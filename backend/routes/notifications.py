from flask import Blueprint, request
from database.db import db
from models.notification import Notification
from utils.helpers import token_required, success_response, error_response

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/notifications", methods=["GET"])
@token_required
def get_notifications():
    """Fetch notifications for the authenticated user."""
    user_id = request.current_user["user_id"]
    unread_only = request.args.get("unread", "false").lower() == "true"

    query = Notification.query.filter_by(user_id=user_id)
    if unread_only:
        query = query.filter_by(read=False)

    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user_id, read=False).count()

    return success_response({
        "notifications": [n.to_dict() for n in notifications],
        "unread_count": unread_count,
    })


@notifications_bp.route("/notifications/read", methods=["PUT"])
@token_required
def mark_read():
    """Mark all or specific notifications as read."""
    user_id = request.current_user["user_id"]
    data = request.get_json(silent=True) or {}
    notification_id = data.get("notification_id")

    if notification_id:
        notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        if notif:
            notif.read = True
    else:
        # Mark all as read
        Notification.query.filter_by(user_id=user_id, read=False).update({"read": True})

    db.session.commit()
    unread_count = Notification.query.filter_by(user_id=user_id, read=False).count()
    return success_response({"unread_count": unread_count}, "Notifications marked as read")


@notifications_bp.route("/notifications/<int:notif_id>", methods=["DELETE"])
@token_required
def delete_notification(notif_id):
    """Delete a notification."""
    user_id = request.current_user["user_id"]
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first_or_404()
    db.session.delete(notif)
    db.session.commit()
    return success_response(None, "Notification deleted")
