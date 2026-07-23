from database.db import db
from datetime import datetime


class Volunteer(db.Model):
    __tablename__ = "volunteers"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    # availability: 'available' | 'busy' | 'offline'
    availability = db.Column(db.String(20), nullable=False, default="available")
    skills = db.Column(db.String(255), nullable=True)  # comma-separated list
    bio = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Float, nullable=True, default=5.0)
    completed_tasks = db.Column(db.Integer, default=0)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        raw_skills = self.skills or "[]"
        try:
            skills_list = json.loads(raw_skills)
        except (ValueError, TypeError):
            # Fallback: treat as comma-separated string
            skills_list = [s.strip() for s in raw_skills.split(",") if s.strip()]

        return {
            "id": self.id,
            "user_id": self.user_id,
            "availability": self.availability,
            "skills": skills_list,
            "bio": self.bio,
            "rating": self.rating,
            "completed_tasks": self.completed_tasks,
            "joined_at": self.joined_at.isoformat(),
        }

