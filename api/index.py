import sys
import os

# Add backend directory to path so we can import from it
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app

# Vercel looks for a variable named 'app'
app = create_app()
