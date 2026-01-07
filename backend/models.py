"""
Eco Haat - Pydantic Models
Data validation models for API requests and responses
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============== Enums ==============
class UserRole(str, Enum):
    ADMIN = "admin"
    SELLER = "seller"
    BUYER = "buyer"


class ProductStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


# ============== Auth Models ==============
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: UserRole = UserRole.BUYER
    phone: Optional[str] = None
    address: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


# ============== Category Models ==============
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class Category(CategoryCreate):
    id: int


# ============== Product Models ==============
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(default=0, ge=0)
    material: str  # paper, bamboo, soil, biodegradable, etc.
    category_id: int
    images: Optional[List[str]] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    material: Optional[str] = None
    category_id: Optional[int] = None
    images: Optional[List[str]] = None


class ProductApproval(BaseModel):
    eco_rating: int = Field(..., ge=0, le=100)


class ProductRejection(BaseModel):
    rejection_reason: str


class Product(BaseModel):
    id: int
    seller_id: str
    category_id: int
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    material: str
    images: List[str] = []
    status: ProductStatus
    eco_rating: Optional[int] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ProductWithDetails(Product):
    seller_name: Optional[str] = None
    category_name: Optional[str] = None


# ============== Cart Models ==============
class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItem(BaseModel):
    id: int
    buyer_id: str
    product_id: int
    quantity: int
    product: Optional[Product] = None
    created_at: datetime


# ============== Order Models ==============
class OrderCreate(BaseModel):
    shipping_address: str


class Order(BaseModel):
    id: int
    buyer_id: str
    total_amount: float
    shipping_address: str
    status: OrderStatus
    created_at: datetime


class OrderItem(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    price_at_purchase: float
    product: Optional[Product] = None


class OrderWithItems(Order):
    items: List[OrderItem] = []


# ============== Response Models ==============
class MessageResponse(BaseModel):
    message: str
    success: bool = True


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
