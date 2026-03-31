import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function HistoryPage() {
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    api.getHistory(50).then(d => setGames(d.games)).catch(console.error);
    api.getStats().then(d => setStats(d.stats)).catch(console.error);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1 className="page-title">📊 Game History</h1>
      </div>

      {stats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {stats.map(s => (
            <div key={s.game_type} className="card text-center fade-in">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {s.game_type === 'blackjack' ? '🃏' : s.game_type === 'slots' ? '🎰' : s.game_type === 'roulette' ? '🎡' : '🎲'}
              </div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, textTransform: 'capitalize' }}>{s.game_type}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{s.played} games</div>
              <div className={s.total_payout - s.total_bet >= 0 ? 'text-green' : 'text-red'}
                style={{ fontWeight: 700, marginTop: '0.25rem' }}>
                {s.total_payout - s.total_bet >= 0 ? '+' : ''}${(s.total_payout - s.total_bet).toFixed(0)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <table className="scoreboard-table">
          <thead>
            <tr><th>Game</th><th>Bet</th><th>Result</th><th>Payout</th><th>Date</th></tr>
          </thead>
          <tbody>
            {games.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                No games played yet. Hit the lobby!
              </td></tr>
            ) : games.map(g => (
              <tr key={g.id}>
                <td style={{ textTransform: 'capitalize' }}>{g.game_type}</td>
                <td>${g.bet}</td>
                <td>
                  <span style={{
                    padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                    background: g.result === 'win' || g.result === 'blackjack' ? 'var(--accent-green-dim)' : g.result === 'push' ? 'var(--accent-gold-dim)' : 'var(--accent-red-dim)',
                    color: g.result === 'win' || g.result === 'blackjack' ? 'var(--accent-green)' : g.result === 'push' ? 'var(--accent-gold)' : 'var(--accent-red)'
                  }}>
                    {g.result.toUpperCase()}
                  </span>
                </td>
                <td className={g.payout > 0 ? 'text-green' : ''}>${g.payout}</td>
                <td className="text-muted">{new Date(g.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
