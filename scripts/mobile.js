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

    /**
     * Initialize touch events for the map with improved handling
     */
    initMapTouchEvents() {
        try {
            // Find all map containers (both main and enhanced)
            const mapContainers = [
                { map: document.getElementById('game-map'), wrapper: document.getElementById('map-wrapper') },
                { map: document.getElementById('enhanced-map'), wrapper: document.getElementById('enhanced-map-wrapper') }
            ];

            // Initialize touch events for each map container that exists
            for (const { map, wrapper } of mapContainers) {
                if (!map || !wrapper) continue;

                // Add zoom controls for mobile
                this.addMapZoomControls(wrapper, map);

                // Initialize touch variables
                let startX, startY, lastX, lastY;
                let isDragging = false;
                let lastTouchTime = 0;
                let touchMoveHistory = [];

                // Find the map renderer instance for this map
                const getMapRenderer = () => {
                    // Try to find the renderer in the global scope or window object
                    if (window.mapRenderer && map.id === 'game-map') {
                        return window.mapRenderer;
                    }
                    if (window.enhancedMapRenderer && map.id === 'enhanced-map') {
                        return window.enhancedMapRenderer;
                    }
                    // Try to find the renderer in the map UI instances
                    if (window.mapUI && window.mapUI.mapRenderer && map.id === 'game-map') {
                        return window.mapUI.mapRenderer;
                    }
                    if (window.mapUI && window.mapUI.enhancedMapRenderer && map.id === 'enhanced-map') {
                        return window.mapUI.enhancedMapRenderer;
                    }
                    return null;
                };

                // Touch start - begin dragging
                map.addEventListener('touchstart', (e) => {
                    // Prevent default to avoid scrolling the page
                    e.preventDefault();

                    if (e.touches.length === 1) {
                        // Single touch - start dragging
                        const touch = e.touches[0];
                        startX = lastX = touch.clientX;
                        startY = lastY = touch.clientY;
                        isDragging = true;
                        lastTouchTime = Date.now();
                        touchMoveHistory = [];
                        map.style.cursor = 'grabbing';
                    } else if (e.touches.length === 2) {
                        // Two touches - prepare for pinch zoom
                        this.initialPinchDistance = Math.hypot(
                            e.touches[0].clientX - e.touches[1].clientX,
                            e.touches[0].clientY - e.touches[1].clientY
                        );

                        // Calculate center point of the pinch
                        this.pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                        this.pinchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                        // Convert to map coordinates
                        const renderer = getMapRenderer();
                        if (renderer) {
                            const rect = map.getBoundingClientRect();
                            const mapX = renderer.getMapXFromCanvas(this.pinchCenterX - rect.left);
                            const mapY = renderer.getMapYFromCanvas(this.pinchCenterY - rect.top);
                            this.pinchMapX = mapX;
                            this.pinchMapY = mapY;
                        }
                    }
                }, { passive: false });

                // Touch move - pan or zoom
                map.addEventListener('touchmove', (e) => {
                    // Prevent default to avoid scrolling the page
                    e.preventDefault();

                    const renderer = getMapRenderer();
                    if (!renderer) return;

                    if (e.touches.length === 1 && isDragging) {
                        // Single touch - pan the map
                        const touch = e.touches[0];
                        const currentTime = Date.now();
                        const deltaX = touch.clientX - lastX;
                        const deltaY = touch.clientY - lastY;
                        const timeDelta = currentTime - lastTouchTime;

                        if (timeDelta > 0) {
                            // Store move history for momentum calculation
                            touchMoveHistory.push({
                                deltaX,
                                deltaY,
                                timeDelta
                            });

                            // Keep only the last 5 moves for momentum calculation
                            if (touchMoveHistory.length > 5) {
                                touchMoveHistory.shift();
                            }

                            // Convert pixel movement to tile movement based on zoom
                            const tileMovementX = deltaX / (renderer.options.tileSize * renderer.zoom);
                            const tileMovementY = deltaY / (renderer.options.tileSize * renderer.zoom);

                            // Update viewport position
                            renderer.viewportX -= tileMovementX;
                            renderer.viewportY -= tileMovementY;

                            // Clamp viewport to map boundaries
                            renderer.clampViewport();

                            // Update last position and time
                            lastX = touch.clientX;
                            lastY = touch.clientY;
                            lastTouchTime = currentTime;

                            // Re-render
                            renderer.render();
                        }
                    } else if (e.touches.length === 2) {
                        // Two touches - pinch zoom
                        const currentDistance = Math.hypot(
                            e.touches[0].clientX - e.touches[1].clientX,
                            e.touches[0].clientY - e.touches[1].clientY
                        );

                        // Calculate zoom factor based on pinch distance change
                        const zoomFactor = currentDistance / this.initialPinchDistance;

                        // Only apply zoom if the change is significant
                        if (Math.abs(zoomFactor - 1) > 0.05) {
                            // Calculate new zoom level
                            const newZoom = renderer.zoom * zoomFactor;

                            // Apply zoom centered on the pinch point
                            renderer.smoothZoom(newZoom, this.pinchMapX, this.pinchMapY);

                            // Update initial distance for next calculation
                            this.initialPinchDistance = currentDistance;
                        }
                    }
                }, { passive: false });

                // Touch end - apply momentum
                map.addEventListener('touchend', (e) => {
                    if (!isDragging) return;

                    // Only apply momentum if this was a drag operation (not a pinch)
                    if (e.touches.length === 0) {
                        isDragging = false;
                        map.style.cursor = 'grab';

                        const renderer = getMapRenderer();
                        if (!renderer) return;

                        // Calculate momentum based on recent movements
                        if (touchMoveHistory.length > 0) {
                            let totalDeltaX = 0;
                            let totalDeltaY = 0;
                            let totalTime = 0;

                            // Calculate weighted average of recent movements
                            touchMoveHistory.forEach((move, index) => {
                                // More recent moves have higher weight
                                const weight = (index + 1) / touchMoveHistory.length;
                                totalDeltaX += move.deltaX * weight;
                                totalDeltaY += move.deltaY * weight;
                                totalTime += move.timeDelta * weight;
                            });

                            // Calculate momentum (pixels per second)
                            if (totalTime > 0) {
                                const speedX = totalDeltaX / totalTime;
                                const speedY = totalDeltaY / totalTime;

                                // Convert to tile movement and apply momentum
                                renderer.momentum = {
                                    x: speedX / (renderer.options.tileSize * renderer.zoom),
                                    y: speedY / (renderer.options.tileSize * renderer.zoom)
                                };
                            }
                        }
                    }
                });

                // Double tap to zoom in
                let lastTap = 0;
                map.addEventListener('touchend', (e) => {
                    const currentTime = Date.now();
                    const tapLength = currentTime - lastTap;

                    // Detect double tap (within 300ms)
                    if (tapLength < 300 && tapLength > 0 && e.touches.length === 0) {
                        const renderer = getMapRenderer();
                        if (!renderer) return;

                        // Get the position of the last touch
                        const touch = e.changedTouches[0];
                        const rect = map.getBoundingClientRect();

                        // Convert to map coordinates
                        const mapX = renderer.getMapXFromCanvas(touch.clientX - rect.left);
                        const mapY = renderer.getMapYFromCanvas(touch.clientY - rect.top);

                        // Zoom in centered on the tap location
                        const newZoom = Math.min(renderer.options.maxZoom, renderer.zoom * 1.5);
                        renderer.smoothZoom(newZoom, mapX, mapY);

                        e.preventDefault();
                    }

                    lastTap = currentTime;
                });
            }
        } catch (error) {
            console.error('Error initializing map touch events:', error);
        }
    }

    /**
     * Add enhanced zoom controls for mobile devices
     * @param {HTMLElement} mapWrapper - The map wrapper element
     * @param {HTMLElement} mapElement - The map element
     */
    addMapZoomControls(mapWrapper, mapElement) {
        try {
            // Check if controls already exist
            const existingControls = mapWrapper.querySelector('.map-zoom-controls');
            if (existingControls) {
                existingControls.remove();
            }

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

            // Create center button
            const centerButton = document.createElement('button');
            centerButton.className = 'zoom-button center-map';
            centerButton.innerHTML = '🌐';
            centerButton.setAttribute('aria-label', 'Center map');

            // Find the appropriate map renderer
            const getMapRenderer = () => {
                // Try to find the renderer in the global scope or window object
                if (window.mapRenderer && mapElement.id === 'game-map') {
                    return window.mapRenderer;
                }
                if (window.enhancedMapRenderer && mapElement.id === 'enhanced-map') {
                    return window.enhancedMapRenderer;
                }
                // Try to find the renderer in the map UI instances
                if (window.mapUI && window.mapUI.mapRenderer && mapElement.id === 'game-map') {
                    return window.mapUI.mapRenderer;
                }
                if (window.mapUI && window.mapUI.enhancedMapRenderer && mapElement.id === 'enhanced-map') {
                    return window.mapUI.enhancedMapRenderer;
                }
                return null;
            };

            // Add event listeners with improved zoom handling
            zoomInButton.addEventListener('click', () => {
                const renderer = getMapRenderer();
                if (renderer && renderer.smoothZoom) {
                    // Use smooth zoom with animation
                    const newZoom = Math.min(renderer.options.maxZoom, renderer.zoom * 1.3);
                    renderer.smoothZoom(newZoom);
                } else if (renderer && renderer.setZoom) {
                    // Fallback to setZoom
                    const newZoom = Math.min(renderer.options.maxZoom, renderer.zoom * 1.3);
                    renderer.setZoom(newZoom);
                }
            });

            zoomOutButton.addEventListener('click', () => {
                const renderer = getMapRenderer();
                if (renderer && renderer.smoothZoom) {
                    // Use smooth zoom with animation
                    const newZoom = Math.max(renderer.options.minZoom, renderer.zoom / 1.3);
                    renderer.smoothZoom(newZoom);
                } else if (renderer && renderer.setZoom) {
                    // Fallback to setZoom
                    const newZoom = Math.max(renderer.options.minZoom, renderer.zoom / 1.3);
                    renderer.setZoom(newZoom);
                }
            });

            centerButton.addEventListener('click', () => {
                const renderer = getMapRenderer();
                if (renderer && renderer.centerOn) {
                    // Center on the middle of the map
                    const mapSystem = renderer.mapSystem;
                    if (mapSystem && mapSystem.config) {
                        const centerX = Math.floor(mapSystem.config.width / 2);
                        const centerY = Math.floor(mapSystem.config.height / 2);
                        renderer.centerOn(centerX, centerY, 1.0); // Reset to default zoom
                    }
                }
            });

            // Add buttons to container
            zoomControls.appendChild(zoomInButton);
            zoomControls.appendChild(zoomOutButton);
            zoomControls.appendChild(centerButton);

            // Add container to map wrapper
            mapWrapper.appendChild(zoomControls);
        } catch (error) {
            console.error('Error adding map zoom controls:', error);
        }
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
