/**
 * Minimap for Pixel Empires
 * Provides a small overview of the entire map
 */
class Minimap {
    /**
     * Initialize the minimap
     * @param {MapSystem} mapSystem - The map system
     * @param {HTMLElement} container - The container element for the minimap
     * @param {Object} options - Minimap options
     */
    constructor(mapSystem, container, options = {}) {
        this.mapSystem = mapSystem;
        this.container = container;

        // Default options
        this.options = {
            width: 150,
            height: 100,
            borderWidth: 2,
            borderColor: '#ffffff',
            ...options
        };

        // Initialize canvas
        this.initializeCanvas();

        // Bind event handlers
        this.bindEvents();

        // Initial render
        this.render();
    }

    /**
     * Initialize the canvas element
     */
    initializeCanvas() {
        // Create container div for minimap and legend
        this.minimapContainer = document.createElement('div');
        this.minimapContainer.className = 'minimap-container';
        this.container.appendChild(this.minimapContainer);

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'minimap-canvas';
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.minimapContainer.appendChild(this.canvas);

        // Set canvas style
        this.canvas.style.width = `${this.options.width}px`;
        this.canvas.style.height = `${this.options.height}px`;
        this.canvas.style.border = `${this.options.borderWidth}px solid ${this.options.borderColor}`;
        this.canvas.style.backgroundColor = '#000';
        this.canvas.style.borderRadius = '4px';
        this.canvas.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

        // Get canvas context
        this.ctx = this.canvas.getContext('2d');

        // Create legend container
        this.legendContainer = document.createElement('div');
        this.legendContainer.className = 'minimap-legend';
        this.legendContainer.style.marginTop = '5px';
        this.legendContainer.style.fontSize = '10px';
        this.legendContainer.style.color = '#fff';
        this.minimapContainer.appendChild(this.legendContainer);

        // Initialize legend
        this.updateLegend();
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Click on minimap to move viewport
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Convert pixel coordinates to map coordinates
            const mapX = Math.floor((x / this.options.width) * this.mapSystem.config.width);
            const mapY = Math.floor((y / this.options.height) * this.mapSystem.config.height);

            // Dispatch event to center the main map on this location
            const event = new CustomEvent('minimapClick', {
                detail: { x: mapX, y: mapY }
            });

            this.container.dispatchEvent(event);
        });

        // Add hover effect to show coordinates
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Convert pixel coordinates to map coordinates
            const mapX = Math.floor((x / this.options.width) * this.mapSystem.config.width);
            const mapY = Math.floor((y / this.options.height) * this.mapSystem.config.height);

            // Update coordinate display
            let coordDisplay = document.getElementById('minimap-coords');
            if (!coordDisplay) {
                coordDisplay = document.createElement('div');
                coordDisplay.id = 'minimap-coords';
                coordDisplay.className = 'minimap-coords';
                this.container.appendChild(coordDisplay);
            }

            coordDisplay.textContent = `X: ${mapX}, Y: ${mapY}`;
            coordDisplay.style.left = `${x + 10}px`;
            coordDisplay.style.top = `${y + 10}px`;
            coordDisplay.style.display = 'block';
        });

        // Hide coordinates when mouse leaves
        this.canvas.addEventListener('mouseleave', () => {
            const coordDisplay = document.getElementById('minimap-coords');
            if (coordDisplay) {
                coordDisplay.style.display = 'none';
            }
        });
    }

    /**
     * Render the minimap with exploration levels and enhanced details
     * @param {Object} viewportInfo - Information about the main map viewport
     */
    render(viewportInfo = null) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate pixel size
        const pixelWidth = this.options.width / this.mapSystem.config.width;
        const pixelHeight = this.options.height / this.mapSystem.config.height;

        // Draw unexplored background with subtle pattern
        this.drawUnexploredBackground();

        // Render terrain based on exploration level
        for (let y = 0; y < this.mapSystem.config.height; y++) {
            for (let x = 0; x < this.mapSystem.config.width; x++) {
                // Get exploration level
                const explorationLevel = this.mapSystem.getExplorationLevel(x, y);

                // Skip if completely unexplored
                if (explorationLevel === 0) continue;

                // Calculate pixel position
                const pixelX = x * pixelWidth;
                const pixelY = y * pixelHeight;

                if (explorationLevel === 2) {
                    // Fully explored - show actual terrain with enhanced visuals
                    const terrainId = this.mapSystem.mapData.terrain[y][x];
                    const terrain = this.mapSystem.terrainTypes[terrainId];

                    if (terrain) {
                        // Fill with terrain color
                        this.ctx.fillStyle = terrain.color;
                        this.ctx.fillRect(pixelX, pixelY, pixelWidth + 0.5, pixelHeight + 0.5);

                        // Add terrain pattern/texture based on terrain type
                        this.addTerrainPattern(pixelX, pixelY, pixelWidth, pixelHeight, terrainId);
                    }
                } else if (explorationLevel === 1) {
                    // Partially explored - show faded terrain with memory effect
                    const lastSeenTerrain = this.mapSystem.getLastSeenTerrain(x, y);

                    if (lastSeenTerrain) {
                        const terrain = this.mapSystem.terrainTypes[lastSeenTerrain];
                        if (terrain) {
                            // Create a faded version of the terrain color
                            const color = terrain.color;
                            this.ctx.fillStyle = this.fadeColor(color, 0.5);
                            this.ctx.fillRect(pixelX, pixelY, pixelWidth + 0.5, pixelHeight + 0.5);

                            // Add subtle fog effect
                            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                            this.ctx.fillRect(pixelX, pixelY, pixelWidth + 0.5, pixelHeight + 0.5);
                        }
                    } else {
                        // If no last seen terrain, use a gray color
                        this.ctx.fillStyle = '#444444';
                        this.ctx.fillRect(pixelX, pixelY, pixelWidth + 0.5, pixelHeight + 0.5);
                    }
                }
            }
        }

        // Render resource nodes and points of interest
        this.renderResourceNodes(pixelWidth, pixelHeight);

        // Render special locations with enhanced visuals
        this.renderSpecialLocations(pixelWidth, pixelHeight);

        // Render viewport rectangle if provided
        if (viewportInfo) {
            const { viewportX, viewportY, viewportWidth, viewportHeight, zoom } = viewportInfo;

            // Calculate viewport rectangle
            const vpX = (viewportX - viewportWidth / 2) * pixelWidth;
            const vpY = (viewportY - viewportHeight / 2) * pixelHeight;
            const vpWidth = viewportWidth * pixelWidth;
            const vpHeight = viewportHeight * pixelHeight;

            // Draw viewport rectangle with enhanced visuals
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(vpX, vpY, vpWidth, vpHeight);

            // Add inner highlight with color based on zoom level
            // Red for zoomed out, green for normal zoom, blue for zoomed in
            let highlightColor;
            if (zoom && zoom < 0.8) {
                highlightColor = 'rgba(255, 0, 0, 0.5)'; // Red for zoomed out
            } else if (zoom && zoom > 1.5) {
                highlightColor = 'rgba(0, 0, 255, 0.5)'; // Blue for zoomed in
            } else {
                highlightColor = 'rgba(0, 255, 0, 0.5)'; // Green for normal zoom
            }

            this.ctx.strokeStyle = highlightColor;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(vpX + 1, vpY + 1, vpWidth - 2, vpHeight - 2);

            // Update legend with current viewport info
            this.updateLegend(viewportInfo);
        }
    }

    /**
     * Draw the unexplored background with a subtle pattern
     */
    drawUnexploredBackground() {
        // Fill with base color
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle pattern
        this.ctx.fillStyle = '#0a0a0a';

        const patternSize = 4;
        for (let y = 0; y < this.canvas.height; y += patternSize * 2) {
            for (let x = 0; x < this.canvas.width; x += patternSize * 2) {
                this.ctx.fillRect(x, y, patternSize, patternSize);
                this.ctx.fillRect(x + patternSize, y + patternSize, patternSize, patternSize);
            }
        }
    }

    /**
     * Add terrain pattern/texture based on terrain type
     */
    addTerrainPattern(x, y, width, height, terrainId) {
        // Skip if pixel is too small
        if (width < 2 || height < 2) return;

        const patternAlpha = 0.3;

        switch (terrainId) {
            case 'MOUNTAINS':
            case 'HILLS':
                // Add triangle pattern for mountains/hills
                this.ctx.fillStyle = `rgba(255, 255, 255, ${patternAlpha})`;
                this.ctx.beginPath();
                this.ctx.moveTo(x + width/2, y);
                this.ctx.lineTo(x + width, y + height);
                this.ctx.lineTo(x, y + height);
                this.ctx.closePath();
                this.ctx.fill();
                break;

            case 'FOREST':
            case 'JUNGLE':
                // Add dots for forests
                this.ctx.fillStyle = `rgba(0, 0, 0, ${patternAlpha})`;
                this.ctx.beginPath();
                this.ctx.arc(x + width/2, y + height/2, width/4, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 'WATER':
            case 'COASTAL':
                // Add wave pattern for water
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${patternAlpha})`;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + height/2);
                this.ctx.lineTo(x + width/3, y + height/3);
                this.ctx.lineTo(x + width*2/3, y + height*2/3);
                this.ctx.lineTo(x + width, y + height/2);
                this.ctx.stroke();
                break;

            case 'DESERT':
            case 'SAVANNA':
                // Add dot pattern for desert/savanna
                this.ctx.fillStyle = `rgba(0, 0, 0, ${patternAlpha})`;
                this.ctx.fillRect(x + width/3, y + height/3, width/3, height/3);
                break;

            case 'SNOW':
                // Add sparkle for snow
                this.ctx.fillStyle = `rgba(255, 255, 255, ${patternAlpha + 0.2})`;
                this.ctx.fillRect(x + width/4, y + height/4, width/2, height/2);
                break;

            case 'VOLCANIC':
                // Add red glow for volcanic
                this.ctx.fillStyle = `rgba(255, 0, 0, ${patternAlpha})`;
                this.ctx.beginPath();
                this.ctx.arc(x + width/2, y + height/2, width/3, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
    }

    /**
     * Render resource nodes on the minimap
     */
    renderResourceNodes(pixelWidth, pixelHeight) {
        // Find all resource-type special locations
        const resourceLocations = this.mapSystem.mapData.specialLocations.filter(loc => {
            const locationType = this.mapSystem.specialLocationTypes[loc.type];
            return locationType && locationType.interactionType === 'HARVEST' && loc.discovered;
        });

        // Render each resource node
        for (const location of resourceLocations) {
            // Skip if not visible
            const explorationLevel = this.mapSystem.getExplorationLevel(location.x, location.y);
            if (explorationLevel === 0) continue;

            // Calculate pixel position
            const pixelX = location.x * pixelWidth;
            const pixelY = location.y * pixelHeight;

            // Draw resource node (yellow dot)
            this.ctx.fillStyle = '#ffcc00';
            this.ctx.beginPath();
            this.ctx.arc(
                pixelX + pixelWidth/2,
                pixelY + pixelHeight/2,
                Math.max(1, pixelWidth/2),
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    /**
     * Render special locations with enhanced visuals
     */
    renderSpecialLocations(pixelWidth, pixelHeight) {
        // Group locations by type for the legend
        const locationCounts = {};

        for (const location of this.mapSystem.mapData.specialLocations) {
            // Skip resource nodes (already rendered)
            const locationType = this.mapSystem.specialLocationTypes[location.type];
            if (locationType && locationType.interactionType === 'HARVEST') continue;

            // Skip if not at least partially visible
            const explorationLevel = this.mapSystem.getExplorationLevel(location.x, location.y);
            if (explorationLevel === 0) continue;

            // Count for legend
            if (location.discovered) {
                locationCounts[location.type] = (locationCounts[location.type] || 0) + 1;
            }

            // Calculate pixel position
            const pixelX = location.x * pixelWidth;
            const pixelY = location.y * pixelHeight;

            // Determine color based on location type and discovery state
            let color;
            if (location.discovered) {
                if (location.fullyDiscovered) {
                    // Color based on location type
                    switch (locationType.interactionType) {
                        case 'EXPLORE': color = '#ffffff'; break; // White for exploration
                        case 'COMBAT': color = '#ff4444'; break;  // Red for combat
                        case 'DIPLOMACY': color = '#44ff44'; break; // Green for diplomacy
                        case 'TRADE': color = '#4444ff'; break; // Blue for trade
                        case 'QUEST': color = '#ff44ff'; break; // Purple for quests
                        case 'USE': color = '#44ffff'; break; // Cyan for usable locations
                        default: color = '#ffffff';
                    }
                } else {
                    // Partially discovered - light version of the color
                    color = '#aaaaaa';
                }
            } else if (explorationLevel === 1) {
                // Visible but not discovered - dark gray
                color = '#666666';
            }

            // Draw location marker with enhanced visuals
            if (pixelWidth >= 2 && pixelHeight >= 2) {
                // Draw diamond shape for larger pixels
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.moveTo(pixelX + pixelWidth/2, pixelY);
                this.ctx.lineTo(pixelX + pixelWidth, pixelY + pixelHeight/2);
                this.ctx.lineTo(pixelX + pixelWidth/2, pixelY + pixelHeight);
                this.ctx.lineTo(pixelX, pixelY + pixelHeight/2);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                // Simple square for small pixels
                this.ctx.fillStyle = color;
                this.ctx.fillRect(pixelX, pixelY, pixelWidth + 0.5, pixelHeight + 0.5);
            }
        }

        // Store location counts for legend
        this.locationCounts = locationCounts;
    }

    /**
     * Fade a color by a given amount
     * @param {string} color - The color to fade (hex or rgb)
     * @param {number} opacity - The opacity level (0-1)
     * @returns {string} - The faded color
     */
    fadeColor(color, opacity) {
        // Handle hex colors
        if (color.startsWith('#')) {
            // Convert hex to rgb
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);

            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        // Handle rgb colors
        if (color.startsWith('rgb')) {
            // Extract rgb values
            const match = color.match(/\d+/g);
            if (match && match.length >= 3) {
                const [r, g, b] = match.map(Number);
                return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            }
        }

        // Fallback
        return color;
    }

    /**
     * Update the minimap with viewport information
     * @param {Object} viewportInfo - Information about the main map viewport
     */
    update(viewportInfo) {
        this.render(viewportInfo);
    }

    /**
     * Update the legend with current information
     * @param {Object} viewportInfo - Information about the main map viewport
     */
    updateLegend(viewportInfo = null) {
        // Clear legend
        this.legendContainer.innerHTML = '';

        // Create legend title
        const title = document.createElement('div');
        title.textContent = 'MINIMAP LEGEND';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '3px';
        title.style.borderBottom = '1px solid #555';
        this.legendContainer.appendChild(title);

        // Add terrain types section
        const terrainSection = document.createElement('div');
        terrainSection.style.marginTop = '3px';
        terrainSection.style.display = 'flex';
        terrainSection.style.flexWrap = 'wrap';
        terrainSection.style.gap = '3px';

        // Add most common terrain types
        const commonTerrains = ['PLAINS', 'FOREST', 'MOUNTAINS', 'WATER', 'DESERT'];
        for (const terrainId of commonTerrains) {
            const terrain = this.mapSystem.terrainTypes[terrainId];
            if (!terrain) continue;

            const terrainItem = document.createElement('div');
            terrainItem.style.display = 'flex';
            terrainItem.style.alignItems = 'center';
            terrainItem.style.marginRight = '5px';

            const colorBox = document.createElement('div');
            colorBox.style.width = '8px';
            colorBox.style.height = '8px';
            colorBox.style.backgroundColor = terrain.color;
            colorBox.style.marginRight = '3px';

            terrainItem.appendChild(colorBox);
            terrainItem.appendChild(document.createTextNode(terrain.name));
            terrainSection.appendChild(terrainItem);
        }

        this.legendContainer.appendChild(terrainSection);

        // Add special locations section if any are discovered
        if (this.locationCounts && Object.keys(this.locationCounts).length > 0) {
            const locationsTitle = document.createElement('div');
            locationsTitle.textContent = 'Discovered Locations:';
            locationsTitle.style.marginTop = '3px';
            locationsTitle.style.fontWeight = 'bold';
            this.legendContainer.appendChild(locationsTitle);

            const locationsSection = document.createElement('div');
            locationsSection.style.display = 'flex';
            locationsSection.style.flexWrap = 'wrap';
            locationsSection.style.gap = '3px';

            // Add discovered location types
            for (const [locType, count] of Object.entries(this.locationCounts)) {
                const locationType = this.mapSystem.specialLocationTypes[locType];
                if (!locationType) continue;

                const locationItem = document.createElement('div');
                locationItem.style.display = 'flex';
                locationItem.style.alignItems = 'center';
                locationItem.style.marginRight = '5px';

                const icon = document.createElement('span');
                icon.textContent = locationType.icon;
                icon.style.marginRight = '3px';
                icon.style.fontSize = '12px';

                locationItem.appendChild(icon);
                locationItem.appendChild(document.createTextNode(`${count}`));
                locationsSection.appendChild(locationItem);
            }

            this.legendContainer.appendChild(locationsSection);
        }

        // Add viewport info if available
        if (viewportInfo) {
            const { viewportX, viewportY, zoom } = viewportInfo;

            const coordsInfo = document.createElement('div');
            coordsInfo.textContent = `Viewing: X:${Math.floor(viewportX)}, Y:${Math.floor(viewportY)}`;
            coordsInfo.style.marginTop = '3px';
            coordsInfo.style.fontSize = '9px';
            coordsInfo.style.color = '#aaa';
            this.legendContainer.appendChild(coordsInfo);

            // Add zoom level info if available
            if (zoom) {
                const zoomInfo = document.createElement('div');
                zoomInfo.textContent = `Zoom: ${Math.round(zoom * 100)}%`;
                zoomInfo.style.fontSize = '9px';
                zoomInfo.style.color = '#aaa';
                this.legendContainer.appendChild(zoomInfo);
            }
        }
    }
}

// Export the Minimap class
if (typeof module !== 'undefined') {
    module.exports = { Minimap };
}
