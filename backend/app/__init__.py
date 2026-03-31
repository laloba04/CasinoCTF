from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from app.config import Config
from app.models.database import init_db

socketio = SocketIO()


def create_app():
    app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='/')
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.game import game_bp
    from app.routes.lobby import lobby_bp
    from app.routes.scoreboard import scoreboard_bp
    from app.routes.ctf import ctf_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(game_bp)
    app.register_blueprint(lobby_bp)
    app.register_blueprint(scoreboard_bp)
    app.register_blueprint(ctf_bp)

    # Initialize SocketIO
    socketio.init_app(app, cors_allowed_origins=Config.CORS_ORIGINS, async_mode='eventlet')

    # Register socket events
    from app.sockets.lobby_events import register_lobby_events
    from app.sockets.game_events import register_game_events
    register_lobby_events(socketio)
    register_game_events(socketio)

    # Initialize database
    with app.app_context():
        init_db()

    # Serve frontend in production
    @app.route('/')
    def serve_frontend():
        return app.send_static_file('index.html')

    @app.errorhandler(404)
    def not_found(e):
        # SPA fallback
        return app.send_static_file('index.html')

    return app
