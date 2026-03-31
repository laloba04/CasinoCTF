import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'casino-ctf-super-secret-key-change-in-prod')
    DATABASE_PATH = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        os.environ.get('DATABASE_PATH', 'casino.db')
    )
    DEBUG = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
