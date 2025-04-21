/**
 * Mobile-specific functionality for Pixel Empires
 */

class MobileUI {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.mobileMenuButton = document.getElementById('main-menu-button');
        this.gameControls = document.getElementById('game-controls');

        this.init();
    }

    init() {
        // Hide mobile menu button on desktop
        if (!this.isMobile) {
            this.mobileMenuButton.style.display = 'none';
        }

        // Add event listeners
        this.addEventListeners();

        // Initialize touch events for map
        this.initMapTouchEvents();

        // Add viewport meta tag dynamically if needed
        this.ensureViewportMeta();

        // Add mobile class to body for CSS targeting
        if (this.isMobile) {
            document.body.classList.add('mobile');
        }

        // Handle orientation changes
        this.handleOrientationChange();
    }

    addEventListeners() {
        // Toggle mobile menu - check if button exists first
        if (this.mobileMenuButton) {
            this.mobileMenuButton.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;

            // Check if elements exist before manipulating them
            if (this.mobileMenuButton) {
                if (!this.isMobile) {
                    this.mobileMenuButton.style.display = 'none';
                } else {
                    this.mobileMenuButton.style.display = 'block';
                }
            }

            // Check if gameControls exists before manipulating classList
            if (this.gameControls && !this.isMobile) {
                this.gameControls.classList.remove('mobile-visible');
            }

            // Update body class
            if (this.isMobile) {
                document.body.classList.add('mobile');
            } else {
                document.body.classList.remove('mobile');
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });

        // Make modals more mobile-friendly
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            });
        });

        // Improve button touch feedback
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('touchstart', () => {
                button.classList.add('touch-active');
            });
            button.addEventListener('touchend', () => {
                button.classList.remove('touch-active');
            });
        });
    }

    toggleMobileMenu() {
        // Check if gameControls exists before toggling class
        if (this.gameControls) {
            this.gameControls.classList.toggle('mobile-visible');
        }
    }

    initMapTouchEvents() {
        const gameMap = document.getElementById('game-map');
        const mapWrapper = document.getElementById('map-wrapper');
        if (!gameMap || !mapWrapper) return;

        // Add zoom controls for mobile
        this.addMapZoomControls(mapWrapper);

        let startX, startY, isDragging = false;

        gameMap.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            isDragging = true;
            gameMap.style.cursor = 'grabbing';
        });

        gameMap.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            // If map renderer has a pan method, use it
            if (typeof mapRenderer !== 'undefined' && mapRenderer.pan) {
                mapRenderer.pan(deltaX, deltaY);
            }

            startX = touch.clientX;
            startY = touch.clientY;
        });

        gameMap.addEventListener('touchend', () => {
            isDragging = false;
            gameMap.style.cursor = 'grab';
        });

        // Handle pinch to zoom
        let initialDistance = 0;

        gameMap.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        });

        gameMap.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );

                const delta = currentDistance - initialDistance;

                // If map renderer has a zoom method, use it
                if (typeof mapRenderer !== 'undefined' && mapRenderer.zoom) {
                    if (delta > 10) {
                        mapRenderer.zoom(0.1); // Zoom in
                        initialDistance = currentDistance;
                    } else if (delta < -10) {
                        mapRenderer.zoom(-0.1); // Zoom out
                        initialDistance = currentDistance;
                    }
                }
            }
        });
    }

    /**
     * Add zoom controls for mobile devices
     * @param {HTMLElement} mapWrapper - The map wrapper element
     */
    addMapZoomControls(mapWrapper) {
        // Create zoom controls container
        const zoomControls = document.createElement('div');
        zoomControls.className = 'map-zoom-controls';

        // Create zoom in button
        const zoomInButton = document.createElement('button');
        zoomInButton.className = 'zoom-button zoom-in';
        zoomInButton.innerHTML = '+';
        zoomInButton.setAttribute('aria-label', 'Zoom in');

        // Create zoom out button
        const zoomOutButton = document.createElement('button');
        zoomOutButton.className = 'zoom-button zoom-out';
        zoomOutButton.innerHTML = '-';
        zoomOutButton.setAttribute('aria-label', 'Zoom out');

        // Add event listeners
        zoomInButton.addEventListener('click', () => {
            if (typeof mapRenderer !== 'undefined' && mapRenderer.zoom) {
                mapRenderer.zoom(0.2); // Zoom in more on mobile
            }
        });

        zoomOutButton.addEventListener('click', () => {
            if (typeof mapRenderer !== 'undefined' && mapRenderer.zoom) {
                mapRenderer.zoom(-0.2); // Zoom out more on mobile
            }
        });

        // Add buttons to container
        zoomControls.appendChild(zoomInButton);
        zoomControls.appendChild(zoomOutButton);

        // Add container to map wrapper
        mapWrapper.appendChild(zoomControls);
    }

    ensureViewportMeta() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(viewportMeta);
        }
    }

    handleOrientationChange() {
        const isLandscape = window.innerWidth > window.innerHeight;

        if (isLandscape) {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        } else {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        }

        // Adjust UI based on orientation
        if (this.isMobile) {
            if (isLandscape) {
                // Optimize for landscape
                document.querySelectorAll('.game-section').forEach(section => {
                    section.style.maxHeight = '80vh';
                });
            } else {
                // Optimize for portrait
                document.querySelectorAll('.game-section').forEach(section => {
                    section.style.maxHeight = '';
                });
            }
        }
    }
}

// Initialize mobile UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mobileUI = new MobileUI();
});

// Add touch detection
document.addEventListener('touchstart', function() {
    document.body.classList.add('touch-device');
}, { once: true });
