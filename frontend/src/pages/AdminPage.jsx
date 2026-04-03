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
    if (!confirm(`${t('adminDeleteConfirm')} "${u.username}"?`)) return;
    try {
      await api.adminDeleteUser(u.id);
      setUsers(us => us.filter(x => x.id !== u.id));
      flash(true, t('adminUserDeleted'));
    } catch (e) {
      flash(false, e.error || 'Error');
    }
  }

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1 className="page-title">🛡️ {t('adminPanel')}</h1>
      </div>

      {msg && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: msg.ok ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
          color: msg.ok ? 'var(--accent-green)' : 'var(--accent-red)',
          fontWeight: 600
        }}>{msg.text}</div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p className="text-muted text-center" style={{ padding: '3rem' }}>⏳ {t('loading')}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {['ID', t('username'), t('displayName'), t('balance'), t('gamesPlayed'), t('totalWinnings'), t('adminRole'), t('adminActions')].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', opacity: u.id === user?.id ? 0.7 : 1 }}>
                    <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)' }}>{u.id}</td>
                    <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>
                      {u.username}
                      {u.id === user?.id && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> ({t('you')})</span>}
                    </td>
                    <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)' }}>{u.display_name}</td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={editBalances[u.id] ?? u.balance}
                          onChange={e => setEditBalances(b => ({ ...b, [u.id]: e.target.value }))}
                          style={{ width: '90px', padding: '0.25rem 0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.85rem' }}
                          min="0"
                        />
                        {editBalances[u.id] !== undefined && (
                          <button className="btn btn-sm btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleSetBalance(u)}>✓</button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)' }}>{u.games_played}</td>
                    <td style={{ padding: '0.6rem 1rem', color: u.total_winnings >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {u.total_winnings >= 0 ? '+' : ''}${(u.total_winnings || 0).toFixed(0)}
                    </td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <button
                        className={`btn btn-sm ${u.is_admin ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        onClick={() => handleToggleAdmin(u)}
                        disabled={u.id === user?.id}
                      >
                        {u.is_admin ? '🛡️ Admin' : '👤 User'}
                      </button>
                    </td>
                    <td style={{ padding: '0.6rem 1rem' }}>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={u.id === user?.id || u.is_admin}
                        title={u.is_admin ? t('adminCantDeleteAdmin') : ''}
                        style={{
                          fontSize: '0.75rem', padding: '0.3rem 0.75rem',
                          borderRadius: '6px', border: '1px solid var(--accent-red)',
                          background: 'transparent', color: 'var(--accent-red)',
                          cursor: u.id === user?.id || u.is_admin ? 'not-allowed' : 'pointer',
                          opacity: u.id === user?.id || u.is_admin ? 0.35 : 1,
                          fontWeight: 600, transition: 'background 0.15s, color 0.15s'
                        }}
                        onMouseEnter={e => { if (!(u.id === user?.id || u.is_admin)) { e.target.style.background = 'var(--accent-red)'; e.target.style.color = '#fff'; }}}
                        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--accent-red)'; }}
                      >
                        🗑️ {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
