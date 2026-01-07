"""
Eco Haat - Authentication Routes
Handles user registration, login, and profile management
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import get_supabase_client, get_supabase_admin_client
from models import (
    UserRegister, UserLogin, UserProfile, TokenResponse, 
    MessageResponse, UserRole
)
from typing import Optional
import json

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserProfile:
    """Verify JWT token and return current user"""
    try:
        supabase = get_supabase_client()
        token = credentials.credentials
        
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        
        user = user_response.user
        
        # Get user profile from profiles table
        profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
        
        if not profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        return UserProfile(**profile.data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


def require_role(allowed_roles: list[UserRole]):
    """Dependency to check if user has required role"""
    def role_checker(current_user: UserProfile = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker


@router.post("/register", response_model=MessageResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    try:
        supabase = get_supabase_client()
        
        # Register with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name,
                    "role": user_data.role.value
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed"
            )
        
        # Create profile in profiles table using Admin client to bypass RLS
        # The regular client is anonymous here, so it can't insert into profiles with RLS enabled
        admin_supabase = get_supabase_admin_client()
        
        profile_data = {
            "id": auth_response.user.id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": user_data.role.value,
            "phone": user_data.phone,
            "address": user_data.address
        }
        
        admin_supabase.table("profiles").insert(profile_data).execute()
        
        return MessageResponse(
            message=f"Registration successful! Please check your email to verify your account.",
            success=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user and return access token"""
    try:
        supabase = get_supabase_client()
        
        # Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Get user profile
        profile = supabase.table("profiles").select("*").eq("id", auth_response.user.id).single().execute()
        
        if not profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        return TokenResponse(
            access_token=auth_response.session.access_token,
            user=UserProfile(**profile.data)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout current user"""
    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
        
        return MessageResponse(message="Logged out successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Logout failed: {str(e)}"
        )


@router.get("/me", response_model=UserProfile)
async def get_profile(current_user: UserProfile = Depends(get_current_user)):
    """Get current user's profile"""
    return current_user


@router.put("/me", response_model=UserProfile)
async def update_profile(
    full_name: Optional[str] = None,
    phone: Optional[str] = None,
    address: Optional[str] = None,
    current_user: UserProfile = Depends(get_current_user)
):
    """Update current user's profile"""
    try:
        supabase = get_supabase_client()
        
        update_data = {}
        if full_name is not None:
            update_data["full_name"] = full_name
        if phone is not None:
            update_data["phone"] = phone
        if address is not None:
            update_data["address"] = address
        
        if not update_data:
            return current_user
        
        result = supabase.table("profiles").update(update_data).eq("id", current_user.id).execute()
        
        if result.data:
            return UserProfile(**result.data[0])
        
        return current_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Profile update failed: {str(e)}"
        )
