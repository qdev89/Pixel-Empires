/**
 * Map UI for Pixel Empires
 * Handles the map interface and interactions
 */
class MapUI {
    /**
     * Initialize the map UI
     * @param {GameState} gameState - The game state
     * @param {UIManager} uiManager - The UI manager
     */
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;

        // Set initial state
        this.showFogOfWar = true;
        this.showGrid = true;
        this.showCoordinates = false;

        // Initialize map system first
        this.mapSystem = new MapSystem({
            width: 50,
            height: 50,
            seed: Math.floor(Math.random() * 1000000)
        });

        // Add additional terrain types
        this.addAdditionalTerrainTypes();

        // Add more special location types
        this.addAdditionalLocationTypes();

        // Initialize UI elements
        this.initializeUI();

        // Make sure the map tab is visible
        const mapTab = document.getElementById('map-tab');
        if (mapTab) {
            mapTab.style.display = 'block';
        }

        // Make sure the map container is visible
        if (this.mapContainer) {
            this.mapContainer.style.display = 'block';
            this.mapContainer.style.width = '100%';
            this.mapContainer.style.height = '400px';
            this.mapContainer.style.minHeight = '300px';
            this.mapContainer.style.backgroundColor = '#1a1a2e';
            this.mapContainer.style.position = 'relative';
            this.mapContainer.style.overflow = 'hidden';
        }

        // Initialize map renderer with a delay to ensure DOM is ready
        setTimeout(() => {
            // Initialize map renderer
            this.initializeMapRenderer();

            // Bind event handlers after map renderer is initialized
            this.bindEvents();

            // Initialize minimap after map renderer
            setTimeout(() => {
                this.initializeMinimap();

                // Explore starting area after everything is initialized
                setTimeout(() => {
                    this.exploreStartingArea();

                    // Start periodic updates for exploration memory decay
                    this.startExplorationMemoryUpdates();

                    // Load map test script for development and testing
                    this.loadMapTestScript();
                }, 500);
            }, 500);
        }, 1000); // Longer delay to ensure DOM is fully ready
    }

    /**
     * Initialize the UI elements
     */
    initializeUI() {
        // Get map container elements
        this.mapContainer = document.getElementById('game-map');
        this.minimapContainer = document.getElementById('minimap');

        // Get control buttons
        this.zoomInButton = document.getElementById('zoom-in');
        this.zoomOutButton = document.getElementById('zoom-out');
        this.centerMapButton = document.getElementById('center-map');
        this.toggleFogButton = document.getElementById('toggle-fog');
        this.toggleGridButton = document.getElementById('toggle-grid');

        // Get location info elements
        this.selectedTerrainElement = document.getElementById('selected-terrain');
        this.selectedLocationElement = document.getElementById('selected-location');
        this.exploreLocationButton = document.getElementById('explore-location');
        this.interactLocationButton = document.getElementById('interact-location');
    }

    /**
     * Initialize the map renderer
     */
    initializeMapRenderer() {
        // Ensure the map container is visible and has dimensions before initializing
        if (!this.mapContainer) {
            console.error('Map container not found');
            return;
        }

        // Force the container to be visible with explicit dimensions
        this.mapContainer.style.display = 'block';
        this.mapContainer.style.width = '100%';
        this.mapContainer.style.height = '400px';
        this.mapContainer.style.minHeight = '300px';
        this.mapContainer.style.backgroundColor = '#1a1a2e';
        this.mapContainer.style.position = 'relative';
        this.mapContainer.style.overflow = 'hidden';

        // Add a loading message to the container
        const loadingMessage = document.createElement('div');
        loadingMessage.textContent = 'Initializing Map...';
        loadingMessage.style.position = 'absolute';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.fontSize = '18px';
        loadingMessage.style.fontWeight = 'bold';
        loadingMessage.style.zIndex = '1000';
        this.mapContainer.appendChild(loadingMessage);

        // Add a small delay to ensure the container is properly rendered
        setTimeout(() => {
            try {
                // Create map renderer with improved options
                this.mapRenderer = new MapRenderer(this.mapSystem, this.mapContainer, {
                    tileSize: 32,
                    viewportWidth: 15,
                    viewportHeight: 10,
                    showGrid: this.showGrid,
                    showCoordinates: false,
                    minZoom: 0.3,  // Lower minimum zoom for better overview
                    maxZoom: 3.0,  // Higher maximum zoom for better detail
                    zoomStep: 0.15 // Smoother zoom steps
                });

                // Remove the loading message
                if (loadingMessage.parentNode) {
                    loadingMessage.parentNode.removeChild(loadingMessage);
                }

                // Ensure the map is properly sized after initialization
                if (this.mapRenderer) {
                    this.mapRenderer.resizeCanvas();
                    this.mapRenderer.render();
                }

                // Log success message
                console.log('Map renderer initialized successfully');
            } catch (error) {
                console.error('Error initializing map renderer:', error);
                // Remove the loading message on error
                if (loadingMessage.parentNode) {
                    loadingMessage.parentNode.removeChild(loadingMessage);
                }
                // Add error message
                const errorMessage = document.createElement('div');
                errorMessage.textContent = 'Failed to initialize map. Please refresh the page.';
                errorMessage.style.position = 'absolute';
                errorMessage.style.top = '50%';
                errorMessage.style.left = '50%';
                errorMessage.style.transform = 'translate(-50%, -50%)';
                errorMessage.style.color = 'red';
                errorMessage.style.fontSize = '16px';
                errorMessage.style.fontWeight = 'bold';
                errorMessage.style.zIndex = '1000';
                this.mapContainer.appendChild(errorMessage);
            }
        }, 500); // Longer delay to ensure DOM is ready
    }

    /**
     * Initialize the minimap
     */
    initializeMinimap() {
        // Check if minimap container exists
        if (!this.minimapContainer) {
            console.warn('Minimap container not found, skipping minimap initialization');
            return;
        }

        // Create minimap with a small delay to ensure map renderer is initialized
        setTimeout(() => {
            try {
                // Create minimap
                this.minimap = new Minimap(this.mapSystem, this.minimapContainer);

                // Update minimap with viewport info only if map renderer is initialized
                if (this.mapRenderer) {
                    this.updateMinimap();
                }
            } catch (error) {
                console.error('Error initializing minimap:', error);
            }
        }, 200); // Delay minimap initialization
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Zoom in button with improved zoom steps and animation
        this.zoomInButton.addEventListener('click', () => {
            const newZoom = this.mapRenderer.zoom * (1 + this.mapRenderer.options.zoomStep);
            this.mapRenderer.setZoom(newZoom);
            this.updateMinimap();
        });

        // Zoom out button with improved zoom steps and animation
        this.zoomOutButton.addEventListener('click', () => {
            const newZoom = this.mapRenderer.zoom * (1 - this.mapRenderer.options.zoomStep);
            this.mapRenderer.setZoom(newZoom);
            this.updateMinimap();
        });

        // Center map button with animation
        this.centerMapButton.addEventListener('click', () => {
            // Center on the middle of the map with a nice animation
            const centerX = Math.floor(this.mapSystem.config.width / 2);
            const centerY = Math.floor(this.mapSystem.config.height / 2);
            this.mapRenderer.centerOn(centerX, centerY, 1.0); // Reset to default zoom
            this.updateMinimap();
        });

        // Toggle fog of war button
        this.toggleFogButton.addEventListener('click', () => {
            this.showFogOfWar = !this.showFogOfWar;
            this.toggleFogButton.textContent = this.showFogOfWar ? 'Hide Fog of War' : 'Show Fog of War';
            this.mapRenderer.render();
        });

        // Toggle grid button
        this.toggleGridButton.addEventListener('click', () => {
            this.showGrid = !this.showGrid;
            this.toggleGridButton.textContent = this.showGrid ? 'Hide Grid' : 'Show Grid';
            this.mapRenderer.options.showGrid = this.showGrid;
            this.mapRenderer.render();
        });

        // Add toggle coordinates button event
        document.getElementById('toggle-grid').addEventListener('dblclick', () => {
            this.showCoordinates = !this.showCoordinates;
            this.mapRenderer.options.showCoordinates = this.showCoordinates;
            this.mapRenderer.render();
            this.uiManager.showMessage(this.showCoordinates ? 'Coordinates shown' : 'Coordinates hidden');
        });

        // Minimap click event with smooth animation
        this.minimapContainer.addEventListener('minimapClick', (e) => {
            const { x, y } = e.detail;
            this.mapRenderer.centerOn(x, y); // Use the new animated centerOn method
            this.updateMinimap();
        });

        // Add keyboard navigation for the map
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard navigation when map is visible
            if (!this.mapContainer.offsetParent) return;

            const moveAmount = 1.0; // Base movement amount in tiles
            const zoomAdjustedMove = moveAmount / this.mapRenderer.zoom; // Adjust for zoom level
            let handled = true;

            switch (e.key) {
                case 'ArrowUp':
                    this.mapRenderer.viewportY -= zoomAdjustedMove;
                    break;
                case 'ArrowDown':
                    this.mapRenderer.viewportY += zoomAdjustedMove;
                    break;
                case 'ArrowLeft':
                    this.mapRenderer.viewportX -= zoomAdjustedMove;
                    break;
                case 'ArrowRight':
                    this.mapRenderer.viewportX += zoomAdjustedMove;
                    break;
                case '+':
                case '=':
                    const newZoomIn = this.mapRenderer.zoom * (1 + this.mapRenderer.options.zoomStep);
                    this.mapRenderer.setZoom(newZoomIn);
                    break;
                case '-':
                case '_':
                    const newZoomOut = this.mapRenderer.zoom * (1 - this.mapRenderer.options.zoomStep);
                    this.mapRenderer.setZoom(newZoomOut);
                    break;
                case 'Home':
                    // Center on the middle of the map
                    const centerX = Math.floor(this.mapSystem.config.width / 2);
                    const centerY = Math.floor(this.mapSystem.config.height / 2);
                    this.mapRenderer.centerOn(centerX, centerY);
                    break;
                default:
                    handled = false;
            }

            if (handled) {
                e.preventDefault();
                this.mapRenderer.clampViewport();
                this.mapRenderer.render();
                this.updateMinimap();
            }
        });

        // Location selected event
        this.mapContainer.addEventListener('locationSelected', (e) => {
            const { location, locationType } = e.detail;
            this.handleLocationSelected(location, locationType);
        });

        // Explore location button
        this.exploreLocationButton.addEventListener('click', () => {
            this.exploreSelectedLocation();
        });

        // Interact location button
        this.interactLocationButton.addEventListener('click', () => {
            this.interactWithSelectedLocation();
        });
    }

    /**
     * Update the minimap with current viewport info
     */
    updateMinimap() {
        // Check if minimap and map renderer are initialized
        if (!this.minimap || !this.mapRenderer) {
            return; // Skip update if not initialized
        }

        try {
            // Update minimap with viewport info
            this.minimap.update({
                viewportX: this.mapRenderer.viewportX,
                viewportY: this.mapRenderer.viewportY,
                viewportWidth: this.mapRenderer.options.viewportWidth,
                viewportHeight: this.mapRenderer.options.viewportHeight,
                zoom: this.mapRenderer.zoom // Pass zoom level to minimap
            });

            // Update zoom level display if it exists
            const zoomDisplay = document.getElementById('zoom-level-display');
            if (zoomDisplay) {
                zoomDisplay.textContent = `${Math.round(this.mapRenderer.zoom * 100)}%`;
            }
        } catch (error) {
            console.error('Error updating minimap:', error);
        }
    }

    /**
     * Handle location selected event
     * @param {Object} location - The selected location
     * @param {Object} locationType - The location type
     */
    handleLocationSelected(location, locationType) {
        // Store selected location
        this.selectedLocation = location;

        // Update location info
        if (location) {
            // Get terrain at location
            const terrain = this.mapSystem.getTerrainAt(location.x, location.y);

            // Update terrain info
            if (terrain) {
                this.selectedTerrainElement.innerHTML = `
                    <div><strong>${terrain.name}</strong></div>
                    <div>${terrain.description}</div>
                    <div class="terrain-stats">
                        <div>Movement Cost: ${terrain.movementCost}x</div>
                        <div>Food Production: ${terrain.resourceModifiers.FOOD}x</div>
                        <div>Ore Production: ${terrain.resourceModifiers.ORE}x</div>
                    </div>
                `;
            } else {
                this.selectedTerrainElement.textContent = 'Unknown terrain';
            }

            // Update special location info
            this.selectedLocationElement.innerHTML = `
                <div><strong>${locationType.name}</strong></div>
                <div>${locationType.description}</div>
                <div class="location-stats">
                    <div>Type: ${locationType.interactionType}</div>
                    <div>Status: ${location.interacted ? 'Interacted' : 'Not interacted'}</div>
                </div>
            `;

            // Enable/disable buttons
            this.exploreLocationButton.disabled = false;
            this.interactLocationButton.disabled = location.interacted;
        } else {
            // No location selected
            this.selectedTerrainElement.textContent = 'No terrain selected';
            this.selectedLocationElement.textContent = 'No special location selected';

            // Disable buttons
            this.exploreLocationButton.disabled = true;
            this.interactLocationButton.disabled = true;
        }
    }

    /**
     * Explore the selected location
     */
    exploreSelectedLocation() {
        if (!this.selectedLocation) return;

        // Explore the area around the selected location
        this.mapSystem.exploreArea(this.selectedLocation.x, this.selectedLocation.y, 3);

        // Update map and minimap
        this.mapRenderer.render();
        this.minimap.render();

        // Show message
        this.uiManager.showMessage(`Explored the area around ${this.mapSystem.specialLocationTypes[this.selectedLocation.type].name}`);
    }

    /**
     * Interact with the selected location
     */
    interactWithSelectedLocation() {
        if (!this.selectedLocation || this.selectedLocation.interacted) return;

        // Interact with the location
        const result = this.mapSystem.interactWithLocation(this.selectedLocation.id);

        if (result.success) {
            // Update map and minimap
            this.mapRenderer.render();
            this.minimap.render();

            // Update location info
            this.handleLocationSelected(
                this.selectedLocation,
                this.mapSystem.specialLocationTypes[this.selectedLocation.type]
            );

            // Show message
            this.uiManager.showMessage(result.message);

            // Process rewards
            this.processRewards(result.rewards);
        } else {
            // Show error message
            this.uiManager.showMessage(result.message);
        }
    }

    /**
     * Process rewards from interacting with a location
     * @param {Object} rewards - The rewards
     */
    processRewards(rewards) {
        if (!rewards) return;

        // Process different types of rewards
        if (rewards.resources) {
            // Add resources to game state
            for (const [resourceType, amount] of Object.entries(rewards.resources)) {
                if (this.gameState.resources[resourceType] !== undefined) {
                    this.gameState.resources[resourceType] += amount;
                }
            }

            // Update resource display
            this.uiManager.updateResourceDisplay();

            // Show message
            const resourceMessage = Object.entries(rewards.resources)
                .map(([type, amount]) => `${amount} ${type.toLowerCase()}`)
                .join(', ');

            this.uiManager.showMessage(`You found ${resourceMessage}!`);
        }

        if (rewards.technologyPoints) {
            // Add technology points to game state
            this.gameState.researchPoints += rewards.technologyPoints;

            // Update research display
            this.uiManager.updateResearchDisplay();

            // Show message
            this.uiManager.showMessage(`You gained ${rewards.technologyPoints} research points!`);
        }

        if (rewards.artifact) {
            // Add artifact to game state
            if (!this.gameState.artifacts) {
                this.gameState.artifacts = [];
            }

            this.gameState.artifacts.push(rewards.artifact);

            // Show message
            this.uiManager.showMessage(`You found a ${rewards.artifact.name}!`);
        }

        if (rewards.item) {
            // Add item to game state
            if (!this.gameState.items) {
                this.gameState.items = [];
            }

            this.gameState.items.push(rewards.item);

            // Show message
            this.uiManager.showMessage(`You found a ${rewards.item.name}!`);
        }

        if (rewards.alliance) {
            // Add alliance to game state
            if (!this.gameState.alliances) {
                this.gameState.alliances = [];
            }

            this.gameState.alliances.push(rewards.alliance);

            // Show message
            this.uiManager.showMessage(`You formed an alliance with ${rewards.alliance.faction}!`);
        }

        if (rewards.trade) {
            // Show trade offer
            this.uiManager.showMessage(`${rewards.trade.resourceType} trade offer available!`);
        }

        if (rewards.temporaryBonus) {
            // Add temporary bonus to game state
            if (!this.gameState.temporaryBonuses) {
                this.gameState.temporaryBonuses = [];
            }

            this.gameState.temporaryBonuses.push({
                ...rewards.temporaryBonus,
                startTime: this.gameState.gameTime
            });

            // Show message
            this.uiManager.showMessage(`You gained a temporary ${rewards.temporaryBonus.type} bonus of ${rewards.temporaryBonus.value}% for ${rewards.temporaryBonus.duration} turns!`);
        }
    }

    /**
     * Add additional terrain types to the map system
     */
    addAdditionalTerrainTypes() {
        // Add new terrain types
        this.mapSystem.terrainTypes.TUNDRA = {
            id: 'TUNDRA',
            name: 'Tundra',
            color: '#E0E0E0',
            movementCost: 1.4,
            resourceModifiers: { FOOD: 0.6, ORE: 1.0, WOOD: 0.7 },
            description: 'Cold northern plains with sparse vegetation.'
        };

        this.mapSystem.terrainTypes.JUNGLE = {
            id: 'JUNGLE',
            name: 'Jungle',
            color: '#1A8F3C',
            movementCost: 1.8,
            resourceModifiers: { FOOD: 1.3, ORE: 0.6, WOOD: 1.7 },
            description: 'Dense tropical forests with abundant food and wood.'
        };

        this.mapSystem.terrainTypes.VOLCANO = {
            id: 'VOLCANO',
            name: 'Volcanic Land',
            color: '#8B4513',
            movementCost: 2.2,
            resourceModifiers: { FOOD: 0.3, ORE: 2.0, GEMS: 1.5 },
            description: 'Dangerous volcanic terrain rich in rare minerals.'
        };
    }

    /**
     * Add additional special location types
     */
    addAdditionalLocationTypes() {
        // Add new special location types
        this.mapSystem.specialLocationTypes.ANCIENT_TEMPLE = {
            id: 'ANCIENT_TEMPLE',
            name: 'Ancient Temple',
            icon: '🏯',
            description: 'A mysterious temple from a forgotten civilization. Contains ancient knowledge and artifacts.',
            interactionType: 'EXPLORE',
            rewards: ['TECHNOLOGY', 'ARTIFACTS', 'SPECIAL_UNITS']
        };

        this.mapSystem.specialLocationTypes.TRADING_POST = {
            id: 'TRADING_POST',
            name: 'Trading Post',
            icon: '🏪',
            description: 'A bustling trading post where merchants gather to exchange goods.',
            interactionType: 'TRADE',
            rewards: ['RESOURCES', 'RARE_GOODS', 'INFORMATION']
        };

        this.mapSystem.specialLocationTypes.ABANDONED_MINE = {
            id: 'ABANDONED_MINE',
            name: 'Abandoned Mine',
            icon: '⛏️',
            description: 'An abandoned mine that may still contain valuable resources.',
            interactionType: 'HARVEST',
            rewards: ['ORE', 'GEMS', 'RARE_METALS']
        };

        this.mapSystem.specialLocationTypes.WIZARD_TOWER = {
            id: 'WIZARD_TOWER',
            name: 'Wizard Tower',
            icon: '🧙',
            description: 'A tower inhabited by a powerful wizard who might share magical knowledge.',
            interactionType: 'QUEST',
            rewards: ['MAGIC_ITEMS', 'SPELLS', 'KNOWLEDGE']
        };
    }

    /**
     * Start periodic updates for exploration memory decay
     */
    startExplorationMemoryUpdates() {
        // Update exploration memory every minute
        setInterval(() => {
            if (this.gameState.gameTime) {
                this.mapSystem.updateExplorationMemory(this.gameState.gameTime, 0.05);
                this.mapRenderer.render();
                this.minimap.render();
            }
        }, 60000); // 60 seconds
    }

    /**
     * Explore the starting area
     */
    exploreStartingArea() {
        try {
            // Explore the center of the map
            const centerX = Math.floor(this.mapSystem.config.width / 2);
            const centerY = Math.floor(this.mapSystem.config.height / 2);

            // Fully explore the immediate starting area
            this.mapSystem.exploreArea(centerX, centerY, 5, this.gameState.gameTime);

            // Partially explore a larger area around the starting point
            for (let y = centerY - 10; y <= centerY + 10; y += 5) {
                for (let x = centerX - 10; x <= centerX + 10; x += 5) {
                    if (x >= 0 && x < this.mapSystem.config.width && y >= 0 && y < this.mapSystem.config.height) {
                        // Skip the center area which is already fully explored
                        if (Math.abs(x - centerX) <= 5 && Math.abs(y - centerY) <= 5) continue;

                        // Partially explore with a smaller radius
                        this.mapSystem.exploreArea(x, y, 3, this.gameState.gameTime);
                    }
                }
            }

            // Center the map on the starting area if map renderer is initialized
            if (this.mapRenderer) {
                this.mapRenderer.centerOn(centerX, centerY);

                // Update minimap if it's initialized
                this.updateMinimap();
            }
        } catch (error) {
            console.error('Error exploring starting area:', error);
        }
    }

    /**
     * Update the map UI
     */
    update() {
        try {
            // Check if map renderer is initialized
            if (this.mapRenderer) {
                // Update map renderer
                this.mapRenderer.render();

                // Update minimap
                this.updateMinimap();
            }
        } catch (error) {
            console.error('Error updating map UI:', error);
        }
    }

    /**
     * Load map test script for development and testing
     */
    loadMapTestScript() {
        try {
            // Check if we're in development mode
            const isDevelopment = window.location.hostname === 'localhost' ||
                                window.location.hostname === '127.0.0.1' ||
                                window.location.search.includes('debug=true');

            if (isDevelopment) {
                // Load the map test script
                const script = document.createElement('script');
                script.src = 'scripts/map-test.js';
                script.async = true;
                script.onload = () => console.log('Map test script loaded');
                script.onerror = (err) => console.error('Error loading map test script:', err);
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error('Error loading map test script:', error);
        }
    }
}

// Export the MapUI class
if (typeof module !== 'undefined') {
    module.exports = { MapUI };
}
