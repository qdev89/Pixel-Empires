/**
 * UI Management
 * Handles all user interface elements and interactions
 */

class UIManager {
    constructor(gameState, buildingManager, unitManager, combatManager, researchManager) {
        this.gameState = gameState;
        this.buildingManager = buildingManager;
        this.unitManager = unitManager;
        this.combatManager = combatManager;
        this.researchManager = researchManager;
        this.animationManager = animationManager; // Use the global animation manager

        // Initialize events UI if event manager exists
        if (this.gameState.eventManager) {
            this.eventsUI = new EventsUI(this.gameState, this.gameState.eventManager);
        }

        // Initialize save UI if save system exists
        if (this.gameState.saveSystem) {
            this.saveUI = new SaveUI(this.gameState, this.gameState.saveSystem);
        }

        // Initialize diplomacy UI
        this.diplomacyUI = new DiplomacyUI(this.gameState, this);

        // Set up state change handler
        this.gameState.onStateChange = () => this.updateUI();

        // Map state
        this.mapZoom = 1;
        this.mapPosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.mapSize = { width: 30, height: 30 }; // Larger map size for more exploration
        this.resourceNodes = []; // Array to store resource nodes on the map

        // DOM elements
        this.elements = {
            resources: {
                food: document.getElementById('food-count'),
                ore: document.getElementById('ore-count')
            },
            gameInfo: {
                timer: document.getElementById('game-timer'),
                onlineStatus: document.getElementById('online-status'),
                statusIndicator: document.querySelector('.status-indicator')
            },
            gameControls: {
                saveButton: document.getElementById('save-button'),
                loadButton: document.getElementById('load-button'),
                speedButton: document.getElementById('speed-button'),
                cheatButton: document.getElementById('cheat-button')
            },
            buildingsGrid: document.getElementById('buildings-grid'),
            buildingButtons: document.getElementById('building-buttons'),
            unitStats: document.getElementById('unit-stats'),
            trainingControls: document.getElementById('training-controls'),
            attackButton: document.getElementById('attack-button'),
            combatReports: document.getElementById('combat-reports'),
            gameMap: document.getElementById('game-map'),
            mapControls: {
                zoomIn: document.getElementById('zoom-in'),
                zoomOut: document.getElementById('zoom-out'),
                resetZoom: document.getElementById('reset-zoom'),
                centerMap: document.getElementById('center-map'),
                claimTerritory: document.getElementById('claim-territory')
            },
            mapElements: {
                wrapper: document.getElementById('map-wrapper'),
                minimap: document.getElementById('minimap'),
                minimapViewport: document.getElementById('minimap-viewport')
            },
            research: {
                currentResearch: document.getElementById('current-research'),
                progressBar: document.getElementById('research-progress-bar'),
                tabs: document.getElementById('research-tabs'),
                options: document.getElementById('research-options')
            }
        };

        // Current active research tab
        this.activeResearchTab = 'MILITARY';

        // Initialize UI
        this.initializeUI();
    }

    /**
     * Initialize the UI
     */
    initializeUI() {
        this.createBuildingButtons();
        this.createTrainingControls();
        this.initializeResearchUI();
        this.initializeMapControls();
        this.initializeEmpireTabs();
        this.renderMap();
        this.updateUI();

        // Set up online status toggle (for demonstration)
        if (this.elements.gameInfo.onlineStatus) {
            this.elements.gameInfo.onlineStatus.addEventListener('click', () => {
                this.gameState.toggleOnlineStatus();
            });
        }

        // Set up game speed control
        if (this.elements.gameControls.speedButton) {
            this.elements.gameControls.speedButton.addEventListener('click', () => {
                this.gameState.cycleGameSpeed();
                this.updateGameSpeedDisplay();
            });
        }

        // Set up territory claim button
        if (this.elements.mapControls.claimTerritory) {
            this.elements.mapControls.claimTerritory.addEventListener('click', () => {
                this.showTerritoryClaimModal();
            });
        }

        // Set up territory modal close button
        const territoryModalClose = document.getElementById('territory-modal-close');
        if (territoryModalClose) {
            territoryModalClose.addEventListener('click', () => {
                document.getElementById('territory-modal').style.display = 'none';
            });
        }

        // Resource production animations disabled as per user request
    }

    /**
     * Update game speed display
     */
    updateGameSpeedDisplay() {
        if (this.elements.gameControls.speedButton) {
            this.elements.gameControls.speedButton.textContent = `Speed: ${this.gameState.gameSpeed}x`;
        }
    }

    /**
     * Initialize Empire tabs
     */
    initializeEmpireTabs() {
        const tabButtons = document.querySelectorAll('.empire-tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));

                // Add active class to clicked button
                button.classList.add('active');

                // Show corresponding tab content
                const tabId = button.dataset.tab;
                const tabContent = document.getElementById(`${tabId}-tab`);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });
    }

    /**
     * Initialize map controls for zooming and panning
     */
    initializeMapControls() {
        // Set up zoom in button - enhanced zoom as per user preference
        if (this.elements.mapControls.zoomIn) {
            this.elements.mapControls.zoomIn.addEventListener('click', () => {
                this.mapZoom = Math.min(this.mapZoom + 0.5, 5.0); // Increased max zoom and zoom step
                this.updateMapTransform();
                this.updateMinimapViewport();
            });
        }

        // Set up zoom out button - enhanced zoom as per user preference
        if (this.elements.mapControls.zoomOut) {
            this.elements.mapControls.zoomOut.addEventListener('click', () => {
                this.mapZoom = Math.max(this.mapZoom - 0.5, 0.2); // Lower min zoom and zoom step
                this.updateMapTransform();
                this.updateMinimapViewport();
            });
        }

        // Set up reset zoom button
        if (this.elements.mapControls.resetZoom) {
            this.elements.mapControls.resetZoom.addEventListener('click', () => {
                this.mapZoom = 1.0;
                this.updateMapTransform();
                this.updateMinimapViewport();
            });
        }

        // Set up center map button
        if (this.elements.mapControls.centerMap) {
            this.elements.mapControls.centerMap.addEventListener('click', () => {
                this.mapPosition = { x: 0, y: 0 };
                this.updateMapTransform();
                this.updateMinimapViewport();
            });
        }

        // Set up map dragging
        const gameMap = this.elements.gameMap;
        if (gameMap) {
            // Mouse events
            gameMap.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // Left mouse button
                    this.isDragging = true;
                    this.dragStart = { x: e.clientX, y: e.clientY };
                    gameMap.classList.add('grabbing');
                    e.preventDefault();
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    const dx = e.clientX - this.dragStart.x;
                    const dy = e.clientY - this.dragStart.y;

                    this.mapPosition.x += dx / this.mapZoom;
                    this.mapPosition.y += dy / this.mapZoom;

                    this.dragStart = { x: e.clientX, y: e.clientY };
                    this.updateMapTransform();
                    this.updateMinimapViewport();
                }
            });

            document.addEventListener('mouseup', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    gameMap.classList.remove('grabbing');
                }
            });

            // Touch events for mobile
            gameMap.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    this.isDragging = true;
                    this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    gameMap.classList.add('grabbing');
                    e.preventDefault();
                }
            });

            document.addEventListener('touchmove', (e) => {
                if (this.isDragging && e.touches.length === 1) {
                    const dx = e.touches[0].clientX - this.dragStart.x;
                    const dy = e.touches[0].clientY - this.dragStart.y;

                    this.mapPosition.x += dx / this.mapZoom;
                    this.mapPosition.y += dy / this.mapZoom;

                    this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                    this.updateMapTransform();
                    this.updateMinimapViewport();
                }
            });

            document.addEventListener('touchend', () => {
                if (this.isDragging) {
                    this.isDragging = false;
                    gameMap.classList.remove('grabbing');
                }
            });

            // Mouse wheel zoom - enhanced zoom as per user preference
            gameMap.addEventListener('wheel', (e) => {
                e.preventDefault();

                // Get mouse position relative to map
                const rect = gameMap.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Calculate position in map coordinates before zoom
                const mapX = (mouseX - this.mapPosition.x) / this.mapZoom;
                const mapY = (mouseY - this.mapPosition.y) / this.mapZoom;

                // Adjust zoom level with improved zoom speed and range
                if (e.deltaY < 0) {
                    // Zoom in
                    this.mapZoom = Math.min(this.mapZoom * 1.2, 5.0); // Faster zoom in, higher max zoom
                } else {
                    // Zoom out
                    this.mapZoom = Math.max(this.mapZoom * 0.8, 0.2); // Faster zoom out, lower min zoom
                }

                // Calculate new position to keep mouse over same point
                this.mapPosition.x = mouseX - mapX * this.mapZoom;
                this.mapPosition.y = mouseY - mapY * this.mapZoom;

                this.updateMapTransform();
                this.updateMinimapViewport();
            }, { passive: false });

            // Set up minimap click to navigate
            const minimap = this.elements.mapElements.minimap;
            if (minimap) {
                minimap.addEventListener('click', (e) => {
                    const rect = minimap.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickY = e.clientY - rect.top;

                    // Convert click position to map position
                    const mapWidth = this.mapSize.width * 40; // Cell size is 40px
                    const mapHeight = this.mapSize.height * 40;

                    const minimapScale = Math.min(
                        minimap.clientWidth / mapWidth,
                        minimap.clientHeight / mapHeight
                    );

                    const mapCenterX = (clickX / minimapScale) - (this.elements.gameMap.clientWidth / 2 / this.mapZoom);
                    const mapCenterY = (clickY / minimapScale) - (this.elements.gameMap.clientHeight / 2 / this.mapZoom);

                    this.mapPosition.x = -mapCenterX * this.mapZoom;
                    this.mapPosition.y = -mapCenterY * this.mapZoom;

                    this.updateMapTransform();
                    this.updateMinimapViewport();
                });
            }
        }
    }

    /**
     * Update map transform (position and zoom)
     */
    updateMapTransform() {
        const mapGrid = this.elements.gameMap.querySelector('.map-grid');
        if (mapGrid) {
            mapGrid.style.transform = `translate(${this.mapPosition.x}px, ${this.mapPosition.y}px) scale(${this.mapZoom})`;
        }
    }

    /**
     * Update minimap viewport indicator
     */
    updateMinimapViewport() {
        const minimapViewport = this.elements.mapElements.minimapViewport;
        const minimap = this.elements.mapElements.minimap;
        const gameMap = this.elements.gameMap;

        if (minimapViewport && minimap && gameMap) {
            // Calculate map dimensions
            const mapWidth = this.mapSize.width * 40; // Cell size is 40px
            const mapHeight = this.mapSize.height * 40;

            // Calculate minimap scale
            const minimapScale = Math.min(
                minimap.clientWidth / mapWidth,
                minimap.clientHeight / mapHeight
            );

            // Calculate visible area in map coordinates
            const visibleWidth = gameMap.clientWidth / this.mapZoom;
            const visibleHeight = gameMap.clientHeight / this.mapZoom;

            // Calculate viewport position and size
            const viewportX = (-this.mapPosition.x / this.mapZoom) * minimapScale;
            const viewportY = (-this.mapPosition.y / this.mapZoom) * minimapScale;
            const viewportWidth = visibleWidth * minimapScale;
            const viewportHeight = visibleHeight * minimapScale;

            // Update viewport element
            minimapViewport.style.left = `${viewportX}px`;
            minimapViewport.style.top = `${viewportY}px`;
            minimapViewport.style.width = `${viewportWidth}px`;
            minimapViewport.style.height = `${viewportHeight}px`;
        }
    }

    /**
     * Initialize research UI
     */
    initializeResearchUI() {
        // Set up research tab buttons
        const tabButtons = this.elements.research.tabs.querySelectorAll('.research-tab-button');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));

                // Add active class to clicked button
                button.classList.add('active');

                // Update active tab
                this.activeResearchTab = button.dataset.category;

                // Update research options
                this.updateResearchOptions();
            });
        });

        // Initial update of research options
        this.updateResearchOptions();
    }

    /**
     * Create building buttons
     */
    createBuildingButtons() {
        const buildingTypes = Object.keys(CONFIG.BUILDINGS);

        buildingTypes.forEach(buildingType => {
            const buildingConfig = CONFIG.BUILDINGS[buildingType];
            const button = document.createElement('button');
            button.className = 'building-button';
            button.dataset.buildingType = buildingType;

            button.innerHTML = `
                <div class="building-button-icon ${buildingType}"></div>
                <div class="building-info">
                    <div>${buildingConfig.name}</div>
                    <div class="building-cost">
                        <div class="cost-item"><div class="cost-icon food"></div>${buildingConfig.levels[0].cost.FOOD}</div>
                        <div class="cost-item"><div class="cost-icon ore"></div>${buildingConfig.levels[0].cost.ORE}</div>
                    </div>
                </div>
            `;

            button.addEventListener('click', () => {
                this.buildingManager.startBuilding(buildingType);

                // Find the building tile and add construction animation
                const buildingTiles = this.elements.buildingsGrid.querySelectorAll('.building-tile');
                for (const tile of buildingTiles) {
                    const nameElement = tile.querySelector('.building-name');
                    if (nameElement && nameElement.textContent === buildingConfig.name) {
                        this.animationManager.createBuildingConstructionAnimation(buildingType, tile, () => {
                            // Animation complete callback
                            this.updateBuildingsGrid();
                        });
                        break;
                    }
                }
            });

            this.elements.buildingButtons.appendChild(button);
        });
    }

    /**
     * Create training controls
     */
    createTrainingControls() {
        // Spearman training button
        const spearmanButton = document.createElement('button');
        spearmanButton.className = 'train-button';
        spearmanButton.innerHTML = `
            <div class="unit-icon-small SPEARMAN">S</div>
            <span>Train Spearman</span>
        `;
        spearmanButton.dataset.unitType = 'SPEARMAN';

        spearmanButton.addEventListener('click', () => {
            this.unitManager.trainUnits('SPEARMAN', 1);
        });

        this.elements.trainingControls.appendChild(spearmanButton);

        // Archer training button
        const archerButton = document.createElement('button');
        archerButton.className = 'train-button';
        archerButton.innerHTML = `
            <div class="unit-icon-small ARCHER">A</div>
            <span>Train Archer</span>
        `;
        archerButton.dataset.unitType = 'ARCHER';

        archerButton.addEventListener('click', () => {
            this.unitManager.trainUnits('ARCHER', 1);
        });

        this.elements.trainingControls.appendChild(archerButton);

        // Cavalry training button
        const cavalryButton = document.createElement('button');
        cavalryButton.className = 'train-button';
        cavalryButton.innerHTML = `
            <div class="unit-icon-small CAVALRY">C</div>
            <span>Train Cavalry</span>
        `;
        cavalryButton.dataset.unitType = 'CAVALRY';

        cavalryButton.addEventListener('click', () => {
            this.unitManager.trainUnits('CAVALRY', 1);
        });

        this.elements.trainingControls.appendChild(cavalryButton);

        // Set up attack button
        this.elements.attackButton.addEventListener('click', () => {
            // For now, just attack the first NPC camp
            const camps = this.combatManager.getNPCCamps();
            if (camps.length > 0) {
                this.combatManager.attackNPC(camps[0].x, camps[0].y);
            }
        });
    }

    /**
     * Render the game map
     */
    renderMap() {
        const mapElement = this.elements.gameMap;
        mapElement.innerHTML = '';

        // Create map grid
        const mapGrid = document.createElement('div');
        mapGrid.className = 'map-grid';

        // Set explicit grid template based on expanded map size
        mapGrid.style.gridTemplateColumns = `repeat(${this.mapSize.width}, 40px)`;
        mapGrid.style.gridTemplateRows = `repeat(${this.mapSize.height}, 40px)`;

        // Generate resource nodes if they don't exist yet
        if (this.resourceNodes.length === 0) {
            this.generateResourceNodes();
        }

        // Render map cells for the expanded map
        for (let y = 0; y < this.mapSize.height; y++) {
            for (let x = 0; x < this.mapSize.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Add terrain type based on position with improved variety
                // This creates a more interesting map with varied terrain
                const terrainSeed = (x * 3 + y * 7 + Math.floor(x/5) * 11 + Math.floor(y/5) * 13) % 15; // More complex deterministic "random" value

                // Create terrain clusters for more realistic map generation
                if (terrainSeed < 7) {
                    cell.classList.add('grass');
                } else if (terrainSeed < 10) {
                    cell.classList.add('forest');
                } else if (terrainSeed < 13) {
                    cell.classList.add('mountain');
                } else {
                    cell.classList.add('water');
                }

                // Check if this cell is within the original game map bounds
                if (x < this.gameState.mapSize.width && y < this.gameState.mapSize.height) {
                    const mapCell = this.gameState.map[y][x];

                    if (mapCell) {
                        if (mapCell.type === 'PLAYER') {
                            // Add player base icon with unit animation
                            const playerIcon = document.createElement('div');
                            playerIcon.className = 'unit-display';
                            playerIcon.dataset.unitType = 'spearman';

                            // Add fallback text if needed
                            playerIcon.textContent = 'P';

                            cell.appendChild(playerIcon);
                            cell.textContent = '';
                            cell.title = 'Player Base';
                            cell.classList.add('player-base');
                        } else if (mapCell.type === 'NPC') {
                            // Add enemy icon with unit animation
                            const enemyType = mapCell.campType === 'GOBLIN_CAMP' ? 'goblin' : 'bandit';
                            const enemyIcon = document.createElement('div');
                            enemyIcon.className = 'unit-display';
                            enemyIcon.dataset.unitType = enemyType;

                            // Add fallback text if needed
                            enemyIcon.textContent = enemyType === 'goblin' ? 'G' : 'B';

                            cell.appendChild(enemyIcon);
                            cell.textContent = '';
                            cell.title = `${CONFIG.NPC_CAMPS[mapCell.campType].name} (Difficulty: ${mapCell.difficulty || CONFIG.NPC_CAMPS[mapCell.campType].difficulty})`;
                            cell.classList.add('enemy-camp');

                            // Add click handler for attacking
                            cell.addEventListener('click', () => {
                                this.combatManager.attackNPC(x, y);
                            });
                            cell.style.cursor = 'pointer';
                        }
                    }
                }

                // Check if this cell has a resource node
                const resourceNode = this.resourceNodes.find(node => node.x === x && node.y === y);
                if (resourceNode) {
                    // Add resource node icon
                    const resourceIcon = document.createElement('div');

                    // Check if it's a special resource node
                    if (resourceNode.isSpecial) {
                        resourceIcon.className = `resource-node special-resource ${resourceNode.type.toLowerCase()}`;

                        // Add special effect indicator
                        const effectIndicator = document.createElement('div');
                        effectIndicator.className = 'special-effect-indicator';
                        resourceIcon.appendChild(effectIndicator);

                        // Add tooltip with special resource info
                        cell.title = `${resourceNode.name} (${resourceNode.amount} remaining)\n${resourceNode.description}\nEffect: ${resourceNode.specialEffect} +${resourceNode.effectValue}%`;
                    } else {
                        resourceIcon.className = `resource-node ${resourceNode.type.toLowerCase()}`;

                        // Add tooltip with resource info
                        cell.title = `${resourceNode.type} Node (${resourceNode.amount} remaining)`;
                    }

                    cell.classList.add('resource-cell');

                    // Add click handler for resource nodes
                    cell.addEventListener('click', () => {
                        this.showResourceNodeInfo(resourceNode);
                    });
                    cell.style.cursor = 'pointer';

                    cell.appendChild(resourceIcon);
                }

                // Check if this cell has an outpost
                const outpost = this.gameState.outposts.find(o => o.x === x && o.y === y);
                if (outpost) {
                    // Add outpost icon
                    const outpostIcon = document.createElement('div');
                    outpostIcon.className = `outpost-icon ${outpost.type.toLowerCase()}`;

                    // Add level indicator
                    const levelIndicator = document.createElement('div');
                    levelIndicator.className = 'outpost-level';
                    levelIndicator.textContent = outpost.level;
                    outpostIcon.appendChild(levelIndicator);

                    // Add tooltip with outpost info
                    cell.title = `${outpost.name} (Level ${outpost.level})`;
                    cell.classList.add('outpost-cell');

                    // Add click handler for outposts
                    cell.addEventListener('click', () => {
                        this.showOutpostInfo(outpost);
                    });
                    cell.style.cursor = 'pointer';

                    cell.appendChild(outpostIcon);

                    // If the outpost is under construction or upgrading, add a progress overlay
                    if (outpost.status === 'building' || outpost.status === 'upgrading') {
                        const progressOverlay = document.createElement('div');
                        progressOverlay.className = 'construction-overlay';

                        const progressBar = document.createElement('div');
                        progressBar.className = 'construction-progress';

                        // Calculate progress percentage
                        const now = Date.now();
                        const elapsed = now - outpost.startTime;
                        const total = outpost.completionTime - outpost.startTime;
                        const percent = Math.min(100, (elapsed / total) * 100);

                        progressBar.style.width = `${percent}%`;
                        progressOverlay.appendChild(progressBar);

                        cell.appendChild(progressOverlay);
                    }
                }

                mapGrid.appendChild(cell);
            }
        }

        // Draw claimed territories
        if (this.gameState.claimedTerritories && this.gameState.claimedTerritories.length > 0) {
            for (const territory of this.gameState.claimedTerritories) {
                // Create a territory overlay
                const territoryOverlay = document.createElement('div');
                territoryOverlay.className = 'territory-overlay';

                // Calculate position and size
                const size = territory.radius * 2 * 40 + 40; // Convert radius to pixels (40px per tile) + extra for border
                territoryOverlay.style.width = `${size}px`;
                territoryOverlay.style.height = `${size}px`;
                territoryOverlay.style.left = `${territory.x * 40 + 20 - size/2}px`;
                territoryOverlay.style.top = `${territory.y * 40 + 20 - size/2}px`;

                mapGrid.appendChild(territoryOverlay);
            }
        }

        // Add map legend
        const mapLegend = document.createElement('div');
        mapLegend.className = 'map-legend';
        mapLegend.innerHTML = `
            <div class="legend-title">Map Legend</div>
            <div class="legend-item"><div class="legend-icon player"></div>Your Base</div>
            <div class="legend-item"><div class="legend-icon enemy"></div>Enemy Camp</div>
            <div class="legend-item"><div class="legend-icon food"></div>Food Resource</div>
            <div class="legend-item"><div class="legend-icon ore"></div>Ore Resource</div>
            <div class="legend-item"><div class="legend-icon special-resource"></div>Special Resource</div>
            <div class="legend-item"><div class="legend-icon territory"></div>Your Territory</div>
            <div class="legend-item"><div class="legend-icon outpost"></div>Outpost</div>
            <div class="legend-item"><div class="legend-icon resource_station"></div>Resource Station</div>
            <div class="legend-item"><div class="legend-icon guard_post"></div>Guard Post</div>
        `;
        mapElement.appendChild(mapLegend);
        mapElement.appendChild(mapGrid);

        // Render minimap
        this.renderMinimap();

        // Apply current transform
        this.updateMapTransform();
        this.updateMinimapViewport();
    }

    /**
     * Generate resource nodes on the map
     */
    generateResourceNodes() {
        // Clear existing nodes
        this.resourceNodes = [];

        // Generate food resource nodes (farms, forests, etc.)
        for (let i = 0; i < 10; i++) {
            // Place food nodes in grass or forest areas
            let x, y, terrainSeed;
            do {
                x = Math.floor(Math.random() * this.mapSize.width);
                y = Math.floor(Math.random() * this.mapSize.height);
                terrainSeed = (x * 3 + y * 7 + Math.floor(x/5) * 11 + Math.floor(y/5) * 13) % 15;
            } while (terrainSeed >= 10); // Only on grass or forest

            this.resourceNodes.push({
                type: 'FOOD',
                x,
                y,
                amount: 500 + Math.floor(Math.random() * 500), // 500-1000 resources
                harvestRate: 5 + Math.floor(Math.random() * 5) // 5-10 per harvest
            });
        }

        // Generate ore resource nodes (mines, mountains, etc.)
        for (let i = 0; i < 8; i++) {
            // Place ore nodes in mountain areas
            let x, y, terrainSeed;
            do {
                x = Math.floor(Math.random() * this.mapSize.width);
                y = Math.floor(Math.random() * this.mapSize.height);
                terrainSeed = (x * 3 + y * 7 + Math.floor(x/5) * 11 + Math.floor(y/5) * 13) % 15;
            } while (terrainSeed < 10 || terrainSeed >= 13); // Only on mountains

            this.resourceNodes.push({
                type: 'ORE',
                x,
                y,
                amount: 300 + Math.floor(Math.random() * 300), // 300-600 resources
                harvestRate: 3 + Math.floor(Math.random() * 3) // 3-6 per harvest
            });
        }

        // Generate special resource nodes (rare and valuable)
        this.generateSpecialResourceNodes();
    }

    /**
     * Generate special resource nodes on the map
     */
    generateSpecialResourceNodes() {
        // Special resource types
        const specialResourceTypes = [
            {
                type: 'CRYSTAL',
                name: 'Crystal',
                description: 'Rare crystals that boost research speed',
                terrainPreference: 'mountain', // Prefers mountains
                rarity: 0.7, // 70% chance to spawn
                minAmount: 100,
                maxAmount: 200,
                harvestRate: 2,
                specialEffect: 'RESEARCH_BOOST',
                effectValue: 25 // 25% research speed boost
            },
            {
                type: 'ANCIENT_ARTIFACT',
                name: 'Ancient Artifact',
                description: 'Mysterious artifacts that provide diplomatic advantages',
                terrainPreference: 'forest', // Prefers forests
                rarity: 0.5, // 50% chance to spawn
                minAmount: 50,
                maxAmount: 100,
                harvestRate: 1,
                specialEffect: 'DIPLOMATIC_INFLUENCE',
                effectValue: 30 // 30% diplomatic influence boost
            },
            {
                type: 'RARE_METAL',
                name: 'Rare Metal',
                description: 'Exotic metals that strengthen military units',
                terrainPreference: 'mountain', // Prefers mountains
                rarity: 0.6, // 60% chance to spawn
                minAmount: 150,
                maxAmount: 250,
                harvestRate: 2,
                specialEffect: 'UNIT_STRENGTH',
                effectValue: 20 // 20% unit strength boost
            },
            {
                type: 'ANCIENT_KNOWLEDGE',
                name: 'Ancient Knowledge',
                description: 'Lost knowledge that accelerates technology development',
                terrainPreference: 'grass', // Prefers grass
                rarity: 0.4, // 40% chance to spawn
                minAmount: 80,
                maxAmount: 150,
                harvestRate: 1,
                specialEffect: 'TECHNOLOGY_BOOST',
                effectValue: 35 // 35% technology development boost
            }
        ];

        // Try to spawn each special resource type
        for (const resourceType of specialResourceTypes) {
            // Check if this resource spawns based on rarity
            if (Math.random() > resourceType.rarity) continue;

            // Determine terrain preference
            let terrainFilter;
            if (resourceType.terrainPreference === 'mountain') {
                terrainFilter = (seed) => seed >= 10 && seed < 13;
            } else if (resourceType.terrainPreference === 'forest') {
                terrainFilter = (seed) => seed >= 7 && seed < 10;
            } else if (resourceType.terrainPreference === 'grass') {
                terrainFilter = (seed) => seed < 7;
            } else {
                terrainFilter = () => true; // No preference
            }

            // Find a suitable location
            let attempts = 0;
            let placed = false;

            while (attempts < 20 && !placed) { // Limit attempts to prevent infinite loops
                attempts++;

                const x = Math.floor(Math.random() * this.mapSize.width);
                const y = Math.floor(Math.random() * this.mapSize.height);
                const terrainSeed = (x * 3 + y * 7 + Math.floor(x/5) * 11 + Math.floor(y/5) * 13) % 15;

                // Check if terrain is suitable
                if (!terrainFilter(terrainSeed)) continue;

                // Check if location is already occupied
                const isOccupied = this.resourceNodes.some(node => node.x === x && node.y === y);
                if (isOccupied) continue;

                // Place the special resource node
                const amount = resourceType.minAmount + Math.floor(Math.random() * (resourceType.maxAmount - resourceType.minAmount));

                const specialNode = {
                    type: resourceType.type,
                    name: resourceType.name,
                    description: resourceType.description,
                    x,
                    y,
                    amount,
                    harvestRate: resourceType.harvestRate,
                    specialEffect: resourceType.specialEffect,
                    effectValue: resourceType.effectValue,
                    isSpecial: true
                };

                this.resourceNodes.push(specialNode);

                // Also add to game state's special resource nodes
                if (this.gameState.specialResourceNodes) {
                    this.gameState.specialResourceNodes.push({
                        ...specialNode,
                        discovered: false // Initially undiscovered
                    });
                }

                placed = true;
            }
        }
    }

    /**
     * Show resource node information and harvesting options
     * @param {Object} node - The resource node
     */
    showResourceNodeInfo(node) {
        // Create or get the harvesting modal
        let harvestModal = document.getElementById('harvest-modal');

        if (!harvestModal) {
            // Create the modal if it doesn't exist
            harvestModal = document.createElement('div');
            harvestModal.id = 'harvest-modal';
            harvestModal.className = 'modal';

            const modalContent = document.createElement('div');
            modalContent.id = 'harvest-modal-content';
            modalContent.className = 'modal-content';

            const closeButton = document.createElement('span');
            closeButton.id = 'harvest-modal-close';
            closeButton.className = 'close-button';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                harvestModal.style.display = 'none';
            });

            modalContent.appendChild(closeButton);
            harvestModal.appendChild(modalContent);
            document.body.appendChild(harvestModal);
        }

        // Get the modal content element
        const modalContent = document.getElementById('harvest-modal-content');

        // Clear previous content (except close button)
        const closeButton = document.getElementById('harvest-modal-close');
        modalContent.innerHTML = '';
        modalContent.appendChild(closeButton);

        // Add node information
        const nodeInfo = document.createElement('div');
        nodeInfo.className = 'node-info';

        // Add node icon
        const nodeIcon = document.createElement('div');
        nodeIcon.className = `resource-node-large ${node.type.toLowerCase()}`;
        nodeInfo.appendChild(nodeIcon);

        // Add node details
        const nodeDetails = document.createElement('div');
        nodeDetails.className = 'node-details';

        // Check if it's a special resource node
        if (node.isSpecial) {
            nodeDetails.innerHTML = `
                <h3>${node.name}</h3>
                <div class="node-stat">Location: (${node.x}, ${node.y})</div>
                <div class="node-stat">Available: ${node.amount}</div>
                <div class="node-stat">Harvest Rate: ${node.harvestRate} per unit</div>
                <div class="node-description">${node.description}</div>
                <div class="special-effect">
                    <span class="effect-label">Special Effect:</span>
                    <span class="effect-value">${node.specialEffect.replace('_', ' ')} +${node.effectValue}%</span>
                </div>
            `;

            // Mark as discovered in game state if it wasn't already
            if (this.gameState.specialResourceNodes) {
                const specialNode = this.gameState.specialResourceNodes.find(
                    n => n.type === node.type && n.x === node.x && n.y === node.y
                );
                if (specialNode && !specialNode.discovered) {
                    specialNode.discovered = true;

                    // Log discovery
                    this.gameState.activityLogManager.addLogEntry(
                        'Discovery',
                        `Discovered ${node.name} at (${node.x}, ${node.y})`
                    );
                }
            }
        } else {
            nodeDetails.innerHTML = `
                <h3>${node.type} Resource Node</h3>
                <div class="node-stat">Location: (${node.x}, ${node.y})</div>
                <div class="node-stat">Available: ${node.amount} ${node.type}</div>
                <div class="node-stat">Harvest Rate: ${node.harvestRate} per unit</div>
            `;
        }

        // Check if the node is within a claimed territory
        const territory = this.gameState.getTerritoryContainingNode(node);
        if (territory) {
            // Add territory information
            nodeDetails.innerHTML += `
                <div class="node-stat territory-info">Within your territory</div>
            `;

            // Add build outpost button if there's no outpost at this location
            const existingOutpost = this.gameState.outposts.find(o => o.x === node.x && o.y === node.y);
            if (!existingOutpost) {
                const buildOutpostButton = document.createElement('button');
                buildOutpostButton.className = 'build-outpost-button';
                buildOutpostButton.textContent = 'Build Outpost Here';
                buildOutpostButton.addEventListener('click', () => {
                    harvestModal.style.display = 'none';
                    this.showBuildOutpostModal(node.x, node.y);
                });
                nodeDetails.appendChild(buildOutpostButton);
            }
        }

        nodeInfo.appendChild(nodeDetails);
        modalContent.appendChild(nodeInfo);

        // Add harvesting form
        const harvestForm = document.createElement('form');
        harvestForm.id = 'harvest-form';
        harvestForm.className = 'harvest-form';

        // Add unit selection
        harvestForm.innerHTML = `
            <h4>Select Units to Send</h4>
            <div class="unit-selection">
                <label for="spearman-harvest">Spearmen:</label>
                <div class="unit-input-group">
                    <input type="number" id="spearman-harvest" min="0" value="0" max="${this.gameState.units.SPEARMAN}">
                    <button type="button" id="spearman-harvest-max" class="max-button">Max (${this.gameState.units.SPEARMAN})</button>
                </div>
            </div>

            <div class="unit-selection">
                <label for="archer-harvest">Archers:</label>
                <div class="unit-input-group">
                    <input type="number" id="archer-harvest" min="0" value="0" max="${this.gameState.units.ARCHER}">
                    <button type="button" id="archer-harvest-max" class="max-button">Max (${this.gameState.units.ARCHER})</button>
                </div>
            </div>

            <div class="unit-selection">
                <label for="cavalry-harvest">Cavalry:</label>
                <div class="unit-input-group">
                    <input type="number" id="cavalry-harvest" min="0" value="0" max="${this.gameState.units.CAVALRY}">
                    <button type="button" id="cavalry-harvest-max" class="max-button">Max (${this.gameState.units.CAVALRY})</button>
                </div>
            </div>

            <div class="harvest-info">
                <h4>Harvesting Information</h4>
                <div id="harvest-estimate">Select units to see harvesting estimate</div>
            </div>

            <button type="button" id="start-harvest-button" class="harvest-button" disabled>Send Units</button>
        `;

        modalContent.appendChild(harvestForm);

        // Show the modal
        harvestModal.style.display = 'block';

        // Set up max buttons
        document.getElementById('spearman-harvest-max').addEventListener('click', () => {
            document.getElementById('spearman-harvest').value = this.gameState.units.SPEARMAN;
            this.updateHarvestEstimate(node);
        });

        document.getElementById('archer-harvest-max').addEventListener('click', () => {
            document.getElementById('archer-harvest').value = this.gameState.units.ARCHER;
            this.updateHarvestEstimate(node);
        });

        document.getElementById('cavalry-harvest-max').addEventListener('click', () => {
            document.getElementById('cavalry-harvest').value = this.gameState.units.CAVALRY;
            this.updateHarvestEstimate(node);
        });

        // Set up input change listeners
        document.getElementById('spearman-harvest').addEventListener('input', () => this.updateHarvestEstimate(node));
        document.getElementById('archer-harvest').addEventListener('input', () => this.updateHarvestEstimate(node));
        document.getElementById('cavalry-harvest').addEventListener('input', () => this.updateHarvestEstimate(node));

        // Set up harvest button
        document.getElementById('start-harvest-button').addEventListener('click', () => {
            const units = {
                SPEARMAN: parseInt(document.getElementById('spearman-harvest').value) || 0,
                ARCHER: parseInt(document.getElementById('archer-harvest').value) || 0,
                CAVALRY: parseInt(document.getElementById('cavalry-harvest').value) || 0
            };

            const success = this.gameState.startHarvesting(node, units);

            if (success) {
                harvestModal.style.display = 'none';
                // Update the node in the UI.resourceNodes array
                const nodeIndex = this.resourceNodes.findIndex(n => n.x === node.x && n.y === node.y);
                if (nodeIndex !== -1) {
                    this.resourceNodes[nodeIndex].amount -= units.SPEARMAN + units.ARCHER + units.CAVALRY;
                }
            } else {
                alert('Failed to start harvesting operation. Check that you have enough units.');
            }
        });

        // Initial update of harvest estimate
        this.updateHarvestEstimate(node);
    }

    /**
     * Show the build outpost modal
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    showBuildOutpostModal(x, y) {
        // Create or get the build outpost modal
        let buildOutpostModal = document.getElementById('build-outpost-modal');

        if (!buildOutpostModal) {
            // Create the modal if it doesn't exist
            buildOutpostModal = document.createElement('div');
            buildOutpostModal.id = 'build-outpost-modal';
            buildOutpostModal.className = 'modal';

            const modalContent = document.createElement('div');
            modalContent.id = 'build-outpost-modal-content';
            modalContent.className = 'modal-content';

            const closeButton = document.createElement('span');
            closeButton.id = 'build-outpost-modal-close';
            closeButton.className = 'close-button';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                buildOutpostModal.style.display = 'none';
            });

            modalContent.appendChild(closeButton);
            buildOutpostModal.appendChild(modalContent);
            document.body.appendChild(buildOutpostModal);
        }

        // Get the modal content element
        const modalContent = document.getElementById('build-outpost-modal-content');

        // Clear previous content (except close button)
        const closeButton = document.getElementById('build-outpost-modal-close');
        modalContent.innerHTML = '';
        modalContent.appendChild(closeButton);

        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Build Outpost';
        modalContent.appendChild(title);

        // Add description
        const description = document.createElement('p');
        description.className = 'outpost-description';
        description.textContent = 'Outposts provide benefits to your territories and resources. Choose the type of outpost to build:';
        modalContent.appendChild(description);

        // Add outpost options
        const outpostOptions = document.createElement('div');
        outpostOptions.className = 'outpost-options';

        // Check which outposts can be built
        const territory = this.gameState.getTerritory(x, y);
        const hasOutpost = territory.outposts.some(o => o.type === 'OUTPOST');

        // Basic outpost
        const outpostOption = this.createOutpostOption('OUTPOST', x, y);
        outpostOptions.appendChild(outpostOption);

        // Resource station (requires outpost)
        const resourceStationOption = this.createOutpostOption('RESOURCE_STATION', x, y);
        if (!hasOutpost) {
            resourceStationOption.classList.add('disabled');
            resourceStationOption.title = 'Requires Outpost level 1';
        }
        outpostOptions.appendChild(resourceStationOption);

        // Guard post (requires outpost)
        const guardPostOption = this.createOutpostOption('GUARD_POST', x, y);
        if (!hasOutpost) {
            guardPostOption.classList.add('disabled');
            guardPostOption.title = 'Requires Outpost level 1';
        }
        outpostOptions.appendChild(guardPostOption);

        modalContent.appendChild(outpostOptions);

        // Show the modal
        buildOutpostModal.style.display = 'block';
    }

    /**
     * Create an outpost option element
     * @param {string} outpostType - The type of outpost
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {HTMLElement} - The outpost option element
     */
    createOutpostOption(outpostType, x, y) {
        const buildingConfig = CONFIG.BUILDINGS[outpostType];
        const cost = buildingConfig.levels[0].cost;

        const option = document.createElement('div');
        option.className = 'outpost-option';

        // Add outpost icon
        const outpostIcon = document.createElement('div');
        outpostIcon.className = `outpost-icon-medium ${outpostType.toLowerCase()}`;
        option.appendChild(outpostIcon);

        // Add outpost details
        const outpostDetails = document.createElement('div');
        outpostDetails.className = 'outpost-option-details';
        outpostDetails.innerHTML = `
            <h4>${buildingConfig.name}</h4>
            <div class="outpost-option-description">${buildingConfig.description}</div>
            <div class="outpost-option-cost">
                <div class="cost-item">
                    <img src="assets/icons/food.png" alt="Food" class="resource-icon">
                    <span>${cost.FOOD}</span>
                </div>
                <div class="cost-item">
                    <img src="assets/icons/ore.png" alt="Ore" class="resource-icon">
                    <span>${cost.ORE}</span>
                </div>
            </div>
        `;

        // Add benefits
        const benefits = [];
        if (outpostType === 'OUTPOST') {
            benefits.push(`+${buildingConfig.levels[0].harvestingBonus}% Harvesting Efficiency`);
            benefits.push(`+${buildingConfig.levels[0].territoryBonus}% Territory Benefits`);
        } else if (outpostType === 'RESOURCE_STATION') {
            benefits.push(`+${buildingConfig.levels[0].resourceBonus}% Resource Production`);
            benefits.push(`+${buildingConfig.levels[0].regenerationBonus}% Resource Regeneration`);
        } else if (outpostType === 'GUARD_POST') {
            benefits.push(`+${buildingConfig.levels[0].defenseBonus}% Territory Defense`);
            benefits.push(`${buildingConfig.levels[0].guardUnits} Automatic Guard Units`);
        }

        if (benefits.length > 0) {
            const benefitsList = document.createElement('ul');
            benefitsList.className = 'outpost-benefits-list';

            for (const benefit of benefits) {
                const item = document.createElement('li');
                item.textContent = benefit;
                benefitsList.appendChild(item);
            }

            outpostDetails.appendChild(benefitsList);
        }

        option.appendChild(outpostDetails);

        // Add build button
        const buildButton = document.createElement('button');
        buildButton.className = 'build-button';
        buildButton.textContent = 'Build';

        // Check if player has enough resources
        const canAfford = this.gameState.resources.FOOD >= cost.FOOD &&
                          this.gameState.resources.ORE >= cost.ORE;

        if (!canAfford) {
            buildButton.disabled = true;
            buildButton.title = 'Not enough resources';
        }

        // Add click handler
        buildButton.addEventListener('click', () => {
            const success = this.gameState.buildOutpost(outpostType, x, y);

            if (success) {
                document.getElementById('build-outpost-modal').style.display = 'none';
                this.renderMap(); // Re-render the map to show the new outpost
            } else {
                alert('Failed to build outpost. Check requirements and resources.');
            }
        });

        option.appendChild(buildButton);

        return option;
    }

    /**
     * Update the harvest estimate based on selected units
     * @param {Object} node - The resource node
     */
    updateHarvestEstimate(node) {
        const spearmen = parseInt(document.getElementById('spearman-harvest').value) || 0;
        const archers = parseInt(document.getElementById('archer-harvest').value) || 0;
        const cavalry = parseInt(document.getElementById('cavalry-harvest').value) || 0;

        const totalUnits = spearmen + archers + cavalry;

        if (totalUnits <= 0) {
            document.getElementById('harvest-estimate').textContent = 'Select units to see harvesting estimate';
            document.getElementById('start-harvest-button').disabled = true;
            return;
        }

        // Calculate travel time
        const playerBase = this.gameState.findPlayerBase();
        const distance = Math.sqrt(
            Math.pow(node.x - playerBase.x, 2) +
            Math.pow(node.y - playerBase.y, 2)
        );

        const travelTime = Math.ceil(distance); // 1 second per tile

        // Calculate harvesting time
        const harvestDuration = Math.max(30 - totalUnits, 5); // Base time: 30 seconds, reduced by 1 second per unit, minimum 5 seconds

        // Calculate total time
        const totalTime = travelTime * 2 + harvestDuration; // Travel there + harvest + travel back

        // Calculate resources harvested
        const baseAmount = node.harvestRate * totalUnits;
        const cavalryBonus = cavalry * 0.5 * node.harvestRate;
        const totalHarvested = Math.min(baseAmount + cavalryBonus, node.amount);

        // Update the estimate
        document.getElementById('harvest-estimate').innerHTML = `
            <div>Travel Time: ${travelTime} seconds each way</div>
            <div>Harvesting Time: ${harvestDuration} seconds</div>
            <div>Total Operation Time: ${totalTime} seconds</div>
            <div>Estimated Yield: ${Math.floor(totalHarvested)} ${node.type}</div>
        `;

        // Enable/disable the harvest button
        document.getElementById('start-harvest-button').disabled = false;
    }

    /**
     * Show outpost information and options
     * @param {Object} outpost - The outpost
     */
    showOutpostInfo(outpost) {
        // Create or get the outpost modal
        let outpostModal = document.getElementById('outpost-modal');

        if (!outpostModal) {
            // Create the modal if it doesn't exist
            outpostModal = document.createElement('div');
            outpostModal.id = 'outpost-modal';
            outpostModal.className = 'modal';

            const modalContent = document.createElement('div');
            modalContent.id = 'outpost-modal-content';
            modalContent.className = 'modal-content';

            const closeButton = document.createElement('span');
            closeButton.id = 'outpost-modal-close';
            closeButton.className = 'close-button';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                outpostModal.style.display = 'none';
            });

            modalContent.appendChild(closeButton);
            outpostModal.appendChild(modalContent);
            document.body.appendChild(outpostModal);
        }

        // Get the modal content element
        const modalContent = document.getElementById('outpost-modal-content');

        // Clear previous content (except close button)
        const closeButton = document.getElementById('outpost-modal-close');
        modalContent.innerHTML = '';
        modalContent.appendChild(closeButton);

        // Get building config
        const buildingConfig = CONFIG.BUILDINGS[outpost.type];

        // Add outpost information
        const outpostInfo = document.createElement('div');
        outpostInfo.className = 'outpost-info';

        // Add outpost icon
        const outpostIcon = document.createElement('div');
        outpostIcon.className = `outpost-icon-large ${outpost.type.toLowerCase()}`;
        outpostInfo.appendChild(outpostIcon);

        // Add outpost details
        const outpostDetails = document.createElement('div');
        outpostDetails.className = 'outpost-details';

        // Get status text
        let statusText = '';
        if (outpost.status === 'building') {
            statusText = 'Under Construction';
        } else if (outpost.status === 'upgrading') {
            statusText = `Upgrading to Level ${outpost.level + 1}`;
        } else {
            statusText = 'Operational';
        }

        outpostDetails.innerHTML = `
            <h3>${outpost.name}</h3>
            <div class="outpost-stat">Level: ${outpost.level}</div>
            <div class="outpost-stat">Status: ${statusText}</div>
            <div class="outpost-stat">Location: (${outpost.x}, ${outpost.y})</div>
        `;

        // Add benefits information
        if (outpost.status === 'completed') {
            const levelConfig = buildingConfig.levels[outpost.level - 1];
            const benefitsHtml = [];

            if (outpost.type === 'OUTPOST') {
                benefitsHtml.push(`<div class="outpost-benefit">+${levelConfig.harvestingBonus}% Harvesting Efficiency</div>`);
                benefitsHtml.push(`<div class="outpost-benefit">+${levelConfig.territoryBonus}% Territory Benefits</div>`);
            } else if (outpost.type === 'RESOURCE_STATION') {
                benefitsHtml.push(`<div class="outpost-benefit">+${levelConfig.resourceBonus}% Resource Production</div>`);
                benefitsHtml.push(`<div class="outpost-benefit">+${levelConfig.regenerationBonus}% Resource Regeneration</div>`);
            } else if (outpost.type === 'GUARD_POST') {
                benefitsHtml.push(`<div class="outpost-benefit">+${levelConfig.defenseBonus}% Territory Defense</div>`);
                benefitsHtml.push(`<div class="outpost-benefit">${levelConfig.guardUnits} Automatic Guard Units</div>`);
            }

            if (benefitsHtml.length > 0) {
                outpostDetails.innerHTML += `
                    <div class="outpost-benefits">
                        <h4>Benefits</h4>
                        ${benefitsHtml.join('')}
                    </div>
                `;
            }
        }

        outpostInfo.appendChild(outpostDetails);
        modalContent.appendChild(outpostInfo);

        // Add progress bar for construction/upgrading
        if (outpost.status === 'building' || outpost.status === 'upgrading') {
            const progressSection = document.createElement('div');
            progressSection.className = 'progress-section';

            // Calculate progress
            const now = Date.now();
            const elapsed = now - outpost.startTime;
            const total = outpost.completionTime - outpost.startTime;
            const percent = Math.min(100, (elapsed / total) * 100);
            const timeLeft = Math.ceil((total - elapsed) / 1000); // seconds left

            progressSection.innerHTML = `
                <h4>${outpost.status === 'building' ? 'Construction' : 'Upgrade'} Progress</h4>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percent}%"></div>
                </div>
                <div class="progress-text">${Math.floor(percent)}% complete (${timeLeft} seconds remaining)</div>
            `;

            modalContent.appendChild(progressSection);
        }

        // Add upgrade section if the outpost is completed and not at max level
        if (outpost.status === 'completed' && outpost.level < buildingConfig.levels.length) {
            const upgradeSection = document.createElement('div');
            upgradeSection.className = 'upgrade-section';

            // Get upgrade cost
            const nextLevel = outpost.level + 1;
            const upgradeCost = buildingConfig.levels[nextLevel - 1].cost;

            upgradeSection.innerHTML = `
                <h4>Upgrade to Level ${nextLevel}</h4>
                <div class="upgrade-cost">
                    <div class="cost-item">
                        <img src="assets/icons/food.png" alt="Food" class="resource-icon">
                        <span id="upgrade-food-cost">${upgradeCost.FOOD}</span>
                    </div>
                    <div class="cost-item">
                        <img src="assets/icons/ore.png" alt="Ore" class="resource-icon">
                        <span id="upgrade-ore-cost">${upgradeCost.ORE}</span>
                    </div>
                </div>
            `;

            // Add upgrade button
            const upgradeButton = document.createElement('button');
            upgradeButton.id = 'upgrade-outpost-button';
            upgradeButton.className = 'upgrade-button';
            upgradeButton.textContent = 'Upgrade';

            // Check if player has enough resources
            const canAfford = this.gameState.resources.FOOD >= upgradeCost.FOOD &&
                              this.gameState.resources.ORE >= upgradeCost.ORE;

            upgradeButton.disabled = !canAfford;

            if (!canAfford) {
                upgradeButton.title = 'Not enough resources';
            }

            // Add click handler
            upgradeButton.addEventListener('click', () => {
                const success = this.gameState.upgradeOutpost(outpost.id);

                if (success) {
                    outpostModal.style.display = 'none';
                    this.renderMap(); // Re-render the map to show the upgrade progress
                } else {
                    alert('Failed to upgrade outpost. Check that you have enough resources.');
                }
            });

            upgradeSection.appendChild(upgradeButton);
            modalContent.appendChild(upgradeSection);
        }

        // Show the modal
        outpostModal.style.display = 'block';
    }

    /**
     * Show the territory claim modal
     */
    showTerritoryClaimModal() {
        const territoryModal = document.getElementById('territory-modal');
        const radiusInput = document.getElementById('territory-radius');
        const radiusDisplay = document.getElementById('radius-display');
        const foodCostDisplay = document.getElementById('territory-food-cost');
        const oreCostDisplay = document.getElementById('territory-ore-cost');
        const claimButton = document.getElementById('claim-territory-button');

        if (!territoryModal || !radiusInput || !radiusDisplay || !foodCostDisplay || !oreCostDisplay || !claimButton) {
            console.error('Territory modal elements not found');
            return;
        }

        // Update the radius display and cost when the slider changes
        const updateTerritoryInfo = () => {
            const radius = parseInt(radiusInput.value);
            radiusDisplay.textContent = `${radius} ${radius === 1 ? 'tile' : 'tiles'}`;

            // Calculate costs
            const foodCost = 100 * radius;
            const oreCost = 150 * radius;

            foodCostDisplay.textContent = foodCost;
            oreCostDisplay.textContent = oreCost;

            // Check if player has enough resources
            const canAfford = this.gameState.resources.FOOD >= foodCost && this.gameState.resources.ORE >= oreCost;
            claimButton.disabled = !canAfford;

            if (!canAfford) {
                claimButton.title = 'Not enough resources';
            } else {
                claimButton.title = '';
            }
        };

        // Set up event listeners
        radiusInput.addEventListener('input', updateTerritoryInfo);

        // Set up claim button
        claimButton.addEventListener('click', () => {
            const radius = parseInt(radiusInput.value);
            const playerBase = this.gameState.findPlayerBase();

            if (playerBase) {
                const success = this.gameState.claimTerritory(playerBase.x, playerBase.y, radius);

                if (success) {
                    territoryModal.style.display = 'none';
                    this.renderMap(); // Re-render the map to show the new territory
                } else {
                    alert('Failed to claim territory. Check that you have enough resources.');
                }
            } else {
                alert('Player base not found. Cannot claim territory.');
            }
        });

        // Initial update
        updateTerritoryInfo();

        // Show the modal
        territoryModal.style.display = 'block';
    }

    /**
     * Update active harvesting operations display
     */
    updateHarvestingOperations() {
        // Check if the harvesting operations section exists
        let harvestingSection = document.getElementById('harvesting-operations');

        if (!harvestingSection) {
            // Create the section if it doesn't exist
            const eventsSection = document.getElementById('events-section');

            if (!eventsSection) return; // Can't find the events section to insert before

            harvestingSection = document.createElement('div');
            harvestingSection.id = 'harvesting-operations';
            harvestingSection.className = 'game-section';

            harvestingSection.innerHTML = `
                <div class="section-header">
                    <h3>Active Operations</h3>
                </div>
                <div id="harvesting-list"></div>
            `;

            // Insert before the events section
            eventsSection.parentNode.insertBefore(harvestingSection, eventsSection);
        }

        // Get the harvesting list element
        const harvestingList = document.getElementById('harvesting-list');

        // Clear the list
        harvestingList.innerHTML = '';

        // Check if there are any active operations
        if (this.gameState.harvestingOperations.length === 0) {
            harvestingList.innerHTML = '<div class="no-operations">No active operations</div>';
            return;
        }

        // Add each operation to the list
        for (const operation of this.gameState.harvestingOperations) {
            const operationElement = document.createElement('div');
            operationElement.className = `operation-item operation-${operation.status}`;

            // Calculate progress
            let progressText = '';
            let progressPercent = 0;
            const now = Date.now();

            if (operation.status === 'traveling') {
                const elapsed = now - operation.startTime;
                progressPercent = Math.min(100, (elapsed / operation.travelTime) * 100);
                progressText = `Traveling to ${operation.node.type} node (${Math.floor(progressPercent)}%)`;
            } else if (operation.status === 'harvesting') {
                const elapsed = now - operation.harvestTime;
                progressPercent = Math.min(100, (elapsed / operation.harvestDuration) * 100);
                progressText = `Harvesting ${operation.node.type} (${Math.floor(progressPercent)}%)`;
            } else if (operation.status === 'returning') {
                const elapsed = now - operation.returnTime;
                progressPercent = Math.min(100, (elapsed / operation.travelTime) * 100);
                progressText = `Returning with ${operation.resourcesHarvested} ${operation.node.type} (${Math.floor(progressPercent)}%)`;
            }

            // Show units involved
            const unitText = [];
            if (operation.units.SPEARMAN > 0) unitText.push(`${operation.units.SPEARMAN} Spearmen`);
            if (operation.units.ARCHER > 0) unitText.push(`${operation.units.ARCHER} Archers`);
            if (operation.units.CAVALRY > 0) unitText.push(`${operation.units.CAVALRY} Cavalry`);

            operationElement.innerHTML = `
                <div class="operation-status">${progressText}</div>
                <div class="operation-units">${unitText.join(', ')}</div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
            `;

            harvestingList.appendChild(operationElement);
        }
    }

    /**
     * Render the minimap
     */
    renderMinimap() {
        const minimap = this.elements.mapElements.minimap;
        if (!minimap) return;

        minimap.innerHTML = '';

        // Calculate minimap scale
        const mapWidth = this.mapSize.width * 40; // Cell size is 40px
        const mapHeight = this.mapSize.height * 40;

        const minimapScale = Math.min(
            minimap.clientWidth / mapWidth,
            minimap.clientHeight / mapHeight
        );

        // Create minimap canvas
        const canvas = document.createElement('canvas');
        canvas.width = minimap.clientWidth;
        canvas.height = minimap.clientHeight;
        minimap.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Draw terrain
        for (let y = 0; y < this.mapSize.height; y++) {
            for (let x = 0; x < this.mapSize.width; x++) {
                const terrainSeed = (x * 3 + y * 7 + Math.floor(x/5) * 11 + Math.floor(y/5) * 13) % 15;

                // Set color based on terrain type
                if (terrainSeed < 7) {
                    ctx.fillStyle = '#2a6e2a'; // grass
                } else if (terrainSeed < 10) {
                    ctx.fillStyle = '#0e4e0e'; // forest
                } else if (terrainSeed < 13) {
                    ctx.fillStyle = '#6e4e2a'; // mountain
                } else {
                    ctx.fillStyle = '#2a4e6e'; // water
                }

                // Draw cell
                ctx.fillRect(
                    x * 40 * minimapScale,
                    y * 40 * minimapScale,
                    40 * minimapScale,
                    40 * minimapScale
                );
            }
        }

        // Draw claimed territories
        if (this.gameState.claimedTerritories && this.gameState.claimedTerritories.length > 0) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#4f4f'; // semi-transparent green

            for (const territory of this.gameState.claimedTerritories) {
                ctx.beginPath();
                ctx.arc(
                    (territory.x * 40 + 20) * minimapScale,
                    (territory.y * 40 + 20) * minimapScale,
                    territory.radius * 40 * minimapScale,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }

            ctx.globalAlpha = 1.0;
        }

        // Draw resource nodes
        for (const node of this.resourceNodes) {
            if (node.type === 'FOOD') {
                ctx.fillStyle = '#4f4'; // bright green for food
            } else if (node.type === 'ORE') {
                ctx.fillStyle = '#f84'; // orange for ore
            }

            // Draw resource node marker
            const markerSize = 4 * minimapScale;
            ctx.fillRect(
                (node.x * 40 + 20 - markerSize/2) * minimapScale,
                (node.y * 40 + 20 - markerSize/2) * minimapScale,
                markerSize,
                markerSize
            );
        }

        // Draw player base and enemy camps
        for (let y = 0; y < this.gameState.mapSize.height; y++) {
            for (let x = 0; x < this.gameState.mapSize.width; x++) {
                const mapCell = this.gameState.map[y][x];

                if (mapCell) {
                    if (mapCell.type === 'PLAYER') {
                        ctx.fillStyle = '#4ff'; // cyan for player
                    } else if (mapCell.type === 'NPC') {
                        ctx.fillStyle = '#f44'; // bright red for enemies
                    } else {
                        continue;
                    }

                    // Draw marker
                    const markerSize = 6 * minimapScale;
                    ctx.fillRect(
                        (x * 40 + 20 - markerSize/2) * minimapScale,
                        (y * 40 + 20 - markerSize/2) * minimapScale,
                        markerSize,
                        markerSize
                    );
                }
            }
        }
    }

    /**
     * Update the UI with current game state
     */
    updateUI() {
        // Update resource values directly without animations
        this.elements.resources.food.textContent = Math.floor(this.gameState.resources.FOOD);
        this.elements.resources.ore.textContent = Math.floor(this.gameState.resources.ORE);

        // Update game timer
        if (this.elements.gameInfo.timer) {
            this.elements.gameInfo.timer.textContent = this.gameState.getFormattedGameTime();
        }

        // Update game speed display
        this.updateGameSpeedDisplay();

        // Update online status
        if (this.elements.gameInfo.statusIndicator) {
            if (this.gameState.isOnline) {
                this.elements.gameInfo.statusIndicator.classList.remove('offline');
            } else {
                this.elements.gameInfo.statusIndicator.classList.add('offline');
            }
        }

        // Update buildings grid
        this.updateBuildingsGrid();

        // Update building buttons
        this.updateBuildingButtons();

        // Update unit stats
        if (this.elements.unitStats) {
            document.getElementById('spearman-count').textContent = this.gameState.units.SPEARMAN;
            document.getElementById('archer-count').textContent = this.gameState.units.ARCHER;
            document.getElementById('cavalry-count').textContent = this.gameState.units.CAVALRY;

            // Update food upkeep display
            const foodUpkeep = this.unitManager.calculateTotalUpkeep().FOOD;
            // Convert to per minute (since we reduced the rate by 10x)
            const foodUpkeepPerMinute = Math.round(foodUpkeep * 60 * 10) / 10;
            document.getElementById('food-upkeep').textContent = foodUpkeepPerMinute;
        }

        // Update training controls
        this.updateTrainingControls();

        // Update research UI
        this.updateResearchStatus();
        this.updateResearchOptions();

        // Update attack button
        this.elements.attackButton.disabled = (this.gameState.units.SPEARMAN <= 0 && this.gameState.units.ARCHER <= 0 && this.gameState.units.CAVALRY <= 0);

        // Update combat reports
        this.updateCombatReports();

        // Update harvesting operations
        this.updateHarvestingOperations();

        // Update event history if events UI exists
        if (this.eventsUI) {
            this.eventsUI.updateEventHistory();
        }

        // Update diplomacy UI if it exists
        if (this.diplomacyUI) {
            this.diplomacyUI.update();
        }
    }

    /**
     * Update the buildings grid
     */
    updateBuildingsGrid() {
        this.elements.buildingsGrid.innerHTML = '';

        // Create building tiles
        for (const [buildingType, building] of Object.entries(this.gameState.buildings)) {
            const buildingConfig = CONFIG.BUILDINGS[buildingType];

            const tile = document.createElement('div');
            tile.className = 'building-tile';

            // Resource production visual effects removed as per user preference

            // Check if building is under construction
            const constructionItem = this.gameState.buildQueue.find(item => item.buildingType === buildingType);
            if (constructionItem) {
                tile.classList.add('constructing');

                // Calculate construction progress
                const buildingLevel = building.level;
                const nextLevelConfig = buildingConfig.levels[buildingLevel];
                const baseConstructionTime = 10; // Default construction time
                const progress = 100 - ((constructionItem.timeRemaining / baseConstructionTime) * 100);

                tile.innerHTML = `
                    <div class="building-icon ${buildingType}"></div>
                    <div class="building-name">${buildingConfig.name}</div>
                    <div class="building-level">Lvl ${building.level}</div>
                    <div class="construction-progress">
                        <div class="progress-text">Upgrading: ${Math.floor(progress)}%</div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                `;
            } else {
                tile.innerHTML = `
                    <div class="building-icon ${buildingType}"></div>
                    <div class="building-name">${buildingConfig.name}</div>
                    <div class="building-level">Lvl ${building.level}</div>
                `;
            }

            this.elements.buildingsGrid.appendChild(tile);
        }

        // Add empty tiles to fill the grid
        const totalTiles = 9;
        const emptyTiles = totalTiles - Object.keys(this.gameState.buildings).length;

        for (let i = 0; i < emptyTiles; i++) {
            const emptyTile = document.createElement('div');
            emptyTile.className = 'building-tile empty';
            emptyTile.innerHTML = `
                <div class="building-icon empty"></div>
                <div class="building-name">Empty</div>
            `;
            this.elements.buildingsGrid.appendChild(emptyTile);
        }
    }

    /**
     * Update building buttons
     */
    updateBuildingButtons() {
        const buttons = this.elements.buildingButtons.querySelectorAll('.building-button');

        buttons.forEach(button => {
            const buildingType = button.dataset.buildingType;
            const canBuild = this.buildingManager.canBuildOrUpgrade(buildingType);

            button.disabled = !canBuild;

            // Update cost display
            const buildingConfig = CONFIG.BUILDINGS[buildingType];
            const currentLevel = this.gameState.buildings[buildingType]?.level || 0;

            if (currentLevel < buildingConfig.maxLevel) {
                const cost = buildingConfig.levels[currentLevel].cost;
                const costItems = button.querySelectorAll('.cost-item');
                if (costItems.length >= 2) {
                    costItems[0].innerHTML = `<div class="cost-icon food"></div>${cost.FOOD}`;
                    costItems[1].innerHTML = `<div class="cost-icon ore"></div>${cost.ORE}`;
                }
            } else {
                button.disabled = true;
                const costDiv = button.querySelector('.building-cost');
                if (costDiv) {
                    costDiv.innerHTML = '<div class="max-level">Max Level</div>';
                }
            }
        });
    }

    /**
     * Update training controls
     */
    updateTrainingControls() {
        // Clear existing training queue display
        const existingQueueDisplay = this.elements.trainingControls.querySelector('.training-queue-display');
        if (existingQueueDisplay) {
            existingQueueDisplay.remove();
        }

        // Update train buttons
        const trainButtons = this.elements.trainingControls.querySelectorAll('.train-button');

        trainButtons.forEach(button => {
            const unitType = button.dataset.unitType;
            const canTrain = this.unitManager.canTrainUnits(unitType, 1);

            button.disabled = !canTrain;
        });

        // Add training queue display if there are units in training
        if (this.gameState.trainingQueue.length > 0) {
            const queueDisplay = document.createElement('div');
            queueDisplay.className = 'training-queue-display';

            const currentTraining = this.gameState.trainingQueue[0];
            const unitConfig = CONFIG.UNITS[currentTraining.unitType];

            // Calculate training progress
            const barracksLevel = this.gameState.buildings.BARRACKS.level - 1;
            const trainingSpeed = CONFIG.BUILDINGS.BARRACKS.levels[barracksLevel].trainingSpeed;
            const baseTrainingTime = (currentTraining.quantity * 5) / trainingSpeed;
            const progress = 100 - ((currentTraining.timeRemaining / baseTrainingTime) * 100);

            queueDisplay.innerHTML = `
                <div class="training-header">Training in Progress</div>
                <div class="training-info">
                    <div class="unit-type">
                        <div class="unit-icon-small ${currentTraining.unitType}">${currentTraining.unitType.charAt(0)}</div>
                        <span>${unitConfig.name} x${currentTraining.quantity}</span>
                    </div>
                    <div class="training-progress">
                        <div class="progress-text">Progress: ${Math.floor(progress)}%</div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            `;

            this.elements.trainingControls.appendChild(queueDisplay);
        }
    }

    /**
     * Update combat reports
     */
    updateCombatReports() {
        this.elements.combatReports.innerHTML = '';

        // First, show active combats
        const activeCombats = this.combatManager.getActiveCombats();
        if (activeCombats.length > 0) {
            const activeCombatsSection = document.createElement('div');
            activeCombatsSection.className = 'active-combats-section';
            activeCombatsSection.innerHTML = '<h4>Active Combats</h4>';

            activeCombats.forEach(combat => {
                const campConfig = CONFIG.NPC_CAMPS[combat.target.campType];
                const combatElement = document.createElement('div');
                combatElement.className = 'active-combat';

                // Calculate progress
                let progressText = '';
                let progressPercent = 0;

                if (combat.status === 'traveling') {
                    const elapsed = Date.now() - combat.startTime;
                    progressPercent = Math.min(100, (elapsed / combat.travelTime) * 100);
                    progressText = `Traveling to ${campConfig.name} (${Math.floor(progressPercent)}%)`;
                } else if (combat.status === 'fighting') {
                    progressText = `Fighting at ${campConfig.name}`;
                    progressPercent = 100;
                } else if (combat.status === 'returning') {
                    const returnElapsed = Date.now() - (combat.returnTime - (combat.travelTime / 2));
                    progressPercent = Math.min(100, (returnElapsed / (combat.travelTime / 2)) * 100);
                    progressText = `Returning from ${campConfig.name} (${Math.floor(progressPercent)}%)`;
                }

                // Show units involved
                const unitText = [];
                if (combat.units.SPEARMAN > 0) unitText.push(`${combat.units.SPEARMAN} Spearmen`);
                if (combat.units.ARCHER > 0) unitText.push(`${combat.units.ARCHER} Archers`);
                if (combat.units.CAVALRY > 0) unitText.push(`${combat.units.CAVALRY} Cavalry`);

                combatElement.innerHTML = `
                    <div class="combat-status">${progressText}</div>
                    <div class="combat-units">${unitText.join(', ')}</div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                `;

                activeCombatsSection.appendChild(combatElement);
            });

            this.elements.combatReports.appendChild(activeCombatsSection);
        }

        // Then show combat reports
        if (this.gameState.combatReports.length > 0) {
            const reportsSection = document.createElement('div');
            reportsSection.className = 'combat-reports-section';
            reportsSection.innerHTML = '<h4>Combat Reports</h4>';

            this.gameState.combatReports.forEach(report => {
                const reportElement = document.createElement('div');
                reportElement.className = `combat-report combat-${report.result}`;

                // Format unit advantages
                let advantagesHtml = '';
                if (report.combatDetails && report.combatDetails.unitAdvantages) {
                    for (const [unitType, advantage] of Object.entries(report.combatDetails.unitAdvantages)) {
                        advantagesHtml += `<div class="advantage">${advantage.description}</div>`;
                    }
                }

                // Format tech bonuses
                let techBonusesHtml = '';
                if (report.combatDetails && report.combatDetails.techBonuses) {
                    const bonuses = report.combatDetails.techBonuses;
                    if (bonuses.attackBonus) {
                        techBonusesHtml += `<div class="tech-bonus">Attack: ${bonuses.attackBonus}</div>`;
                    }
                    if (bonuses.defenseBonus) {
                        techBonusesHtml += `<div class="tech-bonus">Defense: ${bonuses.defenseBonus}</div>`;
                    }
                    if (bonuses.casualtyReduction) {
                        techBonusesHtml += `<div class="tech-bonus">Casualties: ${bonuses.casualtyReduction}</div>`;
                    }
                }

                // Check if we have combat details
                const combatDetails = report.combatDetails ? `
                    <div class="combat-details">
                        <div>Attack Power: ${report.combatDetails.playerAttack?.toFixed(1) || '?'}</div>
                        <div>Enemy Defense: ${report.combatDetails.npcDefense || '?'}</div>
                        ${advantagesHtml}
                        ${techBonusesHtml ? `<div class="tech-bonuses">${techBonusesHtml}</div>` : ''}
                    </div>
                ` : '';

                reportElement.innerHTML = `
                    <div class="report-header">
                        <div class="report-timestamp">[${report.timestamp}]</div>
                        <div class="report-target">Attack on ${report.target}</div>
                        <div class="report-result">${report.result === 'victory' ? '<span class="victory">Victory!</span>' : '<span class="defeat">Defeat!</span>'}</div>
                    </div>
                    <div class="report-units">
                        <div>Spearmen: Sent ${report.unitsSent.SPEARMAN}, Lost ${report.unitsLost.SPEARMAN}</div>
                        <div>Archers: Sent ${report.unitsSent.ARCHER}, Lost ${report.unitsLost.ARCHER}</div>
                        <div>Cavalry: Sent ${report.unitsSent.CAVALRY || 0}, Lost ${report.unitsLost.CAVALRY || 0}</div>
                    </div>
                    <div class="report-loot">Loot: Food ${report.loot.FOOD}, Ore ${report.loot.ORE}</div>
                    ${combatDetails}
                `;

                reportsSection.appendChild(reportElement);
            });

            this.elements.combatReports.appendChild(reportsSection);
        }

        // Show message if no reports or active combats
        if (activeCombats.length === 0 && this.gameState.combatReports.length === 0) {
            const noReportsElement = document.createElement('div');
            noReportsElement.className = 'no-reports';
            noReportsElement.textContent = 'No combat reports yet. Attack an enemy camp to generate reports.';
            this.elements.combatReports.appendChild(noReportsElement);
        }
    }

    /**
     * Update research status
     */
    updateResearchStatus() {
        const researchQueue = this.gameState.researchQueue;

        if (researchQueue.length === 0) {
            this.elements.research.currentResearch.textContent = 'No research in progress';
            this.elements.research.progressBar.style.width = '0%';
            return;
        }

        const currentResearch = researchQueue[0];
        const techConfig = CONFIG.TECHNOLOGIES[currentResearch.category][currentResearch.techId];

        // Calculate progress percentage
        let totalTime = techConfig.researchTime;
        if (this.gameState.buildings.LIBRARY) {
            const libraryLevel = this.gameState.buildings.LIBRARY.level;
            const researchSpeed = CONFIG.BUILDINGS.LIBRARY.levels[libraryLevel - 1].researchSpeed;
            totalTime /= researchSpeed;
        }

        const progress = 100 - ((currentResearch.timeRemaining / totalTime) * 100);

        // Update UI
        this.elements.research.currentResearch.textContent = `Researching: ${techConfig.name} (${Math.floor(progress)}%)`;
        this.elements.research.progressBar.style.width = `${progress}%`;
    }

    /**
     * Show event modal
     * @param {Object} event - The event to display
     */
    showEventModal(event) {
        if (this.eventsUI) {
            this.eventsUI.showEventModal(event);
        }
    }

    /**
     * Update research options
     */
    updateResearchOptions() {
        const optionsContainer = this.elements.research.options;
        optionsContainer.innerHTML = '';

        // Get all technologies for the current category
        const categoryTechs = CONFIG.TECHNOLOGIES[this.activeResearchTab];
        const researchedTechs = this.gameState.technologies[this.activeResearchTab];

        // Create elements for each technology
        for (const [techId, techConfig] of Object.entries(categoryTechs)) {
            const isResearched = researchedTechs[techId];
            const canResearch = this.researchManager.canResearch(this.activeResearchTab, techId);

            const techElement = document.createElement('div');
            techElement.className = `research-item ${isResearched ? 'researched' : ''} ${!canResearch && !isResearched ? 'unavailable' : ''}`;

            // Format requirements text
            let requirementsText = '';
            for (const [reqType, reqValue] of Object.entries(techConfig.requirements)) {
                if (reqType === 'TECHNOLOGIES') {
                    // Technology dependencies
                    for (const [reqCategory, reqTechs] of Object.entries(reqValue)) {
                        for (const [reqTechId, required] of Object.entries(reqTechs)) {
                            if (required) {
                                const reqTechName = CONFIG.TECHNOLOGIES[reqCategory][reqTechId].name;
                                requirementsText += `<div>Requires: ${reqTechName}</div>`;
                            }
                        }
                    }
                } else {
                    // Building requirements
                    if (CONFIG.BUILDINGS[reqType]) {
                        const buildingName = CONFIG.BUILDINGS[reqType].name;
                        requirementsText += `<div>Requires: ${buildingName} Level ${reqValue}</div>`;
                    } else {
                        requirementsText += `<div>Requires: ${reqType} Level ${reqValue}</div>`;
                    }
                }
            }

            // Format effects text
            let effectsText = '';
            for (const [effectType, effectValue] of Object.entries(techConfig.effects)) {
                let effectDescription = '';

                switch (effectType) {
                    case 'unitAttackBonus':
                        effectDescription = `+${effectValue * 100}% Unit Attack`;
                        break;
                    case 'unitDefenseBonus':
                        effectDescription = `+${effectValue * 100}% Unit Defense`;
                        break;
                    case 'foodProductionBonus':
                        effectDescription = `+${effectValue * 100}% Food Production`;
                        break;
                    case 'oreProductionBonus':
                        effectDescription = `+${effectValue * 100}% Ore Production`;
                        break;
                    case 'storageCapacityBonus':
                        effectDescription = `+${effectValue * 100}% Storage Capacity`;
                        break;
                    case 'wallDefenseBonus':
                        effectDescription = `+${effectValue * 100}% Wall Defense`;
                        break;
                    case 'advantageBonus':
                        effectDescription = `+${effectValue * 100}% Unit Type Advantages`;
                        break;
                    case 'defensiveCasualtyReduction':
                        effectDescription = `-${effectValue * 100}% Casualties in Combat`;
                        break;
                    default:
                        effectDescription = `${effectType}: ${effectValue}`;
                }

                effectsText += `<div>${effectDescription}</div>`;
            }

            techElement.innerHTML = `
                <div class="research-name">${techConfig.name}</div>
                <div class="research-description">${techConfig.description}</div>
                <div class="research-cost">Cost: ${techConfig.cost.FOOD} Food, ${techConfig.cost.ORE} Ore</div>
                <div class="research-time">Research Time: ${techConfig.researchTime}s</div>
                <div class="research-effects">${effectsText}</div>
                <div class="research-requirements">${requirementsText}</div>
            `;

            // Add research button if not already researched
            if (!isResearched) {
                const researchButton = document.createElement('button');
                researchButton.className = 'research-button';
                researchButton.textContent = 'Research';
                researchButton.disabled = !canResearch;

                researchButton.addEventListener('click', () => {
                    this.researchManager.startResearch(this.activeResearchTab, techId);
                });

                techElement.appendChild(researchButton);
            }

            optionsContainer.appendChild(techElement);
        }
    }
}

// Create global UI manager (will be initialized in main.js)
