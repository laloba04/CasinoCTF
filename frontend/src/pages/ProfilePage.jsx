import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

const GAME_ICONS = {
  blackjack: '🃏', holdem: '♠️', roulette: '🎡',
  slots: '🎰', baccarat: '🂡', craps: '🎲'
};

const RESULT_STYLE = {
  win:       { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' },
  blackjack: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' },
  push:      { bg: 'var(--accent-gold-dim)',  color: 'var(--accent-gold)'  },
  lose:      { bg: 'var(--accent-red-dim)',   color: 'var(--accent-red)'   },
};

export default function ProfilePage() {
  const { user, refreshBalance } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [ctfSolved, setCtfSolved] = useState(0);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [pwMsg, setPwMsg] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: t('passwordMismatch') });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.changePassword(pwForm.current, pwForm.next);
      setPwMsg({ type: 'ok', text: t('passwordChanged') });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err?.error || 'Error' });
    } finally {
      setPwSaving(false);
    }
  }

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '🎮', value: totalGames, label: t('gamesPlayed'), color: null },
          { icon: totalProfit >= 0 ? '📈' : '📉', value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(0)}`, label: t('netProfit'), color: totalProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
          { icon: '🏆', value: `${winRate}%`, label: t('winRate'), color: null },
          { icon: '🔓', value: `${ctfSolved}/9`, label: t('ctfFlags'), color: 'var(--accent-purple)' },
        ].map((s, i) => (
          <div key={i} className={`card text-center fade-in stagger-${i}`} style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: s.color || 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-muted" style={{ fontSize: '0.78rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-Game Stats */}
      {stats.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>📊 {t('statsByGame')}</div>
          {stats.map(s => {
            const net = (s.total_payout || 0) - (s.total_bet || 0);
            return (
              <div key={s.game_type} className="history-row">
                <div className="history-game">
                  <span style={{ fontSize: '1.4rem' }}>{GAME_ICONS[s.game_type] || '🎲'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t(s.game_type)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.played} {t('gamesPlayed').toLowerCase()}</div>
                  </div>
                </div>
                <div className="history-meta">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>${(s.total_bet || 0).toLocaleString()}</span>
                  <span className="text-green" style={{ fontSize: '0.85rem' }}>${(s.total_payout || 0).toLocaleString()}</span>
                  <span style={{ fontWeight: 700, color: net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.9rem' }}>
                    {net >= 0 ? '+' : ''}${net.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Change Password */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>
          🔑 {t('changePassword')}
        </h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { key: 'current', label: t('currentPassword') },
            { key: 'next',    label: t('newPassword') },
            { key: 'confirm', label: t('confirmPassword') },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={pwShow[key] ? 'text' : 'password'}
                  className="input"
                  value={pwForm[key]}
                  onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setPwShow(s => ({ ...s, [key]: !s[key] }))}
                  style={{
                    position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: '1rem', lineHeight: 1, padding: '0.2rem'
                  }}
                  tabIndex={-1}
                  aria-label={pwShow[key] ? 'Hide password' : 'Show password'}
                >
                  {pwShow[key] ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          ))}
          {pwMsg && (
            <p style={{ fontSize: '0.85rem', color: pwMsg.type === 'ok' ? 'var(--accent-green)' : 'var(--accent-red)', margin: 0 }}>
              {pwMsg.type === 'ok' ? '✓' : '✗'} {pwMsg.text}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={pwSaving} style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
            {pwSaving ? t('saving') : t('changePassword')}
          </button>
        </form>
      </div>

      {/* Recent Games */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>🕐 {t('recentGames')}</div>
        {recentGames.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>{t('noGamesYet')}</p>
        ) : recentGames.map(g => {
          const rs = RESULT_STYLE[g.result] || RESULT_STYLE.lose;
          const label = t(g.result) ? t(g.result).toUpperCase() : g.result?.toUpperCase();
          return (
            <div key={g.id} className="history-row">
              <div className="history-game">
                <span style={{ fontSize: '1.4rem' }}>{GAME_ICONS[g.game_type] || '🎲'}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t(g.game_type)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(g.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="history-meta">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>${g.bet}</span>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
                  background: rs.bg, color: rs.color
                }}>{label}</span>
                <span style={{ fontWeight: 700, color: g.payout > 0 ? 'var(--accent-green)' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {g.payout > 0 ? '+' : ''}${g.payout}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
