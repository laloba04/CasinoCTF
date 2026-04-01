import sqlite3
import os
from app.config import Config

class PostgresCursorWrapper:
    def __init__(self, cursor):
        self.cursor = cursor
        
    def execute(self, query, params=None):
        if params is not None:
            query = query.replace('?', '%s')
            return self.cursor.execute(query, params)
        return self.cursor.execute(query)

    def fetchone(self):
        return self.cursor.fetchone()
        
    def fetchall(self):
        return self.cursor.fetchall()
        
    def close(self):
        self.cursor.close()

class PostgresConnectionWrapper:
    def __init__(self, conn):
        self.conn = conn
        
    def cursor(self):
        from psycopg2.extras import RealDictCursor
        return PostgresCursorWrapper(self.conn.cursor(cursor_factory=RealDictCursor))
        
    def commit(self):
        self.conn.commit()
        
    def close(self):
        self.conn.close()

def get_db():
    if Config.DATABASE_URL:
        import psycopg2
        import urllib.parse
        url = Config.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        conn = psycopg2.connect(url)
        return PostgresConnectionWrapper(conn)
    else:
        db = sqlite3.connect(Config.DATABASE_PATH)
        db.row_factory = sqlite3.Row
        return db

def init_db():
    db = get_db()
    cursor = db.cursor()
    
    is_postgres = bool(Config.DATABASE_URL)
    pk_type = "SERIAL PRIMARY KEY" if is_postgres else "INTEGER PRIMARY KEY AUTOINCREMENT"
    
    queries = [
        f'''CREATE TABLE IF NOT EXISTS users (
            id {pk_type},
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            display_name TEXT,
            balance REAL DEFAULT 5000.0,
            is_admin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );''',
        f'''CREATE TABLE IF NOT EXISTS games (
            id {pk_type},
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
        f'''CREATE TABLE IF NOT EXISTS rooms (
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
        f'''CREATE TABLE IF NOT EXISTS ctf_submissions (
            id {pk_type},
            user_id INTEGER NOT NULL,
            challenge_id INTEGER NOT NULL,
            flag TEXT NOT NULL,
            solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, challenge_id)
        );''',
        f'''CREATE TABLE IF NOT EXISTS scoreboard (
            id {pk_type},
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
            "INSERT INTO users (username, password, display_name, balance, is_admin) VALUES (?, ?, ?, ?, ?) RETURNING id",
            ('admin', 'admin123', 'Casino Admin', 999999, 1)
        )
        row = cursor.fetchone()
        admin_id = row['id'] if isinstance(row, dict) else row[0]
        cursor.execute(
            "INSERT INTO scoreboard (user_id, display_name) VALUES (?, ?)",
            (admin_id, 'Casino Admin')
        )

    db.commit()
    db.close()
