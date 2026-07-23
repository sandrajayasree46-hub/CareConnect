from flask import Blueprint, request
from datetime import datetime
from database.db import db
from models.request import Request
from models.user import User
from utils.helpers import token_required, role_required, success_response, error_response

requests_bp = Blueprint("requests", __name__)

VALID_TYPES = {"medical", "grocery", "transport", "companionship", "home_repair", "other"}
VALID_PRIORITIES = {"low", "medium", "high", "emergency"}
VALID_STATUSES = {"pending", "accepted", "in_progress", "completed", "cancelled"}


@requests_bp.route("/requests", methods=["GET"])
@token_required
def get_requests():
    """
    - Elders see their own requests
    - Volunteers see all pending/accepted requests
    - Admins see everything
    """
    user_id = request.current_user["user_id"]
    role = request.current_user["role"]
    status_filter = request.args.get("status")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    query = Request.query
    if role == "elder":
        query = query.filter_by(user_id=user_id)
    elif role == "volunteer":
        query = query.filter(Request.status.in_(["pending", "accepted", "in_progress"]))
    # admin sees all

    if status_filter and status_filter in VALID_STATUSES:
        query = query.filter_by(status=status_filter)

    paginated = query.order_by(Request.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    requests_list = [r.to_dict(include_requester=True) for r in paginated.items]
    return success_response({
        "requests": requests_list,
        "total": paginated.total,
        "page": page,
        "pages": paginated.pages,
    })


@requests_bp.route("/requests", methods=["POST"])
@role_required("elder", "admin")
def create_request():
    """Create a new help request."""
    data = request.get_json()
    user_id = request.current_user["user_id"]

    required = ["assistance_type", "description"]
    for field in required:
        if not data.get(field):
            return error_response(f"'{field}' is required")

    if data["assistance_type"] not in VALID_TYPES:
        return error_response(f"Invalid assistance_type. Must be one of: {', '.join(VALID_TYPES)}")

    priority = data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        return error_response(f"Invalid priority. Must be one of: {', '.join(VALID_PRIORITIES)}")

    req = Request(
        user_id=user_id,
        assistance_type=data["assistance_type"],
        description=data["description"].strip(),
        priority=priority,
        location=data.get("location", ""),
        notes=data.get("notes", ""),
    )
    db.session.add(req)
    db.session.commit()
    return success_response(req.to_dict(), "Request submitted successfully", 201)


@requests_bp.route("/requests/<int:req_id>", methods=["GET"])
@token_required
def get_request(req_id):
    """Fetch a single request by ID."""
    req = Request.query.get_or_404(req_id)
    user_id = request.current_user["user_id"]
    role = request.current_user["role"]

    # Elders can only see their own requests
    if role == "elder" and req.user_id != user_id:
        return error_response("Access denied", 403)

    return success_response(req.to_dict(include_requester=True))


@requests_bp.route("/requests/<int:req_id>", methods=["PUT"])
@token_required
def update_request(req_id):
    """Update status, notes, or volunteer assignment."""
    req = Request.query.get_or_404(req_id)
    data = request.get_json()
    user_id = request.current_user["user_id"]
    role = request.current_user["role"]

    # Only owner, assigned volunteer, or admin can update
    if role == "elder" and req.user_id != user_id:
        return error_response("Access denied", 403)

    new_status = data.get("status")
    if new_status:
        if new_status not in VALID_STATUSES:
            return error_response(f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")
        # Volunteer accepting
        if new_status == "accepted" and role == "volunteer":
            req.volunteer_id = user_id
        # Mark complete
        if new_status == "completed":
            req.completed_at = datetime.utcnow()
            # Increment volunteer completed_tasks
            if req.volunteer_id:
                from models.volunteer import Volunteer
                vol = Volunteer.query.filter_by(user_id=req.volunteer_id).first()
                if vol:
                    vol.completed_tasks += 1
        req.status = new_status

    if "notes" in data:
        req.notes = data["notes"]
    if role in ("elder", "admin"):
        if "description" in data:
            req.description = data["description"]
        if "location" in data:
            req.location = data["location"]
        if "priority" in data and data["priority"] in VALID_PRIORITIES:
            req.priority = data["priority"]

    req.updated_at = datetime.utcnow()
    db.session.commit()
    return success_response(req.to_dict(), "Request updated successfully")


@requests_bp.route("/requests/<int:req_id>", methods=["DELETE"])
@token_required
def delete_request(req_id):
    """Delete a request (owner or admin only)."""
    req = Request.query.get_or_404(req_id)
    user_id = request.current_user["user_id"]
    role = request.current_user["role"]

    if role not in ("admin",) and req.user_id != user_id:
        return error_response("Access denied", 403)

    db.session.delete(req)
    db.session.commit()
    return success_response(None, "Request deleted successfully")
