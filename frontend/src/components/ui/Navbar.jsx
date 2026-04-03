import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useI18n } from '../../hooks/useI18n';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const { t, lang, toggleLang } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const closeMenu = () => setIsMobileMenuOpen(false);
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-header">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <span>🎰</span> CasinoCTF
          </Link>
          
          <div className="navbar-mobile-controls">
            {user && (
              <div className="balance-badge mobile-balance">
                💰 ${user.balance?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </div>
            )}
            <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        <div className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/lobby" className={isActive('/lobby')} onClick={closeMenu}>🃏 {t('lobby')}</Link>
              <Link to="/scoreboard" className={isActive('/scoreboard')} onClick={closeMenu}>🏆 {t('ranking')}</Link>
              <Link to="/ctf" className={isActive('/ctf')} onClick={closeMenu}>🔓 {t('ctf')}</Link>
              <Link to="/tutorials" className={isActive('/tutorials')} onClick={closeMenu}>📖 <span>{t('tutorials')}</span></Link>
              <Link to="/history" className={isActive('/history')} onClick={closeMenu}>📊 <span>{t('history')}</span></Link>
              <Link to="/profile" className={isActive('/profile')} onClick={closeMenu}>👤 {t('profile')}</Link>
              {user.is_admin && <Link to="/admin" className={isActive('/admin')} onClick={closeMenu}>🛡️ {t('adminPanel')}</Link>}
              <div className="balance-badge desktop-balance">💰 ${user.balance?.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
              <span className="online-status">
                {connected ? <><span style={{color:'var(--accent-green)'}}>●</span> {t('online')}</> : <><span style={{color:'var(--accent-red)'}}>●</span> {t('offline')}</>}
              </span>
              <button className="btn btn-sm btn-outline lang-btn" onClick={toggleLang}>
                {lang === 'en' ? '🇪🇸' : '🇬🇧'}
              </button>
              <button className="btn btn-sm btn-outline" onClick={handleLogout}>{t('logout')}</button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-outline lang-btn" onClick={toggleLang}>
                {lang === 'en' ? '🇪🇸' : '🇬🇧'}
              </button>
              <Link to="/auth" className="btn btn-sm btn-primary" onClick={closeMenu}>{t('login')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
