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
            "INSERT INTO users (username, password, display_name) VALUES (%s, %s, %s) RETURNING id",
            (username, password, display_name)
        )
        row = cursor.fetchone()
        user_id = row['id'] if isinstance(row, dict) else row[0]
        cursor.execute(
            "INSERT INTO scoreboard (user_id, display_name) VALUES (%s, %s)",
            (user_id, display_name)
        )
        db.commit()
        token = create_token(user_id, username)
        return jsonify({
            'token': token,
            'user': {'id': user_id, 'username': username, 'display_name': display_name, 'balance': 5000.0}
        }), 201
    except Exception as e:
        msg = str(e).lower()
        if 'unique' in msg or 'duplicate' in msg:
            return jsonify({'error': 'Username already exists'}), 409
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """
    CTF VULNERABILITY #1 — Jackpot Query (SQL Injection)
    Uses string concatenation instead of parameterized queries.
    FIX: cursor.execute("SELECT ... WHERE username = %s AND password = %s", (username, password))
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


@auth_bp.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password():
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'Both fields required'}), 400
    if len(new_password) < 4:
        return jsonify({'error': 'New password min 4 chars'}), 400

    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT password FROM users WHERE id = %s", (g.user_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'User not found'}), 404
        stored = row['password'] if isinstance(row, dict) else row[0]
        if stored != current_password:
            return jsonify({'error': 'Current password is incorrect'}), 403
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (new_password, g.user_id))
        db.commit()
        return jsonify({'message': 'Password changed successfully'})
    finally:
        db.close()


@auth_bp.route('/api/auth/me', methods=['GET'])
@token_required
def get_me():
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT id, username, display_name, balance, is_admin FROM users WHERE id = %s", (g.user_id,))
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
