import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useI18n } from '../hooks/useI18n';

export default function ScoreboardPage() {
  const { t } = useI18n();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    api.getScoreboard().then(d => setPlayers(d.scoreboard || [])).catch(console.error);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 {t('scoreboard')}</h1>
          <p className="page-subtitle">{t('scoreSubtitle')}</p>
        </div>
      </div>

      <div className="card">
        {players.length === 0 ? (
          <p className="text-muted text-center" style={{ padding: '2rem' }}>{t('noPlayers')}</p>
        ) : (
          <table className="scoreboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('playerCol')}</th>
                <th>{t('totalWinnings')}</th>
                <th>{t('gamesPlayed')}</th>
                <th>{t('biggestWin')}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.user_id} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td style={{
                    fontWeight: 800, fontSize: '1.2rem',
                    color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--text-secondary)'
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}
                      dangerouslySetInnerHTML={{ __html: p.display_name || p.username }}
                    />
                  </td>
                  <td className="text-green" style={{ fontWeight: 700 }}>${(p.total_winnings || 0).toLocaleString()}</td>
                  <td>{p.games_played}</td>
                  <td className="text-gold">${(p.biggest_win || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
