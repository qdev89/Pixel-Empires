/**
 * Map Renderer for Pixel Empires
 * Handles rendering the map and fog of war
 */
class MapRenderer {
    /**
     * Initialize the map renderer
     * @param {MapSystem} mapSystem - The map system
     * @param {HTMLElement} container - The container element for the map
     * @param {Object} options - Rendering options
     */
    constructor(mapSystem, container, options = {}) {
        this.mapSystem = mapSystem;
        this.container = container;

        // Default options
        this.options = {
            tileSize: 32,
            viewportWidth: 15,
            viewportHeight: 10,
            showGrid: true,
            showCoordinates: false,
            ...options
        };

        // Initialize canvas
        this.initializeCanvas();

        // Viewport position (center of the viewport in map coordinates)
        this.viewportX = Math.floor(this.mapSystem.config.width / 2);
        this.viewportY = Math.floor(this.mapSystem.config.height / 2);

        // Zoom level (1.0 = 100%)
        this.zoom = 1.0;

        // Bind event handlers
        this.bindEvents();

        // Initial render
        this.render();
    }

    /**
     * Initialize the canvas element
     */
    initializeCanvas() {
        // Create main canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'map-canvas';
        this.container.appendChild(this.canvas);

        // Create fog of war canvas (rendered on top of the main canvas)
        this.fogCanvas = document.createElement('canvas');
        this.fogCanvas.className = 'fog-canvas';
        this.container.appendChild(this.fogCanvas);

        // Create overlay canvas for UI elements
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.className = 'overlay-canvas';
        this.container.appendChild(this.overlayCanvas);

        // Set canvas size
        this.resizeCanvas();

        // Get canvas contexts
        this.ctx = this.canvas.getContext('2d');
        this.fogCtx = this.fogCanvas.getContext('2d');
        this.overlayCtx = this.overlayCanvas.getContext('2d');
    }

    /**
     * Resize the canvas based on viewport size and zoom
     */
    resizeCanvas() {
        const { tileSize, viewportWidth, viewportHeight } = this.options;

        // Calculate canvas size based on viewport and zoom
        // Ensure minimum dimensions of 1x1 to avoid canvas with zero width/height
        const width = Math.max(1, Math.floor(viewportWidth * tileSize * this.zoom));
        const height = Math.max(1, Math.floor(viewportHeight * tileSize * this.zoom));

        // Set canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;
        this.fogCanvas.width = width;
        this.fogCanvas.height = height;
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;

        // Set canvas style dimensions
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.fogCanvas.style.width = `${width}px`;
        this.fogCanvas.style.height = `${height}px`;
        this.overlayCanvas.style.width = `${width}px`;
        this.overlayCanvas.style.height = `${height}px`;

        // Log canvas dimensions for debugging
        console.debug(`Canvas resized to ${width}x${height}px`);
    }

    /**
     * Bind event handlers for map interaction
     */
    bindEvents() {
        // Mouse wheel for zooming
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();

            // Zoom in/out
            if (e.deltaY < 0) {
                this.zoom = Math.min(2.0, this.zoom + 0.1);
            } else {
                this.zoom = Math.max(0.5, this.zoom - 0.1);
            }

            // Resize canvas and re-render
            this.resizeCanvas();
            this.render();
        });

        // Mouse drag for panning
        let isDragging = false;
        let lastX, lastY;

        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            this.container.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            // Convert pixel movement to tile movement based on zoom
            const tileMovementX = deltaX / (this.options.tileSize * this.zoom);
            const tileMovementY = deltaY / (this.options.tileSize * this.zoom);

            // Update viewport position
            this.viewportX -= tileMovementX;
            this.viewportY -= tileMovementY;

            // Clamp viewport position to map bounds
            this.clampViewport();

            // Update last position
            lastX = e.clientX;
            lastY = e.clientY;

            // Re-render
            this.render();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            this.container.style.cursor = 'grab';
        });

        // Click to select tile
        this.overlayCanvas.addEventListener('click', (e) => {
            const rect = this.overlayCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Convert pixel coordinates to tile coordinates
            const tileX = Math.floor(x / (this.options.tileSize * this.zoom)) + this.getViewportStartX();
            const tileY = Math.floor(y / (this.options.tileSize * this.zoom)) + this.getViewportStartY();

            // Check if coordinates are within map bounds
            if (tileX >= 0 && tileX < this.mapSystem.config.width &&
                tileY >= 0 && tileY < this.mapSystem.config.height) {

                // Handle tile click
                this.handleTileClick(tileX, tileY);
            }
        });
    }

    /**
     * Clamp viewport position to map bounds
     */
    clampViewport() {
        const { width, height } = this.mapSystem.config;
        const { viewportWidth, viewportHeight } = this.options;

        // Calculate viewport bounds
        const halfViewportWidth = viewportWidth / 2;
        const halfViewportHeight = viewportHeight / 2;

        // Clamp viewport position
        this.viewportX = Math.max(halfViewportWidth, Math.min(width - halfViewportWidth, this.viewportX));
        this.viewportY = Math.max(halfViewportHeight, Math.min(height - halfViewportHeight, this.viewportY));
    }

    /**
     * Get the starting X coordinate of the viewport in map coordinates
     * @returns {number} - Starting X coordinate
     */
    getViewportStartX() {
        return Math.floor(this.viewportX - this.options.viewportWidth / 2);
    }

    /**
     * Get the starting Y coordinate of the viewport in map coordinates
     * @returns {number} - Starting Y coordinate
     */
    getViewportStartY() {
        return Math.floor(this.viewportY - this.options.viewportHeight / 2);
    }

    /**
     * Handle tile click event
     * @param {number} tileX - X coordinate of the clicked tile
     * @param {number} tileY - Y coordinate of the clicked tile
     */
    handleTileClick(tileX, tileY) {
        console.log(`Clicked tile at (${tileX}, ${tileY})`);

        // Get terrain information
        const terrain = this.mapSystem.getTerrainAt(tileX, tileY);
        if (terrain) {
            console.log(`Terrain: ${terrain.name}`);
        }

        // Check for special location
        const specialLocation = this.mapSystem.getSpecialLocationAt(tileX, tileY);
        if (specialLocation && specialLocation.discovered) {
            console.log(`Special location: ${this.mapSystem.specialLocationTypes[specialLocation.type].name}`);

            // Show location details
            this.showLocationDetails(specialLocation);
        }

        // Explore the area around the clicked tile (for testing)
        this.mapSystem.exploreArea(tileX, tileY, 3);

        // Re-render the map
        this.render();
    }

    /**
     * Show details for a special location
     * @param {Object} location - The special location
     */
    showLocationDetails(location) {
        const locationType = this.mapSystem.specialLocationTypes[location.type];

        // Create a custom event with location details
        const event = new CustomEvent('locationSelected', {
            detail: {
                location,
                locationType
            }
        });

        // Dispatch the event
        this.container.dispatchEvent(event);
    }

    /**
     * Render the map
     */
    render() {
        // Clear canvases
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

        // Render terrain
        this.renderTerrain();

        // Render fog of war
        this.renderFogOfWar();

        // Render special locations
        this.renderSpecialLocations();

        // Render grid
        if (this.options.showGrid) {
            this.renderGrid();
        }

        // Render coordinates
        if (this.options.showCoordinates) {
            this.renderCoordinates();
        }
    }

    /**
     * Render terrain
     */
    renderTerrain() {
        const { tileSize } = this.options;
        const startX = this.getViewportStartX();
        const startY = this.getViewportStartY();
        const endX = startX + this.options.viewportWidth;
        const endY = startY + this.options.viewportHeight;

        // Render visible terrain
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                // Skip if out of bounds
                if (x < 0 || x >= this.mapSystem.config.width || y < 0 || y >= this.mapSystem.config.height) {
                    continue;
                }

                // Get terrain type
                const terrainId = this.mapSystem.mapData.terrain[y][x];
                const terrain = this.mapSystem.terrainTypes[terrainId];

                if (!terrain) continue;

                // Calculate tile position on canvas
                const canvasX = (x - startX) * tileSize * this.zoom;
                const canvasY = (y - startY) * tileSize * this.zoom;

                // Draw terrain tile
                this.ctx.fillStyle = terrain.color;
                this.ctx.fillRect(canvasX, canvasY, tileSize * this.zoom, tileSize * this.zoom);
            }
        }
    }

    /**
     * Render fog of war with different levels of visibility
     * Enhanced with improved visual effects and exploration levels
     */
    renderFogOfWar() {
        const { tileSize } = this.options;
        const startX = this.getViewportStartX();
        const startY = this.getViewportStartY();
        const endX = startX + this.options.viewportWidth;
        const endY = startY + this.options.viewportHeight;

        // First pass: Draw unexplored background with a more detailed pattern
        this.fogCtx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

        // Add a subtle pattern to the unexplored areas
        this.fogCtx.save();
        this.fogCtx.globalAlpha = 0.1;
        for (let y = 0; y < this.fogCanvas.height; y += 10) {
            for (let x = 0; x < this.fogCanvas.width; x += 10) {
                if (Math.random() < 0.2) {
                    this.fogCtx.fillStyle = `rgba(${20 + Math.random() * 20}, ${20 + Math.random() * 20}, ${40 + Math.random() * 20}, 0.3)`;
                    this.fogCtx.fillRect(x, y, 4 + Math.random() * 6, 4 + Math.random() * 6);
                }
            }
        }
        this.fogCtx.restore();

        // Second pass: Render fog of war with different levels
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                // Skip if out of bounds
                if (x < 0 || x >= this.mapSystem.config.width || y < 0 || y >= this.mapSystem.config.height) {
                    continue;
                }

                // Get exploration level
                const explorationLevel = this.mapSystem.getExplorationLevel(x, y);

                // Get time since last seen (for decay effect)
                const lastSeenTime = this.mapSystem.getLastSeenTime(x, y) || 0;
                const currentTime = this.mapSystem.gameTime || 0;
                const timeSinceLastSeen = currentTime - lastSeenTime;

                // Calculate fog opacity based on time since last seen
                let fogOpacity = 0;
                if (explorationLevel === 1) {
                    // Gradually increase fog opacity over time for partially explored areas
                    fogOpacity = Math.min(0.7, 0.4 + (timeSinceLastSeen / 1000) * 0.3);
                }

                // Calculate tile position on canvas
                const canvasX = (x - startX) * tileSize * this.zoom;
                const canvasY = (y - startY) * tileSize * this.zoom;

                if (explorationLevel === 0) {
                    // Unexplored - completely dark (already covered by background)
                    // Add some texture to unexplored areas
                    if (Math.random() < 0.1) {
                        this.fogCtx.fillStyle = 'rgba(20, 20, 30, 0.3)';
                        this.fogCtx.fillRect(
                            canvasX + Math.random() * tileSize * this.zoom * 0.8,
                            canvasY + Math.random() * tileSize * this.zoom * 0.8,
                            tileSize * this.zoom * 0.2,
                            tileSize * this.zoom * 0.2
                        );
                    }
                } else if (explorationLevel === 1) {
                    // Partially explored - semi-transparent fog with memory
                    // Clear the fog partially
                    this.fogCtx.clearRect(canvasX, canvasY, tileSize * this.zoom, tileSize * this.zoom);

                    // Add semi-transparent fog layer with dynamic opacity
                    this.fogCtx.fillStyle = `rgba(0, 0, 0, ${fogOpacity})`;
                    this.fogCtx.fillRect(canvasX, canvasY, tileSize * this.zoom, tileSize * this.zoom);

                    // Draw the last seen terrain if available
                    const lastSeenTerrain = this.mapSystem.getLastSeenTerrain(x, y);
                    if (lastSeenTerrain) {
                        const terrain = this.mapSystem.terrainTypes[lastSeenTerrain];
                        if (terrain) {
                            // Draw faded terrain
                            this.ctx.globalAlpha = 0.7;
                            this.ctx.fillStyle = terrain.color;
                            this.ctx.fillRect(canvasX, canvasY, tileSize * this.zoom, tileSize * this.zoom);

                            // Add terrain icon if zoom level is high enough
                            if (this.zoom >= 1.0 && terrain.icon) {
                                this.ctx.font = `${Math.floor(12 * this.zoom)}px Arial`;
                                this.ctx.textAlign = 'center';
                                this.ctx.textBaseline = 'middle';
                                this.ctx.fillText(
                                    terrain.icon,
                                    canvasX + (tileSize * this.zoom) / 2,
                                    canvasY + (tileSize * this.zoom) / 2
                                );
                            }

                            this.ctx.globalAlpha = 1.0;
                        }
                    }

                    // Add fog border effect
                    this.fogCtx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
                    this.fogCtx.lineWidth = 2;
                    this.fogCtx.strokeRect(canvasX, canvasY, tileSize * this.zoom, tileSize * this.zoom);
                } else if (explorationLevel === 2) {
                    // Fully explored - clear fog completely
                    this.fogCtx.clearRect(canvasX, canvasY, tileSize * this.zoom, tileSize * this.zoom);

                    // Add subtle highlight to indicate fully explored areas
                    this.overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                    this.overlayCtx.fillRect(canvasX, canvasY, tileSize * this.zoom, tileSize * this.zoom);
                }
            }
        }

        // Add fog border effect around the edges of explored areas
        // Only if the canvas has been properly initialized
        if (this.fogCanvas && this.fogCanvas.width > 0 && this.fogCanvas.height > 0) {
            this.addFogBorderEffect(startX, startY, endX, endY, tileSize);
        }
    }

    /**
     * Add border effect to the edges of explored areas
     */
    addFogBorderEffect(startX, startY, endX, endY, tileSize) {
        // Check if fog canvas has valid dimensions
        if (!this.fogCanvas || this.fogCanvas.width <= 0 || this.fogCanvas.height <= 0) {
            return; // Skip if canvas dimensions are invalid
        }

        try {
            // Create a temporary canvas for the border effect
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.fogCanvas.width;
            tempCanvas.height = this.fogCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            // Copy the current fog canvas to the temp canvas
            tempCtx.drawImage(this.fogCanvas, 0, 0);

            // Set composite operation to only draw where there's already content
            tempCtx.globalCompositeOperation = 'source-atop';

            // Add a subtle glow effect
            const gradient = tempCtx.createRadialGradient(
                this.fogCanvas.width / 2, this.fogCanvas.height / 2,
                0,
                this.fogCanvas.width / 2, this.fogCanvas.height / 2,
                this.fogCanvas.width / 2
            );
            gradient.addColorStop(0, 'rgba(30, 30, 60, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

            tempCtx.fillStyle = gradient;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Draw the temp canvas back to the fog canvas
            this.fogCtx.drawImage(tempCanvas, 0, 0);
        } catch (error) {
            console.warn('Error applying fog border effect:', error.message);
            // Continue without the border effect
        }
    }

    /**
     * Render special locations with different states and visual effects
     */
    renderSpecialLocations() {
        const { tileSize } = this.options;
        const startX = this.getViewportStartX();
        const startY = this.getViewportStartY();

        // Get current time for animations
        const now = Date.now();

        // Render special locations
        for (const location of this.mapSystem.mapData.specialLocations) {
            // Skip if out of viewport
            if (location.x < startX || location.x >= startX + this.options.viewportWidth ||
                location.y < startY || location.y >= startY + this.options.viewportHeight) {
                continue;
            }

            // Get exploration level of the location's tile
            const explorationLevel = this.mapSystem.getExplorationLevel(location.x, location.y);

            // Skip if completely unexplored
            if (explorationLevel === 0) continue;

            // Get location type
            const locationType = this.mapSystem.specialLocationTypes[location.type];

            // Calculate position on canvas
            const canvasX = (location.x - startX) * tileSize * this.zoom;
            const canvasY = (location.y - startY) * tileSize * this.zoom;

            // Draw location based on discovery state
            if (location.discovered) {
                // Apply visual effects for fully discovered locations
                if (location.fullyDiscovered && locationType.visualEffect) {
                    this.overlayCtx.save();

                    switch (locationType.visualEffect) {
                        case 'pulsing':
                            // Pulsing effect
                            const pulseScale = 1 + 0.2 * Math.sin(now / 500);
                            this.overlayCtx.globalAlpha = 0.7 + 0.3 * Math.sin(now / 500);
                            this.overlayCtx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                            this.overlayCtx.beginPath();
                            this.overlayCtx.arc(
                                canvasX + (tileSize * this.zoom) / 2,
                                canvasY + (tileSize * this.zoom) / 2,
                                (tileSize * this.zoom * pulseScale) / 2,
                                0, Math.PI * 2
                            );
                            this.overlayCtx.fill();
                            break;

                        case 'glowing':
                            // Glowing effect
                            const glowOpacity = 0.5 + 0.3 * Math.sin(now / 800);
                            const gradient = this.overlayCtx.createRadialGradient(
                                canvasX + (tileSize * this.zoom) / 2,
                                canvasY + (tileSize * this.zoom) / 2,
                                0,
                                canvasX + (tileSize * this.zoom) / 2,
                                canvasY + (tileSize * this.zoom) / 2,
                                tileSize * this.zoom
                            );
                            gradient.addColorStop(0, `rgba(255, 255, 200, ${glowOpacity})`);
                            gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
                            this.overlayCtx.fillStyle = gradient;
                            this.overlayCtx.fillRect(
                                canvasX - 5 * this.zoom,
                                canvasY - 5 * this.zoom,
                                tileSize * this.zoom + 10 * this.zoom,
                                tileSize * this.zoom + 10 * this.zoom
                            );
                            break;

                        case 'sparkle':
                            // Sparkle effect
                            this.overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            for (let i = 0; i < 5; i++) {
                                const angle = (now / 1000 + i * Math.PI * 2 / 5) % (Math.PI * 2);
                                const distance = tileSize * this.zoom * 0.4;
                                const sparkleX = canvasX + (tileSize * this.zoom) / 2 + Math.cos(angle) * distance;
                                const sparkleY = canvasY + (tileSize * this.zoom) / 2 + Math.sin(angle) * distance;
                                const sparkleSize = 2 * this.zoom * (0.5 + 0.5 * Math.sin(now / 200 + i));

                                this.overlayCtx.beginPath();
                                this.overlayCtx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
                                this.overlayCtx.fill();
                            }
                            break;

                        case 'shimmer':
                            // Shimmer effect
                            this.overlayCtx.fillStyle = 'rgba(200, 200, 255, 0.3)';
                            for (let i = 0; i < 3; i++) {
                                const shimmerY = canvasY + (i + Math.sin(now / 500 + i)) * tileSize * this.zoom / 3;
                                this.overlayCtx.globalAlpha = 0.3 * Math.sin(now / 300 + i * Math.PI / 3);
                                this.overlayCtx.fillRect(
                                    canvasX,
                                    shimmerY,
                                    tileSize * this.zoom,
                                    tileSize * this.zoom / 10
                                );
                            }
                            break;
                    }

                    this.overlayCtx.restore();
                }

                // Fully discovered locations show the actual icon
                if (location.fullyDiscovered) {
                    // Draw location icon
                    this.overlayCtx.font = `${Math.floor(16 * this.zoom)}px Arial`;
                    this.overlayCtx.textAlign = 'center';
                    this.overlayCtx.textBaseline = 'middle';
                    this.overlayCtx.fillText(
                        locationType.icon,
                        canvasX + (tileSize * this.zoom) / 2,
                        canvasY + (tileSize * this.zoom) / 2
                    );

                    // Draw highlight if interacted
                    if (location.interacted) {
                        this.overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                        this.overlayCtx.lineWidth = 2;
                        this.overlayCtx.strokeRect(
                            canvasX + 2,
                            canvasY + 2,
                            tileSize * this.zoom - 4,
                            tileSize * this.zoom - 4
                        );
                    }
                } else {
                    // Partially discovered locations show a question mark
                    this.overlayCtx.font = `${Math.floor(16 * this.zoom)}px Arial`;
                    this.overlayCtx.textAlign = 'center';
                    this.overlayCtx.textBaseline = 'middle';
                    this.overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    this.overlayCtx.fillText(
                        '?',
                        canvasX + (tileSize * this.zoom) / 2,
                        canvasY + (tileSize * this.zoom) / 2
                    );
                }
            } else if (explorationLevel === 1) {
                // Unexplored but visible locations show a faint marker
                this.overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.overlayCtx.beginPath();
                this.overlayCtx.arc(
                    canvasX + (tileSize * this.zoom) / 2,
                    canvasY + (tileSize * this.zoom) / 2,
                    (tileSize * this.zoom) / 6,
                    0,
                    Math.PI * 2
                );
                this.overlayCtx.fill();
            }
        }
    }

    /**
     * Render grid
     */
    renderGrid() {
        const { tileSize } = this.options;

        // Set grid style
        this.overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.overlayCtx.lineWidth = 1;

        // Draw vertical grid lines
        for (let x = 0; x <= this.options.viewportWidth; x++) {
            const canvasX = x * tileSize * this.zoom;
            this.overlayCtx.beginPath();
            this.overlayCtx.moveTo(canvasX, 0);
            this.overlayCtx.lineTo(canvasX, this.canvas.height);
            this.overlayCtx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = 0; y <= this.options.viewportHeight; y++) {
            const canvasY = y * tileSize * this.zoom;
            this.overlayCtx.beginPath();
            this.overlayCtx.moveTo(0, canvasY);
            this.overlayCtx.lineTo(this.canvas.width, canvasY);
            this.overlayCtx.stroke();
        }
    }

    /**
     * Render coordinates
     */
    renderCoordinates() {
        const { tileSize } = this.options;
        const startX = this.getViewportStartX();
        const startY = this.getViewportStartY();

        // Set coordinate style
        this.overlayCtx.font = `${Math.floor(10 * this.zoom)}px Arial`;
        this.overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.overlayCtx.textAlign = 'left';
        this.overlayCtx.textBaseline = 'top';

        // Render coordinates
        for (let y = 0; y < this.options.viewportHeight; y++) {
            for (let x = 0; x < this.options.viewportWidth; x++) {
                const mapX = startX + x;
                const mapY = startY + y;

                // Skip if out of bounds
                if (mapX < 0 || mapX >= this.mapSystem.config.width || mapY < 0 || mapY >= this.mapSystem.config.height) {
                    continue;
                }

                // Calculate position on canvas
                const canvasX = x * tileSize * this.zoom;
                const canvasY = y * tileSize * this.zoom;

                // Draw coordinates
                this.overlayCtx.fillText(`${mapX},${mapY}`, canvasX + 2, canvasY + 2);
            }
        }
    }

    /**
     * Center the viewport on a specific location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    centerOn(x, y) {
        this.viewportX = x;
        this.viewportY = y;
        this.clampViewport();
        this.render();
    }

    /**
     * Set the zoom level
     * @param {number} zoom - Zoom level (1.0 = 100%)
     */
    setZoom(zoom) {
        this.zoom = Math.max(0.5, Math.min(2.0, zoom));
        this.resizeCanvas();
        this.render();
    }
}

// Export the MapRenderer class
if (typeof module !== 'undefined') {
    module.exports = { MapRenderer };
}
