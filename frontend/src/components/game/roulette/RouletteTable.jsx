import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../../hooks/useI18n';
import { sounds } from '../../../utils/sounds';

const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

export default function RouletteTable({ gameState, emit, user, room }) {
  const [betAmount, setBetAmount] = useState(25);
  const [myBets, setMyBets] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const { t } = useI18n();
  const state = gameState || {};
  const rid = room?.id;
  const prevNumber = useRef(undefined);

  useEffect(() => {
    const num = state.number ?? state.result;
    if (num !== undefined && num !== prevNumber.current) {
      setSpinning(false);
      sounds.rouletteStop();
      const myRes = state.results?.[String(user?.id)];
      if (myRes) { if (myRes.total_win > 0) sounds.win(); else sounds.lose(); }
      prevNumber.current = num;
    }
  }, [state.number, state.result]);

  const placeBet = (type, value) => {
    sounds.chipBet();
    emit('roulette_bet', { type, value, amount: betAmount, room_id: rid });
    setMyBets(prev => [...prev, { type, value, amount: betAmount }]);
  };

  const spinWheel = () => {
    sounds.rouletteStart();
    setSpinning(true);
    prevNumber.current = undefined;
    emit('roulette_spin', { room_id: rid });
    setMyBets([]);
  };

  const resultNumber = state.number ?? state.result;
  const resultColor = resultNumber !== undefined
    ? (resultNumber === 0 ? 'green' : RED.has(resultNumber) ? 'red' : 'black') : null;

  return (
    <div>
      <div className="game-table">
        <div className="flex justify-center items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {/* Wheel */}
          <div className={`roulette-wheel ${spinning ? 'roulette-spinning' : ''}`}>
            {spinning ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>🎡</span>
            ) : resultNumber !== undefined ? (
              <span className={`roulette-number ${resultColor}`}>{resultNumber}</span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>?</span>
            )}
          </div>

          {/* Bet Board */}
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <div className="text-center mb-2">
              <div className="flex gap-1 justify-center" style={{ flexWrap: 'wrap' }}>
                {[10, 25, 50, 100].map(v => (
                  <button key={v} className={`chip chip-${v <= 25 ? 10 : v <= 50 ? 25 : 50}`}
                    onClick={() => setBetAmount(v)}
                    style={{ border: betAmount === v ? '3px solid var(--accent-gold)' : undefined }}>
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Numbers grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3px', marginBottom: '0.5rem' }}>
              <div className="bet-cell" style={{ gridColumn: '1/13', background: 'var(--accent-green-dim)' }}
                onClick={() => placeBet('straight', 0)}>0</div>
              {Array.from({ length: 36 }, (_, i) => i + 1).map(n => (
                <div key={n}
                  className={`bet-cell ${RED.has(n) ? 'red-cell' : 'black-cell'}`}
                  style={{ background: RED.has(n) ? 'var(--accent-red-dim)' : 'rgba(30,41,59,0.6)' }}
                  onClick={() => placeBet('straight', n)}>
                  {n}
                </div>
              ))}
            </div>

            {/* Outside bets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              <div className="bet-cell" onClick={() => placeBet('red', null)}
                style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>🔴 {t('red')}</div>
              <div className="bet-cell" onClick={() => placeBet('black', null)}
                style={{ background: 'rgba(30,41,59,0.8)' }}>⚫ {t('black')}</div>
              <div className="bet-cell" onClick={() => placeBet('even', null)}>{t('even')}</div>
              <div className="bet-cell" onClick={() => placeBet('odd', null)}>{t('odd')}</div>
              <div className="bet-cell" onClick={() => placeBet('low', null)}>{t('low')}</div>
              <div className="bet-cell" onClick={() => placeBet('high', null)}>{t('high')}</div>
              <div className="bet-cell" onClick={() => placeBet('dozen', 1)} style={{ gridColumn: 'span 2' }}>{t('first12')}</div>
              <div className="bet-cell" onClick={() => placeBet('dozen', 2)} style={{ gridColumn: 'span 2' }}>{t('second12')}</div>
              <div className="bet-cell" onClick={() => placeBet('dozen', 3)} style={{ gridColumn: 'span 2' }}>{t('third12')}</div>
            </div>
          </div>
        </div>

        {/* Results */}
        {state.results && (
          <div className="fade-in text-center" style={{ marginTop: '1.5rem' }}>
            {Object.entries(state.results).map(([uid, res]) => (
              <div key={uid} className={`result-pop ${res.total_win > 0 ? 'win-glow' : 'lose-shake'}`} style={{
                padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                background: res.total_win > 0 ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                color: res.total_win > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                fontWeight: 700, maxWidth: '300px', margin: '0.5rem auto'
              }}>
                {res.total_win > 0 ? `🎉 ${t('won')} $${res.total_win}!` : `${t('lost')} $${res.total_bet}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="flex items-center justify-between">
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            {myBets.length} {t('betsPlaced')} • {t('total')}: ${myBets.reduce((s, b) => s + b.amount, 0)}
          </div>
          <button className="btn btn-gold btn-lg" onClick={spinWheel} disabled={myBets.length === 0}>
            🎡 {t('spinWheel')}
          </button>
        </div>
      </div>
    </div>
  );
}
