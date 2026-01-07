"""
Eco Haat - Order Routes
Handles order placement, tracking, and history
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query
from config import get_supabase_client
from models import (
    Order, OrderCreate, OrderWithItems, OrderItem, OrderStatus,
    UserProfile, UserRole, MessageResponse
)
from routes.auth import get_current_user, require_role
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=Order)
async def create_order(
    order_data: OrderCreate,
    current_user: UserProfile = Depends(require_role([UserRole.BUYER]))
):
    """Create a new order from cart items"""
    try:
        supabase = get_supabase_client()
        
        # Get cart items with product details
        cart_items = supabase.table("cart_items").select(
            "*, products(*)"
        ).eq("buyer_id", current_user.id).execute()
        
        if not cart_items.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Calculate total and validate stock
        total_amount = 0
        order_items_data = []
        
        for item in cart_items.data:
            product = item["products"]
            
            if product["status"] != "approved":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{product['name']}' is no longer available"
                )
            
            if product["stock_quantity"] < item["quantity"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product['name']}'"
                )
            
            item_total = product["price"] * item["quantity"]
            total_amount += item_total
            
            order_items_data.append({
                "product_id": product["id"],
                "quantity": item["quantity"],
                "price_at_purchase": product["price"]
            })
        
        # Create order
        order_result = supabase.table("orders").insert({
            "buyer_id": current_user.id,
            "total_amount": total_amount,
            "shipping_address": order_data.shipping_address,
            "status": "pending"
        }).execute()
        
        order = order_result.data[0]
        
        # Create order items
        for item_data in order_items_data:
            item_data["order_id"] = order["id"]
        
        supabase.table("order_items").insert(order_items_data).execute()
        
        # Update product stock quantities
        for item in cart_items.data:
            product = item["products"]
            new_stock = product["stock_quantity"] - item["quantity"]
            supabase.table("products").update({
                "stock_quantity": new_stock
            }).eq("id", product["id"]).execute()
        
        # Clear cart
        supabase.table("cart_items").delete().eq("buyer_id", current_user.id).execute()
        
        return Order(**order)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create order: {str(e)}"
        )


@router.get("/", response_model=List[Order])
async def get_my_orders(
    status_filter: Optional[OrderStatus] = None,
    current_user: UserProfile = Depends(require_role([UserRole.BUYER]))
):
    """Get current user's orders"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table("orders").select("*").eq("buyer_id", current_user.id)
        
        if status_filter:
            query = query.eq("status", status_filter.value)
        
        query = query.order("created_at", desc=True)
        result = query.execute()
        
        return [Order(**o) for o in result.data]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )


@router.get("/{order_id}", response_model=OrderWithItems)
async def get_order_details(
    order_id: int,
    current_user: UserProfile = Depends(get_current_user)
):
    """Get order details with items"""
    try:
        supabase = get_supabase_client()
        
        # Get order
        order = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        
        if not order.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check access (buyer can see own orders, admin/seller can see all)
        if current_user.role == UserRole.BUYER and order.data["buyer_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get order items with product details
        items = supabase.table("order_items").select(
            "*, products(*)"
        ).eq("order_id", order_id).execute()
        
        order_items = []
        for item in items.data:
            product_data = item.pop("products", None)
            order_item = OrderItem(**item)
            if product_data:
                order_item.product = product_data
            order_items.append(order_item)
        
        return OrderWithItems(**order.data, items=order_items)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch order: {str(e)}"
        )


# ============== Admin/Seller Order Management ==============

@router.get("/admin/all", response_model=List[Order])
async def get_all_orders(
    status_filter: Optional[OrderStatus] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: UserProfile = Depends(require_role([UserRole.ADMIN]))
):
    """Get all orders (admin only)"""
    try:
        supabase = get_supabase_client()
        
        query = supabase.table("orders").select("*")
        
        if status_filter:
            query = query.eq("status", status_filter.value)
        
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        query = query.order("created_at", desc=True)
        
        result = query.execute()
        
        return [Order(**o) for o in result.data]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch orders: {str(e)}"
        )


@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: int,
    new_status: OrderStatus,
    current_user: UserProfile = Depends(require_role([UserRole.ADMIN]))
):
    """Update order status (admin only)"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table("orders").update({
            "status": new_status.value
        }).eq("id", order_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return Order(**result.data[0])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update order status: {str(e)}"
        )


@router.get("/seller/my-orders", response_model=List[OrderWithItems])
async def get_seller_orders(
    current_user: UserProfile = Depends(require_role([UserRole.SELLER]))
):
    """Get orders containing seller's products"""
    try:
        supabase = get_supabase_client()
        
        # Get order items for seller's products
        order_items = supabase.table("order_items").select(
            "*, products!inner(*), orders(*)"
        ).eq("products.seller_id", current_user.id).execute()
        
        # Group by order
        orders_dict = {}
        for item in order_items.data:
            order_data = item.pop("orders")
            order_id = order_data["id"]
            
            if order_id not in orders_dict:
                orders_dict[order_id] = {
                    **order_data,
                    "items": []
                }
            
            product_data = item.pop("products", None)
            order_item = {**item}
            if product_data:
                order_item["product"] = product_data
            orders_dict[order_id]["items"].append(order_item)
        
        return [OrderWithItems(**o) for o in orders_dict.values()]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch seller orders: {str(e)}"
        )
