from database.db import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    # role: 'elder' | 'volunteer' | 'admin'
    role = db.Column(db.String(20), nullable=False, default="elder")
    phone = db.Column(db.String(20), nullable=True)
    avatar = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    requests = db.relationship(
        "Request", backref="requester", lazy=True, foreign_keys="Request.user_id"
    )
    emergency_contacts = db.relationship(
        "EmergencyContact", backref="owner", lazy=True, cascade="all, delete-orphan"
    )
    volunteer_profile = db.relationship(
        "Volunteer", backref="user", uselist=False, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "avatar": self.avatar,
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active,
        }
