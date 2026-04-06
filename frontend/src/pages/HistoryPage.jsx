import { useState, useEffect } from 'react';
import { api } from '../utils/api';
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

const GAME_TYPES = ['blackjack', 'holdem', 'roulette', 'slots', 'baccarat', 'craps'];

export default function HistoryPage() {
  const { t } = useI18n();
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getHistory(50).then(d => setGames(d.games || [])),
      api.getStats().then(d => setStats(d.stats || [])),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? games : games.filter(g => g.game_type === filter);

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 {t('gameHistory')}</h1>
        </div>
      </div>

      {loading && <p className="text-muted text-center" style={{ padding: '3rem' }}>⏳ {t('loading')}</p>}

      <div className="history-layout" style={{ display: loading ? 'none' : undefined }}>
        {/* Sidebar: stats + filters */}
        <div className="history-sidebar">
          {stats.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {stats.map((s, i) => {
                const net = (s.total_payout || 0) - (s.total_bet || 0);
                const active = filter === s.game_type;
                return (
                  <div
                    key={s.game_type}
                    className="card text-center fade-in"
                    onClick={() => setFilter(active ? 'all' : s.game_type)}
                    style={{
                      animationDelay: `${i * 0.1}s`, padding: '0.85rem', cursor: 'pointer',
                      outline: active ? '2px solid var(--accent-purple)' : 'none',
                      transition: 'outline 0.15s'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{GAME_ICONS[s.game_type] || '🎲'}</div>
                    <div style={{ fontWeight: 700, textTransform: 'capitalize', fontSize: '0.8rem', margin: '0.2rem 0' }}>{t(s.game_type)}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{s.played} {t('gamesPlayed').toLowerCase()}</div>
                    <div style={{ fontWeight: 800, color: net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      {net >= 0 ? '+' : ''}${net.toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filter bar */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
              onClick={() => setFilter('all')}
            >
              {t('all')}
            </button>
            {GAME_TYPES.filter(gt => games.some(g => g.game_type === gt)).map(gt => (
              <button
                key={gt}
                className={`btn ${filter === gt ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.9rem' }}
                onClick={() => setFilter(filter === gt ? 'all' : gt)}
              >
                {GAME_ICONS[gt]} {t(gt)}
              </button>
            ))}
          </div>
        </div>

        {/* Main: history list */}
        <div className="history-main">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '3rem' }}>{t('noGamesYet')}</p>
            ) : filtered.map(g => {
              const rs = RESULT_STYLE[g.result] || RESULT_STYLE.lose;
              const label = t(g.result) ? t(g.result).toUpperCase() : g.result?.toUpperCase();
              return (
                <div key={g.id} className="history-row fade-in">
                  <div className="history-game">
                    <span style={{ fontSize: '1.5rem' }}>{GAME_ICONS[g.game_type] || '🎲'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t(g.game_type)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(g.created_at).toLocaleDateString()}
                      </div>
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
      </div>
    </div>
  );
}
