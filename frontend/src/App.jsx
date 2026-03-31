import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SocketProvider } from './hooks/useSocket';
import Navbar from './components/ui/Navbar';
import AuthForm from './components/auth/AuthForm';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ScoreboardPage from './pages/ScoreboardPage';
import CTFPage from './pages/CTFPage';
import HistoryPage from './pages/HistoryPage';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center" style={{ padding: '4rem' }}>⏳ Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
}

function AuthRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/lobby" /> : <AuthForm />;
}

function AppRoutes() {
  return (
    <SocketProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/lobby" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
        <Route path="/game/:roomId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/scoreboard" element={<ProtectedRoute><ScoreboardPage /></ProtectedRoute>} />
        <Route path="/ctf" element={<ProtectedRoute><CTFPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      </Routes>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
