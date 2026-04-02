import uuid
from flask import Blueprint, request, jsonify, g
from app.models.database import get_db
from app.utils.decorators import token_required

lobby_bp = Blueprint('lobby', __name__)


@lobby_bp.route('/api/rooms', methods=['GET'])
@token_required
def list_rooms():
    db = get_db()
    try:
        cursor = db.cursor()
        game_type = request.args.get('game_type')
        if game_type:
            cursor.execute(
                "SELECT * FROM rooms WHERE status != 'finished' AND game_type = %s ORDER BY created_at DESC",
                (game_type,)
            )
        else:
            cursor.execute("SELECT * FROM rooms WHERE status != 'finished' ORDER BY created_at DESC")
        rooms = [dict(row) for row in cursor.fetchall()]
        return jsonify({'rooms': rooms})
    finally:
        db.close()


@lobby_bp.route('/api/rooms', methods=['POST'])
@token_required
def create_room():
    data = request.get_json()
    game_type = data.get('game_type', 'blackjack')
    name = data.get('name', f"{g.username}'s table")
    max_players = data.get('max_players', 7)
    min_bet = data.get('min_bet', 10)
    max_bet = data.get('max_bet', 1000)

    valid_types = ['blackjack', 'holdem', 'roulette', 'slots', 'baccarat', 'craps']
    if game_type not in valid_types:
        return jsonify({'error': 'Invalid game type'}), 400

    room_id = str(uuid.uuid4())[:8]
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO rooms (id, game_type, name, max_players, min_bet, max_bet, created_by) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (room_id, game_type, name, max_players, min_bet, max_bet, g.user_id)
        )
        db.commit()
        return jsonify({
            'room': {'id': room_id, 'game_type': game_type, 'name': name,
                     'max_players': max_players, 'min_bet': min_bet, 'max_bet': max_bet}
        }), 201
    finally:
        db.close()


@lobby_bp.route('/api/rooms/<room_id>', methods=['GET'])
@token_required
def get_room(room_id):
    db = get_db()
    try:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM rooms WHERE id = %s", (room_id,))
        room = cursor.fetchone()
        if room:
            return jsonify({'room': dict(room)})
        return jsonify({'error': 'Room not found'}), 404
    finally:
        db.close()
