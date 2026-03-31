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


def _get_user(sid):
    return online_users.get(sid, {})


def _save_game(user_id, game_type, room_id, bet, result, payout, details=''):
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO games (user_id, game_type, room_id, bet, result, payout, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (user_id, game_type, room_id, bet, result, payout, details)
        )
        # Update balance
        net = payout - bet
        cursor.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (net, user_id))
        # Update scoreboard
        cursor.execute("""
            UPDATE scoreboard SET
                games_played = games_played + 1,
                total_winnings = total_winnings + ?,
                biggest_win = MAX(biggest_win, ?)
            WHERE user_id = ?
        """, (max(0, net), max(0, payout), user_id))
        db.commit()
    finally:
        db.close()


def _check_balance(user_id, amount):
    """
    CTF VULNERABILITY #5 — High Roller (Bet Tampering)
    Balance check is commented out / bypassable.
    FIX: Always verify bet <= balance server-side before accepting.
    """
    # VULNERABLE: Insufficient server-side validation
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
        room_id = user.get('room_id')
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        if room_id not in active_games:
            active_games[room_id] = BlackjackGame(room_id)
        game = active_games[room_id]
        game.add_player(user['user_id'], user['username'])
        emit('game_state', game.get_state(for_user=user['user_id']), room=room_id)

    @socketio.on('bj_bet')
    def bj_bet(data):
        user = _get_user(request.sid)
        room_id = user.get('room_id')
        game = active_games.get(room_id)
        if not game:
            return emit('error', {'message': 'No active game'})

        amount = data.get('amount', 0)
        # VULNERABLE: No proper balance check (CTF #5)
        result = game.place_bet(user['user_id'], amount)
        if 'error' in result:
            return emit('error', result)
        _deduct_balance(user['user_id'], amount)

        if game.can_start():
            game.deal()
            # Send personalized state to each player
            for uid_str, p in game.get_state()['players'].items():
                uid = int(uid_str)
                for sid, info in online_users.items():
                    if info.get('user_id') == uid:
                        emit('game_state', game.get_state(for_user=uid), room=sid)
        else:
            emit('game_state', game.get_state(), room=room_id)

    @socketio.on('bj_hit')
    def bj_hit(data):
        user = _get_user(request.sid)
        room_id = user.get('room_id')
        game = active_games.get(room_id)
        if not game:
            return emit('error', {'message': 'No active game'})

        """
        CTF VULNERABILITY #9 — Double Down (Race Condition)
        No lock around game actions. Sending simultaneous requests can cause issues.
        FIX: Use game.lock (threading.Lock) around all game actions.
        """
        # VULNERABLE: No lock used (race condition possible)
        result = game.hit(user['user_id'])
        if isinstance(result, dict) and 'error' in result:
            return emit('error', result)
        _broadcast_state(game, room_id)

    @socketio.on('bj_stand')
    def bj_stand(data):
        user = _get_user(request.sid)
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
        game = active_games.get(room_id)
        if game:
            # Process payouts before reset
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
        bet = data.get('bet_per_line', 10)
        lines = data.get('lines', 5)

        balance = _check_balance(uid, bet * lines)
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
        room_id = user.get('room_id')
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        if room_id not in active_games:
            active_games[room_id] = RouletteGame(room_id)
        game = active_games[room_id]
        game.add_player(user['user_id'], user['username'])
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('roulette_bet')
    def roulette_bet(data):
        user = _get_user(request.sid)
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        if room_id not in active_games:
            active_games[room_id] = HoldemGame(room_id)
        game = active_games[room_id]
        game.add_player(user['user_id'], user['username'], data.get('buy_in', 1000))
        emit('game_state', game.get_state(for_user=user['user_id']), room=room_id)

    @socketio.on('holdem_start')
    def holdem_start(data):
        user = _get_user(request.sid)
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        if room_id not in active_games:
            active_games[room_id] = BaccaratGame(room_id)
        game = active_games[room_id]
        game.add_player(user['user_id'], user['username'])
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('baccarat_bet')
    def baccarat_bet(data):
        user = _get_user(request.sid)
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
        if not room_id:
            return emit('error', {'message': 'Join a room first'})
        if room_id not in active_games:
            active_games[room_id] = CrapsGame(room_id)
        game = active_games[room_id]
        game.add_player(user['user_id'], user['username'])
        emit('game_state', game.get_state(), room=room_id)

    @socketio.on('craps_bet')
    def craps_bet(data):
        user = _get_user(request.sid)
        room_id = user.get('room_id')
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
        room_id = user.get('room_id')
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
