from flask import Blueprint, request, jsonify, g
from app.models.database import get_db
from app.utils.decorators import token_required
from app.ctf.flags import CHALLENGES
from app.ctf.hints import get_hints

ctf_bp = Blueprint('ctf', __name__)


@ctf_bp.route('/api/ctf/challenges', methods=['GET'])
@token_required
def list_challenges():
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT challenge_id FROM ctf_submissions WHERE user_id = %s", (g.user_id,))
        solved = {row['challenge_id'] for row in cursor.fetchall()}

        challenges = []
        for c in CHALLENGES:
            challenges.append({
                'id': c['id'], 'name': c['name'], 'category': c['category'],
                'difficulty': c['difficulty'], 'owasp': c['owasp'],
                'description': c['description'], 'solved': c['id'] in solved
            })
        return jsonify({'challenges': challenges})
    finally:
        db.close()


@ctf_bp.route('/api/ctf/submit', methods=['POST'])
@token_required
def submit_flag():
    data = request.get_json()
    challenge_id = data.get('challenge_id')
    flag = data.get('flag', '').strip()

    challenge = next((c for c in CHALLENGES if c['id'] == challenge_id), None)
    if not challenge:
        return jsonify({'error': 'Challenge not found'}), 404

    if flag != challenge['flag']:
        return jsonify({'correct': False, 'message': 'Wrong flag, try again!'}), 200

    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO ctf_submissions (user_id, challenge_id, flag) VALUES (%s, %s, %s) ON CONFLICT (user_id, challenge_id) DO NOTHING",
            (g.user_id, challenge_id, flag)
        )
        db.commit()
        return jsonify({'correct': True, 'message': f'🎉 Correct! Challenge "{challenge["name"]}" solved!'})
    finally:
        db.close()


@ctf_bp.route('/api/ctf/hints/<int:challenge_id>', methods=['GET'])
@token_required
def get_challenge_hints(challenge_id):
    level = request.args.get('level', 1, type=int)
    hints = get_hints(challenge_id, level)
    return jsonify({'hints': hints, 'challenge_id': challenge_id, 'level': level})


@ctf_bp.route('/api/ctf/profile/<int:user_id>', methods=['GET'])
@token_required
def get_ctf_profile(user_id):
    """
    CTF VULNERABILITY #3 — Peeping Cards (IDOR)
    Any authenticated user can view any other user's CTF profile.
    FIX: if user_id != g.user_id and not g.is_admin: return 403
    """
    # VULNERABLE: No ownership check
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "SELECT u.username, u.display_name, u.balance FROM users u WHERE u.id = %s", (user_id,)
        )
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        cursor.execute("SELECT challenge_id, solved_at FROM ctf_submissions WHERE user_id = %s", (user_id,))
        submissions = [dict(row) for row in cursor.fetchall()]

        return jsonify({
            'profile': {
                'username': user['username'], 'display_name': user['display_name'],
                'balance': user['balance'], 'solved': submissions
            }
        })
    finally:
        db.close()


@ctf_bp.route('/api/debug/state', methods=['GET'])
def debug_state():
    """
    CTF VULNERABILITY #6 — Card Counter (Debug Leak)
    Exposes internal game state and configuration.
    FIX: Protect with admin auth + check DEBUG env var.
    """
    # VULNERABLE: Exposed debug endpoint with sensitive info
    from app.config import Config
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT id, username, balance, is_admin FROM users")
        users = [dict(row) for row in cursor.fetchall()]
        return jsonify({
            'secret_key': Config.SECRET_KEY,
            'debug': Config.DEBUG,
            'users': users,
            'flag': 'BJCTF{d3bug_3ndp01nt_l34k}'
        })
    finally:
        db.close()
