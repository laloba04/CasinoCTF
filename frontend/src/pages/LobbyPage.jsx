import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

const GAME_ICONS = {
  blackjack: '🃏', holdem: '♠️', roulette: '🎡',
  slots: '🎰', baccarat: '🂡', craps: '🎲'
};

const GAME_KEYS = ['blackjack', 'holdem', 'roulette', 'slots', 'baccarat', 'craps'];

export default function LobbyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ game_type: 'blackjack', name: '', min_bet: 10, max_bet: 1000 });

  useEffect(() => { loadRooms(); }, [filter]);

  const loadRooms = async () => {
    try {
      const data = await api.getRooms(filter || undefined);
      setRooms(data.rooms);
    } catch (e) { console.error(e); }
  };

  const createRoom = async () => {
    try {
      const data = await api.createRoom({
        ...newRoom, name: newRoom.name || `${user.username}'s ${t(newRoom.game_type)} table`
      });
      navigate(`/game/${data.room.id}`);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🃏 {t('gameLobby')}</h1>
          <p className="page-subtitle">{t('lobbySubtitle')}</p>
        </div>
        <div className="flex gap-1">
          <button className="btn btn-gold" onClick={() => navigate('/game/slots')}>🎰 {t('quickSlots')}</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>{t('createTable')}</button>
        </div>
      </div>

      {showCreate && (
        <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">{t('createNewTable')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('game')}</label>
              <select className="input" value={newRoom.game_type}
                onChange={e => setNewRoom({...newRoom, game_type: e.target.value})}>
                {GAME_KEYS.filter(k => k !== 'slots').map(k => (
                  <option key={k} value={k}>{t(k)}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('tableName')}</label>
              <input className="input" placeholder={t('myTable')} value={newRoom.name}
                onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('minBet')}</label>
              <input className="input" type="number" value={newRoom.min_bet}
                onChange={e => setNewRoom({...newRoom, min_bet: +e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('maxBet')}</label>
              <input className="input" type="number" value={newRoom.max_bet}
                onChange={e => setNewRoom({...newRoom, max_bet: +e.target.value})} />
            </div>
          </div>
          <button className="btn btn-green mt-2" onClick={createRoom}>🚀 {t('createAndJoin')}</button>
        </div>
      )}

      <div className="flex gap-1 mb-2" style={{ flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('')}>{t('all')}</button>
        {GAME_KEYS.map(k => (
          <button key={k} className={`btn btn-sm ${filter === k ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(k)}>{GAME_ICONS[k]} {t(k)}</button>
        ))}
      </div>

      <div className="lobby-grid">
        {rooms.length === 0 ? (
          <div className="card text-center" style={{ gridColumn: '1/-1', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎰</div>
            <p className="text-muted">{t('noTables')}</p>
          </div>
        ) : rooms.map(room => (
          <div key={room.id} className="card room-card fade-in" onClick={() => navigate(`/game/${room.id}`)}
            style={{ cursor: 'pointer' }}>
            <div className="game-type">{GAME_ICONS[room.game_type]} {t(room.game_type)}</div>
            <div className="room-name">{room.name}</div>
            <div className="room-meta">
              <span>💰 ${room.min_bet} - ${room.max_bet}</span>
              <span>👥 Max {room.max_players}</span>
              <span className={room.status === 'waiting' ? 'text-green' : 'text-gold'}>
                {room.status === 'waiting' ? `● ${t('open')}` : `● ${t('playing')}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
