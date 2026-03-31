import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function ScoreboardPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.getScoreboard().then(d => setEntries(d.scoreboard)).catch(console.error);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Scoreboard</h1>
          <p className="page-subtitle">Top players ranked by total winnings</p>
        </div>
      </div>

      <div className="card">
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Total Winnings</th>
              <th>Games Played</th>
              <th>Biggest Win</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                No players yet. Start playing to climb the ranks!
              </td></tr>
            ) : entries.map((entry, i) => (
              <tr key={i} className="fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <td>
                  <span className={`rank-badge ${i < 3 ? `rank-${i+1}` : ''}`}>
                    {i === 0 ? '👑' : i + 1}
                  </span>
                </td>
                {/* CTF VULNERABILITY #2: XSS via dangerouslySetInnerHTML */}
                <td dangerouslySetInnerHTML={{ __html: entry.display_name }} />
                <td className={entry.total_winnings >= 0 ? 'text-green' : 'text-red'}>
                  ${entry.total_winnings?.toLocaleString() || 0}
                </td>
                <td>{entry.games_played || 0}</td>
                <td className="text-gold">${entry.biggest_win?.toLocaleString() || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
