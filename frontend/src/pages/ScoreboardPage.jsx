import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useI18n } from '../hooks/useI18n';

export default function ScoreboardPage() {
  const { t } = useI18n();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    api.getScoreboard().then(d => setPlayers(d.scoreboard || [])).catch(console.error);
  }, []);

  const rankIcon = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
  const rankColor = i => i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-muted)';

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 {t('scoreboard')}</h1>
          <p className="page-subtitle">{t('scoreSubtitle')}</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div className="sb-header">
          <span style={{ minWidth: 48 }}>#</span>
          <span style={{ flex: 1 }}>{t('playerCol')}</span>
          <span className="sb-col">{t('totalWinnings')}</span>
          <span className="sb-col sb-hide-sm">{t('gamesPlayed')}</span>
          <span className="sb-col sb-hide-sm">{t('biggestWin')}</span>
        </div>

        {players.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '3rem' }}>{t('noPlayers')}</p>
        ) : players.map((p, i) => (
          <div key={p.user_id} className={`sb-row fade-in ${i < 3 ? 'sb-top' : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}>
            <span style={{ minWidth: 48, fontWeight: 800, fontSize: i < 3 ? '1.3rem' : '1rem', color: rankColor(i) }}>
              {rankIcon(i)}
            </span>
            <span style={{ flex: 1, fontWeight: 700 }}
              dangerouslySetInnerHTML={{ __html: p.display_name || p.username }}
            />
            <span className="sb-col text-green" style={{ fontWeight: 700 }}>
              ${(p.total_winnings || 0).toLocaleString()}
            </span>
            <span className="sb-col sb-hide-sm text-muted">{p.games_played}</span>
            <span className="sb-col sb-hide-sm text-gold">${(p.biggest_win || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
