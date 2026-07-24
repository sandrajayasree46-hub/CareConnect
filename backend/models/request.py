from database.db import db
from datetime import datetime


class Request(db.Model):
    __tablename__ = "requests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    # Who accepted the request (volunteer)
    volunteer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    # assistance_type: 'medical' | 'grocery' | 'transport' | 'companionship' | 'home_repair' | 'other'
    assistance_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    # priority: 'low' | 'medium' | 'high' | 'emergency'
    priority = db.Column(db.String(20), nullable=False, default="medium")
    # status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)
    location = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    completed_at = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self, include_requester=False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "volunteer_id": self.volunteer_id,
            "assistance_type": self.assistance_type,
            "description": self.description,
            "priority": self.priority,
            "status": self.status,
            "location": self.location,
            "notes": self.notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
        if include_requester and self.requester:
            data["requester"] = self.requester.to_dict()
        return data
