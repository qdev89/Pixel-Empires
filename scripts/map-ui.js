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

        // Initialize map system
        this.mapSystem = new MapSystem({
            width: 50,
            height: 50,
            seed: Math.floor(Math.random() * 1000000)
        });

        // Initialize UI elements
        this.initializeUI();

        // Bind event handlers
        this.bindEvents();

        // Initialize map renderer
        this.initializeMapRenderer();

        // Initialize minimap
        this.initializeMinimap();

        // Set initial state
        this.showFogOfWar = true;
        this.showGrid = true;
        this.showCoordinates = false;

        // Add additional terrain types
        this.addAdditionalTerrainTypes();

        // Add more special location types
        this.addAdditionalLocationTypes();

        // Explore starting area
        this.exploreStartingArea();

        // Start periodic updates for exploration memory decay
        this.startExplorationMemoryUpdates();
    }

    /**
     * Initialize the UI elements
     */
    initializeUI() {
        // Get map container elements
        this.mapContainer = document.getElementById('enhanced-map');
        this.minimapContainer = document.getElementById('enhanced-minimap');

        // Get control buttons
        this.zoomInButton = document.getElementById('enhanced-zoom-in');
        this.zoomOutButton = document.getElementById('enhanced-zoom-out');
        this.centerMapButton = document.getElementById('enhanced-center-map');
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
        // Create map renderer
        this.mapRenderer = new MapRenderer(this.mapSystem, this.mapContainer, {
            tileSize: 32,
            viewportWidth: 15,
            viewportHeight: 10,
            showGrid: this.showGrid,
            showCoordinates: false
        });
    }

    /**
     * Initialize the minimap
     */
    initializeMinimap() {
        // Create minimap
        this.minimap = new Minimap(this.mapSystem, this.minimapContainer);

        // Update minimap with viewport info
        this.updateMinimap();
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Zoom in button
        this.zoomInButton.addEventListener('click', () => {
            this.mapRenderer.setZoom(this.mapRenderer.zoom + 0.1);
            this.updateMinimap();
        });

        // Zoom out button
        this.zoomOutButton.addEventListener('click', () => {
            this.mapRenderer.setZoom(this.mapRenderer.zoom - 0.1);
            this.updateMinimap();
        });

        // Center map button
        this.centerMapButton.addEventListener('click', () => {
            this.mapRenderer.centerOn(
                Math.floor(this.mapSystem.config.width / 2),
                Math.floor(this.mapSystem.config.height / 2)
            );
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

        // Minimap click event
        this.minimapContainer.addEventListener('minimapClick', (e) => {
            const { x, y } = e.detail;
            this.mapRenderer.centerOn(x, y);
            this.updateMinimap();
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
        this.minimap.update({
            viewportX: this.mapRenderer.viewportX,
            viewportY: this.mapRenderer.viewportY,
            viewportWidth: this.mapRenderer.options.viewportWidth,
            viewportHeight: this.mapRenderer.options.viewportHeight
        });
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

        // Center the map on the starting area
        this.mapRenderer.centerOn(centerX, centerY);

        // Update minimap
        this.updateMinimap();
    }

    /**
     * Update the map UI
     */
    update() {
        // Update map renderer
        this.mapRenderer.render();

        // Update minimap
        this.updateMinimap();
    }
}

// Export the MapUI class
if (typeof module !== 'undefined') {
    module.exports = { MapUI };
}
