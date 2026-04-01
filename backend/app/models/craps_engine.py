import random
import threading


class CrapsGame:
    def __init__(self, room_id, min_bet=10, max_bet=1000):
        self.room_id = room_id
        self.min_bet = min_bet
        self.max_bet = max_bet
        self.players = {}
        self.bets = {}  # uid -> [{'type': ..., 'amount': N}]
        self.phase = 'betting'
        self.point = None
        self.dice = [0, 0]
        self.shooter_idx = 0
        self.shooter_order = []
        self.results = {}
        self._last_result = None
        self.lock = threading.Lock()

    def add_player(self, uid, username):
        if len(self.players) >= 8:
            return False
        self.players[uid] = {'username': username}
        self.bets[uid] = []
        if uid not in self.shooter_order:
            self.shooter_order.append(uid)
        return True

    def remove_player(self, uid):
        self.players.pop(uid, None)
        self.bets.pop(uid, None)
        if uid in self.shooter_order:
            self.shooter_order.remove(uid)

    def place_bet(self, uid, bet_type, amount):
        if uid not in self.players:
            return {'error': 'Not in game'}
        if amount < self.min_bet or amount > self.max_bet:
            return {'error': f'Bet between {self.min_bet}-{self.max_bet}'}
        valid = ['pass', 'dont_pass', 'field', 'any_seven', 'any_craps']
        if bet_type not in valid:
            return {'error': 'Invalid bet type'}
        self.bets[uid].append({'type': bet_type, 'amount': amount})
        return {'success': True}

    def roll(self, uid):
        if not self.shooter_order:
            return {'error': 'No players'}
        shooter = self.shooter_order[self.shooter_idx % len(self.shooter_order)]
        if uid != shooter:
            return {'error': 'Not the shooter'}
        if not any(self.bets[u] for u in self.bets):
            return {'error': 'No bets placed'}

        self.dice = [random.randint(1, 6), random.randint(1, 6)]
        total = sum(self.dice)

        if self.phase in ['betting', 'come_out']:
            return self._come_out(total)
        else:
            return self._point_phase(total)

    def _come_out(self, total):
        self.phase = 'come_out'
        self.results = {}
        self._resolve_one_roll(total)

        if total in [7, 11]:
            self._resolve('pass', 'win')
            self._resolve('dont_pass', 'lose')
            self._resolve_field(total)
            self._last_result = f'🎉 Roll {total} — Win! Pass bets win.'
            self.phase = 'betting'
        elif total in [2, 3, 12]:
            self._resolve('pass', 'lose')
            if total == 12:
                self._resolve('dont_pass', 'push')
                self._last_result = f'💀 Craps {total} — Push on Don\'t Pass.'
            else:
                self._resolve('dont_pass', 'win')
                self._last_result = f'💀 Craps {total} — Don\'t Pass wins.'
            self._resolve_field(total)
            self.phase = 'betting'
            self.shooter_idx += 1
        else:
            self.point = total
            self.phase = 'point'
            self._resolve_field(total)
            self._last_result = f'🎯 Point set: {total}'
        return self.get_state()

    def _point_phase(self, total):
        self.results = {}
        self._resolve_one_roll(total)

        if total == self.point:
            self._resolve('pass', 'win')
            self._resolve('dont_pass', 'lose')
            self._resolve_field(total)
            self._last_result = f'🎉 Hit the point {total}! Pass wins.'
            self.point = None
            self.phase = 'betting'
        elif total == 7:
            self._resolve('pass', 'lose')
            self._resolve('dont_pass', 'win')
            self._resolve_field(total)
            self._last_result = f'💀 Seven out! Don\'t Pass wins.'
            self.point = None
            self.phase = 'betting'
            self.shooter_idx += 1
        else:
            self._resolve_field(total)
            self._last_result = f'🎲 Rolled {total} — point is still {self.point}'
        return self.get_state()

    def _resolve_one_roll(self, total):
        """Resolve one-roll proposition bets (any_seven, any_craps)."""
        for uid, bets in list(self.bets.items()):
            if uid not in self.results:
                self.results[uid] = {'total_bet': 0, 'total_win': 0, 'details': []}
            remaining = []
            for b in bets:
                if b['type'] == 'any_seven':
                    self.results[uid]['total_bet'] += b['amount']
                    if total == 7:
                        payout = b['amount'] * 5  # 4:1
                        self.results[uid]['total_win'] += payout
                        self.results[uid]['details'].append({**b, 'result': 'win', 'payout': payout, 'won': True})
                    else:
                        self.results[uid]['details'].append({**b, 'result': 'lose', 'payout': 0, 'won': False})
                elif b['type'] == 'any_craps':
                    self.results[uid]['total_bet'] += b['amount']
                    if total in [2, 3, 12]:
                        payout = b['amount'] * 8  # 7:1
                        self.results[uid]['total_win'] += payout
                        self.results[uid]['details'].append({**b, 'result': 'win', 'payout': payout, 'won': True})
                    else:
                        self.results[uid]['details'].append({**b, 'result': 'lose', 'payout': 0, 'won': False})
                else:
                    remaining.append(b)
            self.bets[uid] = remaining

    def _resolve(self, bet_type, outcome):
        for uid, bets in self.bets.items():
            if uid not in self.results:
                self.results[uid] = {'total_bet': 0, 'total_win': 0, 'details': []}
            remaining = []
            for b in bets:
                if b['type'] == bet_type:
                    self.results[uid]['total_bet'] += b['amount']
                    if outcome == 'win':
                        payout = b['amount'] * 2
                        self.results[uid]['total_win'] += payout
                        self.results[uid]['details'].append({**b, 'result': 'win', 'payout': payout, 'won': True})
                    elif outcome == 'push':
                        self.results[uid]['total_win'] += b['amount']
                        self.results[uid]['details'].append({**b, 'result': 'push', 'payout': b['amount'], 'won': False})
                    else:
                        self.results[uid]['details'].append({**b, 'result': 'lose', 'payout': 0, 'won': False})
                else:
                    remaining.append(b)
            self.bets[uid] = remaining

    def _resolve_field(self, total):
        field_wins = {2: 2, 3: 1, 4: 1, 9: 1, 10: 1, 11: 1, 12: 3}
        for uid, bets in list(self.bets.items()):
            if uid not in self.results:
                self.results[uid] = {'total_bet': 0, 'total_win': 0, 'details': []}
            remaining = []
            for b in bets:
                if b['type'] == 'field':
                    self.results[uid]['total_bet'] += b['amount']
                    if total in field_wins:
                        mult = field_wins[total]
                        payout = b['amount'] * (1 + mult)
                        self.results[uid]['total_win'] += payout
                        self.results[uid]['details'].append({**b, 'result': 'win', 'payout': payout, 'won': True})
                    else:
                        self.results[uid]['details'].append({**b, 'result': 'lose', 'payout': 0, 'won': False})
                else:
                    remaining.append(b)
            self.bets[uid] = remaining

    def get_state(self):
        shooter = self.shooter_order[self.shooter_idx % len(self.shooter_order)] if self.shooter_order else None
        return {
            'phase': self.phase, 'point': self.point,
            'dice': self.dice, 'shooter': str(shooter) if shooter else None,
            'last_result': self._last_result,
            'players': {str(uid): p for uid, p in self.players.items()},
            'bets': {str(uid): b for uid, b in self.bets.items()},
            'my_bets': {},  # populated per-user by game_events if needed
            'results': {str(k): v for k, v in self.results.items()},
            'min_bet': self.min_bet, 'max_bet': self.max_bet
        }

    def reset(self):
        self.phase = 'betting'
        self.results = {}
        self.dice = [0, 0]
        for uid in self.bets:
            self.bets[uid] = []
