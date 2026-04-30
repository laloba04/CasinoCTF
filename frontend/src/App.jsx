import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SocketProvider } from './hooks/useSocket';
import { I18nProvider } from './hooks/useI18n';
import Navbar from './components/ui/Navbar';
import AuthForm from './components/auth/AuthForm';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import ScoreboardPage from './pages/ScoreboardPage';
import CTFPage from './pages/CTFPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import TutorialsPage from './pages/TutorialsPage';
import CTFTutorialPage from './pages/CTFTutorialPage';
import AdminPage from './pages/AdminPage';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center" style={{ padding: '4rem' }}>⏳</div>;
  return user ? children : <Navigate to="/auth" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center" style={{ padding: '4rem' }}>⏳</div>;
  if (!user) return <Navigate to="/auth" />;
  if (!user.is_admin) return <Navigate to="/lobby" />;
  return children;
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
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/tutorials" element={<ProtectedRoute><TutorialsPage /></ProtectedRoute>} />
        <Route path="/ctf-tutorial" element={<ProtectedRoute><CTFTutorialPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Routes>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
