// Performance optimization utilities for KA cave

class PerformanceOptimizer {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        this.imageObserver = new IntersectionObserver(
            this.handleImageIntersection.bind(this),
            this.observerOptions
        );
        
        this.init();
    }

    // Initialize performance optimizations
    init() {
        this.optimizeImages();
        this.optimizeScrolling();
        this.optimizeAnimations();
        this.preloadCriticalResources();
    }

    // Optimize images with lazy loading
    optimizeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            // Add loading placeholder
            if (!img.src) {
                img.style.backgroundColor = '#f3f4f6';
                img.style.minHeight = '200px';
            }
            
            this.imageObserver.observe(img);
        });
    }

    // Handle image intersection for lazy loading
    handleImageIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Create temporary image to check load
                const tempImg = new Image();
                tempImg.onload = () => {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    img.style.backgroundColor = 'transparent';
                    img.style.minHeight = 'auto';
                    this.imageObserver.unobserve(img);
                };
                
                tempImg.onerror = () => {
                    img.src = '/images/placeholder.webp';
                    img.classList.add('error');
                    this.imageObserver.unobserve(img);
                };
                
                tempImg.src = img.dataset.src;
            }
        });
    }

    // Optimize scrolling performance
    optimizeScrolling() {
        let ticking = false;
        
        const updateScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Update scroll-based animations
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', updateScroll, { passive: true });
        window.addEventListener('resize', updateScroll);
    }

    // Update scroll-based effects efficiently
    updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('header, nav');
        
        if (header) {
            if (scrolled > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    // Optimize animations
    optimizeAnimations() {
        // Reduce motion for users who prefer it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            document.documentElement.style.setProperty('--transition-duration', '0.01ms');
        }
        
        // Add CSS for performance
        const style = document.createElement('style');
        style.textContent = `
            /* Performance optimizations */
            img[data-src] {
                transition: opacity 0.3s ease;
            }
            
            img.loaded {
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .scrolled {
                backdrop-filter: blur(10px);
                background-color: rgba(255, 255, 255, 0.95);
                transition: all 0.3s ease;
            }
            
            /* GPU acceleration for smooth animations */
            .animate-gpu {
                transform: translateZ(0);
                will-change: transform;
            }
            
            /* Reduce paint on scroll */
            .virtual-scroll {
                contain: layout style paint;
            }
        `;
        document.head.appendChild(style);
    }

    // Preload critical resources
    preloadCriticalResources() {
        // Preload critical fonts
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        fontLink.as = 'style';
        document.head.appendChild(fontLink);
        
        // Preload critical images
        const criticalImages = [
            '/images/image_0.webp',
            '/images/image_4.webp',
            '/images/image_7.webp'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Cache API responses
    setupCache() {
        if ('caches' in window) {
            const cacheName = 'ka-cave-v1';
            
            self.addEventListener('fetch', event => {
                event.respondWith(
                    caches.match(event.request)
                        .then(response => response || fetch(event.request))
                        .then(response => {
                            if (event.request.method === 'GET') {
                                caches.open(cacheName).then(cache => {
                                    cache.put(event.request, response.clone());
                                });
                            }
                            return response;
                        })
                );
            });
        }
    }

    // Measure and report performance
    measurePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const metrics = {
                        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                        domTime: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        renderTime: perfData.loadEventEnd - perfData.responseEnd
                    };
                    
                    console.log('Performance Metrics:', metrics);
                    
                    // Report to analytics if available
                    if (window.gtag) {
                        gtag('event', 'performance_metrics', {
                            custom_map: {
                                load_time: metrics.loadTime,
                                dom_time: metrics.domTime,
                                render_time: metrics.renderTime
                            }
                        });
                    }
                }, 0);
            });
        }
    }

    // Optimize form inputs
    optimizeForms() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Debounce input events
            let timeout;
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    // Handle input after user stops typing
                    input.dispatchEvent(new CustomEvent('inputDebounced', { detail: e.target.value }));
                }, 300);
            });
        });
    }

    // Cleanup function
    cleanup() {
        this.imageObserver.disconnect();
        window.removeEventListener('scroll', this.updateScrollEffects);
        window.removeEventListener('resize', this.updateScrollEffects);
    }
}

// Service Worker for offline support
const createServiceWorker = () => {
    const swCode = `
        const CACHE_NAME = 'ka-cave-v1';
        const urlsToCache = [
            '/',
            '/index.html',
            '/my-works.html',
            '/styles/global.css',
            '/scripts/main.js',
            '/scripts/performance-optimizer.js'
        ];

        self.addEventListener('install', event => {
            event.waitUntil(
                caches.open(CACHE_NAME)
                    .then(cache => cache.addAll(urlsToCache))
            );
        });

        self.addEventListener('fetch', event => {
            event.respondWith(
                caches.match(event.request)
                    .then(response => {
                        return response || fetch(event.request);
                    })
            );
        });
    `;

    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(swUrl)
            .then(registration => console.log('Service Worker registered'))
            .catch(error => console.log('Service Worker registration failed:', error));
    }
};

// Initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Create service worker for caching
    createServiceWorker();
    
    // Measure performance
    window.performanceOptimizer.measurePerformance();
    
    // Optimize forms
    window.performanceOptimizer.optimizeForms();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.performanceOptimizer) {
        window.performanceOptimizer.cleanup();
    }
});

// Export for external use
window.PerformanceOptimizer = PerformanceOptimizer;
