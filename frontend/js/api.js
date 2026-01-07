/**
 * Eco Haat - API Helper Module
 * Handles all API requests with authentication
 */

const API = {
    /**
     * Get stored auth token
     */
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },

    /**
     * Get stored user data
     */
    getUser() {
        const user = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        const user = this.getUser();
        return user && user.role === role;
    },

    /**
     * Save auth data to storage
     */
    saveAuth(token, user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    },

    /**
     * Clear auth data from storage
     */
    clearAuth() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    },

    /**
     * Make authenticated API request
     */
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
                this.clearAuth();
                window.location.href = '/pages/login.html';
                throw new Error('Session expired. Please login again.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Request failed');
            }

            return data;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // ============== Auth API ==============

    async register(userData) {
        return this.post(CONFIG.ENDPOINTS.REGISTER, userData);
    },

    async login(email, password) {
        const response = await this.post(CONFIG.ENDPOINTS.LOGIN, { email, password });
        if (response.access_token) {
            this.saveAuth(response.access_token, response.user);
        }
        return response;
    },

    async logout() {
        try {
            await this.post(CONFIG.ENDPOINTS.LOGOUT);
        } finally {
            this.clearAuth();
        }
    },

    async getProfile() {
        return this.get(CONFIG.ENDPOINTS.PROFILE);
    },

    // ============== Products API ==============

    async getProducts(params = {}) {
        return this.get(CONFIG.ENDPOINTS.PRODUCTS, params);
    },

    async getProduct(id) {
        return this.get(CONFIG.ENDPOINTS.PRODUCT_DETAIL(id));
    },

    async createProduct(productData) {
        return this.post(CONFIG.ENDPOINTS.PRODUCTS, productData);
    },

    async updateProduct(id, productData) {
        return this.put(CONFIG.ENDPOINTS.PRODUCT_DETAIL(id), productData);
    },

    async deleteProduct(id) {
        return this.delete(CONFIG.ENDPOINTS.PRODUCT_DETAIL(id));
    },

    async getMyProducts(status = null) {
        const params = status ? { status_filter: status } : {};
        return this.get(CONFIG.ENDPOINTS.MY_PRODUCTS, params);
    },

    // ============== Admin API ==============

    async getPendingProducts() {
        return this.get(CONFIG.ENDPOINTS.PENDING_PRODUCTS);
    },

    async approveProduct(id, ecoRating) {
        return this.post(CONFIG.ENDPOINTS.APPROVE_PRODUCT(id), { eco_rating: ecoRating });
    },

    async rejectProduct(id, reason) {
        return this.post(CONFIG.ENDPOINTS.REJECT_PRODUCT(id), { rejection_reason: reason });
    },

    async getCategories() {
        return this.get(CONFIG.ENDPOINTS.CATEGORIES);
    },

    async createCategory(categoryData) {
        return this.post(CONFIG.ENDPOINTS.CATEGORIES, categoryData);
    },

    async getUsers(role = null) {
        const params = role ? { role } : {};
        return this.get(CONFIG.ENDPOINTS.USERS, params);
    },

    async getStats() {
        return this.get(CONFIG.ENDPOINTS.STATS);
    },

    // ============== Cart API ==============

    async getCart() {
        return this.get(CONFIG.ENDPOINTS.CART);
    },

    async addToCart(productId, quantity = 1) {
        return this.post(CONFIG.ENDPOINTS.CART, { product_id: productId, quantity });
    },

    async updateCartItem(cartItemId, quantity) {
        return this.put(CONFIG.ENDPOINTS.CART_ITEM(cartItemId), { quantity });
    },

    async removeFromCart(cartItemId) {
        return this.delete(CONFIG.ENDPOINTS.CART_ITEM(cartItemId));
    },

    async clearCart() {
        return this.delete(CONFIG.ENDPOINTS.CART);
    },

    async getCartCount() {
        return this.get(CONFIG.ENDPOINTS.CART_COUNT);
    },

    // ============== Orders API ==============

    async createOrder(shippingAddress) {
        return this.post(CONFIG.ENDPOINTS.ORDERS, { shipping_address: shippingAddress });
    },

    async getOrders(status = null) {
        const params = status ? { status_filter: status } : {};
        return this.get(CONFIG.ENDPOINTS.ORDERS, params);
    },

    async getOrder(id) {
        return this.get(CONFIG.ENDPOINTS.ORDER_DETAIL(id));
    },

    async updateOrderStatus(id, status) {
        return this.put(CONFIG.ENDPOINTS.UPDATE_ORDER_STATUS(id), null, { params: { new_status: status } });
    }
};
