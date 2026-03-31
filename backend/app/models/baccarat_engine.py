import threading
from app.models.cards import Deck


def card_value(card):
    if card.rank in ['10', 'J', 'Q', 'K']:
        return 0
    if card.rank == 'A':
        return 1
    return int(card.rank)


def hand_total(hand):
    return sum(card_value(c) for c in hand) % 10


class BaccaratGame:
    def __init__(self, room_id, min_bet=10, max_bet=1000):
        self.room_id = room_id
        self.deck = Deck(num_decks=8)
        self.min_bet = min_bet
        self.max_bet = max_bet
        self.players = {}
        self.bets = {}  # uid -> {'side': 'player'|'banker'|'tie', 'amount': N}
        self.phase = 'betting'
        self.player_hand = []
        self.banker_hand = []
        self.result = None
        self.results = {}
        self.lock = threading.Lock()

    def add_player(self, uid, username):
        if len(self.players) >= 7:
            return False
        self.players[uid] = {'username': username}
        return True

    def remove_player(self, uid):
        self.players.pop(uid, None)
        self.bets.pop(uid, None)

    def place_bet(self, uid, side, amount):
        if self.phase != 'betting':
            return {'error': 'Not in betting phase'}
        if side not in ['player', 'banker', 'tie']:
            return {'error': 'Bet on player, banker, or tie'}
        if amount < self.min_bet or amount > self.max_bet:
            return {'error': f'Bet between {self.min_bet}-{self.max_bet}'}
        self.bets[uid] = {'side': side, 'amount': amount}
        return {'success': True}

    def deal(self):
        if not self.bets:
            return {'error': 'No bets placed'}
        self.phase = 'dealing'
        if self.deck.remaining() < 20:
            self.deck.reset()
        self.player_hand = [self.deck.deal(), self.deck.deal()]
        self.banker_hand = [self.deck.deal(), self.deck.deal()]
        pt = hand_total(self.player_hand)
        bt = hand_total(self.banker_hand)

        # Natural
        if pt >= 8 or bt >= 8:
            pass
        else:
            # Player third card rule
            p3 = None
            if pt <= 5:
                p3 = self.deck.deal()
                self.player_hand.append(p3)
                pt = hand_total(self.player_hand)
            # Banker third card rule
            if p3 is None:
                if bt <= 5:
                    self.banker_hand.append(self.deck.deal())
            else:
                pv = card_value(p3)
                draw = False
                if bt <= 2:
                    draw = True
                elif bt == 3 and pv != 8:
                    draw = True
                elif bt == 4 and pv in [2,3,4,5,6,7]:
                    draw = True
                elif bt == 5 and pv in [4,5,6,7]:
                    draw = True
                elif bt == 6 and pv in [6,7]:
                    draw = True
                if draw:
                    self.banker_hand.append(self.deck.deal())

        pt = hand_total(self.player_hand)
        bt = hand_total(self.banker_hand)

        if pt > bt:
            self.result = 'player'
        elif bt > pt:
            self.result = 'banker'
        else:
            self.result = 'tie'

        self.phase = 'payout'
        self._payouts()
        return self.get_state()

    def _payouts(self):
        self.results = {}
        for uid, bet in self.bets.items():
            amt = bet['amount']
            side = bet['side']
            if side == self.result:
                if side == 'player':
                    self.results[uid] = {'result': 'win', 'payout': amt * 2}
                elif side == 'banker':
                    self.results[uid] = {'result': 'win', 'payout': amt * 1.95}  # 5% commission
                else:
                    self.results[uid] = {'result': 'win', 'payout': amt * 9}  # 8:1
            else:
                self.results[uid] = {'result': 'lose', 'payout': 0}

    def get_state(self):
        return {
            'phase': self.phase,
            'player_hand': [c.to_dict() for c in self.player_hand],
            'banker_hand': [c.to_dict() for c in self.banker_hand],
            'player_total': hand_total(self.player_hand) if self.player_hand else 0,
            'banker_total': hand_total(self.banker_hand) if self.banker_hand else 0,
            'result': self.result,
            'players': {str(uid): p for uid, p in self.players.items()},
            'bets': {str(uid): b for uid, b in self.bets.items()},
            'results': {str(k): v for k, v in self.results.items()},
            'min_bet': self.min_bet, 'max_bet': self.max_bet
        }

    def reset(self):
        self.phase = 'betting'
        self.player_hand = []
        self.banker_hand = []
        self.result = None
        self.results = {}
        self.bets = {}
