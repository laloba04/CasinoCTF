const API_BASE = '';

function getToken() {
  return localStorage.getItem('casino_token');
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const api = {
  register: (username, password, display_name) =>
    apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password, display_name }) }),
  login: (username, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getMe: () => apiFetch('/api/auth/me'),
  getBalance: () => apiFetch('/api/wallet/balance'),
  getRooms: (gameType) => apiFetch(`/api/rooms${gameType ? `?game_type=${gameType}` : ''}`),
  createRoom: (data) => apiFetch('/api/rooms', { method: 'POST', body: JSON.stringify(data) }),
  getRoom: (id) => apiFetch(`/api/rooms/${id}`),
  getHistory: (limit = 20) => apiFetch(`/api/games/history?limit=${limit}`),
  getStats: () => apiFetch('/api/games/stats'),
  getScoreboard: () => apiFetch('/api/scoreboard'),
  updateDisplayName: (display_name) =>
    apiFetch('/api/scoreboard/update', { method: 'POST', body: JSON.stringify({ display_name }) }),
  changePassword: (current_password, new_password) =>
    apiFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password, new_password }) }),
  getChallenges: () => apiFetch('/api/ctf/challenges'),
  submitFlag: (challenge_id, flag) =>
    apiFetch('/api/ctf/submit', { method: 'POST', body: JSON.stringify({ challenge_id, flag }) }),
  getHints: (id, level) => apiFetch(`/api/ctf/hints/${id}?level=${level}`),
  getCtfProfile: (userId) => apiFetch(`/api/ctf/profile/${userId}`),
};
