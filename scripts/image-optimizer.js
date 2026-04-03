// Image optimization utilities for BookWriter

// Convert image to WebP and create thumbnails
class ImageOptimizer {
    constructor() {
        this.maxWidth = 1200;
        this.maxHeight = 1200;
        this.thumbnailWidth = 300;
        this.thumbnailHeight = 200;
        this.quality = 0.8;
        this.thumbnailQuality = 0.6;
    }

    // Convert file to WebP
    async convertToWebP(file, isThumbnail = false) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate dimensions
                const maxWidth = isThumbnail ? this.thumbnailWidth : this.maxWidth;
                const maxHeight = isThumbnail ? this.thumbnailHeight : this.maxHeight;
                
                let { width, height } = this.calculateDimensions(
                    img.width, 
                    img.height, 
                    maxWidth, 
                    maxHeight
                );

                canvas.width = width;
                canvas.height = height;

                // Draw and convert image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                                type: 'image/webp'
                            }));
                        } else {
                            reject(new Error('Failed to convert image to WebP'));
                        }
                    },
                    'image/webp',
                    isThumbnail ? this.thumbnailQuality : this.quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    // Calculate aspect-ratio-preserving dimensions
    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let { width, height } = { width: originalWidth, height: originalHeight };

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }

        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    // Validate image before upload
    validateImage(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Only JPEG, PNG, and WebP images are allowed');
        }

        if (file.size > maxSize) {
            throw new Error('Image size must be less than 5MB');
        }

        return true;
    }

    // Process image for upload
    async processImage(file) {
        this.validateImage(file);

        // Convert to WebP
        const webpFile = await this.convertToWebP(file);
        
        // Create thumbnail
        const thumbnailFile = await this.convertToWebP(file, true);

        return {
            original: webpFile,
            thumbnail: thumbnailFile,
            metadata: {
                originalName: file.name,
                originalSize: file.size,
                optimizedSize: webpFile.size,
                compressionRatio: ((file.size - webpFile.size) / file.size * 100).toFixed(1)
            }
        };
    }

    // Generate responsive image srcset
    generateSrcset(baseUrl, fileName) {
        const sizes = [
            { width: 400, suffix: 'small' },
            { width: 800, suffix: 'medium' },
            { width: 1200, suffix: 'large' }
        ];

        return sizes
            .map(size => `${baseUrl}/${fileName}-${size.suffix}.webp ${size.width}w`)
            .join(', ');
    }
}

// Lazy loading with intersection observer
class LazyImageLoader {
    constructor() {
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                rootMargin: '50px 0px',
                threshold: 0.01
            }
        );
    }

    observe(img) {
        if (img.dataset.src) {
            this.observer.observe(img);
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        // Create new image to preload
        const newImg = new Image();
        
        newImg.onload = () => {
            img.src = src;
            if (srcset) img.srcset = srcset;
            img.classList.add('loaded');
            img.classList.remove('loading');
        };

        newImg.onerror = () => {
            img.classList.add('error');
            img.classList.remove('loading');
        };

        // Add loading state
        img.classList.add('loading');
        newImg.src = src;
    }

    // Initialize all lazy images
    init() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.observe(img));
    }
}

// Image upload handler
class ImageUploadHandler {
    constructor(options = {}) {
        this.maxFiles = options.maxFiles || 5;
        this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
        this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
        this.optimizer = new ImageOptimizer();
    }

    // Handle file selection
    async handleFiles(files) {
        const validFiles = Array.from(files).slice(0, this.maxFiles);
        const processedFiles = [];

        for (const file of validFiles) {
            try {
                const processed = await this.optimizer.processImage(file);
                processedFiles.push(processed);
            } catch (error) {
                showToast(error.message, 'error');
            }
        }

        return processedFiles;
    }

    // Create upload preview
    createPreview(file) {
        const preview = document.createElement('div');
        preview.className = 'relative group border rounded-lg overflow-hidden';
        
        const img = document.createElement('img');
        img.className = 'w-full h-32 object-cover';
        img.src = URL.createObjectURL(file.original);
        
        const overlay = document.createElement('div');
        overlay.className = 'absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity';
        
        const info = document.createElement('div');
        info.className = 'absolute bottom-2 left-2 text-white text-xs';
        info.innerHTML = `
            <div>Size: ${(file.original.size / 1024).toFixed(1)}KB</div>
            <div>Optimized: ${(file.optimizedSize / 1024).toFixed(1)}KB</div>
            <div>Saved: ${file.metadata.compressionRatio}%</div>
        `;
        
        overlay.appendChild(info);
        preview.appendChild(img);
        preview.appendChild(overlay);
        
        return { preview, file };
    }
}

// Make utilities globally available
window.ImageOptimizer = ImageOptimizer;
window.LazyImageLoader = LazyImageLoader;
window.ImageUploadHandler = ImageUploadHandler;

// Auto-initialize lazy loading
document.addEventListener('DOMContentLoaded', () => {
    const lazyLoader = new LazyImageLoader();
    lazyLoader.init();
});
