/**
 * Eco Haat - API Configuration
 * Backend endpoint configuration
 */

const CONFIG = {
    // API Base URL - Auto-detects local vs production
    API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000'
        : '/api',

    // Supabase Configuration (for direct client-side auth if needed)
    SUPABASE_URL: 'https://lsmvnvdmqdyuijucvaar.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzbXZudmRtcWR5dWlqdWN2YWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3Mzk0ODksImV4cCI6MjA4MzMxNTQ4OX0.wvKaixuNxuSMP1Q1ZwbZE0CiZhG6SqJzVaFiOKQrHfs',

    // App Settings
    APP_NAME: 'Eco Haat',
    APP_VERSION: '1.0.0',

    // Pagination
    DEFAULT_PAGE_SIZE: 12,

    // Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'eco_haat_token',
        USER: 'eco_haat_user',
        CART: 'eco_haat_cart'
    },

    // API Endpoints
    ENDPOINTS: {
        // Auth
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/me',

        // Products
        PRODUCTS: '/products',
        PRODUCT_DETAIL: (id) => `/products/${id}`,
        MY_PRODUCTS: '/products/seller/my-products',

        // Admin
        PENDING_PRODUCTS: '/admin/products/pending',
        ALL_PRODUCTS_ADMIN: '/admin/products/all',
        APPROVE_PRODUCT: (id) => `/admin/products/${id}/approve`,
        REJECT_PRODUCT: (id) => `/admin/products/${id}/reject`,
        UPDATE_ECO_RATING: (id) => `/admin/products/${id}/eco-rating`,
        CATEGORIES: '/admin/categories',
        USERS: '/admin/users',
        STATS: '/admin/stats',

        // Cart
        CART: '/cart',
        CART_COUNT: '/cart/count',
        CART_ITEM: (id) => `/cart/${id}`,

        // Orders
        ORDERS: '/orders',
        ORDER_DETAIL: (id) => `/orders/${id}`,
        ALL_ORDERS: '/orders/admin/all',
        SELLER_ORDERS: '/orders/seller/my-orders',
        UPDATE_ORDER_STATUS: (id) => `/orders/${id}/status`
    }
};

// Prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.ENDPOINTS);
