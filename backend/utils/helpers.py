import jwt
import bcrypt
from functools import wraps
from flask import request, jsonify, current_app
from datetime import datetime, timedelta


# ─── Password Hashing ────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the plain-text password."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Compare a plain-text password against a stored bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ─── JWT ─────────────────────────────────────────────────────────────────────

def generate_token(user_id: int, role: str) -> str:
    """Generate a JWT access token that expires in JWT_EXPIRATION_HOURS."""
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow()
        + timedelta(hours=current_app.config.get("JWT_EXPIRATION_HOURS", 24)),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decode and validate a JWT. Raises on error."""
    return jwt.decode(
        token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
    )


# ─── Decorators ──────────────────────────────────────────────────────────────

def token_required(f):
    """Decorator: require a valid JWT in the Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401

        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        # Attach payload to request context so route handlers can access it
        request.current_user = payload
        return f(*args, **kwargs)

    return decorated


def role_required(*roles):
    """Decorator: restrict access to users with specific roles."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.current_user.get("role") not in roles:
                return jsonify({"error": "You do not have permission to access this resource"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


# ─── Response Helpers ─────────────────────────────────────────────────────────

def success_response(data=None, message="Success", status=200):
    return jsonify({"success": True, "message": message, "data": data}), status


def error_response(message="An error occurred", status=400):
    return jsonify({"success": False, "error": message}), status
