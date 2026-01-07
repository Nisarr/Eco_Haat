/**
 * Eco Haat - Utility Functions
 * Common helper functions used across the app
 */

const Utils = {
    /**
     * Format price in BDT currency
     */
    formatPrice(amount) {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Format date to readable string
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    },

    /**
     * Format date with time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = document.querySelector('.toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="toast__icon">${icons[type]}</span>
            <span class="toast__message">${message}</span>
            <button class="toast__close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    /**
     * Create toast container if not exists
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    /**
     * Show loading spinner
     */
    showLoading(element) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.id = 'loading-spinner';

        if (element) {
            element.style.position = 'relative';
            element.appendChild(spinner);
        } else {
            // Full page loading
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.id = 'loading-overlay';
            overlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(overlay);
        }
    },

    /**
     * Hide loading spinner
     */
    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        const overlay = document.getElementById('loading-overlay');
        if (spinner) spinner.remove();
        if (overlay) overlay.remove();
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Create particle explosion effect (for add to cart)
     */
    createParticles(x, y) {
        const container = document.createElement('div');
        container.className = 'particles';
        container.style.left = x + 'px';
        container.style.top = y + 'px';

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const angle = (i / 6) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;

            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

            container.appendChild(particle);
        }

        document.body.appendChild(container);

        setTimeout(() => container.remove(), 1000);
    },

    /**
     * Animate counter
     */
    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    },

    /**
     * Initialize scroll animations
     */
    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    },

    /**
     * Generate eco rating circle SVG
     */
    generateEcoRatingCircle(rating, size = 80) {
        const radius = (size - 8) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (rating / 100) * circumference;

        return `
            <svg width="${size}" height="${size}" class="eco-rating__circle">
                <defs>
                    <linearGradient id="ecoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#1B5E20"/>
                        <stop offset="100%" style="stop-color:#4CAF50"/>
                    </linearGradient>
                </defs>
                <circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${radius}"/>
                <circle class="progress eco-circle-animate" 
                        cx="${size / 2}" cy="${size / 2}" r="${radius}"
                        stroke="url(#ecoGradient)"
                        style="--eco-offset: ${offset}"/>
            </svg>
            <span class="eco-rating__value">${rating}%</span>
        `;
    },

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            pending: '<span class="badge badge--warning">Pending</span>',
            approved: '<span class="badge badge--success">Approved</span>',
            rejected: '<span class="badge badge--error">Rejected</span>',
            processing: '<span class="badge badge--info">Processing</span>',
            shipped: '<span class="badge badge--primary">Shipped</span>',
            delivered: '<span class="badge badge--success">Delivered</span>',
            cancelled: '<span class="badge badge--error">Cancelled</span>'
        };
        return badges[status] || `<span class="badge">${status}</span>`;
    },

    /**
     * Truncate text
     */
    truncate(text, length = 100) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    /**
     * Generate product card HTML
     */
    generateProductCard(product) {
        const imageUrl = product.images && product.images.length > 0
            ? product.images[0]
            : 'https://via.placeholder.com/300x220/E8F5E9/2E7D32?text=Eco+Product';

        return `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-card__image">
                    <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                    ${product.eco_rating ? `
                        <span class="product-card__eco-badge">
                            🌿 ${product.eco_rating}% Eco
                        </span>
                    ` : ''}
                </div>
                <div class="product-card__content">
                    <span class="product-card__category">${product.category_name || 'Eco Product'}</span>
                    <h3 class="product-card__title">${this.truncate(product.name, 50)}</h3>
                    <p class="product-card__price">${this.formatPrice(product.price)}</p>
                    <span class="product-card__material">
                        🌱 ${product.material}
                    </span>
                </div>
            </article>
        `;
    },

    /**
     * Update cart badge count
     */
    async updateCartBadge() {
        try {
            if (!API.isAuthenticated() || !API.hasRole('buyer')) return;

            const { count } = await API.getCartCount();
            const badge = document.querySelector('.navbar__cart-count');

            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Failed to update cart badge:', error);
        }
    },

    /**
     * Initialize navbar scroll effect
     */
    initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        window.addEventListener('scroll', this.throttle(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100));
    },

    /**
     * Initialize mobile menu toggle
     */
    initMobileMenu() {
        const toggle = document.querySelector('.navbar__toggle');
        const nav = document.querySelector('.navbar__nav');

        if (toggle && nav) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('open');
                toggle.classList.toggle('active');
            });
        }
    },

    /**
     * Render floating leaves animation
     */
    renderFloatingLeaves(container) {
        const leaves = ['🍃', '🌿', '🍀', '🌱', '🌾'];

        for (let i = 0; i < 10; i++) {
            const leaf = document.createElement('span');
            leaf.className = `hero__leaves leaf-float-${(i % 3) + 1}`;
            leaf.textContent = leaves[i % leaves.length];
            leaf.style.left = `${Math.random() * 100}%`;
            leaf.style.animationDelay = `${Math.random() * 10}s`;
            container.appendChild(leaf);
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Utils.initNavbarScroll();
    Utils.initMobileMenu();
    Utils.initScrollAnimations();
});
