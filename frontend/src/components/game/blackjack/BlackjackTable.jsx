import { useState } from 'react';
import PlayingCard from '../shared/Card';
import { useI18n } from '../../../hooks/useI18n';

export default function BlackjackTable({ gameState, emit, user, room }) {
  const [betAmount, setBetAmount] = useState(50);
  const { t } = useI18n();
  const state = gameState || {};
  const phase = state.phase || 'betting';
  const myId = String(user?.id);
  const myPlayer = state.players?.[myId];
  const isMyTurn = state.current_player === myId;
  const rid = room?.id;

  const placeBet = () => emit('bj_bet', { amount: betAmount, room_id: rid });
  const hit = () => emit('bj_hit', { room_id: rid });
  const stand = () => emit('bj_stand', { room_id: rid });
  const doubleDown = () => emit('bj_double', { room_id: rid });
  const split = () => emit('bj_split', { room_id: rid });
  const newRound = () => emit('bj_reset', { room_id: rid });

  return (
    <div>
      <div className="game-table">
        {/* Dealer */}
        <div className="text-center mb-2">
          <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {t('dealer')} {state.dealer?.score !== '?' ? `• ${state.dealer?.score}` : ''}
          </div>
          <div className="hand justify-center" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {(state.dealer?.hand || []).map((card, i) => (
              <PlayingCard key={i} card={card} />
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

        {/* Players */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(state.players || {}).map(([uid, player]) => (
            <div key={uid} className={`text-center ${state.current_player === uid ? 'active-turn' : ''}`}
              style={{ opacity: player.status?.[0] === 'bust' ? 0.5 : 1, padding: '0.5rem', borderRadius: '10px' }}>
              <div style={{
                fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem',
                color: uid === myId ? 'var(--accent-gold)' : 'var(--text-secondary)',
                padding: '0.3rem 1rem', borderRadius: '20px',
                background: uid === myId ? 'var(--accent-gold-dim)' : 'transparent',
                display: 'inline-block'
              }}>
                {player.username} {uid === myId ? `(${t('you')})` : ''}
              </div>
              {player.hands?.map((hand, hi) => (
                <div key={hi} style={{ marginBottom: '0.5rem' }}>
                  <div className="hand" style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                    {hand.map((card, ci) => <PlayingCard key={ci} card={card} />)}
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: 'var(--text-muted)' }}>
                    {t('score')}: {player.scores?.[hi]} • {t('bet')}: ${player.bets?.[hi]}
                    {player.status?.[hi] && (
                      <span style={{
                        marginLeft: '0.5rem', fontWeight: 700,
                        color: player.status[hi] === 'blackjack' ? 'var(--accent-gold)'
                          : player.status[hi] === 'bust' ? 'var(--accent-red)'
                          : player.status[hi] === 'stand' ? 'var(--accent-green)' : 'var(--text-muted)'
                      }}>
                        {player.status[hi].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Results */}
        {phase === 'payout' && state.results && (
          <div className="fade-in text-center" style={{ marginTop: '1.5rem' }}>
            {Object.entries(state.results).map(([uid, res]) => (
              <div key={uid} style={{
                padding: '0.75rem', borderRadius: 'var(--radius-sm)', margin: '0.5rem auto',
                maxWidth: '300px',
                background: res.total_payout > res.total_bet ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                color: res.total_payout > res.total_bet ? 'var(--accent-green)' : 'var(--accent-red)',
                fontWeight: 700
              }}>
                {uid === myId ? t('you') : state.players[uid]?.username}:
                {res.total_payout > res.total_bet
                  ? ` ${t('won')} $${(res.total_payout - res.total_bet).toFixed(0)}! 🎉`
                  : res.total_payout === res.total_bet ? ` ${t('push')} 🤝` : ` ${t('lost')} $${res.total_bet.toFixed(0)} 😔`}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="card" style={{ marginTop: '1rem' }}>
        {phase === 'betting' && (
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <div className="flex gap-1 items-center">
              {[10, 25, 50, 100, 250, 500].map(v => (
                <button key={v} className={`chip chip-${v <= 25 ? 10 : v <= 50 ? 25 : v <= 100 ? 50 : 100}`}
                  onClick={() => setBetAmount(v)}
                  style={{ border: betAmount === v ? '3px solid var(--accent-gold)' : undefined }}>
                  ${v}
                </button>
              ))}
            </div>
            <input className="input" type="number" value={betAmount} onChange={e => setBetAmount(+e.target.value)}
              style={{ width: '100px' }} />
            <button className="btn btn-gold" onClick={placeBet}>{t('placeBet')}</button>
          </div>
        )}

        {phase === 'playing' && isMyTurn && myPlayer && (
          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-green" onClick={hit}>🃏 {t('hit')}</button>
            <button className="btn btn-primary" onClick={stand}>✋ {t('stand')}</button>
            <button className="btn btn-gold" onClick={doubleDown}
              disabled={myPlayer.hands?.[myPlayer.active_hand]?.length !== 2}>
              💰 {t('double')}
            </button>
            <button className="btn btn-outline" onClick={split}
              disabled={!myPlayer.hands?.[myPlayer.active_hand] ||
                myPlayer.hands[myPlayer.active_hand].length !== 2 ||
                myPlayer.hands[myPlayer.active_hand][0]?.rank !== myPlayer.hands[myPlayer.active_hand][1]?.rank}>
              ✂️ {t('split')}
            </button>
          </div>
        )}

        {phase === 'playing' && !isMyTurn && (
          <p className="text-muted">⏳ {t('waitingFor')} {state.players?.[state.current_player]?.username}{t('turn')}</p>
        )}

        {phase === 'payout' && (
          <button className="btn btn-primary" onClick={newRound}>🔄 {t('newRound')}</button>
        )}

        {phase === 'dealer_turn' && (
          <p className="text-muted">⏳ {t('dealerPlaying')}</p>
        )}
      </div>
    </div>
  );
}
