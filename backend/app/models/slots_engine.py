import random


class SlotsEngine:
    SYMBOLS = ['cherry', 'lemon', 'orange', 'grape', 'bell', 'diamond', 'seven', 'star', 'wild']
    SYMBOL_DISPLAY = {
        'cherry': '🍒', 'lemon': '🍋', 'orange': '🍊', 'grape': '🍇',
        'bell': '🔔', 'diamond': '💎', 'seven': '7️⃣', 'star': '⭐', 'wild': '🃏'
    }
    PAYTABLE = {
        'seven':   {3: 50, 4: 200, 5: 1000},
        'diamond': {3: 30, 4: 100, 5: 500},
        'bell':    {3: 20, 4: 60,  5: 200},
        'grape':   {3: 15, 4: 40,  5: 150},
        'orange':  {3: 10, 4: 30,  5: 100},
        'lemon':   {3: 8,  4: 20,  5: 80},
        'cherry':  {3: 5,  4: 15,  5: 50},
    }
    WEIGHTS = {
        'cherry': 15, 'lemon': 12, 'orange': 10, 'grape': 8,
        'bell': 6, 'diamond': 4, 'seven': 2, 'star': 3, 'wild': 2
    }
    PAYLINES = [
        [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2],
        [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
        [0, 0, 1, 2, 2], [2, 2, 1, 0, 0],
        [1, 0, 1, 0, 1], [1, 2, 1, 2, 1],
    ]

    def spin(self, bet_per_line, num_lines=5):
        num_lines = min(max(1, num_lines), len(self.PAYLINES))
        total_bet = bet_per_line * num_lines
        syms = list(self.WEIGHTS.keys())
        weights = list(self.WEIGHTS.values())

        reels = [[random.choices(syms, weights=weights, k=1)[0] for _ in range(3)] for _ in range(5)]

        wins = []
        total_win = 0
        for i in range(num_lines):
            line = self.PAYLINES[i]
            symbols = [reels[col][line[col]] for col in range(5)]
            payout = self._check_line(symbols, bet_per_line)
            if payout > 0:
                wins.append({
                    'line': i, 'symbols': [self.SYMBOL_DISPLAY[s] for s in symbols], 'payout': payout
                })
                total_win += payout

        scatter_count = sum(1 for reel in reels for s in reel if s == 'star')
        if scatter_count >= 3:
            scatter_win = total_bet * scatter_count * 5
            wins.append({'line': 'scatter', 'count': scatter_count, 'payout': scatter_win})
            total_win += scatter_win

        display_reels = [[self.SYMBOL_DISPLAY[s] for s in reel] for reel in reels]
        return {
            'reels': display_reels, 'raw_reels': reels,
            'wins': wins, 'total_bet': total_bet,
            'total_win': total_win, 'net': total_win - total_bet
        }

    def _check_line(self, symbols, bet):
        base = None
        for s in symbols:
            if s not in ('wild', 'star'):
                base = s
                break
        if not base:
            return bet * 1000 if all(s == 'wild' for s in symbols) else 0
        count = 0
        for s in symbols:
            if s == base or s == 'wild':
                count += 1
            else:
                break
        if count >= 3 and base in self.PAYTABLE:
            return self.PAYTABLE[base].get(count, 0) * bet
        return 0
