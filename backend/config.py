"""
Eco Haat - Configuration Module
Handles Supabase client initialization and environment variables
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Application settings
SECRET_KEY = os.getenv("SECRET_KEY", "eco-haat-secret-key-change-in-production")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Initialize Supabase client
def get_supabase_client() -> Client:
    """Get Supabase client with anon key (for user operations)"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Supabase URL and Key must be set in environment variables")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_admin_client() -> Client:
    """Get Supabase client with service role key (for admin operations)"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("Supabase URL and Service Key must be set in environment variables")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Create default client instance
supabase: Client = None

def init_supabase():
    """Initialize the Supabase client"""
    global supabase
    try:
        supabase = get_supabase_client()
        return supabase
    except ValueError as e:
        print(f"Warning: {e}")
        return None
