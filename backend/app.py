from flask import Flask
from flask_cors import CORS
from config import Config
from database.db import init_db
from routes.auth import auth_bp
from routes.requests import requests_bp
from routes.users import users_bp
from routes.admin import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes (Vite runs on port 5173)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
         supports_credentials=True)

    # Initialize database
    init_db(app)

    # Register blueprints under /api prefix
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(requests_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "app": "CareConnect API"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
