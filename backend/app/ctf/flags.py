CHALLENGES = [
    {
        'id': 1, 'name': 'Jackpot Query', 'category': 'SQL Injection',
        'owasp': 'A03:2021', 'difficulty': 2,
        'description': 'The login form seems to trust user input a bit too much. Can you bypass authentication?',
        'flag': 'BJCTF{sql_1nj3ct10n_jackp0t}'
    },
    {
        'id': 2, 'name': 'Script Dealer', 'category': 'XSS Stored',
        'owasp': 'A03:2021', 'difficulty': 2,
        'description': 'The scoreboard displays player names. What if a name contained something... executable?',
        'flag': 'BJCTF{xss_st0r3d_d3al3r}'
    },
    {
        'id': 3, 'name': 'Peeping Cards', 'category': 'IDOR',
        'owasp': 'A01:2021', 'difficulty': 1,
        'description': 'Player profiles contain interesting info. Can you peek at other players\' profiles?',
        'flag': 'BJCTF{1d0r_p33p1ng_c4rds}'
    },
    {
        'id': 4, 'name': 'Token Trick', 'category': 'JWT Bypass',
        'owasp': 'A02:2021', 'difficulty': 3,
        'description': 'JWTs secure the app. But what happens when you change the algorithm to "none"?',
        'flag': 'BJCTF{jwt_alg_n0ne_tr1ck}'
    },
    {
        'id': 5, 'name': 'High Roller', 'category': 'Bet Tampering',
        'owasp': 'A04:2021', 'difficulty': 2,
        'description': 'Bet limits are enforced... or are they? Try intercepting and modifying your bets.',
        'flag': 'BJCTF{b3t_t4mp3r1ng_h1gh}'
    },
    {
        'id': 6, 'name': 'Card Counter', 'category': 'Debug Leak',
        'owasp': 'A05:2021', 'difficulty': 2,
        'description': 'Developers sometimes leave debug endpoints exposed. Try finding hidden API routes.',
        'flag': 'BJCTF{d3bug_3ndp01nt_l34k}'
    },
    {
        'id': 7, 'name': 'Ghost Player', 'category': 'WS Auth Bypass',
        'owasp': 'A07:2021', 'difficulty': 3,
        'description': 'WebSocket connections might not verify your identity. Can you join as a ghost?',
        'flag': 'BJCTF{ws_4uth_byp4ss_gh0st}'
    },
    {
        'id': 8, 'name': 'Table Hopper', 'category': 'Room Spoofing',
        'owasp': 'A01:2021', 'difficulty': 2,
        'description': 'Are room IDs truly private? Try joining rooms you were not invited to.',
        'flag': 'BJCTF{r00m_sp00f1ng_h0pp3r}'
    },
    {
        'id': 9, 'name': 'Double Down', 'category': 'Race Condition',
        'owasp': 'A04:2021', 'difficulty': 3,
        'description': 'What happens when you send two actions at the exact same time?',
        'flag': 'BJCTF{r4c3_c0nd1t10n_d0ubl3}'
    }
]
