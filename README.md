# 🎰 CasinoCTF

![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-development-orange)
![Architecture](https://img.shields.io/badge/architecture-modular-blue)
![Stack](https://img.shields.io/badge/stack-fullstack-purple)
![Security](https://img.shields.io/badge/security-9%20CTF%20challenges-red)

Plataforma de **casino online multijugador PWA (Progressive Web App)** con seis juegos en tiempo real, sistema de wallet, panel de administración y **9 retos de ciberseguridad (CTF)** integrados con fines educativos.

Este proyecto reproduce la arquitectura usada por plataformas modernas de iGaming mediante una PWA (Progressive Web App), donde varios servicios (cuentas de jugador, wallet, juegos, apuestas y analytics) trabajan juntos para ofrecer una experiencia de casino digital multiplataforma de alto rendimiento e instalable.

---

# 🧠 Project Overview

La plataforma permite a los jugadores:

- Crear una cuenta y gestionar su perfil
- Gestionar su saldo virtual (wallet)
- Jugar a 6 juegos multijugador en tiempo real
- Apostar fichas con límites configurables por mesa
- Ver su historial de partidas y estadísticas
- Competir en el scoreboard global
- Chatear en mesa con otros jugadores (Optimizado para móvil)
- **Experiencia PWA**: Instalar en el móvil como una app nativa, acceso rápido y diseño responsive.
- **Soporte Multi-idioma (i18n)**: Interfaz completamente traducida (Inglés y Español) en tiempo real.

El sistema también incluye un **panel CTF** con 9 vulnerabilidades OWASP intencionadas, hints progresivos y writeups educativos para aprender seguridad ofensiva y defensiva.

---

# 🏗 System Architecture

Arquitectura simplificada del sistema:

```
                        🎰 CASINO CTF

              ┌─────────────────────────────┐
              │          Frontend            │
              │  Lobby | Games | Wallet |    │
              │  Tutorial | CTF | Scoreboard │
              └──────────────┬──────────────┘
                             │
                    ┌────────┴────────┐
                    │ REST            │ WebSocket
                    │ (HTTP + JWT)    │ (Socket.IO)
                    ▼                 ▼

       ┌──────────────────────────────────────┐
       │            Backend API               │
       │                                      │
       │  Auth Service       Lobby Service    │
       │  Wallet Service     Scoreboard       │
       │  CTF Service        Chat Service     │
       └────────────────┬─────────────────────┘
                        │
                        ▼

       ┌──────────────────────────────────────┐
       │           Game Engines               │
       │                                      │
       │  Blackjack Engine (1-7 vs dealer)    │
       │  Texas Hold'em Engine (2-9 players)  │
       │  Roulette Engine (1+ players)        │
       │  Slots Engine (1 player)             │
       │  Baccarat Engine (1-7 vs banca)      │
       │  Craps Engine (1-8 players)          │
       │  Poker Hand Evaluator (shared)       │
       └────────────────┬─────────────────────┘
                        │
                        ▼

       ┌──────────────────────────────────────┐
       │            Database                  │
       │  Users | Games | Rooms | Bets |      │
       │  Transactions | Scoreboard | Flags   │
       └────────────────┬─────────────────────┘
                        │
                        ▼

       ┌──────────────────────────────────────┐
       │         CTF Challenge Layer          │
       │  9 Vulnerabilities | Flags | Hints   │
       │  Writeups | Exploit + Patch docs     │
       └──────────────────────────────────────┘
```

La plataforma utiliza **arquitectura modular con APIs**, donde cada componente (auth, wallet, games, CTF) puede desarrollarse y testearse independientemente.

---

# 🎮 Games

El sistema soporta 6 juegos con diferentes modalidades:

| Game | Players | Type | Description |
|------|---------|------|-------------|
| Blackjack | 1-7 vs dealer | Mesa compartida | Supera al dealer sin pasarte de 21 |
| Texas Hold'em | 2-9 | Poker multijugador | 2 hole cards + 5 community, 4 rondas |
| Ruleta | 1+ | Mesa abierta | Roja, negra, número, docenas, columnas |
| Slots | 1 | Individual | Tragamonedas con múltiples líneas de pago |
| Baccarat | 1-7 vs banca | Mesa compartida | Jugador vs Banca, el más cercano a 9 |
| Craps | 1-8 | Mesa compartida | Dados con apuestas Pass/Don't Pass |

### Blackjack
- 6 mazos barajados (312 cartas), reglas estándar de casino
- Hit, Stand, Double Down, Split (parejas)
- Dealer hits on soft 17
- Blackjack natural paga 3:2
- Insurance cuando el dealer muestra As

### Texas Hold'em
- Small Blind + Big Blind rotativos
- Preflop → Flop (3 cartas) → Turn (+1) → River (+1) → Showdown
- Evaluación de mejor mano de 5 entre 7 cartas (C(7,5) = 21 combinaciones)
- Fold, Call, Raise, Check, All-In

### Ruleta (Europea)
- Números 0-36, un solo cero (ventaja casa 2.7%)
- Apuestas internas: número directo (35:1), split (17:1), street (11:1), corner (8:1), line (5:1)
- Apuestas externas: rojo/negro (1:1), par/impar (1:1), alto/bajo (1:1), docenas (2:1), columnas (2:1)
- Animación de giro de rueda en tiempo real

### Slots (Tragamonedas)
- 3-5 rodillos con símbolos temáticos
- Múltiples líneas de pago configurables
- Símbolos especiales: Wild (comodín), Scatter (bonus)
- Jackpot progresivo
- RTP (Return To Player) configurable (~95%)

### Baccarat
- Jugador vs Banca, apuesta a quién gana o empate
- Valores: As=1, 2-9=su valor, 10/J/Q/K=0
- Se suman las cartas y se toma la cifra de las unidades (ej: 7+8=15→5)
- Tercera carta automática según reglas fijas del casino
- Pagos: Jugador 1:1, Banca 0.95:1 (5% comisión), Empate 8:1

### Craps (Dados)
- Tirador lanza dos dados, los demás apuestan
- **Come Out Roll**: 7 u 11 = Win, 2/3/12 = Craps (pierde), otro número = Point
- **Point Phase**: el tirador intenta repetir el Point antes de sacar 7
- Apuestas: Pass Line (1:1), Don't Pass (1:1), Come/Don't Come, Field, Place bets
- Odds bets sin ventaja de la casa (true odds)

### Poker Hand Evaluator (shared)
Motor compartido para Texas Hold'em que evalúa las 10 manos de póker:

```
Royal Flush > Straight Flush > Four of a Kind > Full House >
Flush > Straight > Three of a Kind > Two Pair > One Pair > High Card
```

Soporta As bajo (A-2-3-4-5) y desempate por kickers.

---

# 💰 Wallet System

Sistema central para manejar todas las transacciones del jugador.

**Funciones:**

- Saldo inicial al registrarse ($5,000)
- Deducciones automáticas al apostar
- Pagos automáticos al ganar
- Historial de transacciones por partida
- Balance visible en tiempo real en el navbar

```
Player Balance
  │
  ├── Place Bet ──→ Balance -= bet
  │
  ├── Win ──────→ Balance += payout
  │
  ├── Lose ─────→ (no change, bet already deducted)
  │
  └── Push ─────→ Balance += bet (refund)
```

Cada transacción se registra en la tabla `games` con bet, result, payout y timestamp para auditoría completa.

---

# 👤 Player Account Management

Sistema que gestiona todo el ciclo de vida del jugador.

**Funciones:**

- Registro con username + password
- Login con JWT (JSON Web Token)
- Perfil con estadísticas
- Balance en tiempo real
- Historial de partidas
- Flags CTF encontradas

El JWT incluye: user_id, username, is_admin, exp (expiración). Se envía en el header `Authorization: Bearer <token>` en cada petición.

---

# 🔄 Real-Time Multiplayer (WebSockets)

Comunicación bidireccional con **Flask-SocketIO + eventlet**.

**Funciones:**

- **Lobby**: ver mesas activas, crear nuevas, filtrar por juego
- **Rooms**: cada mesa es un room de SocketIO
- **Game sync**: estado personalizado por jugador (solo ves tus cartas)
- **Turn broadcast**: notificación en tiempo real de quién juega
- **Chat**: mensajes en mesa entre jugadores
- **Spectators**: ver partidas sin participar

```
Client A                    Server                    Client B
   │                          │                          │
   ├── emit('bj_bet') ──────→│                          │
   │                          ├── broadcast_state() ────→│
   │←── emit('game_state') ──┤                          │
   │                          │←── emit('bj_hit') ──────┤
   │←── emit('game_state') ──┼── emit('game_state') ───→│
```

Cada jugador recibe una versión **personalizada** del estado: ve sus cartas pero las de los demás están ocultas hasta el showdown.

---

# 📊 Bet Flow

Flujo completo de una apuesta:

```
Player places bet
    │
    ▼
Server validates bet amount
    │
    ▼
Game engine processes round
    │
    ▼
Result calculated (win/lose/push/blackjack)
    │
    ▼
Payout applied to wallet
    │
    ▼
Game saved to history (DB)
    │
    ▼
Updated state broadcast to all players
    │
    ▼
Result returned to player
```

---

# 📊 Scoreboard

Ranking global de jugadores ordenado por ganancias totales.

**Datos mostrados:**

- Display name (personalizable)
- Total winnings
- Partidas jugadas
- Mayor victoria

---

# 🔓 CTF Challenge Layer

La plataforma incluye **9 vulnerabilidades intencionadas** con fines educativos:

### REST Vulnerabilities (6)

| # | Name | Category | OWASP | Difficulty |
|---|------|----------|-------|------------|
| 1 | Jackpot Query | SQL Injection | A03:2021 | ⭐⭐ |
| 2 | Script Dealer | XSS Stored | A03:2021 | ⭐⭐ |
| 3 | Peeping Cards | IDOR | A01:2021 | ⭐ |
| 4 | Token Trick | JWT Bypass | A02:2021 | ⭐⭐⭐ |
| 5 | High Roller | Bet Tampering | A04:2021 | ⭐⭐ |
| 6 | Card Counter | Debug Leak | A05:2021 | ⭐⭐ |

### WebSocket Vulnerabilities (3)

| # | Name | Category | OWASP | Difficulty |
|---|------|----------|-------|------------|
| 7 | Ghost Player | WS Auth Bypass | A07:2021 | ⭐⭐⭐ |
| 8 | Table Hopper | Room Spoofing | A01:2021 | ⭐⭐ |
| 9 | Double Down | Race Condition | A04:2021 | ⭐⭐⭐ |

Cada reto tiene:
- Flag con formato `BJCTF{...}`
- 3 niveles de hints progresivos
- Writeup completo con explotación paso a paso + parche

**Tools recomendadas**: Burp Suite, DevTools, jwt.io, curl

---

# 📂 Project Structure

```
casino-ctf/
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Flask + SocketIO app factory
│   │   ├── config.py                # Configuration (SECRET_KEY, DB path)
│   │   ├── routes/
│   │   │   ├── auth.py              # Register + Login (SQLi vulnerable)
│   │   │   ├── game.py              # Game history REST endpoint
│   │   │   ├── lobby.py             # Create/list rooms
│   │   │   ├── scoreboard.py        # Rankings (XSS vulnerable)
│   │   │   └── ctf.py               # Challenges, flags, hints, profile (IDOR)
│   │   ├── models/
│   │   │   ├── cards.py             # Shared card utilities (deck, suits, ranks)
│   │   │   ├── database.py          # SQLite schema + raw queries
│   │   │   ├── blackjack_engine.py  # Multiplayer Blackjack (1-7 players)
│   │   │   ├── holdem_engine.py     # Texas Hold'em (2-9 players)
│   │   │   ├── roulette_engine.py   # European Roulette
│   │   │   ├── slots_engine.py      # Slot machine with paylines
│   │   │   ├── baccarat_engine.py   # Baccarat (Player vs Banker)
│   │   │   ├── craps_engine.py      # Craps (dice game)
│   │   │   └── poker_hands.py       # Hand evaluator (Royal Flush → High Card)
│   │   ├── sockets/
│   │   │   ├── lobby_events.py      # Connect, disconnect, rooms, chat
│   │   │   └── game_events.py       # All game actions via WebSocket
│   │   ├── utils/
│   │   │   ├── jwt_handler.py       # JWT create/decode (alg:none vuln)
│   │   │   └── decorators.py        # @token_required middleware
│   │   └── ctf/
│   │       ├── flags.py             # 9 challenge definitions
│   │       └── hints.py             # Progressive hint system
│   ├── run.py                       # Entry point (socketio.run)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Router + AuthProvider
│   │   ├── components/
│   │   │   ├── game/
│   │   │   │   ├── shared/Card.jsx  # Reusable card component
│   │   │   │   ├── shared/Chip.jsx  # Reusable chip/bet component
│   │   │   │   ├── shared/Dice.jsx  # Reusable dice component
│   │   │   │   ├── blackjack/       # Blackjack table components
│   │   │   │   ├── holdem/          # Hold'em table components
│   │   │   │   ├── roulette/        # Roulette wheel + betting board
│   │   │   │   ├── slots/           # Slot machine reels + paylines
│   │   │   │   ├── baccarat/        # Baccarat table components
│   │   │   │   └── craps/           # Craps table + dice area
│   │   │   ├── lobby/               # Room list, create room
│   │   │   ├── auth/AuthForm.jsx    # Login/Register
│   │   │   ├── ui/Navbar.jsx        # Navigation + balance
│   │   │   ├── scoreboard/          # Rankings table
│   │   │   ├── ctf/                 # Challenge panel, flag submit
│   │   │   └── tutorial/            # Interactive game rules
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx          # Auth context + JWT management
│   │   │   └── useSocket.jsx        # WebSocket connection + state
│   │   ├── utils/api.js             # HTTP client with auto JWT
│   │   ├── pages/                   # Route pages
│   │   └── styles/globals.css       # Tailwind + casino theme
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # Proxy for API + WebSocket
│   └── tailwind.config.js           # Casino color palette
├── docs/
│   ├── writeups/
│   │   ├── 01-sqli.md               # SQL Injection writeup
│   │   ├── 02-xss.md                # XSS Stored writeup
│   │   ├── 03-idor.md               # IDOR writeup
│   │   ├── 04-jwt-bypass.md         # JWT alg:none writeup
│   │   ├── 05-bet-tampering.md      # Bet tampering writeup
│   │   ├── 06-client-side.md        # Debug leak writeup
│   │   ├── 07-ws-auth-bypass.md     # WebSocket auth bypass writeup
│   │   ├── 08-room-spoofing.md      # Room spoofing writeup
│   │   └── 09-race-condition.md     # Race condition writeup
│   └── tutorials/
│       ├── blackjack.md             # How to play Blackjack
│       ├── holdem.md                # How to play Texas Hold'em
│       ├── roulette.md              # How to play Roulette
│       ├── slots.md                 # How Slots work
│       ├── baccarat.md              # How to play Baccarat
│       └── craps.md                 # How to play Craps
└── README.md
```

---

# ⚙️ Tech Stack

### Frontend
- **React 18** — Componentes de interfaz con hooks
- **Vite + PWA Plugin** — Tooling rápido con soporte para Progressive Web App
- **i18n Custom Context** — Internacionalización dinámica mediante diccionarios y providers locales
- **Service Workers** — Cacheo de assets para carga instantánea y funcionamiento offline básico
- **Web App Manifest** — Configuración para instalación en dispositivos móviles y escritorio
- **TailwindCSS** — Diseño "Mobile First" con paleta personalizada de casino
- **Socket.IO Client** — Comunicación en tiempo real
- **React Router** — Navegación SPA fluida

### Backend
- **Python 3.12** — Core language
- **Flask** — Lightweight web framework
- **Flask-SocketIO** — WebSocket support
- **Eventlet** — Async server for concurrent connections

### Database
- **SQLite** — File-based database (intentionally raw SQL for CTF)

### Auth
- **JWT (PyJWT)** — Stateless authentication tokens

### Security Tools (for CTF)
- Burp Suite Community
- Browser DevTools
- jwt.io
- curl / Postman

---

# 🔒 Security

### Vulnerabilidades intencionadas (CTF)

Las siguientes vulnerabilidades son **deliberadas** con fines educativos:

- SQL Injection en login (concatenación de queries)
- XSS Stored en scoreboard (dangerouslySetInnerHTML)
- IDOR en perfiles (sin verificación de ownership)
- JWT bypass (algoritmo "none" aceptado)
- Bet tampering (sin validación server-side)
- Debug endpoint expuesto (información sensible)
- WebSocket auth bypass (handshake sin verificación)
- Room spoofing (acceso a mesas ajenas)
- Race condition (acciones simultáneas sin locks)

### Medidas de seguridad reales (documentadas en parches)

Cada writeup incluye el **parche correcto**:

- Prepared statements para SQL
- Escape automático de React (no dangerouslySetInnerHTML)
- Verificación de ownership en endpoints
- Solo algoritmo HS256 + secret key fuerte
- Validación de apuestas contra balance en servidor
- Endpoints debug protegidos por env vars + admin auth
- JWT verificado en WebSocket handshake
- Verificación de room membership
- threading.Lock() por mesa

---

# 🚀 Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Server runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

### Play & PWA Installation

1. Accede a `http://localhost:3000` (o la URL de despliegue).
2. **Instalar como App**:
   - **Móvil (Chrome/Android)**: Pulsa en los tres puntos y selecciona "Añadir a pantalla de inicio" o "Instalar aplicación".
   - **Móvil (iOS/Safari)**: Pulsa el botón "Compartir" y selecciona "Añadir a pantalla de inicio".
   - **Escritorio**: Busca el icono de instalación en la barra de direcciones de Chrome/Edge.
3. Regístrate y gestiona tu wallet.
4. Juega Blackjack, Hold'em, Roulette, Slots, Baccarat o Craps desde cualquier dispositivo.
5. ¡Encuentra las 9 flags ocultas! 🔓

---

# 📝 Learning Outcomes

- **Full Stack Development**: React + Flask + SQLite + WebSockets
- **Real-time Systems**: Socket.IO rooms, personalized state broadcasting
- **Game Logic**: Card game engines, hand evaluation, turn management
- **OWASP Top 10**: Real vulnerabilities, not theoretical
- **Offensive Security**: Exploitation with professional tools
- **Defensive Security**: Each writeup includes the correct patch
- **Technical Documentation**: Writeups, tutorials, architecture docs

---

# ⚠️ Disclaimer

This project is **exclusively educational**. All vulnerabilities are intentional for learning offensive and defensive security. Do not deploy in production. Do not use these techniques against systems without authorization.

---

# 👩‍💻 Author

**María Bravo Angulo** — Full Stack Developer & Cybersecurity Enthusiast

- GitHub: [@laloba04](https://github.com/laloba04)
