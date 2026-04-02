import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../hooks/useSocket';
import { useAuth } from '../../../hooks/useAuth';
import { useI18n } from '../../../hooks/useI18n';
import { sounds } from '../../../utils/sounds';

export default function SlotsGame() {
  const { emit, gameState } = useSocket();
  const { refreshBalance } = useAuth();
  const { t } = useI18n();
  const [betPerLine, setBetPerLine] = useState(10);
  const [lines, setLines] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const stopSlotSound = useRef(null);

  useEffect(() => {
    if (gameState?.reels) {
      if (stopSlotSound.current) { stopSlotSound.current(); stopSlotSound.current = null; }
      setSpinning(false);
      refreshBalance();
      const totalBet = (gameState.bet_per_line || 10) * (gameState.lines || 5);
      if (gameState.total_win > totalBet * 5) sounds.bigWin();
      else if (gameState.total_win > 0) sounds.slotsWin();
    }
  }, [gameState?.reels]);

  const spin = () => {
    setSpinning(true);
    setResult(null);
    sounds.chipBet();
    stopSlotSound.current = sounds.slotsSpin();
    emit('slots_spin', { bet_per_line: betPerLine, lines });
  };

  const displayResult = gameState?.reels ? gameState : result;

  return (
    <div>
      <div className="slots-machine">
        <div className="text-center" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent-gold)' }}>
            🎰 {t('megaJackpot')}
          </h2>
        </div>

        <div className="slots-reels">
          {displayResult?.reels ? displayResult.reels.map((reel, ri) => (
            <div key={ri} className="slots-reel">
              {reel.map((sym, si) => (
                <div key={si} className={`slots-symbol ${spinning ? 'slots-spinning' : ''}`}
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
              <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{t('noWin')}</div>
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
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('betPerLine')}</label>
            <select className="input" value={betPerLine} onChange={e => setBetPerLine(+e.target.value)}
              style={{ width: '100px' }}>
              {[1, 5, 10, 25, 50, 100].map(v => <option key={v} value={v}>${v}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ width: 'auto' }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('lines')}</label>
            <select className="input" value={lines} onChange={e => setLines(+e.target.value)}
              style={{ width: '80px' }}>
              {[1, 3, 5, 7, 9].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="form-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('totalBet')}</div>
            <div style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.2rem' }}>
              ${betPerLine * lines}
            </div>
          </div>
        </div>

        <div className="text-center" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-gold btn-lg" onClick={spin} disabled={spinning}
            style={{ minWidth: '200px', fontSize: '1.1rem' }}>
            {spinning ? `🎰 ${t('spinning')}` : `🎰 ${t('spin')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
