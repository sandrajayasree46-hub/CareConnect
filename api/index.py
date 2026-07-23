import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# On Vercel, only /tmp is writable — point SQLite there
os.environ.setdefault('DATABASE_URL', 'sqlite:////tmp/careconnect.db')
os.environ.setdefault('SECRET_KEY', 'careconnect-secret-key-2024')

from app import create_app

# Vercel looks for a variable named 'app'
app = create_app()
