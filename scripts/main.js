// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load delete utilities
    const deleteScript = document.createElement('script');
    deleteScript.src = '/scripts/delete-utils.js';
    document.head.appendChild(deleteScript);
    
    // Navigation elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update navigation based on auth status
    function updateNavigation() {
        if (token && user.id) {
            loginBtn.textContent = 'Profile';
            loginBtn.onclick = () => window.location.href = '/profile.html';
            signupBtn.textContent = 'Logout';
            signupBtn.onclick = logout;
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => window.location.href = '/login.html';
            signupBtn.textContent = 'Sign Up';
            signupBtn.onclick = () => window.location.href = '/signup.html';
        }
    }
    
    // Logout function
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    }
    
    // Initialize navigation
    updateNavigation();
    
    // Initialize React Query-like cache management
    window.queryClient = {
        cache: new Map(),
        invalidateQueries: function({ queryKey }) {
            // Simple cache invalidation
            for (const [key, value] of this.cache.entries()) {
                if (typeof queryKey === 'string' && key.includes(queryKey)) {
                    this.cache.delete(key);
                } else if (Array.isArray(queryKey) && queryKey.every(q => key.includes(q))) {
                    this.cache.delete(key);
                }
            }
        },
        getQueryData: function(queryKey) {
            return this.cache.get(JSON.stringify(queryKey));
        },
        setQueryData: function(queryKey, data) {
            this.cache.set(JSON.stringify(queryKey), {
                data,
                timestamp: Date.now(),
                staleTime: 1000 * 60 * 5 // 5 minutes
            });
        }
    };
    
    // API helper functions with caching
    const api = {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
        
        async request(endpoint, options = {}) {
            const url = `${this.baseURL}${endpoint}`;
            const cacheKey = JSON.stringify([endpoint, options.method || 'GET']);
            
            // Check cache for GET requests
            if (!options.method || options.method === 'GET') {
                const cached = window.queryClient.getQueryData([endpoint]);
                if (cached && Date.now() - cached.timestamp < cached.staleTime) {
                    return cached.data;
                }
            }
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            };
            
            // Add auth token if available
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            try {
                const response = await fetch(url, config);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Request failed');
                }
                
                // Cache successful GET requests
                if (!options.method || options.method === 'GET') {
                    window.queryClient.setQueryData([endpoint], data);
                }
                
                return data;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },
        
        get(endpoint) {
            return this.request(endpoint);
        },
        
        post(endpoint, data) {
            return this.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        
        put(endpoint, data) {
            return this.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },
        
        delete(endpoint) {
            return this.request(endpoint, {
                method: 'DELETE',
            });
        },
    };
    
    // Make API available globally
    window.api = api;
    
    // Toast notification system
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
        } text-white`;
        toast.textContent = message;
        toast.style.transform = 'translateX(100%)';
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Make showToast available globally
    window.showToast = showToast;
    
    // Form validation helpers
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePassword(password) {
        return password.length >= 8;
    }
    
    // Make validators available globally
    window.validateEmail = validateEmail;
    window.validatePassword = validatePassword;
    
    // Performance optimization: Lazy load images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Initialize lazy loading
    lazyLoadImages();
    
    console.log('BookWriter application initialized');
});
