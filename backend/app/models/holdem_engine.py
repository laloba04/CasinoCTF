import threading
from app.models.cards import Deck
from app.models.poker_hands import best_hand


class HoldemGame:
    def __init__(self, room_id, small_blind=10, big_blind=20, min_buy=200, max_buy=2000):
        self.room_id = room_id
        self.deck = Deck()
        self.small_blind = small_blind
        self.big_blind = big_blind
        self.min_buy = min_buy
        self.max_buy = max_buy
        self.players = {}   # uid -> {username, chips, hole_cards, current_bet, total_bet, folded, all_in}
        self.seat_order = []
        self.community = []
        self.pot = 0
        self.phase = 'waiting'  # waiting, preflop, flop, turn, river, showdown
        self.dealer_idx = 0
        self.current_idx = 0
        self.current_bet = 0
        self.last_raiser = None
        self.results = {}
        self.lock = threading.Lock()

    def add_player(self, uid, username, buy_in=1000):
        if len(self.players) >= 9:
            return False
        buy_in = max(self.min_buy, min(buy_in, self.max_buy))
        self.players[uid] = {
            'username': username, 'chips': buy_in, 'hole_cards': [],
            'current_bet': 0, 'total_bet': 0, 'folded': False, 'all_in': False
        }
        # Only join current seat_order if no hand is in progress
        if self.phase in ['waiting', 'showdown']:
            self.seat_order.append(uid)
        # else: picked up on next start_hand
        return True

    def remove_player(self, uid):
        self.players.pop(uid, None)
        if uid in self.seat_order:
            self.seat_order.remove(uid)

    def start_hand(self):
        # Pick up any players who joined while a hand was in progress
        for uid in list(self.players):
            if uid not in self.seat_order and uid != 'BOT_HOUSE':
                self.seat_order.append(uid)
        active = [uid for uid in self.seat_order if uid in self.players]
        # Auto-add house bot for solo play
        if len(active) == 1:
            self._add_bot()
            active = [uid for uid in self.seat_order if uid in self.players]
        if len(active) < 2:
            return {'error': 'Need at least 2 players'}
        self.seat_order = active
        self.deck.reset()
        self.community = []
        self.pot = 0
        self.results = {}
        self.current_bet = 0

        for uid in self.seat_order:
            p = self.players[uid]
            p['hole_cards'] = [self.deck.deal(), self.deck.deal()]
            p['current_bet'] = 0
            p['total_bet'] = 0
            p['folded'] = False
            p['all_in'] = False

        n = len(self.seat_order)
        sb_idx = (self.dealer_idx + 1) % n
        bb_idx = (self.dealer_idx + 2) % n

        self._force_bet(self.seat_order[sb_idx], self.small_blind)
        self._force_bet(self.seat_order[bb_idx], self.big_blind)
        self.current_bet = self.big_blind

        self.phase = 'preflop'
        self.current_idx = (bb_idx + 1) % n
        self.last_raiser = self.seat_order[bb_idx]
        self._skip_inactive()
        self._check_bot_turn()
        return self.get_state()

    def _force_bet(self, uid, amount):
        p = self.players[uid]
        actual = min(amount, p['chips'])
        p['chips'] -= actual
        p['current_bet'] += actual
        p['total_bet'] += actual
        self.pot += actual
        if p['chips'] == 0:
            p['all_in'] = True

    def _add_bot(self):
        bot_id = "BOT_HOUSE"
        if bot_id not in self.players:
            self.players[bot_id] = {
                'username': 'House Dealer', 'chips': 100000, 'hole_cards': [],
                'current_bet': 0, 'total_bet': 0, 'folded': False, 'all_in': False
            }
            if bot_id not in self.seat_order:
                self.seat_order.append(bot_id)

    def action(self, uid, action_type, amount=0):
        if self.phase in ['waiting', 'showdown']:
            return {'error': 'No active hand'}
        current_uid = self.seat_order[self.current_idx]
        if uid != current_uid:
            return {'error': 'Not your turn'}
        p = self.players[uid]

        if action_type == 'fold':
            p['folded'] = True
            if self._count_active() == 1:
                return self._single_winner()
        elif action_type == 'check':
            if p['current_bet'] < self.current_bet:
                return {'error': 'Must call or raise'}
        elif action_type == 'call':
            diff = self.current_bet - p['current_bet']
            self._force_bet(uid, diff)
        elif action_type == 'raise':
            if amount <= self.current_bet:
                return {'error': 'Raise must be higher than current bet'}
            diff = amount - p['current_bet']
            self._force_bet(uid, diff)
            self.current_bet = amount
            self.last_raiser = uid
        elif action_type == 'all_in':
            amount_left = p['chips']
            new_bet = p['current_bet'] + amount_left
            self._force_bet(uid, amount_left)
            if new_bet > self.current_bet:
                self.current_bet = new_bet
                self.last_raiser = uid
        else:
            return {'error': 'Invalid action'}

        self.current_idx = (self.current_idx + 1) % len(self.seat_order)
        self._skip_inactive()

        if self._round_complete():
            self._next_phase()

        self._check_bot_turn()
        return self.get_state()

    def _check_bot_turn(self):
        if self.phase in ['waiting', 'showdown']:
            return
        current_uid = self.seat_order[self.current_idx]
        if current_uid == "BOT_HOUSE":
            p = self.players["BOT_HOUSE"]
            diff = self.current_bet - p['current_bet']
            import random
            if diff > 0:
                # House will call or fold
                if random.random() < 0.1:
                    self.action("BOT_HOUSE", "fold")
                else:
                    self.action("BOT_HOUSE", "call")
            else:
                if random.random() < 0.15:
                    self.action("BOT_HOUSE", "raise", self.current_bet + self.big_blind * 2)
                else:
                    self.action("BOT_HOUSE", "check")

    def _skip_inactive(self):
        n = len(self.seat_order)
        for _ in range(n):
            uid = self.seat_order[self.current_idx]
            p = self.players[uid]
            if not p['folded'] and not p['all_in']:
                return
            self.current_idx = (self.current_idx + 1) % n

    def _count_active(self):
        return sum(1 for uid in self.seat_order if not self.players[uid]['folded'])

    def _round_complete(self):
        uid = self.seat_order[self.current_idx]
        if uid == self.last_raiser:
            return True
        active = [u for u in self.seat_order if not self.players[u]['folded'] and not self.players[u]['all_in']]
        if not active:
            return True
        return all(self.players[u]['current_bet'] == self.current_bet for u in active)

    def _next_phase(self):
        for uid in self.seat_order:
            self.players[uid]['current_bet'] = 0
        self.current_bet = 0

        if self.phase == 'preflop':
            self.community += [self.deck.deal() for _ in range(3)]
            self.phase = 'flop'
        elif self.phase == 'flop':
            self.community.append(self.deck.deal())
            self.phase = 'turn'
        elif self.phase == 'turn':
            self.community.append(self.deck.deal())
            self.phase = 'river'
        elif self.phase == 'river':
            self.phase = 'showdown'
            self._showdown()
            return

        n = len(self.seat_order)
        self.current_idx = (self.dealer_idx + 1) % n
        self.last_raiser = self.seat_order[self.current_idx]
        self._skip_inactive()

        if self._count_active() <= 1 or all(
            self.players[u]['all_in'] or self.players[u]['folded']
            for u in self.seat_order
        ):
            while self.phase != 'showdown':
                self._next_phase()

    def _single_winner(self):
        winner = [u for u in self.seat_order if not self.players[u]['folded']][0]
        self.players[winner]['chips'] += self.pot
        self.results = {winner: {'payout': self.pot, 'hand': 'Last standing'}}
        self.phase = 'showdown'
        self.pot = 0
        self.dealer_idx = (self.dealer_idx + 1) % len(self.seat_order)
        return self.get_state()

    def _showdown(self):
        contenders = [u for u in self.seat_order if not self.players[u]['folded']]
        hands = {}
        for uid in contenders:
            all_cards = self.players[uid]['hole_cards'] + self.community
            hands[uid] = best_hand(all_cards)

        winner = max(contenders, key=lambda u: hands[u])
        self.players[winner]['chips'] += self.pot
        self.results = {}
        for uid in contenders:
            rank_val, hand_name, _ = hands[uid]
            self.results[uid] = {
                'hand': hand_name,
                'payout': self.pot if uid == winner else 0,
                'winner': uid == winner
            }
        self.pot = 0
        self.dealer_idx = (self.dealer_idx + 1) % len(self.seat_order)

    def get_state(self, for_user=None):
        state = {
            'phase': self.phase, 'pot': self.pot, 'current_bet': self.current_bet,
            'community': [c.to_dict() for c in self.community],
            'players': {}, 'current_player': None,
            'dealer': str(self.seat_order[self.dealer_idx]) if self.seat_order else None,
            'small_blind': self.small_blind, 'big_blind': self.big_blind
        }
        if self.phase != 'waiting' and self.current_idx < len(self.seat_order):
            state['current_player'] = str(self.seat_order[self.current_idx])

        for uid, p in self.players.items():
            ps = {
                'username': p['username'], 'chips': p['chips'],
                'current_bet': p['current_bet'], 'total_bet': p['total_bet'],
                'folded': p['folded'], 'all_in': p['all_in'],
                'hole_cards': []
            }
            if self.phase == 'showdown' or (for_user and uid == for_user):
                ps['hole_cards'] = [c.to_dict() for c in p['hole_cards']]
            elif p['hole_cards']:
                ps['hole_cards'] = [{'hidden': True}, {'hidden': True}]
            state['players'][str(uid)] = ps

        if self.phase == 'showdown':
            state['results'] = {str(k): v for k, v in self.results.items()}
        return state
