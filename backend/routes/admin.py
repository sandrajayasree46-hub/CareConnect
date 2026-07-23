from flask import Blueprint, request
from database.db import db
from models.user import User
from models.request import Request
from models.volunteer import Volunteer
from utils.helpers import role_required, success_response, error_response

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/stats", methods=["GET"])
@role_required("admin")
def dashboard_stats():
    """Return aggregate dashboard statistics for the admin panel."""
    total_users = User.query.count()
    total_elders = User.query.filter_by(role="elder").count()
    total_volunteers = User.query.filter_by(role="volunteer").count()
    total_requests = Request.query.count()
    pending_requests = Request.query.filter_by(status="pending").count()
    active_requests = Request.query.filter(
        Request.status.in_(["accepted", "in_progress"])
    ).count()
    completed_requests = Request.query.filter_by(status="completed").count()
    available_volunteers = Volunteer.query.filter_by(availability="available").count()

    return success_response({
        "total_users": total_users,
        "total_elders": total_elders,
        "total_volunteers": total_volunteers,
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "active_requests": active_requests,
        "completed_requests": completed_requests,
        "available_volunteers": available_volunteers,
    })


@admin_bp.route("/admin/users", methods=["GET"])
@role_required("admin")
def list_users():
    """List all users with optional role filter."""
    role_filter = request.args.get("role")
    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter)
    users = query.order_by(User.created_at.desc()).all()
    return success_response({"users": [u.to_dict() for u in users]})


@admin_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@role_required("admin")
def delete_user(user_id):
    """Admin: delete a user and all associated data."""
    user = User.query.get_or_404(user_id)
    if user.role == "admin":
        return error_response("Cannot delete an admin account", 403)
    db.session.delete(user)
    db.session.commit()
    return success_response(None, "User deleted successfully")


@admin_bp.route("/admin/users/<int:user_id>/toggle-active", methods=["PUT"])
@role_required("admin")
def toggle_user_active(user_id):
    """Admin: enable or disable a user account."""
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    status_str = "activated" if user.is_active else "deactivated"
    return success_response(user.to_dict(), f"User {status_str} successfully")


@admin_bp.route("/admin/requests", methods=["GET"])
@role_required("admin")
def list_all_requests():
    """Admin: list all requests with pagination."""
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    status_filter = request.args.get("status")

    query = Request.query
    if status_filter:
        query = query.filter_by(status=status_filter)

    paginated = query.order_by(Request.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return success_response({
        "requests": [r.to_dict(include_requester=True) for r in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
    })


@admin_bp.route("/admin/volunteers", methods=["GET"])
@role_required("admin")
def list_volunteers():
    """Admin: list all volunteer profiles with user info."""
    volunteers = Volunteer.query.all()
    result = []
    for vol in volunteers:
        vol_data = vol.to_dict()
        if vol.user:
            vol_data["user"] = vol.user.to_dict()
        result.append(vol_data)
    return success_response({"volunteers": result})
