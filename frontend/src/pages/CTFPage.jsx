import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function CTFPage() {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [flag, setFlag] = useState('');
  const [hints, setHints] = useState([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.getChallenges().then(d => setChallenges(d.challenges)).catch(console.error);
  }, []);

  const submitFlag = async () => {
    try {
      const result = await api.submitFlag(selectedChallenge.id, flag);
      setMessage({ type: result.correct ? 'success' : 'error', text: result.message });
      if (result.correct) {
        setChallenges(prev => prev.map(c => c.id === selectedChallenge.id ? { ...c, solved: true } : c));
        setSelectedChallenge(prev => ({ ...prev, solved: true }));
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.error || 'Error submitting flag' });
    }
  };

  const loadHints = async (challengeId) => {
    const newLevel = hintLevel + 1;
    try {
      const data = await api.getHints(challengeId, newLevel);
      setHints(data.hints);
      setHintLevel(newLevel);
    } catch (e) { console.error(e); }
  };

  const solvedCount = challenges.filter(c => c.solved).length;

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔓 CTF Challenges</h1>
          <p className="page-subtitle">Find the 9 hidden vulnerabilities • {solvedCount}/9 solved</p>
        </div>
        <div style={{
          background: 'var(--accent-purple-dim)', padding: '0.5rem 1.2rem',
          borderRadius: 'var(--radius-xl)', color: 'var(--accent-purple)', fontWeight: 700
        }}>
          {solvedCount}/9 Flags 🚩
        </div>
      </div>

      {selectedChallenge ? (
        <div className="card fade-in">
          <button className="btn btn-outline btn-sm mb-2" onClick={() => {
            setSelectedChallenge(null); setHints([]); setHintLevel(0); setMessage(null); setFlag('');
          }}>← Back to challenges</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
              #{selectedChallenge.id} {selectedChallenge.name}
              {selectedChallenge.solved && ' ✅'}
            </h2>
            <span className="ctf-category">{selectedChallenge.category}</span>
            <span className="difficulty-stars">{'⭐'.repeat(selectedChallenge.difficulty)}</span>
          </div>

          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {selectedChallenge.description}
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Submit Flag</label>
              <div className="flex gap-1">
                <input className="input" placeholder="BJCTF{...}" value={flag}
                  onChange={e => setFlag(e.target.value)} />
                <button className="btn btn-primary" onClick={submitFlag}>Submit 🚩</button>
              </div>
            </div>
            {message && (
              <div className={`fade-in mt-2`} style={{
                padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                background: message.type === 'success' ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                color: message.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)',
                fontWeight: 600
              }}>{message.text}</div>
            )}
          </div>

          <div>
            <button className="btn btn-outline btn-sm" onClick={() => loadHints(selectedChallenge.id)}
              disabled={hintLevel >= 3}>
              💡 {hintLevel >= 3 ? 'No more hints' : `Get Hint ${hintLevel + 1}/3`}
            </button>
            {hints.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                {hints.map((hint, i) => (
                  <div key={i} className="fade-in" style={{
                    padding: '0.75rem', margin: '0.5rem 0', borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)',
                    border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.9rem'
                  }}>
                    💡 Hint {i + 1}: {hint}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="ctf-grid">
          {challenges.map(c => (
            <div key={c.id} className={`card ctf-card fade-in ${c.solved ? 'solved' : ''}`}
              style={{ cursor: 'pointer' }} onClick={() => setSelectedChallenge(c)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <span className="ctf-category">{c.category}</span>
                <span className="difficulty-stars">{'⭐'.repeat(c.difficulty)}</span>
              </div>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, margin: '0.75rem 0 0.5rem' }}>
                #{c.id} {c.name}
              </h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                {c.description}
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                OWASP: {c.owasp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
