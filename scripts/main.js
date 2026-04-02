// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
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
    
    // API helper functions
    const api = {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
        
        async request(endpoint, options = {}) {
            const url = `${this.baseURL}${endpoint}`;
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
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
        } text-white`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
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
    
    console.log('BookWriter application initialized');
});
