import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "careconnect-secret-key-2024")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///careconnect.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRATION_HOURS = 24
