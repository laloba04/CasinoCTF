import psycopg2
import psycopg2.extras
from app.config import Config


def get_db():
    url = Config.DATABASE_URL
    if not url:
        raise RuntimeError("DATABASE_URL is not set. PostgreSQL is required.")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    conn = psycopg2.connect(url)
    conn.cursor_factory = psycopg2.extras.RealDictCursor
    return conn


def init_db():
    db = get_db()
    cursor = db.cursor()

    queries = [
        '''CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            display_name TEXT,
            balance REAL DEFAULT 5000.0,
            is_admin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );''',
        '''CREATE TABLE IF NOT EXISTS games (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            game_type TEXT NOT NULL,
            room_id TEXT,
            bet REAL NOT NULL,
            result TEXT NOT NULL,
            payout REAL DEFAULT 0,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );''',
        '''CREATE TABLE IF NOT EXISTS rooms (
            id TEXT PRIMARY KEY,
            game_type TEXT NOT NULL,
            name TEXT NOT NULL,
            max_players INTEGER DEFAULT 7,
            min_bet REAL DEFAULT 10,
            max_bet REAL DEFAULT 1000,
            status TEXT DEFAULT 'waiting',
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        );''',
        '''CREATE TABLE IF NOT EXISTS ctf_submissions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            challenge_id INTEGER NOT NULL,
            flag TEXT NOT NULL,
            solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, challenge_id)
        );''',
        '''CREATE TABLE IF NOT EXISTS scoreboard (
            id SERIAL PRIMARY KEY,
            user_id INTEGER UNIQUE NOT NULL,
            display_name TEXT,
            total_winnings REAL DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            biggest_win REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );'''
    ]

    for q in queries:
        cursor.execute(q)

    # Create admin user if not exists
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (username, password, display_name, balance, is_admin) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            ('admin', 'admin123', 'Casino Admin', 999999, 1)
        )
        row = cursor.fetchone()
        admin_id = row['id']
        cursor.execute(
            "INSERT INTO scoreboard (user_id, display_name) VALUES (%s, %s)",
            (admin_id, 'Casino Admin')
        )

    db.commit()
    cursor.close()
    db.close()
