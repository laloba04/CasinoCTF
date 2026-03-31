HINTS = {
    1: [
        "Try entering a single quote (') in the username field. What happens?",
        "SQL uses -- to comment out the rest of a query. Try: admin'--",
        "Full payload: username = admin' OR '1'='1' -- , password = anything"
    ],
    2: [
        "The scoreboard renders display names. What if a name had HTML in it?",
        "Try changing your display name to include a <script> tag.",
        "Set display_name to: <img src=x onerror=alert(document.cookie)>"
    ],
    3: [
        "Look at the CTF profile endpoint URL. Notice the user ID?",
        "Try changing the user_id in /api/ctf/profile/{id} to another number.",
        "Enumerate user IDs: /api/ctf/profile/1, /api/ctf/profile/2, etc."
    ],
    4: [
        "Decode your JWT token at jwt.io. Notice the 'alg' field in the header?",
        "What if you change the algorithm to 'none' and remove the signature?",
        "Craft a token: header={alg:none}, payload={user_id:1,is_admin:true}, signature=''"
    ],
    5: [
        "Intercept a bet request with Burp Suite or DevTools Network tab.",
        "The bet amount is sent from the client. What if you modify it?",
        "Send a negative bet or a bet larger than your balance via the API directly."
    ],
    6: [
        "Not all API endpoints are shown in the UI. Try common debug paths.",
        "Developers often use /debug, /api/debug, or /api/debug/state.",
        "Visit /api/debug/state — it exposes the secret key and user data."
    ],
    7: [
        "WebSocket connections sometimes skip authentication checks.",
        "Try connecting to the WebSocket without sending a valid token.",
        "Connect to Socket.IO without auth and emit game events directly."
    ],
    8: [
        "Room IDs are short identifiers. Are they validated on join?",
        "Try emitting a 'join_room' event with a room_id you found or guessed.",
        "Enumerate rooms via /api/rooms, then join one directly via WebSocket."
    ],
    9: [
        "Some actions check the game state but don't lock it during processing.",
        "What happens if you send two 'hit' or 'bet' requests simultaneously?",
        "Use curl or a script to send multiple requests at the exact same time."
    ]
}


def get_hints(challenge_id, level=1):
    hints = HINTS.get(challenge_id, [])
    level = max(1, min(level, len(hints)))
    return hints[:level]
