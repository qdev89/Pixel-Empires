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
            minZoom: 0.3,  // Lower minimum zoom for better overview
            maxZoom: 3.0,  // Higher maximum zoom for better detail
            zoomStep: 0.15, // Smoother zoom steps
            ...options
        };

        // Initialize canvas
        this.initializeCanvas();

        // Viewport position (center of the viewport in map coordinates)
        this.viewportX = Math.floor(this.mapSystem.config.width / 2);
        this.viewportY = Math.floor(this.mapSystem.config.height / 2);

        // Zoom level (1.0 = 100%)
        this.zoom = 1.0;

        // Initialize container dimensions with fallback values
        // These will be updated in resizeCanvas
        this.containerWidth = 300;
        this.containerHeight = 200;

        // For smooth panning with momentum
        this.momentum = { x: 0, y: 0 };
        this.lastFrameTime = 0;
        this.animationFrameId = null;

        // Bind event handlers
        this.bindEvents();

        // Start animation loop
        this.startAnimationLoop();

        // Initial render
        this.render();
    }

    /**
     * Initialize the canvas element
     */
    initializeCanvas() {
        try {
            // Clear any existing canvases first
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }

            // Add loading indicator
            this.showLoadingIndicator();

            // Create main canvas with explicit dimensions
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'map-canvas';
            this.canvas.width = 800;  // Default width
            this.canvas.height = 600; // Default height
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.display = 'block';
            this.container.appendChild(this.canvas);

            // Create fog of war canvas with explicit dimensions
            this.fogCanvas = document.createElement('canvas');
            this.fogCanvas.className = 'fog-canvas';
            this.fogCanvas.width = 800;  // Default width
            this.fogCanvas.height = 600; // Default height
            this.fogCanvas.style.width = '100%';
            this.fogCanvas.style.height = '100%';
            this.fogCanvas.style.display = 'block';
            this.container.appendChild(this.fogCanvas);

            // Create overlay canvas with explicit dimensions
            this.overlayCanvas = document.createElement('canvas');
            this.overlayCanvas.className = 'overlay-canvas';
            this.overlayCanvas.width = 800;  // Default width
            this.overlayCanvas.height = 600; // Default height
            this.overlayCanvas.style.width = '100%';
            this.overlayCanvas.style.height = '100%';
            this.overlayCanvas.style.display = 'block';
            this.container.appendChild(this.overlayCanvas);

            // Get canvas contexts with proper options
            this.ctx = this.canvas.getContext('2d', { alpha: false }); // Use non-alpha for better performance
            this.fogCtx = this.fogCanvas.getContext('2d');
            this.overlayCtx = this.overlayCanvas.getContext('2d');

            // Then set canvas size
            this.resizeCanvas();

            // Hide loading indicator
            this.hideLoadingIndicator();

            console.log('Canvas initialized successfully');
        } catch (error) {
            console.error('Error initializing canvas:', error);
            this.hideLoadingIndicator();
        }
    }

    /**
     * Show loading indicator while initializing
     */
    showLoadingIndicator() {
        try {
            // Remove any existing loading indicator first
            this.hideLoadingIndicator();

            // Create loading indicator
            this.loadingIndicator = document.createElement('div');
            this.loadingIndicator.className = 'map-loading';
            this.loadingIndicator.innerHTML = 'Loading Map...';
            this.loadingIndicator.style.position = 'absolute';
            this.loadingIndicator.style.top = '50%';
            this.loadingIndicator.style.left = '50%';
            this.loadingIndicator.style.transform = 'translate(-50%, -50%)';
            this.loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            this.loadingIndicator.style.color = 'white';
            this.loadingIndicator.style.padding = '10px 20px';
            this.loadingIndicator.style.borderRadius = '5px';
            this.loadingIndicator.style.zIndex = '1000';
            this.container.appendChild(this.loadingIndicator);
        } catch (error) {
            console.error('Error showing loading indicator:', error);
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        try {
            if (this.loadingIndicator && this.loadingIndicator.parentNode) {
                this.loadingIndicator.parentNode.removeChild(this.loadingIndicator);
                this.loadingIndicator = null;
            }

            // Also remove any other loading indicators that might be present
            const loadingIndicators = this.container.querySelectorAll('.map-loading');
            loadingIndicators.forEach(indicator => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            });
        } catch (error) {
            console.error('Error hiding loading indicator:', error);
        }
    }

    /**
     * Resize the canvas based on viewport size and zoom
     */
    resizeCanvas() {
        try {
            // Get container dimensions for responsive sizing
            const containerRect = this.container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;

            // Check if container has valid dimensions
            if (containerWidth <= 0 || containerHeight <= 0) {
                console.warn('Container has invalid dimensions, using fallback values');
                // Use fallback values
                const fallbackWidth = 300;
                const fallbackHeight = 200;
                this.setCanvasDimensions(fallbackWidth, fallbackHeight);
                return;
            }

            // Calculate canvas size based on container dimensions
            // Use device pixel ratio for sharper rendering on high-DPI displays
            const pixelRatio = window.devicePixelRatio || 1;
            const width = Math.max(1, containerWidth);
            const height = Math.max(1, containerHeight);

            // Set canvas dimensions
            this.setCanvasDimensions(width, height, pixelRatio);

            // Adjust viewport dimensions based on container size and zoom
            const { tileSize } = this.options;
            this.options.viewportWidth = Math.ceil(width / (tileSize * this.zoom)) + 2; // Add buffer tiles
            this.options.viewportHeight = Math.ceil(height / (tileSize * this.zoom)) + 2; // Add buffer tiles

            // Store the container dimensions for calculations
            this.containerWidth = width;
            this.containerHeight = height;

            // Log canvas dimensions for debugging
            console.debug(`Canvas resized to ${width}x${height}px (${this.canvas.width}x${this.canvas.height} actual pixels)`);
        } catch (error) {
            console.error('Error resizing canvas:', error);
            // Use fallback values in case of error
            this.setCanvasDimensions(300, 200);
        }
    }

    /**
     * Set canvas dimensions with proper error handling
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} pixelRatio - Device pixel ratio
     */
    setCanvasDimensions(width, height, pixelRatio = 1) {
        try {
            // Set canvas dimensions with pixel ratio for sharp rendering
            if (this.canvas) {
                this.canvas.width = width * pixelRatio;
                this.canvas.height = height * pixelRatio;
                this.canvas.style.width = `${width}px`;
                this.canvas.style.height = `${height}px`;
            }

            if (this.fogCanvas) {
                this.fogCanvas.width = width * pixelRatio;
                this.fogCanvas.height = height * pixelRatio;
                this.fogCanvas.style.width = `${width}px`;
                this.fogCanvas.style.height = `${height}px`;
            }

            if (this.overlayCanvas) {
                this.overlayCanvas.width = width * pixelRatio;
                this.overlayCanvas.height = height * pixelRatio;
                this.overlayCanvas.style.width = `${width}px`;
                this.overlayCanvas.style.height = `${height}px`;
            }

            // Scale the canvas context to account for the pixel ratio
            // Only if contexts exist
            if (this.ctx && this.fogCtx && this.overlayCtx) {
                this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
                this.fogCtx.setTransform(1, 0, 0, 1, 0, 0);
                this.overlayCtx.setTransform(1, 0, 0, 1, 0, 0);

                this.ctx.scale(pixelRatio, pixelRatio);
                this.fogCtx.scale(pixelRatio, pixelRatio);
                this.overlayCtx.scale(pixelRatio, pixelRatio);
            }
        } catch (error) {
            console.error('Error setting canvas dimensions:', error);
        }
    }

    /**
     * Start animation loop for smooth rendering
     */
    startAnimationLoop() {
        const animate = (timestamp) => {
            // Calculate delta time for smooth animations
            const deltaTime = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0;
            this.lastFrameTime = timestamp;

            // Apply momentum for smooth panning
            if (Math.abs(this.momentum.x) > 0.01 || Math.abs(this.momentum.y) > 0.01) {
                // Move viewport based on momentum
                this.viewportX -= this.momentum.x * deltaTime * 5;
                this.viewportY -= this.momentum.y * deltaTime * 5;

                // Apply friction to slow down movement
                this.momentum.x *= 0.95;
                this.momentum.y *= 0.95;

                // Clamp viewport to map boundaries
                this.clampViewport();

                // Re-render the map
                this.render();
            }

            // Continue animation loop
            this.animationFrameId = requestAnimationFrame(animate);
        };

        // Start animation loop
        this.animationFrameId = requestAnimationFrame(animate);
    }

    /**
     * Stop animation loop
     */
    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Bind event handlers for map interaction
     */
    bindEvents() {
        // Mouse wheel for zooming with improved handling
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();

            try {
                // Get mouse position relative to container
                const rect = this.container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Convert mouse position to map coordinates before zoom
                const mapX = this.getMapXFromCanvas(mouseX);
                const mapY = this.getMapYFromCanvas(mouseY);

                // Calculate zoom delta with smoother steps based on deltaY
                const zoomDelta = -Math.sign(e.deltaY) * this.options.zoomStep;
                const zoomFactor = 1 + Math.abs(zoomDelta);

                // Calculate new zoom level
                let newZoom;
                if (zoomDelta > 0) {
                    // Zoom in
                    newZoom = this.zoom * zoomFactor;
                } else {
                    // Zoom out
                    newZoom = this.zoom / zoomFactor;
                }

                // Apply smooth zoom with animation
                this.smoothZoom(newZoom, mapX, mapY);
            } catch (error) {
                console.error('Error handling wheel event:', error);
            }
        });

        // Mouse drag for panning with improved feel and momentum
        let isDragging = false;
        let lastX, lastY;
        let lastMoveTime = 0;
        let moveHistory = [];

        // Mouse down - start dragging
        this.container.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left mouse button

            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            lastMoveTime = Date.now();
            moveHistory = [];
            this.momentum = { x: 0, y: 0 };
            this.container.style.cursor = 'grabbing';

            // Prevent text selection during drag
            e.preventDefault();
        });

        // Mouse move - pan the map
        const handleMouseMove = (e) => {
            if (!isDragging) return;

            const currentTime = Date.now();
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            const timeDelta = currentTime - lastMoveTime;

            if (timeDelta > 0) {
                // Store move history for momentum calculation
                moveHistory.push({
                    deltaX,
                    deltaY,
                    timeDelta
                });

                // Keep only the last 5 moves for momentum calculation
                if (moveHistory.length > 5) {
                    moveHistory.shift();
                }

                // Convert pixel movement to tile movement based on zoom
                const tileMovementX = deltaX / (this.options.tileSize * this.zoom);
                const tileMovementY = deltaY / (this.options.tileSize * this.zoom);

                // Update viewport position
                this.viewportX -= tileMovementX;
                this.viewportY -= tileMovementY;

                // Clamp viewport position to map bounds
                this.clampViewport();

                // Update last position and time
                lastX = e.clientX;
                lastY = e.clientY;
                lastMoveTime = currentTime;

                // Re-render
                this.render();
            }
        };

        // Use both window and container for mouse move to ensure smooth dragging
        window.addEventListener('mousemove', handleMouseMove);
        this.container.addEventListener('mousemove', handleMouseMove);

        // Mouse up - stop dragging and apply momentum
        const handleMouseUp = (e) => {
            if (!isDragging) return;

            isDragging = false;
            this.container.style.cursor = 'grab';

            // Calculate momentum based on recent movements
            if (moveHistory.length > 0) {
                let totalDeltaX = 0;
                let totalDeltaY = 0;
                let totalTime = 0;

                // Calculate weighted average of recent movements
                moveHistory.forEach((move, index) => {
                    // More recent moves have higher weight
                    const weight = (index + 1) / moveHistory.length;
                    totalDeltaX += move.deltaX * weight;
                    totalDeltaY += move.deltaY * weight;
                    totalTime += move.timeDelta * weight;
                });

                // Calculate momentum (pixels per second)
                if (totalTime > 0) {
                    const speedX = totalDeltaX / totalTime;
                    const speedY = totalDeltaY / totalTime;

                    // Convert to tile movement
                    this.momentum.x = speedX / (this.options.tileSize * this.zoom);
                    this.momentum.y = speedY / (this.options.tileSize * this.zoom);
                }
            }
        };

        // Use both window and container for mouse up to ensure it's always captured
        window.addEventListener('mouseup', handleMouseUp);
        this.container.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseleave', handleMouseUp);

        // Click to select tile with improved accuracy
        this.overlayCanvas.addEventListener('click', (e) => {
            // Only handle click if not dragging
            if (isDragging) return;

            try {
                const rect = this.overlayCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Convert pixel coordinates to tile coordinates with proper rounding
                const tileX = Math.floor(this.getMapXFromCanvas(x));
                const tileY = Math.floor(this.getMapYFromCanvas(y));

                // Check if coordinates are within map bounds
                if (tileX >= 0 && tileX < this.mapSystem.config.width &&
                    tileY >= 0 && tileY < this.mapSystem.config.height) {

                    // Handle tile click
                    this.handleTileClick(tileX, tileY);
                }
            } catch (error) {
                console.error('Error handling tile click:', error);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.render();
        });

        // Double click to zoom in
        this.container.addEventListener('dblclick', (e) => {
            const rect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Convert mouse position to map coordinates
            const mapX = this.getMapXFromCanvas(mouseX);
            const mapY = this.getMapYFromCanvas(mouseY);

            // Zoom in and center on the clicked point
            const newZoom = Math.min(this.options.maxZoom, this.zoom * 1.5);
            this.smoothZoom(newZoom, mapX, mapY);
        });
    }

    /**
     * Clamp viewport position to map bounds with buffer
     */
    clampViewport() {
        const { width, height } = this.mapSystem.config;
        const { viewportWidth, viewportHeight } = this.options;

        // Calculate viewport bounds with buffer for smoother edge scrolling
        // This allows partial visibility of the map edge
        const buffer = 2; // Buffer tiles
        const minX = Math.max(0, viewportWidth / 2 - buffer);
        const maxX = Math.min(width, width - viewportWidth / 2 + buffer);
        const minY = Math.max(0, viewportHeight / 2 - buffer);
        const maxY = Math.min(height, height - viewportHeight / 2 + buffer);

        // Clamp viewport position with smoother limits
        this.viewportX = Math.max(minX, Math.min(maxX, this.viewportX));
        this.viewportY = Math.max(minY, Math.min(maxY, this.viewportY));
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
     * Render the map with performance optimizations and enhanced visuals
     */
    render() {
        try {
            // Check if canvases are properly initialized
            if (!this.canvas || !this.fogCanvas || !this.overlayCanvas) {
                console.error('Canvases not properly initialized');
                return;
            }

            // Check if contexts are properly initialized
            if (!this.ctx || !this.fogCtx || !this.overlayCtx) {
                console.error('Canvas contexts not properly initialized');
                return;
            }

            // Clear canvases with proper dimensions
            this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
            this.fogCtx.clearRect(0, 0, this.fogCanvas.width / window.devicePixelRatio, this.fogCanvas.height / window.devicePixelRatio);
            this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width / window.devicePixelRatio, this.overlayCanvas.height / window.devicePixelRatio);

            // Render terrain with performance optimizations
            this.renderTerrain();

            // Render resources if enabled
            if (this.options.showResources) {
                this.renderResources();
            }

            // Render territories if enabled
            if (this.options.showTerritories) {
                this.renderTerritories();
            }

            // Render battles if any
            this.renderBattles();

            // Render special locations with enhanced visuals
            this.renderSpecialLocations();

            // Render fog of war if not disabled
            if (this.options.showFogOfWar !== false) {
                this.renderFogOfWar();
            }

            // Render grid if enabled
            if (this.options.showGrid) {
                this.renderGrid();
            }

            // Render coordinates if enabled
            if (this.options.showCoordinates) {
                this.renderCoordinates();
            }

            // Render zoom level display
            this.renderZoomDisplay();

            // Render selected tile if any
            this.renderSelectedTile();
        } catch (error) {
            console.error('Error rendering map:', error);
        }
    }

    /**
     * Render terrain with improved visuals and performance
     */
    renderTerrain() {
        try {
            const { tileSize } = this.options;
            const startX = Math.floor(this.getViewportStartX());
            const startY = Math.floor(this.getViewportStartY());
            const endX = Math.ceil(startX + this.options.viewportWidth);
            const endY = Math.ceil(startY + this.options.viewportHeight);

            // Create a pattern for the background (unexplored areas)
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, this.containerWidth, this.containerHeight);

            // Calculate pixel offset for smooth scrolling
            const offsetX = (startX - this.getViewportStartX()) * tileSize * this.zoom;
            const offsetY = (startY - this.getViewportStartY()) * tileSize * this.zoom;

            // Performance optimization: Batch similar terrain types together
            const terrainBatches = {};

            // First pass: Group tiles by terrain type
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    // Skip if out of bounds
                    if (x < 0 || x >= this.mapSystem.config.width || y < 0 || y >= this.mapSystem.config.height) {
                        continue;
                    }

                    // Get terrain type
                    const terrainId = this.mapSystem.mapData.terrain[y][x];
                    if (!terrainId) continue;

                    // Initialize batch if needed
                    if (!terrainBatches[terrainId]) {
                        terrainBatches[terrainId] = [];
                    }

                    // Calculate tile position on canvas with sub-pixel precision
                    const canvasX = Math.round((x - startX) * tileSize * this.zoom - offsetX);
                    const canvasY = Math.round((y - startY) * tileSize * this.zoom - offsetY);
                    const tileWidth = Math.ceil(tileSize * this.zoom);
                    const tileHeight = Math.ceil(tileSize * this.zoom);

                    // Add to batch
                    terrainBatches[terrainId].push({
                        x: canvasX,
                        y: canvasY,
                        width: tileWidth,
                        height: tileHeight,
                        mapX: x,
                        mapY: y
                    });
                }
            }

            // Second pass: Render each terrain type in batches
            for (const [terrainId, tiles] of Object.entries(terrainBatches)) {
                const terrain = this.mapSystem.terrainTypes[terrainId];
                if (!terrain) continue;

                // Set fill style for this terrain type
                this.ctx.fillStyle = terrain.color;

                // Draw all tiles of this terrain type
                for (const tile of tiles) {
                    this.ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
                }

                // Only draw detailed patterns at higher zoom levels for performance
                if (this.zoom >= 0.5) {
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.2;

                    // Draw patterns for each tile
                    for (const tile of tiles) {
                        // Different patterns for different terrain types
                        switch (terrainId) {
                            case 'PLAINS':
                            case 0: // Grass
                                this.drawGrassPattern(tile.x, tile.y, tile.width, tile.height);
                                break;
                            case 'FOREST':
                            case 1: // Forest
                                this.drawForestPattern(tile.x, tile.y, tile.width, tile.height);
                                break;
                            case 'MOUNTAIN':
                            case 2: // Mountain
                                this.drawMountainPattern(tile.x, tile.y, tile.width, tile.height);
                                break;
                            case 'WATER':
                            case 3: // Water
                                this.drawWaterPattern(tile.x, tile.y, tile.width, tile.height);
                                break;
                        }
                    }

                    this.ctx.restore();

                    // Add subtle borders at higher zoom levels
                    if (this.zoom > 0.8) {
                        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                        this.ctx.lineWidth = 1;

                        for (const tile of tiles) {
                            this.ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);
                        }
                    }
                }

                // Add terrain icons at higher zoom levels
                if (this.zoom >= 1.2 && terrain.icon) {
                    this.ctx.font = `${Math.floor(12 * this.zoom)}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

                    for (const tile of tiles) {
                        this.ctx.fillText(
                            terrain.icon,
                            tile.x + tile.width / 2,
                            tile.y + tile.height / 2
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error rendering terrain:', error);
        }
    }

    /**
     * Draw grass pattern
     */
    drawGrassPattern(x, y, width, height) {
        // Simple dots pattern for grass
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < 5; i++) {
            const dotX = x + Math.random() * width;
            const dotY = y + Math.random() * height;
            const dotSize = Math.max(1, width * 0.1 * Math.random());
            this.ctx.beginPath();
            this.ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Draw forest pattern
     */
    drawForestPattern(x, y, width, height) {
        // Tree-like shapes for forest
        this.ctx.fillStyle = '#2E7D32';
        for (let i = 0; i < 3; i++) {
            const treeX = x + width * 0.2 + Math.random() * width * 0.6;
            const treeY = y + height * 0.2 + Math.random() * height * 0.6;
            const treeSize = Math.max(2, width * 0.2);

            // Tree trunk
            this.ctx.fillRect(treeX - treeSize * 0.1, treeY, treeSize * 0.2, treeSize * 0.4);

            // Tree top
            this.ctx.beginPath();
            this.ctx.moveTo(treeX - treeSize * 0.5, treeY);
            this.ctx.lineTo(treeX + treeSize * 0.5, treeY);
            this.ctx.lineTo(treeX, treeY - treeSize * 0.8);
            this.ctx.fill();
        }
    }

    /**
     * Draw mountain pattern
     */
    drawMountainPattern(x, y, width, height) {
        // Mountain peaks
        this.ctx.fillStyle = '#795548';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.2, y + height * 0.8);
        this.ctx.lineTo(x + width * 0.5, y + height * 0.3);
        this.ctx.lineTo(x + width * 0.8, y + height * 0.8);
        this.ctx.fill();

        // Snow cap if tile is large enough
        if (width > 10) {
            this.ctx.fillStyle = '#EEEEEE';
            this.ctx.beginPath();
            this.ctx.moveTo(x + width * 0.4, y + height * 0.4);
            this.ctx.lineTo(x + width * 0.5, y + height * 0.3);
            this.ctx.lineTo(x + width * 0.6, y + height * 0.4);
            this.ctx.fill();
        }
    }

    /**
     * Draw water pattern
     */
    drawWaterPattern(x, y, width, height) {
        // Wave-like pattern for water
        this.ctx.strokeStyle = '#64B5F6';
        this.ctx.lineWidth = Math.max(1, width * 0.05);

        for (let i = 0; i < 2; i++) {
            const waveY = y + height * (0.3 + i * 0.3);
            this.ctx.beginPath();
            this.ctx.moveTo(x, waveY);
            this.ctx.bezierCurveTo(
                x + width * 0.3, waveY - height * 0.1,
                x + width * 0.7, waveY + height * 0.1,
                x + width, waveY
            );
            this.ctx.stroke();
        }
    }

    /**
     * Render fog of war with different levels of visibility
     * Enhanced with improved visual effects and exploration levels
     */
    renderFogOfWar() {
        try {
            const { tileSize } = this.options;
            const startX = Math.floor(this.getViewportStartX());
            const startY = Math.floor(this.getViewportStartY());
            const endX = Math.ceil(startX + this.options.viewportWidth);
            const endY = Math.ceil(startY + this.options.viewportHeight);

            // First pass: Draw unexplored background with a more detailed pattern
            this.fogCtx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            this.fogCtx.fillRect(0, 0, this.containerWidth, this.containerHeight);

            // Add a subtle pattern to the unexplored areas (optimized to reduce random calls)
            this.fogCtx.save();
            this.fogCtx.globalAlpha = 0.1;

            // Use a pre-calculated pattern for better performance
            const patternSize = 20;
            const patternDensity = 0.2;
            const patternCount = Math.ceil(this.containerWidth / patternSize) * Math.ceil(this.containerHeight / patternSize);
            const patternPoints = Math.floor(patternCount * patternDensity);

            for (let i = 0; i < patternPoints; i++) {
                const x = Math.floor(Math.random() * this.containerWidth);
                const y = Math.floor(Math.random() * this.containerHeight);
                const size = 4 + Math.random() * 6;

                this.fogCtx.fillStyle = `rgba(${20 + Math.random() * 20}, ${20 + Math.random() * 20}, ${40 + Math.random() * 20}, 0.3)`;
                this.fogCtx.fillRect(x, y, size, size);
            }

            this.fogCtx.restore();

            // Group tiles by exploration level for batch rendering
            const explorationLevels = {
                0: [], // Unexplored
                1: [], // Partially explored
                2: []  // Fully explored
            };

            // First pass: Group tiles by exploration level
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    // Skip if out of bounds
                    if (x < 0 || x >= this.mapSystem.config.width || y < 0 || y >= this.mapSystem.config.height) {
                        continue;
                    }

                    // Get exploration level
                    const explorationLevel = this.mapSystem.getExplorationLevel(x, y);
                    if (explorationLevel === undefined) continue;

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
                    const canvasX = Math.round((x - startX) * tileSize * this.zoom);
                    const canvasY = Math.round((y - startY) * tileSize * this.zoom);
                    const tileWidth = Math.ceil(tileSize * this.zoom);
                    const tileHeight = Math.ceil(tileSize * this.zoom);

                    // Add to appropriate group
                    explorationLevels[explorationLevel].push({
                        x: canvasX,
                        y: canvasY,
                        width: tileWidth,
                        height: tileHeight,
                        mapX: x,
                        mapY: y,
                        fogOpacity,
                        lastSeenTerrain: this.mapSystem.getLastSeenTerrain(x, y)
                    });
                }
            }

            // Second pass: Render each exploration level in batches

            // Level 0: Unexplored - add texture to some tiles
            if (explorationLevels[0].length > 0) {
                // Add random texture to a subset of unexplored tiles
                const textureCount = Math.min(20, Math.floor(explorationLevels[0].length * 0.1));
                const textureIndices = new Set();

                while (textureIndices.size < textureCount) {
                    textureIndices.add(Math.floor(Math.random() * explorationLevels[0].length));
                }

                this.fogCtx.fillStyle = 'rgba(20, 20, 30, 0.3)';

                for (const index of textureIndices) {
                    const tile = explorationLevels[0][index];
                    this.fogCtx.fillRect(
                        tile.x + Math.random() * tile.width * 0.8,
                        tile.y + Math.random() * tile.height * 0.8,
                        tile.width * 0.2,
                        tile.height * 0.2
                    );
                }
            }

            // Level 1: Partially explored - semi-transparent fog with memory
            if (explorationLevels[1].length > 0) {
                // Clear fog for all partially explored tiles
                for (const tile of explorationLevels[1]) {
                    this.fogCtx.clearRect(tile.x, tile.y, tile.width, tile.height);
                }

                // Draw last seen terrain for all partially explored tiles
                for (const tile of explorationLevels[1]) {
                    if (tile.lastSeenTerrain) {
                        const terrain = this.mapSystem.terrainTypes[tile.lastSeenTerrain];
                        if (terrain) {
                            // Draw faded terrain
                            this.ctx.globalAlpha = 0.7;
                            this.ctx.fillStyle = terrain.color;
                            this.ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
                        }
                    }
                }

                // Add fog overlay with dynamic opacity
                for (const tile of explorationLevels[1]) {
                    this.fogCtx.fillStyle = `rgba(0, 0, 0, ${tile.fogOpacity})`;
                    this.fogCtx.fillRect(tile.x, tile.y, tile.width, tile.height);
                }

                // Add terrain icons if zoom level is high enough
                if (this.zoom >= 1.0) {
                    this.ctx.font = `${Math.floor(12 * this.zoom)}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';

                    for (const tile of explorationLevels[1]) {
                        if (tile.lastSeenTerrain) {
                            const terrain = this.mapSystem.terrainTypes[tile.lastSeenTerrain];
                            if (terrain && terrain.icon) {
                                this.ctx.fillText(
                                    terrain.icon,
                                    tile.x + tile.width / 2,
                                    tile.y + tile.height / 2
                                );
                            }
                        }
                    }
                }

                // Reset global alpha
                this.ctx.globalAlpha = 1.0;

                // Add fog borders
                this.fogCtx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
                this.fogCtx.lineWidth = 2;

                for (const tile of explorationLevels[1]) {
                    this.fogCtx.strokeRect(tile.x, tile.y, tile.width, tile.height);
                }
            }

            // Level 2: Fully explored - clear fog completely
            if (explorationLevels[2].length > 0) {
                // Clear fog for all fully explored tiles
                for (const tile of explorationLevels[2]) {
                    this.fogCtx.clearRect(tile.x, tile.y, tile.width, tile.height);
                }

                // Add subtle highlight
                this.overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';

                for (const tile of explorationLevels[2]) {
                    this.overlayCtx.fillRect(tile.x, tile.y, tile.width, tile.height);
                }
            }

            // Add fog border effect around the edges of explored areas
            if (this.fogCanvas && this.fogCanvas.width > 0 && this.fogCanvas.height > 0) {
                this.addFogBorderEffect(startX, startY, endX, endY, tileSize);
            }
        } catch (error) {
            console.error('Error rendering fog of war:', error);
        }
    }

    /**
     * Add border effect to the edges of explored areas with improved performance
     */
    addFogBorderEffect(startX, startY, endX, endY, tileSize) {
        // Check if fog canvas has valid dimensions
        if (!this.fogCanvas || this.fogCanvas.width <= 0 || this.fogCanvas.height <= 0) {
            return; // Skip if canvas dimensions are invalid
        }

        try {
            // Use a simpler and more efficient approach for the border effect
            // Instead of creating a temporary canvas, we'll draw directly on the fog canvas

            // Save the current state
            this.fogCtx.save();

            // Set composite operation to only draw where there's already content
            this.fogCtx.globalCompositeOperation = 'source-atop';

            // Check if container dimensions are valid
            if (!isFinite(this.containerWidth) || !isFinite(this.containerHeight) ||
                this.containerWidth <= 0 || this.containerHeight <= 0) {
                console.warn('Invalid container dimensions for gradient');
                // Use a solid color as fallback
                this.fogCtx.fillStyle = 'rgba(20, 20, 40, 0.2)';
                this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
            } else {
                // Create a gradient for the border effect
                const gradient = this.fogCtx.createLinearGradient(
                    0, 0,
                    Math.min(1000, this.containerWidth), // Limit to reasonable values
                    Math.min(1000, this.containerHeight)
                );
                gradient.addColorStop(0, 'rgba(30, 30, 60, 0.1)');
                gradient.addColorStop(0.5, 'rgba(20, 20, 40, 0.2)');
                gradient.addColorStop(1, 'rgba(10, 10, 20, 0.3)');

                // Apply the gradient
                this.fogCtx.fillStyle = gradient;
                this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
            }

            // Restore the previous state
            this.fogCtx.restore();

            // Add a subtle vignette effect
            this.fogCtx.save();
            this.fogCtx.globalCompositeOperation = 'source-over';

            // Check if container dimensions are valid
            if (!isFinite(this.containerWidth) || !isFinite(this.containerHeight) ||
                this.containerWidth <= 0 || this.containerHeight <= 0) {
                console.warn('Invalid container dimensions for vignette');
                // Skip vignette effect
            } else {
                // Use safe values for the gradient
                const centerX = Math.min(1000, Math.max(0, this.containerWidth / 2)) || 0;
                const centerY = Math.min(1000, Math.max(0, this.containerHeight / 2)) || 0;
                const maxDimension = Math.min(2000, Math.max(this.containerWidth, this.containerHeight)) || 100;

                // Create a radial gradient for the vignette with safe values
                try {
                    const vignette = this.fogCtx.createRadialGradient(
                        centerX, centerY,
                        maxDimension * 0.3, // Inner radius
                        centerX, centerY,
                        maxDimension * 0.7  // Outer radius
                    );
                    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
                    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

                    // Apply the vignette
                    this.fogCtx.fillStyle = vignette;
                    this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
                } catch (gradientError) {
                    console.warn('Error creating vignette gradient:', gradientError.message);
                    // Use a solid color as fallback
                    this.fogCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
                }
            }

            // Restore the previous state
            this.fogCtx.restore();
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
     * @deprecated Use the animated centerOn method below instead
     * This method is kept for backward compatibility
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    // centerOn method moved to line ~1447

    /**
     * Convert canvas X coordinate to map X coordinate
     * @param {number} canvasX - X coordinate on the canvas
     * @returns {number} - X coordinate on the map
     */
    getMapXFromCanvas(canvasX) {
        const { tileSize } = this.options;
        const startX = this.getViewportStartX();
        return startX + canvasX / (tileSize * this.zoom);
    }

    /**
     * Convert canvas Y coordinate to map Y coordinate
     * @param {number} canvasY - Y coordinate on the canvas
     * @returns {number} - Y coordinate on the map
     */
    getMapYFromCanvas(canvasY) {
        const { tileSize } = this.options;
        const startY = this.getViewportStartY();
        return startY + canvasY / (tileSize * this.zoom);
    }

    /**
     * Render zoom level display with additional info
     */
    renderZoomDisplay() {
        // Create or update zoom level display element
        let zoomDisplay = document.getElementById('zoom-level-display');

        if (!zoomDisplay) {
            zoomDisplay = document.createElement('div');
            zoomDisplay.id = 'zoom-level-display';
            this.container.appendChild(zoomDisplay);
        }

        // Get current coordinates
        const centerX = Math.floor(this.viewportX);
        const centerY = Math.floor(this.viewportY);

        // Update zoom level text with coordinates
        zoomDisplay.textContent = `Zoom: ${Math.round(this.zoom * 100)}% | Position: ${centerX},${centerY}`;

        // Add class based on zoom level for styling
        zoomDisplay.className = '';
        if (this.zoom < 0.5) {
            zoomDisplay.classList.add('zoom-out');
        } else if (this.zoom > 1.5) {
            zoomDisplay.classList.add('zoom-in');
        }
    }

    /**
     * Set the zoom level with animation
     * @param {number} targetZoom - Target zoom level
     * @param {number} centerX - X coordinate to center on (optional)
     * @param {number} centerY - Y coordinate to center on (optional)
     */
    setZoom(targetZoom, centerX, centerY) {
        // Clamp zoom level to min/max
        targetZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, targetZoom));

        // If center coordinates are provided, use them as zoom center
        if (centerX !== undefined && centerY !== undefined) {
            this.zoomCenterX = centerX;
            this.zoomCenterY = centerY;
        } else {
            // Otherwise use the center of the viewport
            this.zoomCenterX = this.viewportX;
            this.zoomCenterY = this.viewportY;
        }

        // Store old zoom for viewport adjustment
        const oldZoom = this.zoom;
        this.zoom = targetZoom;

        // Adjust viewport to keep the zoom center point stable
        if (oldZoom !== this.zoom) {
            const zoomRatio = this.zoom / oldZoom;
            const viewportCenterX = this.viewportX;
            const viewportCenterY = this.viewportY;

            this.viewportX = this.zoomCenterX - (this.zoomCenterX - viewportCenterX) / zoomRatio;
            this.viewportY = this.zoomCenterY - (this.zoomCenterY - viewportCenterY) / zoomRatio;

            // Clamp viewport to map boundaries
            this.clampViewport();
        }

        // Resize canvas and re-render
        this.resizeCanvas();
        this.render();

        // Dispatch zoom change event
        const event = new CustomEvent('zoomChange', {
            detail: { zoom: this.zoom }
        });
        this.container.dispatchEvent(event);
    }

    /**
     * Smooth zoom with animation
     * @param {number} targetZoom - Target zoom level
     * @param {number} centerX - X coordinate to center on
     * @param {number} centerY - Y coordinate to center on
     */
    smoothZoom(targetZoom, centerX, centerY) {
        // Clamp zoom level to min/max
        targetZoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, targetZoom));

        // If zoom change is very small, just set it directly
        if (Math.abs(this.zoom - targetZoom) < 0.01) {
            this.setZoom(targetZoom, centerX, centerY);
            return;
        }

        // Store start values for animation
        const startZoom = this.zoom;
        const startTime = Date.now();
        const duration = 200; // Animation duration in ms

        // Store center point for animation
        this.zoomCenterX = centerX !== undefined ? centerX : this.viewportX;
        this.zoomCenterY = centerY !== undefined ? centerY : this.viewportY;

        // Cancel any existing zoom animation
        if (this.zoomAnimationId) {
            cancelAnimationFrame(this.zoomAnimationId);
        }

        // Animate zoom
        const animateZoom = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease function (cubic ease out)
            const ease = 1 - Math.pow(1 - progress, 3);

            // Calculate current zoom
            const currentZoom = startZoom + (targetZoom - startZoom) * ease;

            // Set zoom without animation
            this.setZoom(currentZoom, this.zoomCenterX, this.zoomCenterY);

            // Continue animation if not complete
            if (progress < 1) {
                this.zoomAnimationId = requestAnimationFrame(animateZoom);
            } else {
                this.zoomAnimationId = null;
            }
        };

        // Start animation
        this.zoomAnimationId = requestAnimationFrame(animateZoom);
    }

    /**
     * Center the map on a specific location with smooth animation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} targetZoom - Optional zoom level to set
     */
    centerOn(x, y, targetZoom) {
        // Store current position for animation
        const startX = this.viewportX;
        const startY = this.viewportY;
        const startZoom = this.zoom;

        // Set target zoom if provided
        const endZoom = targetZoom !== undefined ?
            Math.max(this.options.minZoom, Math.min(this.options.maxZoom, targetZoom)) :
            this.zoom;

        // Animate the transition
        const duration = 500; // ms
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease function (cubic ease out)
            const ease = 1 - Math.pow(1 - progress, 3);

            // Interpolate position and zoom
            this.viewportX = startX + (x - startX) * ease;
            this.viewportY = startY + (y - startY) * ease;

            if (targetZoom !== undefined) {
                this.zoom = startZoom + (endZoom - startZoom) * ease;
            }

            // Clamp viewport and render
            this.clampViewport();
            this.render();

            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final position is exact
                this.viewportX = x;
                this.viewportY = y;
                if (targetZoom !== undefined) {
                    this.zoom = endZoom;
                }
                this.clampViewport();
                this.render();
            }
        };

        // Start animation
        animate();
    }

    /**
     * Render resources on the map
     */
    renderResources() {
        try {
            // Only render resources at higher zoom levels
            if (this.zoom < 0.8) return;

            const { tileSize } = this.options;
            const startX = Math.floor(this.getViewportStartX());
            const startY = Math.floor(this.getViewportStartY());
            const endX = Math.ceil(startX + this.options.viewportWidth);
            const endY = Math.ceil(startY + this.options.viewportHeight);

            // Set up overlay context
            this.overlayCtx.save();
            this.overlayCtx.font = `${Math.floor(10 * this.zoom)}px Arial`;
            this.overlayCtx.textAlign = 'center';
            this.overlayCtx.textBaseline = 'middle';

            // Loop through visible tiles
            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    // Skip if out of bounds
                    if (x < 0 || x >= this.mapSystem.config.width || y < 0 || y >= this.mapSystem.config.height) {
                        continue;
                    }

                    // Skip if not explored
                    const explorationLevel = this.mapSystem.getExplorationLevel(x, y);
                    if (explorationLevel < 1) continue;

                    // Get terrain at this location
                    const terrain = this.mapSystem.getTerrainAt(x, y);
                    if (!terrain || !terrain.resourceModifiers) continue;

                    // Calculate position on canvas
                    const canvasX = (x - startX) * tileSize * this.zoom;
                    const canvasY = (y - startY) * tileSize * this.zoom;

                    // Draw resource indicators based on terrain type
                    if (terrain.resourceModifiers.FOOD > 1.2) {
                        this.overlayCtx.fillStyle = 'rgba(76, 175, 80, 0.7)';
                        this.overlayCtx.fillText('🌾', canvasX + tileSize * this.zoom * 0.25, canvasY + tileSize * this.zoom * 0.25);
                    }

                    if (terrain.resourceModifiers.ORE > 1.2) {
                        this.overlayCtx.fillStyle = 'rgba(158, 158, 158, 0.7)';
                        this.overlayCtx.fillText('⛏️', canvasX + tileSize * this.zoom * 0.75, canvasY + tileSize * this.zoom * 0.25);
                    }

                    if (terrain.resourceModifiers.WOOD && terrain.resourceModifiers.WOOD > 1.2) {
                        this.overlayCtx.fillStyle = 'rgba(121, 85, 72, 0.7)';
                        this.overlayCtx.fillText('🪵', canvasX + tileSize * this.zoom * 0.25, canvasY + tileSize * this.zoom * 0.75);
                    }

                    if (terrain.resourceModifiers.CRYSTAL && terrain.resourceModifiers.CRYSTAL > 1.0) {
                        this.overlayCtx.fillStyle = 'rgba(156, 39, 176, 0.7)';
                        this.overlayCtx.fillText('💎', canvasX + tileSize * this.zoom * 0.75, canvasY + tileSize * this.zoom * 0.75);
                    }
                }
            }

            this.overlayCtx.restore();
        } catch (error) {
            console.error('Error rendering resources:', error);
        }
    }

    /**
     * Render territories on the map
     */
    renderTerritories() {
        try {
            // Get game state from map system
            const gameState = this.mapSystem.gameState;
            if (!gameState || !gameState.claimedTerritories || gameState.claimedTerritories.length === 0) {
                return; // No territories to render
            }

            const { tileSize } = this.options;
            const startX = Math.floor(this.getViewportStartX());
            const startY = Math.floor(this.getViewportStartY());

            // Set up overlay context
            this.overlayCtx.save();

            // Render each territory
            for (const territory of gameState.claimedTerritories) {
                const { x, y, radius } = territory;

                // Calculate position on canvas
                const canvasX = (x - startX) * tileSize * this.zoom;
                const canvasY = (y - startY) * tileSize * this.zoom;

                // Draw territory border
                this.overlayCtx.strokeStyle = 'rgba(33, 150, 243, 0.8)';
                this.overlayCtx.lineWidth = 2 * this.zoom;
                this.overlayCtx.beginPath();
                this.overlayCtx.arc(
                    canvasX + tileSize * this.zoom / 2,
                    canvasY + tileSize * this.zoom / 2,
                    radius * tileSize * this.zoom,
                    0, Math.PI * 2
                );
                this.overlayCtx.stroke();

                // Draw territory fill
                this.overlayCtx.fillStyle = 'rgba(33, 150, 243, 0.1)';
                this.overlayCtx.fill();

                // Draw territory center marker
                this.overlayCtx.fillStyle = 'rgba(33, 150, 243, 0.8)';
                this.overlayCtx.beginPath();
                this.overlayCtx.arc(
                    canvasX + tileSize * this.zoom / 2,
                    canvasY + tileSize * this.zoom / 2,
                    4 * this.zoom,
                    0, Math.PI * 2
                );
                this.overlayCtx.fill();
            }

            this.overlayCtx.restore();
        } catch (error) {
            console.error('Error rendering territories:', error);
        }
    }

    /**
     * Render battles on the map
     */
    renderBattles() {
        try {
            // Get game state from map system
            const gameState = this.mapSystem.gameState;
            if (!gameState || !gameState.battles || gameState.battles.length === 0) {
                return; // No battles to render
            }

            const { tileSize } = this.options;
            const startX = Math.floor(this.getViewportStartX());
            const startY = Math.floor(this.getViewportStartY());

            // Set up overlay context
            this.overlayCtx.save();

            // Get current time for animations
            const now = Date.now();

            // Render each battle
            for (const battle of gameState.battles) {
                // Skip completed battles
                if (battle.completed) continue;

                const { location } = battle;
                if (!location) continue;

                // Calculate position on canvas
                const canvasX = (location.x - startX) * tileSize * this.zoom;
                const canvasY = (location.y - startY) * tileSize * this.zoom;

                // Calculate animation phase (0-1) based on time
                const animPhase = (now % 2000) / 2000;
                const size = (0.8 + Math.sin(animPhase * Math.PI * 2) * 0.2) * tileSize * this.zoom;

                // Draw battle indicator
                this.overlayCtx.strokeStyle = 'rgba(244, 67, 54, 0.8)';
                this.overlayCtx.lineWidth = 2 * this.zoom;
                this.overlayCtx.beginPath();
                this.overlayCtx.arc(
                    canvasX + tileSize * this.zoom / 2,
                    canvasY + tileSize * this.zoom / 2,
                    size / 2,
                    0, Math.PI * 2
                );
                this.overlayCtx.stroke();

                // Draw crossed swords icon
                if (this.zoom >= 0.8) {
                    this.overlayCtx.font = `${Math.floor(16 * this.zoom)}px Arial`;
                    this.overlayCtx.textAlign = 'center';
                    this.overlayCtx.textBaseline = 'middle';
                    this.overlayCtx.fillStyle = 'rgba(244, 67, 54, 0.9)';
                    this.overlayCtx.fillText(
                        '⚔️',
                        canvasX + tileSize * this.zoom / 2,
                        canvasY + tileSize * this.zoom / 2
                    );
                }
            }

            this.overlayCtx.restore();
        } catch (error) {
            console.error('Error rendering battles:', error);
        }
    }

    /**
     * Set whether to show fog of war
     * @param {boolean} show - Whether to show fog of war
     */
    setFogOfWar(show) {
        this.options.showFogOfWar = show;
        this.render();
    }

    /**
     * Set whether to show grid
     * @param {boolean} show - Whether to show grid
     */
    setShowGrid(show) {
        this.options.showGrid = show;
        this.render();
    }

    /**
     * Set whether to show resources
     * @param {boolean} show - Whether to show resources
     */
    setShowResources(show) {
        this.options.showResources = show;
        this.render();
    }

    /**
     * Set whether to show territories
     * @param {boolean} show - Whether to show territories
     */
    setShowTerritories(show) {
        this.options.showTerritories = show;
        this.render();
    }

    /**
     * Set selected tile
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setSelectedTile(x, y) {
        this.selectedTile = { x, y };
        this.render();
    }

    /**
     * Render selected tile
     */
    renderSelectedTile() {
        if (!this.selectedTile) return;

        const { x, y } = this.selectedTile;
        const { tileSize } = this.options;
        const startX = Math.floor(this.getViewportStartX());
        const startY = Math.floor(this.getViewportStartY());

        // Skip if selected tile is not in viewport
        if (x < startX || x >= startX + this.options.viewportWidth ||
            y < startY || y >= startY + this.options.viewportHeight) {
            return;
        }

        // Calculate position on canvas
        const canvasX = (x - startX) * tileSize * this.zoom;
        const canvasY = (y - startY) * tileSize * this.zoom;

        // Draw selection highlight
        this.overlayCtx.save();

        // Outer glow
        this.overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.overlayCtx.lineWidth = 2 * this.zoom;
        this.overlayCtx.strokeRect(
            canvasX - 1,
            canvasY - 1,
            tileSize * this.zoom + 2,
            tileSize * this.zoom + 2
        );

        // Inner highlight
        this.overlayCtx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        this.overlayCtx.lineWidth = 1 * this.zoom;
        this.overlayCtx.strokeRect(
            canvasX + 1,
            canvasY + 1,
            tileSize * this.zoom - 2,
            tileSize * this.zoom - 2
        );

        this.overlayCtx.restore();
    }

    /**
     * Clean up resources when the renderer is no longer needed
     */
    dispose() {
        // Stop animation loop
        this.stopAnimationLoop();

        // Remove canvases from container
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        if (this.fogCanvas && this.fogCanvas.parentNode) {
            this.fogCanvas.parentNode.removeChild(this.fogCanvas);
        }
        if (this.overlayCanvas && this.overlayCanvas.parentNode) {
            this.overlayCanvas.parentNode.removeChild(this.overlayCanvas);
        }
    }
}

// Export the MapRenderer class
if (typeof module !== 'undefined') {
    module.exports = { MapRenderer };
}
