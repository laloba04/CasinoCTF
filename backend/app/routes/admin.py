from flask import Blueprint, jsonify, request, g
from app.models.database import get_db
from app.utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/api/admin/flag', methods=['GET'])
@admin_required
def get_admin_flag():
    return jsonify({
        'flag_jwt': 'BJCTF{jwt_alg_n0ne_tr1ck}',
        'message': '¡Bienvenido al panel de admin. Forjaste un token de administrador!'
    })


@admin_bp.route('/api/admin/users', methods=['GET'])
@admin_required
def list_users():
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT u.id, u.username, u.display_name, u.balance, u.is_admin,
                   COALESCE(s.games_played, 0) AS games_played,
                   COALESCE(s.total_winnings, 0) AS total_winnings
            FROM users u
            LEFT JOIN scoreboard s ON s.user_id = u.id
            ORDER BY u.id
        """)
        users = [dict(row) for row in cursor.fetchall()]
        return jsonify({'users': users})
    finally:
        db.close()


@admin_bp.route('/api/admin/users/<int:user_id>/balance', methods=['PUT'])
@admin_required
def set_balance(user_id):
    data = request.get_json()
    balance = data.get('balance')
    if balance is None or float(balance) < 0:
        return jsonify({'error': 'Invalid balance'}), 400
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("UPDATE users SET balance = %s WHERE id = %s RETURNING id", (float(balance), user_id))
        if not cursor.fetchone():
            return jsonify({'error': 'User not found'}), 404
        db.commit()
        return jsonify({'message': 'Balance updated'})
    finally:
        db.close()


@admin_bp.route('/api/admin/users/<int:user_id>/toggle-admin', methods=['PUT'])
@admin_required
def toggle_admin(user_id):
    if user_id == g.user_id:
        return jsonify({'error': 'Cannot change your own admin status'}), 400
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("UPDATE users SET is_admin = 1 - is_admin WHERE id = %s RETURNING is_admin", (user_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'User not found'}), 404
        db.commit()
        return jsonify({'is_admin': bool(row['is_admin'] if isinstance(row, dict) else row[0])})
    finally:
        db.close()


@admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    if user_id == g.user_id:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT id, is_admin FROM users WHERE id = %s", (user_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'User not found'}), 404
        if row['is_admin'] if isinstance(row, dict) else row[1]:
            return jsonify({'error': 'Cannot delete admin users'}), 400
        cursor.execute("DELETE FROM ctf_submissions WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM games WHERE user_id = %s", (user_id,))
        cursor.execute("UPDATE rooms SET created_by = NULL WHERE created_by = %s", (user_id,))
        cursor.execute("DELETE FROM scoreboard WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        db.commit()
        return jsonify({'message': 'User deleted'})
    finally:
        db.close()
