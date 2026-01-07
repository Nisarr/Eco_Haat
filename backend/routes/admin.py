"""
Eco Haat - Admin Routes
Handles admin operations: product approval, user management, categories
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from config import get_supabase_client
from models import (
    Product, ProductApproval, ProductRejection, UserProfile, UserRole,
    MessageResponse, Category, CategoryCreate, ProductStatus
)
from routes.auth import get_current_user, require_role
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Admin"])

# All routes require admin role
admin_only = require_role([UserRole.ADMIN])


# ============== Product Approval ==============

@router.get("/products/pending", response_model=List[Product])
async def get_pending_products(
    current_user: UserProfile = Depends(admin_only)
):
    """Get all products pending approval"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("products").select(
            "*, profiles!seller_id(full_name, email)"
        ).eq("status", "pending").order("created_at").execute()
        
        return [Product(**p) for p in result.data]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pending products: {str(e)}"
        )


@router.get("/products/all", response_model=List[Product])
async def get_all_products_admin(
    status_filter: Optional[ProductStatus] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UserProfile = Depends(admin_only)
):
    """Get all products (admin view)"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table("products").select("*")
        
        if status_filter:
            query = query.eq("status", status_filter.value)
        
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        query = query.order("created_at", desc=True)
        
        result = query.execute()
        
        return [Product(**p) for p in result.data]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products: {str(e)}"
        )


@router.post("/products/{product_id}/approve", response_model=Product)
async def approve_product(
    product_id: int,
    approval: ProductApproval,
    current_user: UserProfile = Depends(admin_only)
):
    """Approve a product and set eco-friendliness rating"""
    try:
        supabase = get_supabase_client()
        
        # Check if product exists and is pending
        existing = supabase.table("products").select("status").eq("id", product_id).single().execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        update_data = {
            "status": "approved",
            "eco_rating": approval.eco_rating,
            "rejection_reason": None,
            "updated_at": datetime.now().isoformat()
        }
        
        result = supabase.table("products").update(update_data).eq("id", product_id).execute()
        
        return Product(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to approve product: {str(e)}"
        )


@router.post("/products/{product_id}/reject", response_model=Product)
async def reject_product(
    product_id: int,
    rejection: ProductRejection,
    current_user: UserProfile = Depends(admin_only)
):
    """Reject a product with reason"""
    try:
        supabase = get_supabase_client()
        
        # Check if product exists
        existing = supabase.table("products").select("status").eq("id", product_id).single().execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        update_data = {
            "status": "rejected",
            "rejection_reason": rejection.rejection_reason,
            "eco_rating": None,
            "updated_at": datetime.now().isoformat()
        }
        
        result = supabase.table("products").update(update_data).eq("id", product_id).execute()
        
        return Product(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to reject product: {str(e)}"
        )


@router.put("/products/{product_id}/eco-rating", response_model=Product)
async def update_eco_rating(
    product_id: int,
    approval: ProductApproval,
    current_user: UserProfile = Depends(admin_only)
):
    """Update eco-friendliness rating for an approved product"""
    try:
        supabase = get_supabase_client()
        
        update_data = {
            "eco_rating": approval.eco_rating,
            "updated_at": datetime.now().isoformat()
        }
        
        result = supabase.table("products").update(update_data).eq("id", product_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return Product(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update eco rating: {str(e)}"
        )


# ============== Category Management ==============

@router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all categories (public)"""
    try:
        supabase = get_supabase_client()
        result = supabase.table("categories").select("*").order("name").execute()
        return [Category(**c) for c in result.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {str(e)}"
        )


@router.post("/categories", response_model=Category)
async def create_category(
    category: CategoryCreate,
    current_user: UserProfile = Depends(admin_only)
):
    """Create a new category (admin only)"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("categories").insert({
            "name": category.name,
            "description": category.description,
            "icon": category.icon
        }).execute()
        
        return Category(**result.data[0])
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create category: {str(e)}"
        )


@router.delete("/categories/{category_id}", response_model=MessageResponse)
async def delete_category(
    category_id: int,
    current_user: UserProfile = Depends(admin_only)
):
    """Delete a category (admin only)"""
    try:
        supabase = get_supabase_client()
        
        # Check if any products use this category
        products = supabase.table("products").select("id").eq("category_id", category_id).limit(1).execute()
        
        if products.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete category with existing products"
            )
        
        supabase.table("categories").delete().eq("id", category_id).execute()
        
        return MessageResponse(message="Category deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete category: {str(e)}"
        )


# ============== User Management ==============

@router.get("/users", response_model=List[UserProfile])
async def get_users(
    role: Optional[UserRole] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UserProfile = Depends(admin_only)
):
    """Get all users (admin only)"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table("profiles").select("*")
        
        if role:
            query = query.eq("role", role.value)
        
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        query = query.order("created_at", desc=True)
        
        result = query.execute()
        
        return [UserProfile(**u) for u in result.data]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


@router.get("/stats")
async def get_dashboard_stats(
    current_user: UserProfile = Depends(admin_only)
):
    """Get dashboard statistics"""
    try:
        supabase = get_supabase_client()
        
        # Get counts
        products_pending = supabase.table("products").select("id", count="exact").eq("status", "pending").execute()
        products_approved = supabase.table("products").select("id", count="exact").eq("status", "approved").execute()
        total_sellers = supabase.table("profiles").select("id", count="exact").eq("role", "seller").execute()
        total_buyers = supabase.table("profiles").select("id", count="exact").eq("role", "buyer").execute()
        total_orders = supabase.table("orders").select("id", count="exact").execute()
        
        return {
            "pending_products": products_pending.count or 0,
            "approved_products": products_approved.count or 0,
            "total_sellers": total_sellers.count or 0,
            "total_buyers": total_buyers.count or 0,
            "total_orders": total_orders.count or 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )
