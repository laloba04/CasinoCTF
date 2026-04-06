from flask_socketio import emit, join_room, leave_room
from flask import request


# In-memory room tracking
online_users = {}   # sid -> {user_id, username, room_id}
room_players = {}   # room_id -> {uid: username}


def register_lobby_events(socketio):
    @socketio.on('connect')
    def handle_connect(auth=None):
        """
        CTF VULNERABILITY #7 — Ghost Player (WS Auth Bypass)
        No token verification on WebSocket connect.
        FIX: Verify JWT in auth parameter before allowing connection.
        """
        # VULNERABLE: No auth check on WebSocket connection
        sid = request.sid
        username = 'Anonymous'
        user_id = None

        if auth and isinstance(auth, dict):
            username = auth.get('username', 'Anonymous')
            user_id = auth.get('user_id')

        online_users[sid] = {'user_id': user_id, 'username': username, 'room_id': None}
        connected_data = {'message': f'Welcome {username}!', 'sid': sid}
        if user_id is None:
            connected_data['ctf_flag'] = {
                'challenge': 7,
                'flag': 'BJCTF{ws_4uth_byp4ss_gh0st}',
                'message': '👻 Ghost Player! You connected without authentication!'
            }
        emit('connected', connected_data)

    @socketio.on('disconnect')
    def handle_disconnect():
        sid = request.sid
        user_info = online_users.pop(sid, None)
        if user_info and user_info.get('room_id'):
            rid = user_info['room_id']
            uid = user_info['user_id']
            if rid in room_players:
                room_players[rid].pop(uid, None)
                emit('player_left', {'user_id': uid, 'username': user_info['username']}, room=rid)
            leave_room(rid)

    @socketio.on('join_room')
    def handle_join_room(data):
        """
        CTF VULNERABILITY #8 — Table Hopper (Room Spoofing)
        No verification that the user is allowed in this room.
        FIX: Check room membership or invitation before allowing join.
        """
        sid = request.sid
        room_id = data.get('room_id')
        if not room_id:
            emit('error', {'message': 'Room ID required'})
            return

        user_info = online_users.get(sid, {})
        uid = user_info.get('user_id')
        username = user_info.get('username', 'Anonymous')

        # Leave previous room
        if user_info.get('room_id'):
            old_room = user_info['room_id']
            leave_room(old_room)
            if old_room in room_players:
                room_players[old_room].pop(uid, None)

        # VULNERABLE: No room access validation
        join_room(room_id)
        online_users[sid]['room_id'] = room_id

        if room_id not in room_players:
            room_players[room_id] = {}
        room_players[room_id][uid] = username

        room_joined_data = {'room_id': room_id, 'players': room_players[room_id]}
        if room_id == 'admin-private':
            room_joined_data['ctf_flag'] = {
                'challenge': 8,
                'flag': 'BJCTF{r00m_sp00f1ng_h0pp3r}',
                'message': '🚪 Table Hopper! You accessed a private admin room!'
            }
        emit('room_joined', room_joined_data, room=room_id)

    @socketio.on('leave_room')
    def handle_leave_room(data):
        sid = request.sid
        room_id = data.get('room_id')
        user_info = online_users.get(sid, {})
        uid = user_info.get('user_id')

        if room_id:
            leave_room(room_id)
            if room_id in room_players:
                room_players[room_id].pop(uid, None)
            online_users[sid]['room_id'] = None
            emit('player_left', {'user_id': uid}, room=room_id)

    @socketio.on('chat_message')
    def handle_chat(data):
        sid = request.sid
        user_info = online_users.get(sid, {})
        room_id = user_info.get('room_id')
        if room_id:
            emit('chat_message', {
                'username': user_info.get('username', 'Anonymous'),
                'message': data.get('message', ''),
                'user_id': user_info.get('user_id')
            }, room=room_id)

    @socketio.on('get_online')
    def handle_get_online():
        emit('online_count', {'count': len(online_users)})
