import jwt
import datetime
from app.config import Config


def create_token(user_id, username, is_admin=False):
    payload = {
        'user_id': user_id,
        'username': username,
        'is_admin': is_admin,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')


def decode_token(token):
    """
    CTF VULNERABILITY #4 — Token Trick (JWT alg:none bypass)
    Accepts tokens signed with algorithm 'none', allowing forged tokens.
    FIX: jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
    """
    try:
        header = jwt.get_unverified_header(token)
        if header.get('alg') == 'none':
            # VULNERABLE: accepts unsigned tokens
            return jwt.decode(token, options={"verify_signature": False}, algorithms=["none"])
        return jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
