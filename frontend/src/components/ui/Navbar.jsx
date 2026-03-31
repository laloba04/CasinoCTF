import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span>🎰</span> CasinoCTF
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/lobby" className={isActive('/lobby')}>🃏 Lobby</Link>
              <Link to="/scoreboard" className={isActive('/scoreboard')}>🏆 Ranking</Link>
              <Link to="/ctf" className={isActive('/ctf')}>🔓 CTF</Link>
              <Link to="/history" className={isActive('/history')}>📊 History</Link>
              <div className="balance-badge">💰 ${user.balance?.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
              <span style={{ color: connected ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.7rem' }}>
                {connected ? '● Online' : '● Offline'}
              </span>
              <button className="btn btn-sm btn-outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-sm btn-primary">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
