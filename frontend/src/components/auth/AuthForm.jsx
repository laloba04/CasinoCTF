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
            <input className="input" type="password" placeholder={t('enterPassword')}
              value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
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
