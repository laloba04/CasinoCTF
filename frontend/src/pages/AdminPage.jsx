import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';

export default function AdminPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBalances, setEditBalances] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.adminGetUsers()
      .then(d => setUsers(d.users || []))
      .catch(() => setMsg({ ok: false, text: 'Failed to load users' }))
      .finally(() => setLoading(false));
  }, []);

  function flash(ok, text) {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleSetBalance(u) {
    const val = editBalances[u.id];
    if (val === undefined || val === '') return;
    try {
      await api.adminSetBalance(u.id, val);
      setUsers(us => us.map(x => x.id === u.id ? { ...x, balance: parseFloat(val) } : x));
      setEditBalances(e => { const n = { ...e }; delete n[u.id]; return n; });
      flash(true, t('adminBalanceUpdated'));
    } catch (e) {
      flash(false, e.error || 'Error');
    }
  }

  async function handleToggleAdmin(u) {
    try {
      const res = await api.adminToggleAdmin(u.id);
      setUsers(us => us.map(x => x.id === u.id ? { ...x, is_admin: res.is_admin } : x));
    } catch (e) {
      flash(false, e.error || 'Error');
    }
  }

  async function handleDelete(u) {
    try {
      await api.adminDeleteUser(u.id);
      setUsers(us => us.filter(x => x.id !== u.id));
      flash(true, t('adminUserDeleted'));
    } catch (e) {
      flash(false, e.error || 'Error');
    } finally {
      setConfirmId(null);
    }
  }

  const isSelf = (u) => u.id === user?.id;

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1 className="page-title">🛡️ {t('adminPanel')}</h1>
        <span className="text-muted" style={{ fontSize: '0.9rem' }}>{users.length} {t('adminUsersTotal')}</span>
      </div>

      {msg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: msg.ok ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
          color: msg.ok ? 'var(--accent-green)' : 'var(--accent-red)',
          fontWeight: 600
        }}>{msg.text}</div>
      )}

      {loading ? (
        <p className="text-muted text-center" style={{ padding: '3rem' }}>⏳ {t('loading')}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.75rem' }}>
          {users.map(u => (
            <div key={u.id} className="card fade-in" style={{
              padding: '1rem 1.25rem',
              opacity: isSelf(u) ? 0.75 : 1,
              borderLeft: `3px solid ${u.is_admin ? 'var(--accent-purple)' : 'var(--border)'}`
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 700 }}>{u.username}</span>
                  {isSelf(u) && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{t('you')}</span>}
                  {u.display_name !== u.username && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>· {u.display_name}</span>}
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '12px',
                  background: u.is_admin ? 'rgba(168,85,247,0.15)' : 'var(--surface-2)',
                  color: u.is_admin ? 'var(--accent-purple)' : 'var(--text-muted)'
                }}>
                  {u.is_admin ? '🛡️ Admin' : '👤 User'}
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>#{u.id}</span>
                <span>{u.games_played} {t('gamesPlayed').toLowerCase()}</span>
                <span style={{ color: u.total_winnings >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                  {u.total_winnings >= 0 ? '+' : ''}${(u.total_winnings || 0).toFixed(0)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  value={editBalances[u.id] ?? u.balance}
                  onChange={e => setEditBalances(b => ({ ...b, [u.id]: e.target.value }))}
                  style={{ width: '95px', padding: '0.28rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' }}
                  min="0"
                />
                {editBalances[u.id] !== undefined && (
                  <button className="btn btn-sm btn-primary" style={{ padding: '0.28rem 0.65rem', fontSize: '0.78rem' }} onClick={() => handleSetBalance(u)}>✓</button>
                )}

                <div style={{ flex: 1 }} />

                <button
                  className={`btn btn-sm ${u.is_admin ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.75rem', padding: '0.28rem 0.65rem' }}
                  onClick={() => handleToggleAdmin(u)}
                  disabled={isSelf(u)}
                >
                  {u.is_admin ? '🛡️ Admin' : '👤 User'}
                </button>

                {confirmId === u.id ? (
                  <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: 600 }}>¿Seguro?</span>
                    <button
                      onClick={() => handleDelete(u)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', borderRadius: '6px', border: 'none', background: 'var(--accent-red)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
                    >Sí</button>
                    <button
                      onClick={() => setConfirmId(null)}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >No</button>
                  </div>
                ) : (
                  <button
                    className="btn-danger-outline"
                    onClick={() => setConfirmId(u.id)}
                    disabled={isSelf(u) || u.is_admin}
                    title={u.is_admin ? t('adminCantDeleteAdmin') : ''}
                  >
                    🗑️ {t('delete')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
