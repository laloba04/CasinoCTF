HINTS = {
    1: [
        "Prueba a escribir una comilla (') en el campo de usuario. ¿Qué ocurre?",
        "SQL usa -- para comentar el resto de la consulta. Prueba: admin'--",
        "Payload completo: usuario = admin' OR '1'='1' -- , contraseña = cualquier cosa"
    ],
    2: [
        "El marcador muestra nombres de jugadores. ¿Y si un nombre contuviera HTML?",
        "Prueba a cambiar tu nombre visible para incluir una etiqueta <script>.",
        "Pon como nombre: <img src=x onerror=\"fetch('/api/ctf/xss-flag',{headers:{'Authorization':'Bearer '+localStorage.getItem('casino_token')}}).then(r=>r.json()).then(d=>alert(d.flag))\">"
    ],
    3: [
        "Fíjate en la URL del perfil CTF. ¿Ves el ID de usuario?",
        "Prueba a cambiar el user_id en /api/ctf/profile/{id} por otro número.",
        "Accede a /api/ctf/profile/1 — el perfil del admin contiene algo especial."
    ],
    4: [
        "Decodifica tu token JWT en jwt.io. ¿Ves el campo 'alg' en la cabecera?",
        "¿Qué pasa si cambias el algoritmo a 'none' y eliminas la firma?",
        "Construye un token con alg:none e is_admin:true, y llama a GET /api/admin/flag con él."
    ],
    5: [
        "Intercepta una petición de apuesta con Burp Suite o las DevTools del navegador.",
        "El importe de la apuesta lo envía el cliente. ¿Y si lo modificas?",
        "Envía un evento WebSocket bj_bet con un importe mayor a tu saldo. Observa la respuesta."
    ],
    6: [
        "No todos los endpoints aparecen en la UI. Prueba rutas de debug habituales.",
        "Los desarrolladores usan /debug, /api/debug o /api/debug/state.",
        "Visita /api/debug/state — expone la clave secreta y los datos de usuarios."
    ],
    7: [
        "Las conexiones WebSocket a veces omiten la verificación de autenticación.",
        "Intenta conectarte al WebSocket sin enviar un token válido.",
        "Conéctate a Socket.IO sin auth (o con {}) y revisa el payload del evento 'connected'."
    ],
    8: [
        "Los IDs de sala son identificadores cortos. ¿Se validan al unirse?",
        "Intenta emitir el evento 'join_room' con un room_id que hayas encontrado o adivinado.",
        "Hay una sala oculta llamada 'admin-private'. Únete a ella por WebSocket y revisa el evento 'room_joined'."
    ],
    9: [
        "Algunas acciones comprueban el estado del juego pero no lo bloquean durante el proceso.",
        "¿Qué ocurre si envías dos solicitudes de 'hit' simultáneamente cuando tu mano ya ha terminado?",
        "Envía un evento bj_hit por WebSocket después de que tu mano esté cerrada. El evento ctf_flag se emite en ese socket."
    ]
}


def get_hints(challenge_id, level=1):
    hints = HINTS.get(challenge_id, [])
    level = max(1, min(level, len(hints)))
    return hints[:level]
