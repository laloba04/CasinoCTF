import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useI18n } from '../hooks/useI18n';

export default function HistoryPage() {
  const { t } = useI18n();
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    api.getHistory(50).then(d => setGames(d.games || [])).catch(console.error);
    api.getStats().then(d => setStats(d.stats || [])).catch(console.error);
  }, []);

  const GAME_ICONS = {
    blackjack: '🃏', holdem: '♠️', roulette: '🎡',
    slots: '🎰', baccarat: '🂡', craps: '🎲'
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 {t('gameHistory')}</h1>
        </div>
      </div>

      {stats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {stats.map((s, i) => {
            const net = (s.total_payout || 0) - (s.total_bet || 0);
            return (
              <div key={s.game_type} className="card text-center fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: '2rem' }}>{GAME_ICONS[s.game_type] || '🎲'}</div>
                <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{t(s.game_type)}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{s.played} {t('gamesPlayed').toLowerCase()}</div>
                <div style={{ fontWeight: 700, color: net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '1.1rem' }}>
                  {net >= 0 ? '+' : ''}${net.toFixed(0)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        {games.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '2rem' }}>{t('noGamesYet')}</p>
        ) : (
          <div className="table-wrap"><table className="scoreboard-table">
            <thead><tr><th>{t('game')}</th><th>{t('bet')}</th><th>{t('result')}</th><th>{t('payout')}</th><th>{t('date')}</th></tr></thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id} className="fade-in">
                  <td>
                    <span style={{ marginRight: '0.4rem' }}>{GAME_ICONS[g.game_type] || '🎲'}</span>
                    {t(g.game_type)}
                  </td>
                  <td>${g.bet}</td>
                  <td>
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                      background: g.result === 'win' ? 'var(--accent-green-dim)' : g.result === 'push' ? 'var(--accent-gold-dim)' : 'var(--accent-red-dim)',
                      color: g.result === 'win' ? 'var(--accent-green)' : g.result === 'push' ? 'var(--accent-gold)' : 'var(--accent-red)'
                    }}>{t(g.result) ? t(g.result).toUpperCase() : g.result?.toUpperCase()}</span>
                  </td>
                  <td className={g.payout > 0 ? 'text-green' : ''}>${g.payout}</td>
                  <td className="text-muted">{new Date(g.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
