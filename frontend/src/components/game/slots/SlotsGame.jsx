import { useState } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { useAuth } from '../../../hooks/useAuth';

export default function SlotsGame() {
  const { emit, gameState } = useSocket();
  const { refreshBalance } = useAuth();
  const [betPerLine, setBetPerLine] = useState(10);
  const [lines, setLines] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const spin = () => {
    setSpinning(true);
    setResult(null);
    emit('slots_spin', { bet_per_line: betPerLine, lines });
    setTimeout(() => setSpinning(false), 1500);
  };

  const displayResult = gameState?.reels ? gameState : result;

  return (
    <div>
      <div className="slots-machine">
        <div className="text-center" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent-gold)' }}>
            🎰 MEGA JACKPOT SLOTS
          </h2>
        </div>

        <div className="slots-reels">
          {displayResult?.reels ? displayResult.reels.map((reel, ri) => (
            <div key={ri} className="slots-reel">
              {reel.map((sym, si) => (
                <div key={si} className={`slots-symbol ${spinning ? 'fade-in' : ''}`}
                  style={{ animationDelay: `${ri * 0.15}s` }}>
                  {sym}
                </div>
              ))}
            </div>
          )) : (
            Array.from({ length: 5 }, (_, ri) => (
              <div key={ri} className="slots-reel">
                {Array.from({ length: 3 }, (_, si) => (
                  <div key={si} className="slots-symbol" style={{ opacity: 0.3 }}>❓</div>
                ))}
              </div>
            ))
          )}
        </div>

        {displayResult && !spinning && (
          <div className="text-center fade-in" style={{ marginBottom: '1rem' }}>
            {displayResult.total_win > 0 ? (
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                🎉 WIN: ${displayResult.total_win}!
              </div>
            ) : displayResult.reels ? (
              <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>No win this spin</div>
            ) : null}
            {displayResult.wins?.filter(w => w.line !== 'scatter').map((win, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: 'var(--accent-green)', marginTop: '0.25rem' }}>
                Line {win.line + 1}: {win.symbols?.join(' ')} → ${win.payout}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-2" style={{ flexWrap: 'wrap' }}>
          <div className="form-group" style={{ width: 'auto' }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Bet/Line</label>
            <select className="input" value={betPerLine} onChange={e => setBetPerLine(+e.target.value)}
              style={{ width: '100px' }}>
              {[1, 5, 10, 25, 50, 100].map(v => <option key={v} value={v}>${v}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ width: 'auto' }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Lines</label>
            <select className="input" value={lines} onChange={e => setLines(+e.target.value)}
              style={{ width: '80px' }}>
              {[1, 3, 5, 7, 9].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Bet</div>
            <div style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.2rem' }}>
              ${betPerLine * lines}
            </div>
          </div>
        </div>

        <div className="text-center" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-gold btn-lg" onClick={spin} disabled={spinning}
            style={{ minWidth: '200px', fontSize: '1.1rem' }}>
            {spinning ? '🎰 SPINNING...' : '🎰 SPIN!'}
          </button>
        </div>
      </div>
    </div>
  );
}
