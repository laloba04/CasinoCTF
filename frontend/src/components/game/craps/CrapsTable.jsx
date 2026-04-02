import { useState, useRef } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { sounds } from '../../../utils/sounds';

export default function CrapsTable({ gameState, emit, user, room }) {
  const [betAmount, setBetAmount] = useState(25);
  const { t } = useI18n();

  const translateResult = (str) => {
    if (!str) return str;
    const phrases = [
      'Win! Pass bets win.', "Push on Don't Pass.", "Don't Pass wins.",
      'Point set:', 'Hit the point', 'Pass wins.', 'Seven out!',
      'point is still', 'Rolled', 'Roll',
    ];
    let out = str;
    phrases.forEach(p => { out = out.replace(p, t(p) || p); });
    return out;
  };
  const state = gameState || {};
  const rid = room?.id;
  const isShooter = !state.shooter || state.shooter === String(user?.id);
  const shooterName = state.shooter && state.players?.[state.shooter]?.username;

  const BET_TYPES = [
    { key: 'pass', label: `✅ ${t('passLine')}`, desc: 'Win on 7/11, lose on 2/3/12', payout: '1:1' },
    { key: 'dont_pass', label: `❌ ${t('dontPass')}`, desc: 'Opposite of Pass', payout: '1:1' },
    { key: 'field', label: `🌾 ${t('field')}`, desc: 'Win on 2,3,4,9,10,11,12', payout: '1:1 / 2:1' },
    { key: 'any_seven', label: `7️⃣ ${t('anySeven')}`, desc: 'Next roll is 7', payout: '4:1' },
    { key: 'any_craps', label: `💀 ${t('anyCraps')}`, desc: 'Next roll is 2/3/12', payout: '7:1' },
  ];

  const placeBet = (type) => {
    sounds.chipBet();
    emit('craps_bet', { type, amount: betAmount, room_id: rid });
  };

  const rollDice = () => {
    sounds.diceRoll();
    emit('craps_roll', { room_id: rid });
  };

  return (
    <div>
      <div className="game-table">
        {/* Point indicator */}
        <div className="text-center mb-2">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {state.point ? `${t('point')}: ${state.point}` : t('comeOutRoll')}
          </div>

          {/* Dice display */}
          <div className="flex justify-center gap-2" style={{ marginBottom: '1rem' }}>
            {state.dice?.[0] > 0 ? (
              <>
                <div className="dice">{state.dice[0]}</div>
                <div className="dice">{state.dice[1]}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 900,
                  fontFamily: 'Outfit', color: 'var(--accent-gold)', marginLeft: '0.5rem'
                }}>
                  = {state.dice[0] + state.dice[1]}
                </div>
              </>
            ) : (
              <>
                <div className="dice" style={{ opacity: 0.3 }}>?</div>
                <div className="dice" style={{ opacity: 0.3 }}>?</div>
              </>
            )}
          </div>

          {/* Roll result message */}
          {state.last_result && (
            <div className="fade-in" style={{
              fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem',
              color: state.last_result.includes('Win') ? 'var(--accent-green)'
                : state.last_result.includes('Lose') ? 'var(--accent-red)' : 'var(--accent-gold)'
            }}>
              {translateResult(state.last_result)}
            </div>
          )}

          {/* Point marker */}
          {state.point && (
            <div style={{
              display: 'inline-block', padding: '0.4rem 1.2rem', borderRadius: 'var(--radius-xl)',
              background: 'var(--accent-gold-dim)', border: '2px solid var(--accent-gold)',
              color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.1rem'
            }}>
              🎯 {t('point')}: {state.point}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

        {/* Active bets display */}
        <div className="text-center">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('yourBets')}</div>
          {(() => {
            const myBets = state.bets?.[String(user?.id)] || [];
            return myBets.length > 0 ? (
              <div className="flex gap-1 justify-center" style={{ flexWrap: 'wrap' }}>
                {myBets.map((b, i) => (
                  <span key={i} style={{
                    padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)',
                    fontSize: '0.8rem', fontWeight: 600
                  }}>
                    {b.type}: ${b.amount}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>{t('noBetsYet')}</p>
            );
          })()}
        </div>

        {/* Results */}
        {state.results && Object.entries(state.results).map(([uid, res]) => (
          uid === String(user?.id) && res.details && (
            <div key={uid} className="fade-in text-center" style={{ marginTop: '1rem' }}>
              {res.details.map((d, i) => (
                <div key={i} className={`result-pop ${d.won ? 'win-glow' : 'lose-shake'}`} style={{
                  padding: '0.5rem', margin: '0.25rem auto', maxWidth: '300px',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600,
                  background: d.won ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                  color: d.won ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  {d.type}: {d.won ? `+ $${d.payout}` : `- $${d.amount}`}
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      {/* Bet Board */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">{t('placeYourBets')}</div>
        <div className="flex gap-1 mb-2">
          {[10, 25, 50, 100, 250].map(v => (
            <button key={v} className={`chip chip-${v <= 25 ? 10 : v <= 50 ? 25 : v <= 100 ? 50 : 100}`}
              onClick={() => setBetAmount(v)}
              style={{ border: betAmount === v ? '3px solid var(--accent-gold)' : undefined }}>
              ${v}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          {BET_TYPES.map(bt => (
            <button key={bt.key} className="btn btn-outline" onClick={() => placeBet(bt.key)}
              style={{ flexDirection: 'column', padding: '0.75rem', textAlign: 'left', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 700 }}>{bt.label}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{bt.desc} • {bt.payout}</span>
            </button>
          ))}
        </div>

        {!isShooter && (
          <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            ⏳ {shooterName || t('opponent')} {t('isRolling')}...
          </p>
        )}
        <button className="btn btn-gold btn-lg" onClick={rollDice} disabled={!isShooter} style={{ width: '100%' }}>
          🎲 {t('rollDice')}
        </button>
      </div>
    </div>
  );
}
