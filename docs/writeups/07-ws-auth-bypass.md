# Challenge 7: Ghost Player (WS Auth Bypass)

**Category**: A07:2021-Identification and Authentication Failures
**Difficulty**: ⭐⭐⭐

## Description
The WebSocket `/socket.io` connection allows players to connect and emit game events without sending or verifying a JWT token in the handshake.

## Exploitation
1. Write a custom python script using `socketio.Client()`.
2. Connect to the server without passing an auth header.
3. Emit `join_room` events. The server trusts the connection because it assumes authentication was handled by the REST API beforehand.

## Patch
Enforce token verification in the `@socketio.on('connect')` event. If the token is invalid or missing, `return False` to reject the socket connection.
