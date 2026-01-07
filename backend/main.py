"""
Eco Haat - FastAPI Main Application
Eco-friendly E-commerce Platform Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import init_supabase, DEBUG
from routes import (
    auth_router, 
    products_router, 
    admin_router, 
    cart_router, 
    orders_router
)

# Initialize FastAPI app
app = FastAPI(
    title="Eco Haat API",
    description="Backend API for Eco Haat - An eco-friendly e-commerce marketplace for biodegradable products",
    version="1.0.0",
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8080",
        "*"  # Remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(admin_router)
app.include_router(cart_router)
app.include_router(orders_router)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("[Eco Haat] API Starting...")
    init_supabase()
    print("[OK] Supabase client initialized")
    print("[Eco Haat] API is ready!")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "🌿 Welcome to Eco Haat API",
        "status": "healthy",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "api": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG
    )
