from database.db import db


class EmergencyContact(db.Model):
    __tablename__ = "emergency_contacts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    contact_name = db.Column(db.String(120), nullable=False)
    relationship = db.Column(db.String(60), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(150), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.contact_name,           # used by frontend
            "contact_name": self.contact_name,   # legacy alias
            "relationship": self.relationship,
            "phone": self.phone,
            "email": self.email,
        }
