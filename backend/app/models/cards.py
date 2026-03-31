import random

SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

SUIT_SYMBOLS = {
    'hearts': '♥', 'diamonds': '♦', 'clubs': '♣', 'spades': '♠'
}

RANK_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
}


class Card:
    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit

    def to_dict(self):
        return {
            'rank': self.rank,
            'suit': self.suit,
            'symbol': SUIT_SYMBOLS[self.suit],
            'value': RANK_VALUES[self.rank]
        }

    def __repr__(self):
        return f"{self.rank}{SUIT_SYMBOLS[self.suit]}"


class Deck:
    def __init__(self, num_decks=1):
        self.num_decks = num_decks
        self.cards = []
        self.reset()

    def reset(self):
        self.cards = [
            Card(rank, suit)
            for _ in range(self.num_decks)
            for suit in SUITS
            for rank in RANKS
        ]
        self.shuffle()

    def shuffle(self):
        random.shuffle(self.cards)

    def deal(self):
        if len(self.cards) < 1:
            self.reset()
        return self.cards.pop()

    def remaining(self):
        return len(self.cards)
