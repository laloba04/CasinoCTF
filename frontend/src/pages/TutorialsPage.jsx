import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';

function getTutorials(t) {
  return {
    blackjack: {
      icon: '🃏',
      sections: [
        {
          title: t('tut_goal'),
          content: t('tut_bj_goal')
        },
        {
          title: t('tut_cardValues'),
          table: {
            headers: [t('tut_card'), t('tut_value')],
            rows: [
              ['2–10', t('tut_faceValue')],
              ['J, Q, K', '10'],
              ['As', t('tut_aceValue')],
            ]
          }
        },
        {
          title: t('tut_flow'),
          list: [
            t('tut_bj_flow1'), t('tut_bj_flow2'), t('tut_bj_flow3'),
            t('tut_bj_flow4'), t('tut_bj_flow5'), t('tut_bj_flow6'),
            t('tut_bj_flow7'), t('tut_bj_flow8'),
          ]
        },
        {
          title: t('tut_payouts'),
          table: {
            headers: [t('tut_result'), t('tut_payout')],
            rows: [
              [t('win'), '1:1'],
              [t('tut_bj_natural'), '3:2'],
              [t('push'), t('tut_betReturned')],
              [t('tut_bust'), t('tut_loseBet')],
            ]
          }
        },
        {
          title: t('tut_tips'),
          list: [
            t('tut_bj_tip1'), t('tut_bj_tip2'),
            t('tut_bj_tip3'), t('tut_bj_tip4'), t('tut_bj_tip5'),
          ]
        }
      ]
    },
    holdem: {
      icon: '♠️',
      sections: [
        {
          title: t('tut_goal'),
          content: t('tut_holdem_goal')
        },
        {
          title: t('tut_bettingRounds'),
          table: {
            headers: [t('tut_round'), t('tut_communityCards')],
            rows: [
              ['Pre-Flop', t('tut_preflop_desc')],
              ['Flop', t('tut_flop_desc')],
              ['Turn', t('tut_turn_desc')],
              ['River', t('tut_river_desc')],
              ['Showdown', t('tut_showdown_desc')],
            ]
          }
        },
        {
          title: t('tut_actions'),
          list: [
            t('tut_fold_desc'), t('tut_check_desc'), t('tut_call_desc'),
            t('tut_raise_desc'), t('tut_allin_desc'),
          ]
        },
        {
          title: t('tut_handRankings'),
          table: {
            headers: [t('tut_hand'), t('tut_example')],
            rows: [
              [t('Royal Flush'), 'A K Q J 10 ♠'],
              [t('Straight Flush'), '7 8 9 10 J ♥'],
              [t('Four of a Kind'), 'K K K K 3'],
              [t('Full House'), 'Q Q Q 7 7'],
              [t('Flush'), t('tut_flush_ex')],
              [t('Straight'), '4 5 6 7 8'],
              [t('Three of a Kind'), 'J J J 4 2'],
              [t('Two Pair'), '9 9 4 4 K'],
              [t('One Pair'), 'A A 7 3 2'],
              [t('High Card'), t('tut_highcard_ex')],
            ]
          }
        },
        {
          title: t('tut_tips'),
          list: [
            t('tut_holdem_tip1'), t('tut_holdem_tip2'), t('tut_holdem_tip3'),
          ]
        }
      ]
    },
    roulette: {
      icon: '🎡',
      sections: [
        {
          title: t('tut_goal'),
          content: t('tut_roulette_goal')
        },
        {
          title: t('tut_betTypes'),
          table: {
            headers: [t('tut_bet'), t('tut_description'), t('tut_payout')],
            rows: [
              [t('tut_straight'), t('tut_straight_desc'), '35:1'],
              [t('tut_redBlack'), t('tut_redBlack_desc'), '1:1'],
              [t('tut_evenOdd'), t('tut_evenOdd_desc'), '1:1'],
              ['1-18 / 19-36', t('tut_lowhigh_desc'), '1:1'],
              [t('tut_dozen'), t('tut_dozen_desc'), '2:1'],
            ]
          }
        },
        {
          title: t('tut_flow'),
          list: [
            t('tut_roulette_flow1'), t('tut_roulette_flow2'),
            t('tut_roulette_flow3'), t('tut_roulette_flow4'),
          ]
        }
      ]
    },
    baccarat: {
      icon: '🂡',
      sections: [
        {
          title: t('tut_goal'),
          content: t('tut_baccarat_goal')
        },
        {
          title: t('tut_cardValues'),
          table: {
            headers: [t('tut_card'), t('tut_value')],
            rows: [
              ['As', '1'],
              ['2–9', t('tut_faceValue')],
              ['10, J, Q, K', '0'],
            ]
          }
        },
        {
          title: t('tut_flow'),
          list: [
            t('tut_baccarat_flow1'), t('tut_baccarat_flow2'), t('tut_baccarat_flow3'),
            t('tut_baccarat_flow4'), t('tut_baccarat_flow5'),
          ]
        },
        {
          title: t('tut_payouts'),
          table: {
            headers: [t('tut_bet'), t('tut_payout')],
            rows: [
              [t('tut_playerWins'), '1:1'],
              [t('tut_bankerWins'), '0.95:1 (5%)'],
              [t('tie'), '8:1'],
            ]
          }
        }
      ]
    },
    craps: {
      icon: '🎲',
      sections: [
        {
          title: t('tut_goal'),
          content: t('tut_craps_goal')
        },
        {
          title: t('tut_betTypes'),
          table: {
            headers: [t('tut_bet'), t('tut_winCondition'), t('tut_payout')],
            rows: [
              ['Pass Line', t('tut_passline_desc'), '1:1'],
              ["Don't Pass", t('tut_dontpass_desc'), '1:1'],
              [t('field'), t('tut_field_desc'), '1:1 (2:1)'],
              [t('anySeven'), t('tut_anyseven_desc'), '4:1'],
              [t('anyCraps'), t('tut_anycraps_desc'), '7:1'],
            ]
          }
        },
        {
          title: t('tut_flow'),
          list: [
            t('tut_craps_flow1'), t('tut_craps_flow2'), t('tut_craps_flow3'),
            t('tut_craps_flow4'), t('tut_craps_flow5'), t('tut_craps_flow6'),
          ]
        }
      ]
    },
    slots: {
      icon: '🎰',
      sections: [
        {
          title: t('tut_goal'),
          content: t('tut_slots_goal')
        },
        {
          title: t('tut_controls'),
          list: [
            t('tut_slots_ctrl1'), t('tut_slots_ctrl2'),
            t('tut_slots_ctrl3'), t('tut_slots_ctrl4'),
          ]
        },
        {
          title: t('tut_payouts'),
          table: {
            headers: [t('tut_symbols'), t('tut_multiplier')],
            rows: [
              ['💎💎💎', '50×'],
              ['7️⃣7️⃣7️⃣', '20×'],
              ['🍀🍀🍀', '10×'],
              ['⭐⭐⭐', '5×'],
              ['🍋🍋🍋', '3×'],
              ['🍒🍒🍒', '2×'],
              ['🎯🎯🎯 (Scatter)', t('tut_scatter_desc')],
            ]
          }
        }
      ]
    }
  };
}

export default function TutorialsPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState('blackjack');
  const TUTORIALS = getTutorials(t);
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

      <div className="flex gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
        {GAMES.map(g => (
          <button key={g}
            className={`btn btn-sm ${selected === g ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelected(g)}>
            {TUTORIALS[g].icon} {t(g)}
          </button>
        ))}
      </div>

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
