import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AuthForm() {
  const { login, register } = useAuth();
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
      setError(err.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '0.5rem' }}>🎰</div>
        <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Join the Table'}</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Login to continue playing' : 'Create your account and get $5,000'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="input" type="text" placeholder="Enter username"
              value={username} onChange={e => setUsername(e.target.value)} required minLength={3} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" placeholder="Enter password"
              value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
          </div>

          {!isLogin && (
            <div className="form-group fade-in">
              <label className="form-label">Display Name (optional)</label>
              <input className="input" type="text" placeholder="How should we call you?"
                value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? '⏳ Loading...' : isLogin ? '🎲 Login' : '🎰 Register'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </div>
      </div>
    </div>
  );
}
