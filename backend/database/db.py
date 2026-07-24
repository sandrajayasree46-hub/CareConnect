from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.engine import Engine

# Shared SQLAlchemy instance – imported by all models
db = SQLAlchemy()


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable foreign key constraints for SQLite connections."""
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    except Exception:
        pass


def init_db(app):
    """Bind the SQLAlchemy instance to the Flask app and create all tables."""
    db.init_app(app)
    with app.app_context():
        # Import models so SQLAlchemy registers them before create_all
        from models.user import User  # noqa: F401
        from models.request import Request  # noqa: F401
        from models.emergency_contact import EmergencyContact  # noqa: F401
        from models.volunteer import Volunteer  # noqa: F401
        from models.notification import Notification  # noqa: F401
        db.create_all()

