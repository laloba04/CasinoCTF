import threading
from app.models.cards import Deck, RANK_VALUES


class BlackjackGame:
    def __init__(self, room_id, min_bet=10, max_bet=1000):
        self.room_id = room_id
        self.deck = Deck(num_decks=6)
        self.players = {}
        self.dealer = {'hand': [], 'score': 0}
        self.min_bet = min_bet
        self.max_bet = max_bet
        self.phase = 'betting'
        self.current_player_idx = 0
        self.player_order = []
        self.results = {}
        self.lock = threading.Lock()

    def add_player(self, user_id, username):
        if len(self.players) >= 7:
            return False
        self.players[user_id] = {
            'username': username, 'hands': [[]], 'bets': [0],
            'scores': [0], 'status': ['waiting'], 'active_hand': 0
        }
        return True

    def remove_player(self, user_id):
        self.players.pop(user_id, None)
        if user_id in self.player_order:
            self.player_order.remove(user_id)

    def place_bet(self, user_id, amount):
        if self.phase != 'betting':
            return {'error': 'Not in betting phase'}
        if user_id not in self.players:
            return {'error': 'Not in this game'}
        if amount < self.min_bet or amount > self.max_bet:
            return {'error': f'Bet must be between {self.min_bet} and {self.max_bet}'}
        self.players[user_id]['bets'] = [amount]
        self.players[user_id]['status'] = ['ready']
        return {'success': True}

    def can_start(self):
        if not self.players:
            return False
        return all(p['status'][0] == 'ready' for p in self.players.values())

    def deal(self):
        if not self.can_start():
            return {'error': 'No players ready'}
        self.phase = 'playing'
        self.player_order = [uid for uid, p in self.players.items() if p['status'][0] == 'ready']
        if self.deck.remaining() < 75:
            self.deck.reset()
        for _ in range(2):
            for uid in self.player_order:
                self.players[uid]['hands'][0].append(self.deck.deal())
            self.dealer['hand'].append(self.deck.deal())
        for uid in self.player_order:
            score = self._calc(self.players[uid]['hands'][0])
            self.players[uid]['scores'] = [score]
            if score == 21:
                self.players[uid]['status'] = ['blackjack']
        self.dealer['score'] = self._calc(self.dealer['hand'])
        self.current_player_idx = 0
        self._advance()
        return self.get_state()

    def _calc(self, hand):
        score = sum(RANK_VALUES.get(c.rank, 0) for c in hand)
        aces = sum(1 for c in hand if c.rank == 'A')
        while score > 21 and aces > 0:
            score -= 10
            aces -= 1
        return score

    def hit(self, user_id):
        p = self.players.get(user_id)
        if not p or not self._is_current(user_id):
            return {'error': 'Not your turn'}
        a = p['active_hand']
        if p['status'][a] not in ['playing', 'ready']:
            return {'error': 'Cannot hit'}
        p['hands'][a].append(self.deck.deal())
        score = self._calc(p['hands'][a])
        p['scores'][a] = score
        if score > 21:
            p['status'][a] = 'bust'
            self._next(user_id)
        elif score == 21:
            p['status'][a] = 'stand'
            self._next(user_id)
        else:
            p['status'][a] = 'playing'
        return self.get_state()

    def stand(self, user_id):
        p = self.players.get(user_id)
        if not p or not self._is_current(user_id):
            return {'error': 'Not your turn'}
        p['status'][p['active_hand']] = 'stand'
        self._next(user_id)
        return self.get_state()

    def double_down(self, user_id):
        p = self.players.get(user_id)
        if not p or not self._is_current(user_id):
            return {'error': 'Not your turn'}
        a = p['active_hand']
        if len(p['hands'][a]) != 2:
            return {'error': 'Only on first two cards'}
        p['bets'][a] *= 2
        p['hands'][a].append(self.deck.deal())
        score = self._calc(p['hands'][a])
        p['scores'][a] = score
        p['status'][a] = 'bust' if score > 21 else 'stand'
        self._next(user_id)
        return self.get_state()

    def split(self, user_id):
        p = self.players.get(user_id)
        if not p or not self._is_current(user_id):
            return {'error': 'Not your turn'}
        a = p['active_hand']
        hand = p['hands'][a]
        if len(hand) != 2 or hand[0].rank != hand[1].rank:
            return {'error': 'Can only split pairs'}
        c1, c2 = hand
        p['hands'][a] = [c1, self.deck.deal()]
        p['hands'].append([c2, self.deck.deal()])
        p['bets'].append(p['bets'][a])
        p['scores'][a] = self._calc(p['hands'][a])
        p['scores'].append(self._calc(p['hands'][-1]))
        p['status'][a] = 'playing'
        p['status'].append('playing')
        return self.get_state()

    def _is_current(self, uid):
        return self.current_player_idx < len(self.player_order) and self.player_order[self.current_player_idx] == uid

    def _next(self, uid):
        p = self.players[uid]
        if p['active_hand'] + 1 < len(p['hands']):
            p['active_hand'] += 1
            p['status'][p['active_hand']] = 'playing'
            return
        self.current_player_idx += 1
        self._advance()

    def _advance(self):
        while self.current_player_idx < len(self.player_order):
            uid = self.player_order[self.current_player_idx]
            if self.players[uid]['status'][0] in ['blackjack', 'bust', 'stand', 'done']:
                self.current_player_idx += 1
            else:
                self.players[uid]['status'][self.players[uid]['active_hand']] = 'playing'
                return
        self._dealer_turn()

    def _dealer_turn(self):
        self.phase = 'dealer_turn'
        all_bust = all(
            all(s == 'bust' for s in p['status'])
            for uid, p in self.players.items() if uid in self.player_order
        )
        if not all_bust:
            while self.dealer['score'] < 17:
                self.dealer['hand'].append(self.deck.deal())
                self.dealer['score'] = self._calc(self.dealer['hand'])
        self.phase = 'payout'
        self._payouts()

    def _payouts(self):
        ds = self.dealer['score']
        dbj = len(self.dealer['hand']) == 2 and ds == 21
        self.results = {}
        for uid in self.player_order:
            p = self.players[uid]
            hands_results = []
            total_payout = 0
            for i in range(len(p['hands'])):
                bet = p['bets'][i]
                score = p['scores'][i]
                status = p['status'][i]
                if status == 'bust':
                    hands_results.append({'result': 'lose', 'payout': 0})
                elif status == 'blackjack':
                    if dbj:
                        hands_results.append({'result': 'push', 'payout': bet})
                        total_payout += bet
                    else:
                        pay = bet + bet * 1.5
                        hands_results.append({'result': 'blackjack', 'payout': pay})
                        total_payout += pay
                elif ds > 21 or score > ds:
                    pay = bet * 2
                    hands_results.append({'result': 'win', 'payout': pay})
                    total_payout += pay
                elif score == ds:
                    hands_results.append({'result': 'push', 'payout': bet})
                    total_payout += bet
                else:
                    hands_results.append({'result': 'lose', 'payout': 0})
            self.results[uid] = {'hands': hands_results, 'total_payout': total_payout, 'total_bet': sum(p['bets'])}

    def get_state(self, for_user=None):
        state = {
            'phase': self.phase, 'min_bet': self.min_bet, 'max_bet': self.max_bet,
            'dealer': {'hand': [], 'score': 0}, 'players': {}, 'current_player': None
        }
        if self.phase in ['dealer_turn', 'payout']:
            state['dealer'] = {'hand': [c.to_dict() for c in self.dealer['hand']], 'score': self.dealer['score']}
        elif self.dealer['hand']:
            state['dealer'] = {
                'hand': [self.dealer['hand'][0].to_dict(), {'rank': '?', 'suit': '?', 'hidden': True}],
                'score': '?'
            }
        for uid, p in self.players.items():
            ps = {
                'username': p['username'], 'scores': p['scores'],
                'bets': p['bets'], 'status': p['status'], 'active_hand': p['active_hand'], 'hands': []
            }
            for hand in p['hands']:
                if for_user and uid != for_user and self.phase == 'playing':
                    ps['hands'].append([{'hidden': True} for _ in hand])
                else:
                    ps['hands'].append([c.to_dict() for c in hand])
            state['players'][str(uid)] = ps
        if self.current_player_idx < len(self.player_order):
            state['current_player'] = str(self.player_order[self.current_player_idx])
        if self.phase == 'payout':
            state['results'] = {str(k): v for k, v in self.results.items()}
        return state

    def reset(self):
        for uid in self.players:
            self.players[uid] = {
                'username': self.players[uid]['username'], 'hands': [[]],
                'bets': [0], 'scores': [0], 'status': ['waiting'], 'active_hand': 0
            }
        self.dealer = {'hand': [], 'score': 0}
        self.phase = 'betting'
        self.current_player_idx = 0
        self.player_order = []
        self.results = {}
