"""
Eco Haat - Product Routes
Handles product CRUD operations for sellers and buyers
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from config import get_supabase_client
from models import (
    Product, ProductCreate, ProductUpdate, ProductWithDetails,
    UserProfile, UserRole, MessageResponse, ProductStatus
)
from routes.auth import get_current_user, require_role
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[ProductWithDetails])
async def get_products(
    category_id: Optional[int] = None,
    min_eco_rating: Optional[int] = Query(None, ge=0, le=100),
    material: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50)
):
    """Get all approved products (public endpoint for buyers)"""
    try:
        supabase = get_supabase_client()
        
        # Start query for approved products only
        query = supabase.table("products").select(
            "*, profiles!seller_id(full_name), categories!category_id(name)"
        ).eq("status", "approved")
        
        # Apply filters
        if category_id:
            query = query.eq("category_id", category_id)
        if min_eco_rating:
            query = query.gte("eco_rating", min_eco_rating)
        if material:
            query = query.ilike("material", f"%{material}%")
        if search:
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        query = query.order("created_at", desc=True)
        
        result = query.execute()
        
        # Transform data
        products = []
        for item in result.data:
            product_data = {k: v for k, v in item.items() if k not in ['profiles', 'categories']}
            product_data['seller_name'] = item.get('profiles', {}).get('full_name') if item.get('profiles') else None
            product_data['category_name'] = item.get('categories', {}).get('name') if item.get('categories') else None
            products.append(ProductWithDetails(**product_data))
        
        return products
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products: {str(e)}"
        )


@router.get("/{product_id}", response_model=ProductWithDetails)
async def get_product(product_id: int):
    """Get a single product by ID"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("products").select(
            "*, profiles!seller_id(full_name), categories!category_id(name)"
        ).eq("id", product_id).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        item = result.data
        product_data = {k: v for k, v in item.items() if k not in ['profiles', 'categories']}
        product_data['seller_name'] = item.get('profiles', {}).get('full_name') if item.get('profiles') else None
        product_data['category_name'] = item.get('categories', {}).get('name') if item.get('categories') else None
        
        return ProductWithDetails(**product_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch product: {str(e)}"
        )


# ============== Seller Routes ==============

@router.post("/", response_model=Product)
async def create_product(
    product: ProductCreate,
    current_user: UserProfile = Depends(require_role([UserRole.SELLER]))
):
    """Create a new product (Seller only)"""
    try:
        supabase = get_supabase_client()
        
        product_data = {
            "seller_id": current_user.id,
            "category_id": product.category_id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "stock_quantity": product.stock_quantity,
            "material": product.material,
            "images": product.images,
            "status": "pending"
        }
        
        result = supabase.table("products").insert(product_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create product"
            )
        
        return Product(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create product: {str(e)}"
        )


@router.get("/seller/my-products", response_model=List[Product])
async def get_my_products(
    status_filter: Optional[ProductStatus] = None,
    current_user: UserProfile = Depends(require_role([UserRole.SELLER]))
):
    """Get current seller's products"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table("products").select("*").eq("seller_id", current_user.id)
        
        if status_filter:
            query = query.eq("status", status_filter.value)
        
        query = query.order("created_at", desc=True)
        result = query.execute()
        
        return [Product(**p) for p in result.data]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products: {str(e)}"
        )


@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: UserProfile = Depends(require_role([UserRole.SELLER]))
):
    """Update a product (Seller only, own products)"""
    try:
        supabase = get_supabase_client()
        
        # Check ownership
        existing = supabase.table("products").select("seller_id, status").eq("id", product_id).single().execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        if existing.data["seller_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own products"
            )
        
        # Prepare update data
        update_data = product_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.now().isoformat()
        
        # If product was rejected and updated, set back to pending
        if existing.data["status"] == "rejected" and update_data:
            update_data["status"] = "pending"
            update_data["rejection_reason"] = None
        
        result = supabase.table("products").update(update_data).eq("id", product_id).execute()
        
        return Product(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update product: {str(e)}"
        )


@router.delete("/{product_id}", response_model=MessageResponse)
async def delete_product(
    product_id: int,
    current_user: UserProfile = Depends(require_role([UserRole.SELLER, UserRole.ADMIN]))
):
    """Delete a product (Seller: own products, Admin: any product)"""
    try:
        supabase = get_supabase_client()
        
        # Check ownership (unless admin)
        if current_user.role != UserRole.ADMIN:
            existing = supabase.table("products").select("seller_id").eq("id", product_id).single().execute()
            
            if not existing.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product not found"
                )
            
            if existing.data["seller_id"] != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only delete your own products"
                )
        
        supabase.table("products").delete().eq("id", product_id).execute()
        
        return MessageResponse(message="Product deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete product: {str(e)}"
        )
