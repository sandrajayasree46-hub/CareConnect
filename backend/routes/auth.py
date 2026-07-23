from flask import Blueprint, request
from database.db import db
from models.user import User
from models.volunteer import Volunteer
from utils.helpers import (
    hash_password, verify_password, generate_token,
    success_response, error_response
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user (elder, volunteer, or admin)."""
    data = request.get_json()

    # Validate required fields
    required = ["name", "email", "password", "role"]
    for field in required:
        if not data.get(field):
            return error_response(f"'{field}' is required")

    if data["role"] not in ("elder", "volunteer", "admin"):
        return error_response("Role must be 'elder', 'volunteer', or 'admin'")

    if User.query.filter_by(email=data["email"].lower()).first():
        return error_response("An account with this email already exists", 409)

    user = User(
        name=data["name"].strip(),
        email=data["email"].lower().strip(),
        password_hash=hash_password(data["password"]),
        role=data["role"],
        phone=data.get("phone", ""),
    )
    db.session.add(user)
    db.session.flush()  # get user.id before commit

    # Auto-create volunteer profile if role is volunteer
    if data["role"] == "volunteer":
        volunteer = Volunteer(user_id=user.id)
        db.session.add(volunteer)

    db.session.commit()

    token = generate_token(user.id, user.role)
    return success_response(
        {"token": token, "user": user.to_dict()},
        "Account created successfully",
        201,
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate a user and return a JWT."""
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return error_response("Email and password are required")

    user = User.query.filter_by(email=data["email"].lower()).first()
    if not user or not verify_password(data["password"], user.password_hash):
        return error_response("Invalid email or password", 401)

    if not user.is_active:
        return error_response("Your account has been deactivated. Please contact support.", 403)

    token = generate_token(user.id, user.role)
    return success_response(
        {"token": token, "user": user.to_dict()},
        "Logged in successfully",
    )
