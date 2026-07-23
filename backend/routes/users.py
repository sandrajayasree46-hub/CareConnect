from flask import Blueprint, request
from database.db import db
from models.user import User
from models.emergency_contact import EmergencyContact
from models.volunteer import Volunteer
from utils.helpers import (
    token_required, role_required,
    success_response, error_response,
    verify_password, hash_password,
)

users_bp = Blueprint("users", __name__)


@users_bp.route("/users", methods=["GET"])
@role_required("admin")
def get_users():
    """Admin: list all users with optional role filter."""
    role_filter = request.args.get("role")
    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter)
    users = query.order_by(User.created_at.desc()).all()
    return success_response({"users": [u.to_dict() for u in users]})


@users_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    """Return the authenticated user's full profile."""
    user_id = request.current_user["user_id"]
    user = User.query.get_or_404(user_id)

    data = user.to_dict()
    data["emergency_contacts"] = [c.to_dict() for c in user.emergency_contacts]
    if user.volunteer_profile:
        vol = user.volunteer_profile.to_dict()
        data["availability"]   = vol.get("availability", "offline")
        data["bio"]            = vol.get("bio", "")
        data["skills"]         = vol.get("skills", [])
        data["rating"]         = vol.get("rating")
        data["completed_tasks"] = vol.get("completed_tasks", 0)
        data["volunteer_profile"] = vol
    return success_response(data)


@users_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    """Update the authenticated user's profile fields."""
    user_id = request.current_user["user_id"]
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if "name" in data and data["name"].strip():
        user.name = data["name"].strip()
    if "phone" in data:
        user.phone = data["phone"]
    if "avatar" in data:
        user.avatar = data["avatar"]
    if "avatar_url" in data:
        user.avatar = data["avatar_url"]

    # Volunteer-specific fields
    if user.role == "volunteer" and user.volunteer_profile:
        vol = user.volunteer_profile
        if "availability" in data and data["availability"] in ("available", "busy", "offline"):
            vol.availability = data["availability"]
        if "bio" in data:
            vol.bio = data["bio"]
        if "skills" in data:
            import json
            skills = data["skills"]
            vol.skills = json.dumps(skills) if isinstance(skills, list) else skills

    db.session.commit()

    updated = user.to_dict()
    updated["emergency_contacts"] = [c.to_dict() for c in user.emergency_contacts]
    if user.volunteer_profile:
        vol = user.volunteer_profile.to_dict()
        updated["availability"]    = vol.get("availability", "offline")
        updated["bio"]             = vol.get("bio", "")
        updated["skills"]          = vol.get("skills", [])
        updated["rating"]          = vol.get("rating")
        updated["volunteer_profile"] = vol
    return success_response(updated, "Profile updated successfully")


# ─── Change Password ──────────────────────────────────────────────────────────

@users_bp.route("/profile/change-password", methods=["POST"])
@token_required
def change_password():
    """Change the authenticated user's password."""
    user_id = request.current_user["user_id"]
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    current_pw  = data.get("current_password", "")
    new_pw      = data.get("new_password", "")
    confirm_pw  = data.get("confirm_password", "")

    if not current_pw or not new_pw or not confirm_pw:
        return error_response("All password fields are required.")

    if not verify_password(current_pw, user.password_hash):
        return error_response("Current password is incorrect.", 401)

    if new_pw != confirm_pw:
        return error_response("New passwords do not match.")

    if len(new_pw) < 8:
        return error_response("Password must be at least 8 characters.")

    user.password_hash = hash_password(new_pw)
    db.session.commit()
    return success_response(None, "Password changed successfully.")


# ─── Emergency Contacts ───────────────────────────────────────────────────────

@users_bp.route("/emergency-contacts", methods=["GET"])
@token_required
def get_emergency_contacts():
    user_id = request.current_user["user_id"]
    contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
    return success_response({"contacts": [c.to_dict() for c in contacts]})


@users_bp.route("/emergency-contacts", methods=["POST"])
@token_required
def add_emergency_contact():
    user_id = request.current_user["user_id"]
    data = request.get_json()

    # Accept both 'name' (frontend) and 'contact_name' (legacy)
    contact_name = (data.get("name") or data.get("contact_name") or "").strip()
    phone        = (data.get("phone") or "").strip()
    relationship = (data.get("relationship") or "").strip()

    if not contact_name:
        return error_response("'name' is required")
    if not phone:
        return error_response("'phone' is required")

    contact = EmergencyContact(
        user_id=user_id,
        contact_name=contact_name,
        relationship=relationship,
        phone=phone,
        email=data.get("email", ""),
    )
    db.session.add(contact)
    db.session.commit()
    return success_response(contact.to_dict(), "Emergency contact added", 201)


@users_bp.route("/emergency-contacts/<int:contact_id>", methods=["DELETE"])
@token_required
def delete_emergency_contact(contact_id):
    user_id = request.current_user["user_id"]
    contact = EmergencyContact.query.get_or_404(contact_id)
    if contact.user_id != user_id:
        return error_response("Access denied", 403)
    db.session.delete(contact)
    db.session.commit()
    return success_response(None, "Contact removed")
