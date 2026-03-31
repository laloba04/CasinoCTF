from itertools import combinations
from collections import Counter

HAND_RANKS = {
    'royal_flush': 10, 'straight_flush': 9, 'four_of_a_kind': 8,
    'full_house': 7, 'flush': 6, 'straight': 5, 'three_of_a_kind': 4,
    'two_pair': 3, 'one_pair': 2, 'high_card': 1
}

RANK_ORDER = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}


def evaluate_hand(cards):
    """Evaluate a 5-card poker hand. Returns (rank_value, hand_name, tiebreakers)."""
    ranks = sorted([RANK_ORDER[c.rank] for c in cards], reverse=True)
    suits = [c.suit for c in cards]

    is_flush = len(set(suits)) == 1
    unique = sorted(set(ranks), reverse=True)

    is_straight = False
    straight_high = 0
    if len(unique) == 5:
        if unique[0] - unique[4] == 4:
            is_straight = True
            straight_high = unique[0]
        elif unique == [14, 5, 4, 3, 2]:  # Ace-low
            is_straight = True
            straight_high = 5

    freq = Counter(ranks)
    fv = sorted(freq.values(), reverse=True)

    if is_flush and is_straight:
        if straight_high == 14 and min(ranks) == 10:
            return (HAND_RANKS['royal_flush'], 'Royal Flush', [14])
        return (HAND_RANKS['straight_flush'], 'Straight Flush', [straight_high])

    if fv == [4, 1]:
        quad = [r for r, c in freq.items() if c == 4][0]
        kick = [r for r, c in freq.items() if c == 1][0]
        return (HAND_RANKS['four_of_a_kind'], 'Four of a Kind', [quad, kick])

    if fv == [3, 2]:
        trip = [r for r, c in freq.items() if c == 3][0]
        pair = [r for r, c in freq.items() if c == 2][0]
        return (HAND_RANKS['full_house'], 'Full House', [trip, pair])

    if is_flush:
        return (HAND_RANKS['flush'], 'Flush', ranks)

    if is_straight:
        return (HAND_RANKS['straight'], 'Straight', [straight_high])

    if fv == [3, 1, 1]:
        trip = [r for r, c in freq.items() if c == 3][0]
        kicks = sorted([r for r, c in freq.items() if c == 1], reverse=True)
        return (HAND_RANKS['three_of_a_kind'], 'Three of a Kind', [trip] + kicks)

    if fv == [2, 2, 1]:
        pairs = sorted([r for r, c in freq.items() if c == 2], reverse=True)
        kick = [r for r, c in freq.items() if c == 1][0]
        return (HAND_RANKS['two_pair'], 'Two Pair', pairs + [kick])

    if fv == [2, 1, 1, 1]:
        pair = [r for r, c in freq.items() if c == 2][0]
        kicks = sorted([r for r, c in freq.items() if c == 1], reverse=True)
        return (HAND_RANKS['one_pair'], 'One Pair', [pair] + kicks)

    return (HAND_RANKS['high_card'], 'High Card', ranks)


def best_hand(cards):
    """Find the best 5-card hand from 7 cards (Texas Hold'em)."""
    best = None
    for combo in combinations(cards, 5):
        result = evaluate_hand(list(combo))
        if best is None or result > best:
            best = result
    return best
