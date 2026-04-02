import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const currentRoomRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [roomPlayers, setRoomPlayers] = useState({});
  const [socketError, setSocketError] = useState(null);
  const errorTimerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = io('/', {
      auth: { user_id: user.id, username: user.username },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      setConnected(true);
      // Re-join room on reconnect so server knows our room_id again
      if (currentRoomRef.current) {
        socket.emit('join_room', { room_id: currentRoomRef.current });
      }
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('game_state', (state) => setGameState(state));
    socket.on('chat_message', (msg) => setChatMessages(prev => [...prev.slice(-99), msg]));
    socket.on('room_joined', (data) => setRoomPlayers(data.players || {}));
    socket.on('player_left', () => {});
    socket.on('error', (err) => {
      const msg = err?.message || err?.error || '';
      const ignore = ['No active game', 'Join a room first', 'Not in game', 'Not your turn', 'Not in this game'];
      if (!ignore.some(i => msg.includes(i))) {
        console.warn('Socket:', err);
        setSocketError(msg);
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        errorTimerRef.current = setTimeout(() => setSocketError(null), 3500);
      }
    });
    socket.on('slots_result', (result) => setGameState(result));
    socket.on('roulette_result', (result) => setGameState(prev => ({ ...prev, ...result })));

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [user]);

  const emit = (event, data) => {
    if (socketRef.current) socketRef.current.emit(event, data);
  };

  const joinRoom = (roomId) => {
    currentRoomRef.current = roomId;
    emit('join_room', { room_id: roomId });
    setChatMessages([]);
    setGameState(null);
  };

  const leaveRoom = (roomId) => {
    currentRoomRef.current = null;
    emit('leave_room', { room_id: roomId });
    setGameState(null);
    setChatMessages([]);
  };

  const sendChat = (message) => emit('chat_message', { message });

  return (
    <SocketContext.Provider value={{
      connected, gameState, setGameState, chatMessages, roomPlayers,
      socketError, emit, joinRoom, leaveRoom, sendChat
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
