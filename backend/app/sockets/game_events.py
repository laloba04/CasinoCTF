from flask_socketio import emit
from flask import request
from app.models.database import get_db
from app.models.blackjack_engine import BlackjackGame
from app.models.holdem_engine import HoldemGame
from app.models.roulette_engine import RouletteGame
from app.models.slots_engine import SlotsEngine
from app.models.baccarat_engine import BaccaratGame
from app.models.craps_engine import CrapsGame
from app.sockets.lobby_events import online_users, room_players

# In-memory active games
active_games = {}  # room_id -> game instance
slots_engine = SlotsEngine()

GAME_CLASSES = {
    'blackjack': BlackjackGame,
    'holdem': HoldemGame,
    'roulette': RouletteGame,
    'baccarat': BaccaratGame,
    'craps': CrapsGame,
}


def _get_user(sid):
    return online_users.get(sid, {})


def _get_room_id(user, data):
    """Get room_id from user state or from data payload as fallback."""
    return user.get('room_id') or data.get('room_id')


def _ensure_game(room_id, game_type='blackjack'):
    """Get or create a game for the given room."""
    if room_id and room_id not in active_games:
        cls = GAME_CLASSES.get(game_type, BlackjackGame)
        active_games[room_id] = cls(room_id)
    return active_games.get(room_id)


def _save_game(user_id, game_type, room_id, bet, result, payout, details=''):
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO games (user_id, game_type, room_id, bet, result, payout, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, game_type, room_id, bet, result, payout, details)
        )
        # Bet was already deducted at bet time — only add back the gross payout
        cursor.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (payout, user_id))
        # Compute profit for scoreboard (separate from balance update)
        profit = payout - bet
        cursor.execute("SELECT biggest_win FROM scoreboard WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        current_biggest = (row['biggest_win'] if isinstance(row, dict) else row[0]) if row else 0
        new_biggest = max(current_biggest or 0, payout)
        cursor.execute("""
            UPDATE scoreboard SET
                games_played = games_played + 1,
                total_winnings = total_winnings + ?,
                biggest_win = ?
            WHERE user_id = ?
        """, (max(0, profit), new_biggest, user_id))
        db.commit()
    finally:
        db.close()


def _check_balance(user_id, amount):
    """
    CTF VULNERABILITY #5 — High Roller (Bet Tampering)
    FIX: Always verify bet <= balance server-side before accepting.
    """
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT balance FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        return row['balance'] if row else 0
    finally:
        db.close()


def _deduct_balance(user_id, amount):
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("UPDATE users SET balance = balance - ? WHERE id = ?", (amount, user_id))
        db.commit()
    finally:
        db.close()


def register_game_events(socketio):

    # ── BLACKJACK ──
    @socketio.on('bj_join')
    def bj_join(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        game = _ensure_game(room_id, 'blackjack')
        uid = user.get('user_id')
        username = user.get('username', 'Anonymous')
        if uid:
            game.add_player(uid, username)
        emit('game_state', game.get_state(for_user=uid), room=room_id)

    @socketio.on('bj_bet')
    def bj_bet(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = _ensure_game(room_id, 'blackjack') if room_id else None
        if not game:
            return emit('error', {'message': 'No active game'})

        uid = user.get('user_id')
        username = user.get('username', 'Anonymous')
        # Auto-add player if not in game
        if uid and str(uid) not in {str(k) for k in game.players}:
            game.add_player(uid, username)

        amount = data.get('amount', 0)
        # VULNERABLE: No proper balance check (CTF #5)
        result = game.place_bet(uid, amount)
        if 'error' in result:
            return emit('error', result)
        _deduct_balance(uid, amount)

        if game.can_start():
            game.deal()
            _broadcast_state(game, room_id)
        else:
            emit('game_state', game.get_state(), room=room_id)

    @socketio.on('bj_hit')
    def bj_hit(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game:
            return emit('error', {'message': 'No active game'})
        """
        CTF VULNERABILITY #9 — Double Down (Race Condition)
        No lock around game actions.
        FIX: Use game.lock (threading.Lock) around all game actions.
        """
        result = game.hit(user['user_id'])
        if isinstance(result, dict) and 'error' in result:
            return emit('error', result)
        _broadcast_state(game, room_id)

    @socketio.on('bj_stand')
    def bj_stand(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game:
            return emit('error', {'message': 'No active game'})
        result = game.stand(user['user_id'])
        if isinstance(result, dict) and 'error' in result:
            return emit('error', result)
        _broadcast_state(game, room_id)

    @socketio.on('bj_double')
    def bj_double(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game:
            return emit('error', {'message': 'No active game'})
        result = game.double_down(user['user_id'])
        if isinstance(result, dict) and 'error' in result:
            return emit('error', result)
        _broadcast_state(game, room_id)

    @socketio.on('bj_split')
    def bj_split(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game:
            return emit('error', {'message': 'No active game'})
        result = game.split(user['user_id'])
        if isinstance(result, dict) and 'error' in result:
            return emit('error', result)
        _broadcast_state(game, room_id)

    @socketio.on('bj_reset')
    def bj_reset(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if game:
            if game.phase == 'payout' and game.results:
                for uid, res in game.results.items():
                    _save_game(uid, 'blackjack', room_id, res['total_bet'],
                              'win' if res['total_payout'] > res['total_bet'] else 'lose',
                              res['total_payout'])
            game.reset()
            emit('game_state', game.get_state(), room=room_id)

    # ── SLOTS ──
    @socketio.on('slots_spin')
    def slots_spin(data):
        user = _get_user(request.sid)
        uid = user.get('user_id')
        if not uid:
            return emit('error', {'message': 'Not authenticated'})
        bet = data.get('bet_per_line', 10)
        lines = data.get('lines', 5)
        total_bet = bet * lines
        # VULNERABLE: No proper balance check (CTF #5)
        _deduct_balance(uid, total_bet)
        result = slots_engine.spin(bet, lines)

        if result['total_win'] > 0:
            _save_game(uid, 'slots', None, total_bet, 'win', result['total_win'])
        else:
            _save_game(uid, 'slots', None, total_bet, 'lose', 0)

        emit('slots_result', result)

    # ── ROULETTE ──
    @socketio.on('roulette_join')
    def roulette_join(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        game = _ensure_game(room_id, 'roulette')
        uid = user.get('user_id')
        if uid:
            game.add_player(uid, user.get('username', 'Anonymous'))
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('roulette_bet')
    def roulette_bet(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game or not isinstance(game, RouletteGame):
            return emit('error', {'message': 'No roulette game'})
        result = game.place_bet(user['user_id'], data.get('type'), data.get('value'), data.get('amount', 0))
        if 'error' in result:
            return emit('error', result)
        _deduct_balance(user['user_id'], data.get('amount', 0))
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('roulette_spin')
    def roulette_spin(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game or not isinstance(game, RouletteGame):
            return emit('error', {'message': 'No roulette game'})
        result = game.spin()
        for uid, res in result.get('results', {}).items():
            uid_int = int(uid)
            _save_game(uid_int, 'roulette', room_id, res['total_bet'],
                      'win' if res['total_win'] > 0 else 'lose', res['total_win'])
        emit('roulette_result', result, room=room_id)
        game.reset()

    # ── HOLDEM ──
    @socketio.on('holdem_join')
    def holdem_join(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        game = _ensure_game(room_id, 'holdem')
        uid = user.get('user_id')
        if uid:
            game.add_player(uid, user.get('username', 'Anonymous'), data.get('buy_in', 1000))
        emit('game_state', game.get_state(for_user=uid), room=room_id)

    @socketio.on('holdem_start')
    def holdem_start(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game or not isinstance(game, HoldemGame):
            return emit('error', {'message': 'No holdem game'})
        result = game.start_hand()
        if isinstance(result, dict) and 'error' in result:
            return emit('error', result)
        _broadcast_holdem_state(game, room_id)

    @socketio.on('holdem_action')
    def holdem_action(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game or not isinstance(game, HoldemGame):
            return emit('error', {'message': 'No holdem game'})
        result = game.action(user['user_id'], data.get('action'), data.get('amount', 0))
        if isinstance(result, dict) and 'error' in result:
            return emit('error', result)
        _broadcast_holdem_state(game, room_id)

    # ── BACCARAT ──
    @socketio.on('baccarat_join')
    def baccarat_join(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        game = _ensure_game(room_id, 'baccarat')
        uid = user.get('user_id')
        if uid:
            game.add_player(uid, user.get('username', 'Anonymous'))
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('baccarat_bet')
    def baccarat_bet(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game or not isinstance(game, BaccaratGame):
            return emit('error', {'message': 'No baccarat game'})
        result = game.place_bet(user['user_id'], data.get('side'), data.get('amount', 0))
        if 'error' in result:
            return emit('error', result)
        _deduct_balance(user['user_id'], data.get('amount', 0))
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('baccarat_deal')
    def baccarat_deal(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game or not isinstance(game, BaccaratGame):
            return emit('error', {'message': 'No baccarat game'})
        game.deal()
        for uid, res in game.results.items():
            _save_game(uid, 'baccarat', room_id,
                      game.bets.get(uid, {}).get('amount', 0) if isinstance(game.bets.get(uid), dict) else 0,
                      res['result'], res['payout'])
        emit('game_state', game.get_state(), room=room_id)
        game.reset()

    # ── CRAPS ──
    @socketio.on('craps_join')
    def craps_join(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        game = _ensure_game(room_id, 'craps')
        uid = user.get('user_id')
        if uid:
            game.add_player(uid, user.get('username', 'Anonymous'))
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('craps_bet')
    def craps_bet(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game or not isinstance(game, CrapsGame):
            return emit('error', {'message': 'No craps game'})
        result = game.place_bet(user['user_id'], data.get('type'), data.get('amount', 0))
        if 'error' in result:
            return emit('error', result)
        _deduct_balance(user['user_id'], data.get('amount', 0))
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('craps_roll')
    def craps_roll(data):
        user = _get_user(request.sid)
        room_id = _get_room_id(user, data)
        game = active_games.get(room_id)
        if not game or not isinstance(game, CrapsGame):
            return emit('error', {'message': 'No craps game'})
        result = game.roll(user['user_id'])
        if isinstance(result, dict) and 'error' in result:
            return emit('error', result)
        for uid, res in game.results.items():
            if res['details']:
                _save_game(uid, 'craps', room_id, res['total_bet'],
                          'win' if res['total_win'] > res['total_bet'] else 'lose', res['total_win'])
        emit('game_state', game.get_state(), room=room_id)

    def _broadcast_state(game, room_id):
        for sid, info in online_users.items():
            if info.get('room_id') == room_id:
                uid = info.get('user_id')
                socketio.emit('game_state', game.get_state(for_user=uid), room=sid)

    def _broadcast_holdem_state(game, room_id):
        for sid, info in online_users.items():
            if info.get('room_id') == room_id:
                uid = info.get('user_id')
                socketio.emit('game_state', game.get_state(for_user=uid), room=sid)
