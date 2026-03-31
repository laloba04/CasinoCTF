from flask import Blueprint, request, jsonify, g
from app.models.database import get_db
from app.utils.decorators import token_required

game_bp = Blueprint('game', __name__)


@game_bp.route('/api/games/history', methods=['GET'])
@token_required
def get_history():
    db = get_db()
    try:
        cursor = db.cursor()
        limit = request.args.get('limit', 20, type=int)
        cursor.execute(
            "SELECT * FROM games WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
            (g.user_id, limit)
        )
        games = [dict(row) for row in cursor.fetchall()]
        return jsonify({'games': games})
    finally:
        db.close()


@game_bp.route('/api/games/stats', methods=['GET'])
@token_required
def get_stats():
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT game_type, COUNT(*) as played,
                   SUM(CASE WHEN result = 'win' OR result = 'blackjack' THEN 1 ELSE 0 END) as wins,
                   SUM(payout) as total_payout, SUM(bet) as total_bet
            FROM games WHERE user_id = ? GROUP BY game_type
        """, (g.user_id,))
        stats = [dict(row) for row in cursor.fetchall()]
        return jsonify({'stats': stats})
    finally:
        db.close()


@game_bp.route('/api/wallet/balance', methods=['GET'])
@token_required
def get_balance():
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT balance FROM users WHERE id = ?", (g.user_id,))
        row = cursor.fetchone()
        return jsonify({'balance': row['balance'] if row else 0})
    finally:
        db.close()
