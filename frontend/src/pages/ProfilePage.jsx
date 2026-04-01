import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

export default function ProfilePage() {
  const { user, refreshBalance } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [ctfSolved, setCtfSolved] = useState(0);

  useEffect(() => {
    api.getStats().then(d => setStats(d.stats || [])).catch(() => {});
    api.getHistory(10).then(d => setRecentGames(d.games || [])).catch(() => {});
    api.getChallenges().then(d => {
      setCtfSolved((d.challenges || []).filter(c => c.solved).length);
    }).catch(() => {});
    refreshBalance();
  }, []);

  const totalGames = stats.reduce((s, st) => s + (st.played || 0), 0);
  const totalProfit = stats.reduce((s, st) => s + ((st.total_payout || 0) - (st.total_bet || 0)), 0);
  const winRate = totalGames > 0
    ? Math.round(stats.reduce((s, st) => s + (st.wins || 0), 0) / totalGames * 100) : 0;

  const GAME_ICONS = {
    blackjack: '🃏', holdem: '♠️', roulette: '🎡',
    slots: '🎰', baccarat: '🂡', craps: '🎲'
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1 className="page-title">👤 {t('profileTitle')}</h1>
      </div>

      {/* Profile Card */}
      <div className="card" style={{
        padding: '2rem', marginBottom: '1.5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.05))'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem',
          background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 900, color: 'white'
        }}>
          {(user?.display_name || user?.username || '?')[0].toUpperCase()}
        </div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>
          {user?.display_name || user?.username}
        </h2>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>@{user?.username}</p>
        <div className="balance-badge" style={{ fontSize: '1.2rem', display: 'inline-block', padding: '0.6rem 1.5rem' }}>
          💰 ${user?.balance?.toLocaleString('en-US') || 0}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card text-center fade-in">
          <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🎮</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{totalGames}</div>
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t('gamesPlayed')}</div>
        </div>
        <div className="card text-center fade-in stagger-1">
          <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>{totalProfit >= 0 ? '📈' : '📉'}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: totalProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(0)}
          </div>
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t('netProfit')}</div>
        </div>
        <div className="card text-center fade-in stagger-2">
          <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🏆</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{winRate}%</div>
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t('winRate')}</div>
        </div>
        <div className="card text-center fade-in stagger-3">
          <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🔓</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent-purple)' }}>{ctfSolved}/9</div>
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>{t('ctfFlags')}</div>
        </div>
      </div>

      {/* Per-Game Stats */}
      {stats.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">📊 {t('statsByGame')}</div>
          <div className="table-wrap"><table className="scoreboard-table">
            <thead>
              <tr><th>{t('game')}</th><th>{t('played')}</th><th>{t('totalBetCol')}</th><th>{t('totalWon')}</th><th>{t('net')}</th></tr>
            </thead>
            <tbody>
              {stats.map(s => {
                const net = (s.total_payout || 0) - (s.total_bet || 0);
                return (
                  <tr key={s.game_type}>
                    <td>
                      <span style={{ marginRight: '0.5rem' }}>{GAME_ICONS[s.game_type] || '🎲'}</span>
                      {t(s.game_type)}
                    </td>
                    <td>{s.played}</td>
                    <td>${(s.total_bet || 0).toLocaleString()}</td>
                    <td className="text-green">${(s.total_payout || 0).toLocaleString()}</td>
                    <td className={net >= 0 ? 'text-green' : 'text-red'} style={{ fontWeight: 700 }}>
                      {net >= 0 ? '+' : ''}${net.toFixed(0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      )}

      {/* Recent Games */}
      <div className="card">
        <div className="card-header">🕐 {t('recentGames')}</div>
        {recentGames.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '1.5rem' }}>{t('noGamesYet')}</p>
        ) : (
          <div className="table-wrap"><table className="scoreboard-table">
            <thead><tr><th>{t('game')}</th><th>{t('bet')}</th><th>{t('result')}</th><th>{t('payout')}</th><th>{t('date')}</th></tr></thead>
            <tbody>
              {recentGames.map(g => (
                <tr key={g.id}>
                  <td>
                    <span style={{ marginRight: '0.5rem' }}>{GAME_ICONS[g.game_type] || '🎲'}</span>
                    {t(g.game_type)}
                  </td>
                  <td>${g.bet}</td>
                  <td>
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                      background: g.result === 'win' || g.result === 'blackjack' ? 'var(--accent-green-dim)' : g.result === 'push' ? 'var(--accent-gold-dim)' : 'var(--accent-red-dim)',
                      color: g.result === 'win' || g.result === 'blackjack' ? 'var(--accent-green)' : g.result === 'push' ? 'var(--accent-gold)' : 'var(--accent-red)'
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
