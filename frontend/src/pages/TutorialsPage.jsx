import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';

const TUTORIALS = {
  blackjack: {
    icon: '🃏',
    sections: [
      {
        title: 'Goal',
        content: 'Beat the dealer by getting a hand value as close to 21 as possible without going over.'
      },
      {
        title: 'Card Values',
        table: {
          headers: ['Card', 'Value'],
          rows: [
            ['2–10', 'Face value'],
            ['J, Q, K', '10'],
            ['Ace', '1 or 11 (whichever benefits you)'],
          ]
        }
      },
      {
        title: 'The Flow',
        list: [
          'Place your bet — choose chips and click Bet.',
          'You get 2 cards face up. Dealer gets 1 face up, 1 face down.',
          'Hit — draw another card.',
          'Stand — keep your hand and end your turn.',
          'Double Down — double your bet and draw exactly one more card.',
          'Split — if your first 2 cards match, split into 2 hands (costs another bet).',
          'Dealer reveals hidden card and must hit until reaching 17+.',
          'Closest to 21 without busting wins.',
        ]
      },
      {
        title: 'Payouts',
        table: {
          headers: ['Result', 'Payout'],
          rows: [
            ['Win', '1:1'],
            ['Blackjack (Ace + 10 on first 2 cards)', '3:2'],
            ['Push (tie)', 'Bet returned'],
            ['Bust (over 21)', 'Lose bet'],
          ]
        }
      },
      {
        title: 'Tips',
        list: [
          'Always split Aces and 8s.',
          'Never split 10s or 5s.',
          'Double Down on 11 when dealer shows 2–10.',
          'Stand on 17+ against a dealer showing a weak card (2–6).',
          'Table uses 6 decks (312 cards). Dealer hits on soft 17.',
        ]
      }
    ]
  },
  holdem: {
    icon: '♠️',
    sections: [
      {
        title: 'Goal',
        content: 'Make the best 5-card poker hand using your 2 hole cards and 5 community cards.'
      },
      {
        title: 'Betting Rounds',
        table: {
          headers: ['Round', 'Community Cards'],
          rows: [
            ['Pre-Flop', 'None — bet with just your 2 hole cards'],
            ['Flop', '3 cards revealed'],
            ['Turn', '1 more card (4 total)'],
            ['River', '1 more card (5 total)'],
            ['Showdown', 'Best hand wins the pot'],
          ]
        }
      },
      {
        title: 'Actions',
        list: [
          'Fold — give up your hand, lose any bet.',
          'Check — pass without betting (only if no bet has been placed yet).',
          'Call — match the current bet.',
          'Raise — increase the bet.',
          'All In — bet all your chips.',
        ]
      },
      {
        title: 'Hand Rankings (Best → Worst)',
        table: {
          headers: ['Hand', 'Example'],
          rows: [
            ['Royal Flush', 'A K Q J 10 (same suit)'],
            ['Straight Flush', '7 8 9 10 J (same suit)'],
            ['Four of a Kind', 'K K K K 3'],
            ['Full House', 'Q Q Q 7 7'],
            ['Flush', 'Any 5 of the same suit'],
            ['Straight', '4 5 6 7 8 (any suits)'],
            ['Three of a Kind', 'J J J 4 2'],
            ['Two Pair', '9 9 4 4 K'],
            ['One Pair', 'A A 7 3 2'],
            ['High Card', 'Highest card in hand'],
          ]
        }
      },
      {
        title: 'Tips',
        list: [
          'You need at least 2 players to start a hand.',
          'The dealer button rotates after each hand.',
          'Your best 5-card hand is auto-selected from 2 hole + 5 community cards.',
        ]
      }
    ]
  },
  roulette: {
    icon: '🎡',
    sections: [
      {
        title: 'Goal',
        content: 'Predict where the ball will land on the spinning wheel (numbers 0–36). European Roulette — single zero, house edge 2.7%.'
      },
      {
        title: 'Bet Types',
        table: {
          headers: ['Bet', 'Description', 'Payout'],
          rows: [
            ['Straight', 'One specific number', '35:1'],
            ['Red / Black', 'Color of the number', '1:1'],
            ['Even / Odd', 'Parity of the number', '1:1'],
            ['1-18 / 19-36', 'Low or high half', '1:1'],
            ['1st/2nd/3rd 12', 'Group of 12 numbers', '2:1'],
          ]
        }
      },
      {
        title: 'The Flow',
        list: [
          'Select chip value, then click any bet to place it.',
          'You can place multiple bets before spinning.',
          'Click "Spin the Wheel!" to launch the ball.',
          'Winnings are paid out automatically.',
        ]
      }
    ]
  },
  baccarat: {
    icon: '🂡',
    sections: [
      {
        title: 'Goal',
        content: 'Bet on which hand (Player or Banker) will be closest to 9, or if they will tie.'
      },
      {
        title: 'Card Values',
        table: {
          headers: ['Card', 'Value'],
          rows: [
            ['Ace', '1'],
            ['2–9', 'Face value'],
            ['10, J, Q, K', '0'],
          ]
        }
      },
      {
        title: 'The Flow',
        list: [
          'Choose Player, Banker, or Tie.',
          'Enter your bet amount and click your choice to confirm.',
          'Click "Deal Cards" when ready.',
          'If total exceeds 9, only the last digit counts (e.g. 15 = 5).',
          'A natural 8 or 9 wins automatically — no more cards drawn.',
        ]
      },
      {
        title: 'Payouts',
        table: {
          headers: ['Bet', 'Payout'],
          rows: [
            ['Player wins', '1:1'],
            ['Banker wins', '0.95:1 (5% commission)'],
            ['Tie', '8:1'],
          ]
        }
      }
    ]
  },
  craps: {
    icon: '🎲',
    sections: [
      {
        title: 'Goal',
        content: 'Bet on the outcome of dice rolls. One player is the "shooter" — they roll for everyone at the table.'
      },
      {
        title: 'Bet Types',
        table: {
          headers: ['Bet', 'Win condition', 'Payout'],
          rows: [
            ['Pass Line', 'Come-out: 7/11 win, 2/3/12 lose. Point: hit point before 7', '1:1'],
            ["Don't Pass", 'Opposite of Pass Line', '1:1'],
            ['Field', 'Roll 2, 3, 4, 9, 10, 11, or 12', '1:1 (2:1 on 2 or 12)'],
            ['Any Seven', 'Next roll is 7', '4:1'],
            ['Any Craps', 'Next roll is 2, 3, or 12', '7:1'],
          ]
        }
      },
      {
        title: 'The Flow',
        list: [
          'Place your bets.',
          'The shooter rolls — first roll is the "Come Out" roll.',
          '7 or 11 on come-out: Pass Line wins.',
          '2, 3, or 12 on come-out: Don\'t Pass wins (craps).',
          'Any other number sets the "Point".',
          'Shooter keeps rolling until they hit the Point (Pass wins) or roll a 7 (Don\'t Pass wins).',
        ]
      }
    ]
  },
  slots: {
    icon: '🎰',
    sections: [
      {
        title: 'Goal',
        content: 'Spin the reels and match symbols across paylines. More matching symbols = bigger payout.'
      },
      {
        title: 'Controls',
        list: [
          'Bet/Line — how much to bet per active payline.',
          'Lines — how many paylines to activate (1, 3, 5, 7, or 9).',
          'Total Bet = Bet/Line × Lines.',
          'Click SPIN to play.',
        ]
      },
      {
        title: 'Payouts',
        table: {
          headers: ['Symbols', 'Multiplier'],
          rows: [
            ['💎💎💎', '50×'],
            ['7️⃣7️⃣7️⃣', '20×'],
            ['🍀🍀🍀', '10×'],
            ['⭐⭐⭐', '5×'],
            ['🍋🍋🍋', '3×'],
            ['🍒🍒🍒', '2×'],
            ['Scatter 🎯 (3+)', 'Free spins bonus'],
          ]
        }
      }
    ]
  }
};

export default function TutorialsPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState('blackjack');
  const tutorial = TUTORIALS[selected];

  const GAMES = Object.keys(TUTORIALS);

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📖 {t('tutorials')}</h1>
          <p className="page-subtitle">{t('tutorialsSubtitle')}</p>
        </div>
      </div>

      {/* Game selector */}
      <div className="flex gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
        {GAMES.map(g => (
          <button key={g}
            className={`btn btn-sm ${selected === g ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelected(g)}>
            {TUTORIALS[g].icon} {t(g)}
          </button>
        ))}
      </div>

      {/* Tutorial content */}
      <div className="card fade-in" style={{ maxWidth: '760px' }}>
        <div className="card-header" style={{ fontSize: '1.2rem' }}>
          {tutorial.icon} {t('howToPlay')} {t(selected)}
        </div>

        {tutorial.sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700 }}>
              {sec.title}
            </h3>

            {sec.content && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{sec.content}</p>
            )}

            {sec.list && (
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {sec.list.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            )}

            {sec.table && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      {sec.table.headers.map((h, j) => (
                        <th key={j} style={{
                          textAlign: 'left', padding: '0.5rem 0.75rem',
                          borderBottom: '1px solid var(--border)',
                          color: 'var(--accent-gold)', fontWeight: 700
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.table.rows.map((row, j) => (
                      <tr key={j} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {row.map((cell, k) => (
                          <td key={k} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
