import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useI18n } from '../../hooks/useI18n';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const { t, lang, toggleLang } = useI18n();

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
              <Link to="/lobby" className={isActive('/lobby')}>🃏 {t('lobby')}</Link>
              <Link to="/scoreboard" className={isActive('/scoreboard')}>🏆 {t('ranking')}</Link>
              <Link to="/ctf" className={isActive('/ctf')}>🔓 {t('ctf')}</Link>
              <Link to="/tutorials" className={isActive('/tutorials')}>📖 <span className="hide-mobile">{t('tutorials')}</span></Link>
              <Link to="/history" className={isActive('/history')}>📊 <span className="hide-mobile">{t('history')}</span></Link>
              <Link to="/profile" className={isActive('/profile')}>👤 {t('profile')}</Link>
              <div className="balance-badge">💰 ${user.balance?.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
              <span style={{ color: connected ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.7rem' }}>
                {connected ? `● ${t('online')}` : `● ${t('offline')}`}
              </span>
              <button className="btn btn-sm btn-outline" onClick={toggleLang}
                style={{ minWidth: '36px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                {lang === 'en' ? '🇪🇸' : '🇬🇧'}
              </button>
              <button className="btn btn-sm btn-outline" onClick={logout}>{t('logout')}</button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-outline" onClick={toggleLang}
                style={{ minWidth: '36px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                {lang === 'en' ? '🇪🇸' : '🇬🇧'}
              </button>
              <Link to="/auth" className="btn btn-sm btn-primary">{t('login')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
