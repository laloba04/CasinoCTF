import { useState } from 'react';
import PlayingCard from '../shared/Card';
import { useI18n } from '../../../hooks/useI18n';

export default function BaccaratTable({ gameState, emit, user, room }) {
  const [betAmount, setBetAmount] = useState(50);
  const [betSide, setBetSide] = useState(null);
  const { t } = useI18n();
  const state = gameState || {};
  const phase = state.phase || 'betting';
  const rid = room?.id;

  const placeBet = () => {
    if (!betSide) return;
    emit('baccarat_bet', { side: betSide, amount: betAmount, room_id: rid });
  };

  const deal = () => emit('baccarat_deal', { room_id: rid });

  const SIDES = [
    { key: 'player', label: `👤 ${t('playerBet')}`, payout: '1:1', color: 'var(--accent-blue)' },
    { key: 'banker', label: `🏦 ${t('bankerBet')}`, payout: '0.95:1', color: 'var(--accent-red)' },
    { key: 'tie', label: `🤝 ${t('tieBet')}`, payout: '8:1', color: 'var(--accent-green)' },
  ];

  return (
    <div>
      <div className="game-table">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          {/* Player Hand */}
          <div className="text-center">
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              {t('player')} {state.player_total !== undefined ? `• ${state.player_total}` : ''}
            </div>
            <div className="hand" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', minHeight: '100px' }}>
              {(state.player_hand || []).map((card, i) => (
                <PlayingCard key={i} card={card} />
              ))}
            </div>
          </div>

          {/* Banker Hand */}
          <div className="text-center">
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
              {t('banker')} {state.banker_total !== undefined ? `• ${state.banker_total}` : ''}
            </div>
            <div className="hand" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', minHeight: '100px' }}>
              {(state.banker_hand || []).map((card, i) => (
                <PlayingCard key={i} card={card} />
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        {state.result && (
          <div className="fade-in text-center" style={{ marginTop: '1.5rem' }}>
            <div style={{
              padding: '1rem', borderRadius: 'var(--radius-md)', maxWidth: '300px', margin: '0 auto',
              background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)',
              fontWeight: 800, fontSize: '1.2rem'
            }}>
              🏆 {state.result === 'player' ? t('playerBet') : state.result === 'banker' ? t('bankerBet') : t('tieBet')}!
            </div>
            {state.results && Object.entries(state.results).map(([uid, res]) => {
              const betAmt = state.bets?.[uid]?.amount || 0;
              return (
                <div key={uid} style={{
                  marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
                  color: res.payout > 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  {res.payout > 0 ? `+ $${Math.round(res.payout)} 🎉` : `- $${betAmt} 😔`}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="card" style={{ marginTop: '1rem' }}>
        {phase === 'betting' && (
          <div>
            <div className="flex gap-2 justify-center mb-2" style={{ flexWrap: 'wrap' }}>
              {SIDES.map(side => (
                <button key={side.key}
                  className={`btn ${betSide === side.key ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => setBetSide(side.key)}
                  style={{ minWidth: '140px', flexDirection: 'column', padding: '1rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{side.label}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{t('pays')} {side.payout}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[25, 50, 100, 250].map(v => (
                  <button key={v} className={`chip chip-${v <= 25 ? 10 : v <= 50 ? 25 : v <= 100 ? 50 : 100}`}
                    onClick={() => setBetAmount(v)}
                    style={{ border: betAmount === v ? '3px solid var(--accent-gold)' : undefined }}>
                    ${v}
                  </button>
                ))}
              </div>
              <button className="btn btn-gold" onClick={placeBet} disabled={!betSide}>
                {t('placeBet')} ${betAmount}
              </button>
            </div>
          </div>
        )}

        {Object.keys(state.bets || {}).length > 0 && !state.result && (
          <div className="flex items-center justify-between">
            <span className="text-muted">{t('betPlacedOn')} {betSide && t(betSide + 'Bet')}</span>
            <button className="btn btn-primary btn-lg" onClick={deal}>🂡 {t('dealCards')}</button>
          </div>
        )}

        {state.result && (
          <div className="text-center mt-2">
            <button className="btn btn-primary" onClick={() => {
              setBetSide(null);
              emit('baccarat_join', { room_id: rid });
            }}>
              🔄 {t('newRound')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
