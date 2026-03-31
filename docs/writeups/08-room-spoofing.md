# Challenge 8: Table Hopper (Room Spoofing)

**Category**: A01:2021-Broken Access Control
**Difficulty**: ⭐⭐

## Description
Players can emit game actions specifying a `room_id` they haven't joined. The server processes the action in the context of that room without checking if the socket ID is actually part of that room.

## Exploitation
1. Intercept a WebSocket message.
2. Change the `room_id` parameter to a private room ID (e.g., a high-stakes test room).
3. The server applies your bet to the victim's room.

## Patch
```python
# VULNERABLE
room_id = data.get('room_id')
game = active_games[room_id]

# PATCHED
if request.sid not in get_participants(room_id):
    return
```
