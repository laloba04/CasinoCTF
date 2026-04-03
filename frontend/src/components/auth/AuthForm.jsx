import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

export default function AuthForm() {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password, displayName || username);
      }
    } catch (err) {
      setError(err.error || t('somethingWentWrong') || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.5rem' }}>🎰</div>
        <h1 className="auth-title">{isLogin ? t('welcomeBack') : t('joinTheTable')}</h1>
        <p className="auth-subtitle">
          {isLogin ? t('loginToContinue') : t('createAccount')}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">{t('username')}</label>
            <input className="input" type="text" placeholder={t('enterUsername')}
              value={username} onChange={e => setUsername(e.target.value)} required minLength={3} />
          </div>

          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPassword ? 'text' : 'password'} placeholder={t('enterPassword')}
                value={password} onChange={e => setPassword(e.target.value)} required minLength={4}
                style={{ paddingRight: '2.5rem', width: '100%', boxSizing: 'border-box' }} />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPassword(s => !s)}
                style={{
                  position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: '1rem', lineHeight: 1, padding: '0.2rem'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group fade-in">
              <label className="form-label">{t('displayName')}</label>
              <input className="input" type="text" placeholder={t('howCallYou')}
                value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? `⏳ ${t('loading')}` : isLogin ? `🎲 ${t('login')}` : `🎰 ${t('register')}`}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? `${t('noAccount')} ` : `${t('haveAccount')} `}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? t('register') : t('login')}
          </span>
        </div>
      </div>
    </div>
  );
}
