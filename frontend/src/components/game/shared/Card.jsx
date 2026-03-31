export default function PlayingCard({ card }) {
  if (!card || card.hidden) {
    return (
      <div className="playing-card hidden-card">
        <span style={{ fontSize: '2rem' }}>🂠</span>
      </div>
    );
  }

  const suitClass = card.suit === 'hearts' || card.suit === 'diamonds' ? 'suit-hearts' : 'suit-clubs';

  return (
    <div className={`playing-card ${suitClass}`}>
      <span className="card-rank">{card.rank}</span>
      <span className="card-suit">{card.symbol}</span>
    </div>
  );
}
