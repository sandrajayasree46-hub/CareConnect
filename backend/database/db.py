from flask_sqlalchemy import SQLAlchemy

# Shared SQLAlchemy instance – imported by all models
db = SQLAlchemy()


def init_db(app):
    """Bind the SQLAlchemy instance to the Flask app and create all tables."""
    db.init_app(app)
    with app.app_context():
        # Import models so SQLAlchemy registers them before create_all
        from models.user import User  # noqa: F401
        from models.request import Request  # noqa: F401
        from models.emergency_contact import EmergencyContact  # noqa: F401
        from models.volunteer import Volunteer  # noqa: F401
        db.create_all()
