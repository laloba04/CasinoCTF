import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { api } from '../utils/api';
import BlackjackTable from '../components/game/blackjack/BlackjackTable';
import SlotsGame from '../components/game/slots/SlotsGame';
import RouletteTable from '../components/game/roulette/RouletteTable';
import HoldemTable from '../components/game/holdem/HoldemTable';
import BaccaratTable from '../components/game/baccarat/BaccaratTable';
import CrapsTable from '../components/game/craps/CrapsTable';
import ChatPanel from '../components/game/shared/ChatPanel';

const GAME_COMPONENTS = {
  blackjack: BlackjackTable,
  slots: SlotsGame,
  roulette: RouletteTable,
  holdem: HoldemTable,
  baccarat: BaccaratTable,
  craps: CrapsTable,
};

export default function GamePage() {
  const { roomId } = useParams();
  const { joinRoom, leaveRoom, gameState, emit, connected } = useSocket();
  const { user, refreshBalance } = useAuth();
  const { t } = useI18n();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevConnected = useRef(false);

  // Re-send game-specific join on socket reconnect
  useEffect(() => {
    if (connected && !prevConnected.current && room && roomId !== 'slots') {
      const joinEvent = `${room.game_type}_join`;
      setTimeout(() => emit(joinEvent, { room_id: roomId }), 300);
    }
    prevConnected.current = connected;
  }, [connected]);

  useEffect(() => {
    if (roomId === 'slots') {
      setRoom({ id: 'slots', game_type: 'slots', name: t('quickSlots') || 'Quick Slots' });
      setLoading(false);
      return;
    }
    api.getRoom(roomId).then(data => {
      setRoom(data.room);
      joinRoom(roomId);
      const joinEvent = `${data.room.game_type}_join`;
      setTimeout(() => emit(joinEvent, { room_id: roomId }), 500);
    }).catch(console.error).finally(() => setLoading(false));

    return () => { if (roomId !== 'slots') leaveRoom(roomId); };
  }, [roomId, t]);

  useEffect(() => {
    if (gameState?.phase === 'payout' || gameState?.total_win !== undefined) {
      refreshBalance();
    }
  }, [gameState?.phase, gameState?.total_win]);

  if (loading) return <div className="container text-center" style={{ padding: '4rem' }}>⏳ {t('loading')}</div>;
  if (!room) return <div className="container text-center" style={{ padding: '4rem' }}>❌ {t('roomNotFound')}</div>;

  const GameComponent = GAME_COMPONENTS[room.game_type] || (() => (
    <div className="card text-center" style={{ padding: '3rem' }}>
      <p style={{ fontSize: '3rem' }}>🚧</p>
      <p className="text-muted mt-2">{room.game_type} {t('comingSoon')}</p>
    </div>
  ));

  const safeGameType = t(room.game_type) || room.game_type;

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{room.name}</h1>
          <p className="page-subtitle">{safeGameType} {t('table')}{room.id !== 'slots' ? ` • ${t('roomTitle')} ${room.id}` : ''}</p>
        </div>
      </div>

      <div className={room.game_type !== 'slots' ? 'game-layout' : 'game-layout-full'}>
        <GameComponent gameState={gameState} emit={emit} user={user} room={room} refreshBalance={refreshBalance} />
        {room.game_type !== 'slots' && <ChatPanel />}
      </div>
    </div>
  );
}
