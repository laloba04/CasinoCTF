from flask import Blueprint, request, jsonify, g
from app.models.database import get_db
from app.utils.jwt_handler import create_token
from app.utils.decorators import token_required

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    display_name = data.get('display_name', username)

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    if len(username) < 3 or len(password) < 4:
        return jsonify({'error': 'Username min 3 chars, password min 4 chars'}), 400

    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)",
            (username, password, display_name)
        )
        user_id = cursor.lastrowid
        cursor.execute(
            "INSERT INTO scoreboard (user_id, display_name) VALUES (?, ?)",
            (user_id, display_name)
        )
        db.commit()
        token = create_token(user_id, username)
        return jsonify({
            'token': token,
            'user': {'id': user_id, 'username': username, 'display_name': display_name, 'balance': 5000.0}
        }), 201
    except Exception as e:
        if 'UNIQUE' in str(e):
            return jsonify({'error': 'Username already exists'}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """
    CTF VULNERABILITY #1 — Jackpot Query (SQL Injection)
    Uses string concatenation instead of parameterized queries.
    FIX: cursor.execute("SELECT ... WHERE username = ? AND password = ?", (username, password))
    """
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    db = get_db()
    try:
        cursor = db.cursor()
        # VULNERABLE: SQL Injection
        query = f"SELECT id, username, display_name, balance, is_admin FROM users WHERE username = '{username}' AND password = '{password}'"
        cursor.execute(query)
        user = cursor.fetchone()

        if user:
            token = create_token(user['id'], user['username'], bool(user['is_admin']))
            return jsonify({
                'token': token,
                'user': {
                    'id': user['id'], 'username': user['username'],
                    'display_name': user['display_name'], 'balance': user['balance'],
                    'is_admin': bool(user['is_admin'])
                }
            })
        return jsonify({'error': 'Invalid credentials'}), 401
    finally:
        db.close()


@auth_bp.route('/api/auth/me', methods=['GET'])
@token_required
def get_me():
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT id, username, display_name, balance, is_admin FROM users WHERE id = ?", (g.user_id,))
        user = cursor.fetchone()
        if user:
            return jsonify({
                'user': {
                    'id': user['id'], 'username': user['username'],
                    'display_name': user['display_name'], 'balance': user['balance'],
                    'is_admin': bool(user['is_admin'])
                }
            })
        return jsonify({'error': 'User not found'}), 404
    finally:
        db.close()
