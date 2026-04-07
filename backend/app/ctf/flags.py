CHALLENGES = [
    {
        'id': 1, 'name': 'Consulta Jackpot', 'category': 'SQL Injection',
        'owasp': 'A03:2021', 'difficulty': 2,
        'description': 'El formulario de login confía demasiado en lo que escribes. ¿Puedes saltarte la autenticación?',
        'flag': 'BJCTF{sql_1nj3ct10n_jackp0t}'
    },
    {
        'id': 2, 'name': 'Repartidor de Scripts', 'category': 'XSS Almacenado',
        'owasp': 'A03:2021', 'difficulty': 2,
        'description': 'El marcador muestra nombres de jugadores. ¿Y si un nombre contuviera algo... ejecutable?',
        'flag': 'BJCTF{xss_st0r3d_d3al3r}'
    },
    {
        'id': 3, 'name': 'Cartas al Descubierto', 'category': 'IDOR',
        'owasp': 'A01:2021', 'difficulty': 1,
        'description': 'Los perfiles de jugadores contienen información interesante. ¿Puedes espiar el perfil de otros?',
        'flag': 'BJCTF{1d0r_p33p1ng_c4rds}'
    },
    {
        'id': 4, 'name': 'Truco del Token', 'category': 'JWT Bypass',
        'owasp': 'A02:2021', 'difficulty': 3,
        'description': 'Los JWT protegen la app. ¿Pero qué pasa si cambias el algoritmo a "none"?',
        'flag': 'BJCTF{jwt_alg_n0ne_tr1ck}'
    },
    {
        'id': 5, 'name': 'Apuesta Imposible', 'category': 'Manipulación de Apuesta',
        'owasp': 'A04:2021', 'difficulty': 2,
        'description': 'Los límites de apuesta están controlados... ¿o no? Intercepta y modifica tus apuestas.',
        'flag': 'BJCTF{b3t_t4mp3r1ng_h1gh}'
    },
    {
        'id': 6, 'name': 'Contador de Cartas', 'category': 'Fuga de Debug',
        'owasp': 'A05:2021', 'difficulty': 2,
        'description': 'Los desarrolladores a veces dejan endpoints de debug expuestos. Busca rutas ocultas en la API.',
        'flag': 'BJCTF{d3bug_3ndp01nt_l34k}'
    },
    {
        'id': 7, 'name': 'Jugador Fantasma', 'category': 'WS Auth Bypass',
        'owasp': 'A07:2021', 'difficulty': 3,
        'description': 'Las conexiones WebSocket a veces no verifican tu identidad. ¿Puedes conectarte como fantasma?',
        'flag': 'BJCTF{ws_4uth_byp4ss_gh0st}'
    },
    {
        'id': 8, 'name': 'Saltador de Mesas', 'category': 'Room Spoofing',
        'owasp': 'A01:2021', 'difficulty': 2,
        'description': '¿Los IDs de sala son realmente privados? Intenta unirte a salas a las que no fuiste invitado.',
        'flag': 'BJCTF{r00m_sp00f1ng_h0pp3r}'
    },
    {
        'id': 9, 'name': 'Doblar la Apuesta', 'category': 'Condición de Carrera',
        'owasp': 'A04:2021', 'difficulty': 3,
        'description': '¿Qué ocurre si envías dos acciones exactamente al mismo tiempo?',
        'flag': 'BJCTF{r4c3_c0nd1t10n_d0ubl3}'
    }
]
