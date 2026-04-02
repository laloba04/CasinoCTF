import { useState } from 'react';
import PlayingCard from '../shared/Card';
import { useI18n } from '../../../hooks/useI18n';

export default function HoldemTable({ gameState, emit, user, room }) {
  const [raiseAmount, setRaiseAmount] = useState(50);
  const { t } = useI18n();
  const state = gameState || {};
  const phase = state.phase || 'waiting';
  const myId = String(user?.id);
  const myPlayer = state.players?.[myId];
  const isMyTurn = state.current_player === myId;
  const rid = room?.id;

  const startGame = () => emit('holdem_start', { room_id: rid });
  const fold = () => emit('holdem_action', { action: 'fold', room_id: rid });
  const check = () => emit('holdem_action', { action: 'check', room_id: rid });
  const call = () => emit('holdem_action', { action: 'call', room_id: rid });
  const raise = () => emit('holdem_action', { action: 'raise', amount: raiseAmount, room_id: rid });
  const allIn = () => emit('holdem_action', { action: 'all_in', room_id: rid });

  const PHASE_NAMES = { preflop: 'Pre-Flop', flop: 'Flop', turn: 'Turn', river: 'River', showdown: 'Showdown' };

  return (
    <div>
      <div className="game-table">
        {/* Community Cards */}
        <div className="text-center mb-2">
          <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {PHASE_NAMES[phase] || phase} {state.pot ? `• ${t('pot')}: $${state.pot}` : ''}
          </div>
          <div className="hand" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', minHeight: '100px' }}>
            {(state.community || []).map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
            {phase === 'waiting' && (
              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                {t('waitingForPlayers')}
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

        {/* Players */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(state.players || {}).map(([uid, player]) => (
            <div key={uid} className={state.current_player === uid ? 'active-turn' : ''} style={{
              padding: '1rem',
              background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-lg)',
              border: '1px solid ' + (player.folded ? 'var(--border)' : 'var(--accent-purple)'),
              opacity: player.folded ? 0.5 : 1,
              minWidth: '160px', textAlign: 'center',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: player.username === 'House Dealer' ? 'var(--accent-gold)' : (uid === myId ? 'var(--accent-purple)' : 'white') }}>
                {player.username === 'House Dealer' ? t('houseDealer') : (player.display_name || player.username)} {uid === myId ? `(${t('you')})` : ''}
                {player.folded && ' 🚫'}
              </div>

              {/* Hole Cards */}
              <div className="hand" style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', marginBottom: '0.3rem' }}>
                {(player.hole_cards || []).map((card, ci) => (
                  <PlayingCard key={ci} card={card} />
                ))}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('stack')}: ${player.chips || 0}
                {player.current_bet > 0 && <span className="text-gold"> • {t('bet')}: ${player.current_bet}</span>}
              </div>

              {uid === state.dealer && (
                <div style={{
                  fontSize: '0.65rem', marginTop: '0.2rem', padding: '0.1rem 0.4rem',
                  borderRadius: '10px', display: 'inline-block',
                  background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)'
                }}>
                  D
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Showdown results */}
        {phase === 'showdown' && state.results && (
          <div className="fade-in text-center" style={{ marginTop: '1.5rem' }}>
            {Object.entries(state.results).map(([uid, res]) => {
              const username = state.players?.[uid]?.username || uid;
              return (
                <div key={uid} style={{
                  padding: '0.75rem', borderRadius: 'var(--radius-sm)', margin: '0.5rem auto',
                  maxWidth: '350px',
                  background: res.winner ? 'var(--accent-green-dim)' : 'rgba(0,0,0,0.3)',
                  color: res.winner ? 'var(--accent-green)' : 'var(--text-muted)',
                  fontWeight: 700
                }}>
                  {res.winner ? '🏆' : '🃏'} {username === 'House Dealer' ? t('houseDealer') : username}
                  {res.winner ? ` ${t('wins')} $${res.payout}` : ''} {res.hand ? `— ${res.hand}` : ''}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="card" style={{ marginTop: '1rem' }}>
        {phase === 'waiting' && (
          <div className="flex items-center gap-2">
            <button className="btn btn-primary btn-lg" onClick={startGame}>🃏 {t('startHand')}</button>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              {Object.keys(state.players || {}).length} {t('playersAtTable')}
            </span>
          </div>
        )}

        {(['preflop', 'flop', 'turn', 'river'].includes(phase)) && isMyTurn && (
          <div className="flex gap-1 items-center" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-danger" onClick={fold}>🚫 {t('fold')}</button>
            <button className="btn btn-outline" onClick={check}
              disabled={state.current_bet > (myPlayer?.current_bet || 0)}>
              ✓ {t('check')}
            </button>
            <button className="btn btn-green" onClick={call}>
              📞 {t('call')} {state.current_bet > (myPlayer?.current_bet || 0)
                ? `$${state.current_bet - (myPlayer?.current_bet || 0)}` : ''}
            </button>
            <div className="flex gap-1 items-center">
              <input className="input" type="number" value={raiseAmount}
                onChange={e => setRaiseAmount(+e.target.value)}
                style={{ width: '90px' }} min={state.min_raise || 10} />
              <button className="btn btn-gold" onClick={raise}>💰 {t('raise')}</button>
            </div>
            <button className="btn btn-primary" onClick={allIn}>🔥 {t('allIn')}</button>
          </div>
        )}

        {(['preflop', 'flop', 'turn', 'river'].includes(phase)) && !isMyTurn && (
          <p className="text-muted">⏳ {t('waitingFor')} {state.players?.[state.current_player]?.username === 'House Dealer' ? t('houseDealer') : state.players?.[state.current_player]?.username || 'opponent'}...</p>
        )}

        {phase === 'showdown' && (
          <button className="btn btn-primary" onClick={startGame}>🔄 {t('nextHand')}</button>
        )}
      </div>
    </div>
  );
}
