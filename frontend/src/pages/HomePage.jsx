import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const GAMES = [
  { id: 'blackjack', icon: '🃏', name: 'Blackjack', desc: 'Beat the dealer without going over 21', players: '1-7' },
  { id: 'holdem', icon: '♠️', name: "Texas Hold'em", desc: '2 hole cards + 5 community, best hand wins', players: '2-9' },
  { id: 'roulette', icon: '🎡', name: 'Roulette', desc: 'Bet on numbers, colors, or ranges', players: '1+' },
  { id: 'slots', icon: '🎰', name: 'Slots', desc: 'Spin the reels and hit the jackpot', players: '1' },
  { id: 'baccarat', icon: '🂡', name: 'Baccarat', desc: 'Player vs Banker, closest to 9 wins', players: '1-7' },
  { id: 'craps', icon: '🎲', name: 'Craps', desc: 'Roll the dice and ride your luck', players: '1-8' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Hero */}
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
          CasinoCTF
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Play 6 casino games in real-time with friends.<br />
          Find 9 hidden security vulnerabilities. Learn hacking while having fun.
        </p>
        <div className="flex gap-1 justify-center" style={{ flexWrap: 'wrap' }}>
          {user ? (
            <>
              <Link to="/lobby" className="btn btn-primary btn-lg">🃏 Enter Lobby</Link>
              <Link to="/ctf" className="btn btn-outline btn-lg">🔓 CTF Challenges</Link>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-lg">🎲 Start Playing</Link>
          )}
        </div>
      </div>

      {/* Games Grid */}
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <h2 className="text-center" style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>
          6 Games, Unlimited Fun
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {GAMES.map((game, i) => (
            <div key={game.id} className="card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{game.icon}</div>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '0.3rem' }}>{game.name}</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                {game.desc}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>👥 {game.players} players</span>
            </div>
          ))}
        </div>

        {/* CTF Preview */}
        <div className="card" style={{ marginTop: '3rem', textAlign: 'center', padding: '3rem',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.05))' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔓</div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            9 CTF Security Challenges
          </h2>
          <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto 1rem', lineHeight: 1.6 }}>
            SQL Injection, XSS, IDOR, JWT Bypass, Race Conditions and more.
            Learn OWASP Top 10 vulnerabilities by exploiting this casino.
          </p>
          <Link to={user ? '/ctf' : '/auth'} className="btn btn-primary">
            {user ? 'View Challenges' : 'Login to Start'}
          </Link>
        </div>
      </div>
    </div>
  );
}
