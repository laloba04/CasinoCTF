import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const GAMES = [
    { id: 'blackjack', icon: '🃏', name: t('blackjack'), desc: t('blackjackDesc'), players: '1-7' },
    { id: 'holdem', icon: '♠️', name: t('holdem'), desc: t('holdemDesc'), players: '2-9' },
    { id: 'roulette', icon: '🎡', name: t('roulette'), desc: t('rouletteDesc'), players: '1+' },
    { id: 'slots', icon: '🎰', name: t('slots'), desc: t('slotsDesc'), players: '1' },
    { id: 'baccarat', icon: '🂡', name: t('baccarat'), desc: t('baccaratDesc'), players: '1-7' },
    { id: 'craps', icon: '🎲', name: t('craps'), desc: t('crapsDesc'), players: '1-8' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div style={{
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
        background: 'radial-gradient(ellipse at top, rgba(168,85,247,0.15) 0%, transparent 60%)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎰</div>
        <h1 style={{
          fontFamily: 'Outfit', fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1,
          background: 'linear-gradient(135deg, #a855f7, #6366f1, #f59e0b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem'
        }}>
          {t('heroTitle')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          {t('heroSubtitle1')}<br />{t('heroSubtitle2')}
        </p>
        <div className="flex gap-1 justify-center" style={{ flexWrap: 'wrap' }}>
          {user ? (
            <>
              <Link to="/lobby" className="btn btn-primary btn-lg">🃏 {t('enterLobby')}</Link>
              <Link to="/ctf" className="btn btn-outline btn-lg">🔓 {t('ctfChallenges')}</Link>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-lg">🎲 {t('startPlaying')}</Link>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        <h2 className="text-center" style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>
          {t('gamesTitle')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {GAMES.map((game, i) => (
            <div key={game.id} className="card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{game.icon}</div>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.3rem' }}>{game.name}</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>{game.desc}</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>👥 {game.players} players</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.05))' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔓</div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {t('ctfPreviewTitle')}
          </h2>
          <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto 1rem', lineHeight: 1.6 }}>
            {t('ctfPreviewDesc')}
          </p>
          <Link to={user ? '/ctf' : '/auth'} className="btn btn-primary">
            {user ? t('viewChallenges') : t('loginToStart')}
          </Link>
        </div>
      </div>
    </div>
  );
}
