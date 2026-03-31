from flask import Blueprint, request, jsonify, g
from app.models.database import get_db
from app.utils.decorators import token_required

scoreboard_bp = Blueprint('scoreboard', __name__)


@scoreboard_bp.route('/api/scoreboard', methods=['GET'])
def get_scoreboard():
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "SELECT display_name, total_winnings, games_played, biggest_win FROM scoreboard ORDER BY total_winnings DESC LIMIT 50"
        )
        entries = [dict(row) for row in cursor.fetchall()]
        return jsonify({'scoreboard': entries})
    finally:
        db.close()


@scoreboard_bp.route('/api/scoreboard/update', methods=['POST'])
@token_required
def update_display_name():
    """
    CTF VULNERABILITY #2 — Script Dealer (XSS Stored)
    Display name is stored without sanitization, rendered with dangerouslySetInnerHTML on frontend.
    FIX: Sanitize input server-side and don't use dangerouslySetInnerHTML.
    """
    data = request.get_json()
    display_name = data.get('display_name', '')
    # VULNERABLE: No sanitization - allows XSS payloads in display_name
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("UPDATE scoreboard SET display_name = ? WHERE user_id = ?", (display_name, g.user_id))
        cursor.execute("UPDATE users SET display_name = ? WHERE id = ?", (display_name, g.user_id))
        db.commit()
        return jsonify({'success': True, 'display_name': display_name})
    finally:
        db.close()
