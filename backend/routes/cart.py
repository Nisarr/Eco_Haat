"""
Eco Haat - Cart Routes
Handles shopping cart operations for buyers
"""
from fastapi import APIRouter, HTTPException, Depends, status
from config import get_supabase_client
from models import (
    CartItem, CartItemAdd, CartItemUpdate, UserProfile, UserRole, MessageResponse
)
from routes.auth import get_current_user, require_role
from typing import List

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])

# Buyers only
buyer_only = require_role([UserRole.BUYER])


@router.get("/", response_model=List[CartItem])
async def get_cart(
    current_user: UserProfile = Depends(buyer_only)
):
    """Get current user's cart items with product details"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("cart_items").select(
            "*, products(*)"
        ).eq("buyer_id", current_user.id).execute()
        
        cart_items = []
        for item in result.data:
            product_data = item.pop("products", None)
            cart_item = CartItem(**item)
            if product_data:
                cart_item.product = product_data
            cart_items.append(cart_item)
        
        return cart_items
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch cart: {str(e)}"
        )


@router.post("/", response_model=CartItem)
async def add_to_cart(
    item: CartItemAdd,
    current_user: UserProfile = Depends(buyer_only)
):
    """Add item to cart or update quantity if exists"""
    try:
        supabase = get_supabase_client()
        
        # Check if product exists and is approved
        product = supabase.table("products").select(
            "id, status, stock_quantity"
        ).eq("id", item.product_id).single().execute()
        
        if not product.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        if product.data["status"] != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is not available for purchase"
            )
        
        if product.data["stock_quantity"] < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        
        # Check if item already in cart
        existing = supabase.table("cart_items").select("id, quantity").eq(
            "buyer_id", current_user.id
        ).eq("product_id", item.product_id).execute()
        
        if existing.data:
            # Update quantity
            new_quantity = existing.data[0]["quantity"] + item.quantity
            result = supabase.table("cart_items").update({
                "quantity": new_quantity
            }).eq("id", existing.data[0]["id"]).execute()
        else:
            # Add new item
            result = supabase.table("cart_items").insert({
                "buyer_id": current_user.id,
                "product_id": item.product_id,
                "quantity": item.quantity
            }).execute()
        
        return CartItem(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to add to cart: {str(e)}"
        )


@router.put("/{cart_item_id}", response_model=CartItem)
async def update_cart_item(
    cart_item_id: int,
    update: CartItemUpdate,
    current_user: UserProfile = Depends(buyer_only)
):
    """Update cart item quantity"""
    try:
        supabase = get_supabase_client()
        
        # Check ownership
        existing = supabase.table("cart_items").select(
            "buyer_id, product_id"
        ).eq("id", cart_item_id).single().execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        if existing.data["buyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Check stock
        product = supabase.table("products").select(
            "stock_quantity"
        ).eq("id", existing.data["product_id"]).single().execute()
        
        if product.data["stock_quantity"] < update.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        
        result = supabase.table("cart_items").update({
            "quantity": update.quantity
        }).eq("id", cart_item_id).execute()
        
        return CartItem(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update cart: {str(e)}"
        )


@router.delete("/{cart_item_id}", response_model=MessageResponse)
async def remove_from_cart(
    cart_item_id: int,
    current_user: UserProfile = Depends(buyer_only)
):
    """Remove item from cart"""
    try:
        supabase = get_supabase_client()
        
        # Check ownership
        existing = supabase.table("cart_items").select(
            "buyer_id"
        ).eq("id", cart_item_id).single().execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        if existing.data["buyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        supabase.table("cart_items").delete().eq("id", cart_item_id).execute()
        
        return MessageResponse(message="Item removed from cart")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to remove from cart: {str(e)}"
        )


@router.delete("/", response_model=MessageResponse)
async def clear_cart(
    current_user: UserProfile = Depends(buyer_only)
):
    """Clear entire cart"""
    try:
        supabase = get_supabase_client()
        
        supabase.table("cart_items").delete().eq("buyer_id", current_user.id).execute()
        
        return MessageResponse(message="Cart cleared successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to clear cart: {str(e)}"
        )


@router.get("/count")
async def get_cart_count(
    current_user: UserProfile = Depends(buyer_only)
):
    """Get total items in cart"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("cart_items").select(
            "quantity"
        ).eq("buyer_id", current_user.id).execute()
        
        total = sum(item["quantity"] for item in result.data)
        
        return {"count": total}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cart count: {str(e)}"
        )
