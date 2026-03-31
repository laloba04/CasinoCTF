import random
import threading


class RouletteGame:
    RED = {1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36}
    BLACK = {2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35}

    def __init__(self, room_id, min_bet=10, max_bet=1000):
        self.room_id = room_id
        self.min_bet = min_bet
        self.max_bet = max_bet
        self.players = {}
        self.bets = {}  # user_id -> [{'type': ..., 'value': ..., 'amount': ...}]
        self.phase = 'betting'  # betting, spinning, payout
        self.result = None
        self.lock = threading.Lock()

    def add_player(self, user_id, username):
        self.players[user_id] = {'username': username}
        self.bets[user_id] = []
        return True

    def remove_player(self, user_id):
        self.players.pop(user_id, None)
        self.bets.pop(user_id, None)

    def place_bet(self, user_id, bet_type, value, amount):
        if self.phase != 'betting':
            return {'error': 'Not in betting phase'}
        if amount < self.min_bet or amount > self.max_bet:
            return {'error': f'Bet must be between {self.min_bet} and {self.max_bet}'}
        if user_id not in self.bets:
            return {'error': 'Not in game'}
        valid_types = ['straight','split','street','corner','line','red','black',
                       'even','odd','low','high','dozen','column']
        if bet_type not in valid_types:
            return {'error': 'Invalid bet type'}
        self.bets[user_id].append({'type': bet_type, 'value': value, 'amount': amount})
        return {'success': True}

    def spin(self):
        self.phase = 'spinning'
        self.result = random.randint(0, 36)
        self.phase = 'payout'
        return self._calc_payouts()

    def _calc_payouts(self):
        n = self.result
        color = 'red' if n in self.RED else ('black' if n in self.BLACK else 'green')
        results = {}
        for uid, bets in self.bets.items():
            total_bet = sum(b['amount'] for b in bets)
            total_win = 0
            bet_results = []
            for b in bets:
                win = self._eval_bet(b, n, color)
                bet_results.append({**b, 'win': win})
                total_win += win
            results[uid] = {'bets': bet_results, 'total_bet': total_bet, 'total_win': total_win}
        self.payout_results = results
        return {'number': n, 'color': color, 'results': {str(k): v for k, v in results.items()}}

    def _eval_bet(self, bet, n, color):
        t, v, amt = bet['type'], bet['value'], bet['amount']
        if t == 'straight':
            return amt * 36 if n == int(v) else 0
        if t == 'red':
            return amt * 2 if color == 'red' else 0
        if t == 'black':
            return amt * 2 if color == 'black' else 0
        if t == 'even':
            return amt * 2 if n != 0 and n % 2 == 0 else 0
        if t == 'odd':
            return amt * 2 if n % 2 == 1 else 0
        if t == 'low':
            return amt * 2 if 1 <= n <= 18 else 0
        if t == 'high':
            return amt * 2 if 19 <= n <= 36 else 0
        if t == 'dozen':
            d = int(v)
            ranges = {1: range(1,13), 2: range(13,25), 3: range(25,37)}
            return amt * 3 if n in ranges.get(d, []) else 0
        if t == 'column':
            c = int(v)
            return amt * 3 if n != 0 and n % 3 == (c % 3) else 0
        if t == 'split':
            nums = [int(x) for x in str(v).split(',')]
            return amt * 18 if n in nums else 0
        if t == 'street':
            start = int(v)
            return amt * 12 if n in range(start, start + 3) else 0
        if t == 'corner':
            nums = [int(x) for x in str(v).split(',')]
            return amt * 9 if n in nums else 0
        if t == 'line':
            start = int(v)
            return amt * 6 if n in range(start, start + 6) else 0
        return 0

    def get_state(self):
        return {
            'phase': self.phase, 'result': self.result,
            'players': {str(uid): p for uid, p in self.players.items()},
            'bets': {str(uid): b for uid, b in self.bets.items()},
            'min_bet': self.min_bet, 'max_bet': self.max_bet,
            'payout_results': {str(k): v for k, v in getattr(self, 'payout_results', {}).items()}
        }

    def reset(self):
        self.phase = 'betting'
        self.result = None
        self.payout_results = {}
        for uid in self.bets:
            self.bets[uid] = []
