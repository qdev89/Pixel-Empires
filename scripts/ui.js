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

        // Set up state change handler
        this.gameState.onStateChange = () => this.updateUI();

        // Map state
        this.mapZoom = 1;
        this.mapPosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.mapSize = { width: 20, height: 20 }; // Expanded map size

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
                centerMap: document.getElementById('center-map')
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
        this.renderMap();
        this.updateUI();

        // Set up online status toggle (for demonstration)
        if (this.elements.gameInfo.onlineStatus) {
            this.elements.gameInfo.onlineStatus.addEventListener('click', () => {
                this.gameState.toggleOnlineStatus();
            });
        }

        // Resource production animations disabled as per user request
    }

    /**
     * Initialize map controls for zooming and panning
     */
    initializeMapControls() {
        // Set up zoom in button
        if (this.elements.mapControls.zoomIn) {
            this.elements.mapControls.zoomIn.addEventListener('click', () => {
                this.mapZoom = Math.min(this.mapZoom + 0.2, 3.0);
                this.updateMapTransform();
                this.updateMinimapViewport();
            });
        }

        // Set up zoom out button
        if (this.elements.mapControls.zoomOut) {
            this.elements.mapControls.zoomOut.addEventListener('click', () => {
                this.mapZoom = Math.max(this.mapZoom - 0.2, 0.5);
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

            // Mouse wheel zoom
            gameMap.addEventListener('wheel', (e) => {
                e.preventDefault();

                // Get mouse position relative to map
                const rect = gameMap.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Calculate position in map coordinates before zoom
                const mapX = (mouseX - this.mapPosition.x) / this.mapZoom;
                const mapY = (mouseY - this.mapPosition.y) / this.mapZoom;

                // Adjust zoom level
                if (e.deltaY < 0) {
                    // Zoom in
                    this.mapZoom = Math.min(this.mapZoom * 1.1, 3.0);
                } else {
                    // Zoom out
                    this.mapZoom = Math.max(this.mapZoom * 0.9, 0.5);
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
                <span>${buildingConfig.name}</span>
                <span class="building-cost">F: ${buildingConfig.levels[0].cost.FOOD} O: ${buildingConfig.levels[0].cost.ORE}</span>
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
        spearmanButton.textContent = 'Train Spearman';
        spearmanButton.dataset.unitType = 'SPEARMAN';

        spearmanButton.addEventListener('click', () => {
            this.unitManager.trainUnits('SPEARMAN', 1);
        });

        this.elements.trainingControls.appendChild(spearmanButton);

        // Archer training button
        const archerButton = document.createElement('button');
        archerButton.className = 'train-button';
        archerButton.textContent = 'Train Archer';
        archerButton.dataset.unitType = 'ARCHER';

        archerButton.addEventListener('click', () => {
            this.unitManager.trainUnits('ARCHER', 1);
        });

        this.elements.trainingControls.appendChild(archerButton);

        // Cavalry training button
        const cavalryButton = document.createElement('button');
        cavalryButton.className = 'train-button';
        cavalryButton.textContent = 'Train Cavalry';
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

        // Render map cells for the expanded map
        for (let y = 0; y < this.mapSize.height; y++) {
            for (let x = 0; x < this.mapSize.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                // Add terrain type based on position
                // This creates a more interesting map with varied terrain
                const terrainSeed = (x * 3 + y * 7) % 10; // Simple deterministic "random" value
                if (terrainSeed < 5) {
                    cell.classList.add('grass');
                } else if (terrainSeed < 7) {
                    cell.classList.add('forest');
                } else if (terrainSeed < 9) {
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

                mapGrid.appendChild(cell);
            }
        }

        mapElement.appendChild(mapGrid);

        // Render minimap
        this.renderMinimap();

        // Apply current transform
        this.updateMapTransform();
        this.updateMinimapViewport();
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
                const terrainSeed = (x * 3 + y * 7) % 10;

                // Set color based on terrain type
                if (terrainSeed < 5) {
                    ctx.fillStyle = '#2a6e2a'; // grass
                } else if (terrainSeed < 7) {
                    ctx.fillStyle = '#0e4e0e'; // forest
                } else if (terrainSeed < 9) {
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

        // Draw player base and enemy camps
        for (let y = 0; y < this.gameState.mapSize.height; y++) {
            for (let x = 0; x < this.gameState.mapSize.width; x++) {
                const mapCell = this.gameState.map[y][x];

                if (mapCell) {
                    if (mapCell.type === 'PLAYER') {
                        ctx.fillStyle = '#4f4'; // bright green for player
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

        // Update event history if events UI exists
        if (this.eventsUI) {
            this.eventsUI.updateEventHistory();
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

            // Add special classes for producing buildings
            if (building.level > 0) {
                const level = building.level - 1; // Adjust for 0-based array
                const effects = buildingConfig.levels[level];

                // Add producing classes for visual effects
                if (effects.production) {
                    if (effects.production.FOOD > 0) {
                        tile.classList.add('producing-food');
                    }
                    if (effects.production.ORE > 0) {
                        tile.classList.add('producing-ore');
                    }
                }
            }

            // Add class for buildings under construction
            if (this.gameState.buildQueue.some(item => item.buildingType === buildingType)) {
                tile.classList.add('constructing');
            }

            tile.innerHTML = `
                <div class="building-icon">${buildingType.charAt(0)}</div>
                <div class="building-name">${buildingConfig.name}</div>
                <div class="building-level">Lvl ${building.level}</div>
            `;

            this.elements.buildingsGrid.appendChild(tile);
        }

        // Add empty tiles to fill the grid
        const totalTiles = 9;
        const emptyTiles = totalTiles - Object.keys(this.gameState.buildings).length;

        for (let i = 0; i < emptyTiles; i++) {
            const emptyTile = document.createElement('div');
            emptyTile.className = 'building-tile';
            emptyTile.innerHTML = '<div class="building-name">Empty</div>';
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
                const costSpan = button.querySelector('.building-cost');
                costSpan.textContent = `F: ${cost.FOOD} O: ${cost.ORE}`;
            } else {
                button.disabled = true;
                const costSpan = button.querySelector('.building-cost');
                costSpan.textContent = 'Max Level';
            }
        });
    }

    /**
     * Update training controls
     */
    updateTrainingControls() {
        const trainButtons = this.elements.trainingControls.querySelectorAll('.train-button');

        trainButtons.forEach(button => {
            const unitType = button.dataset.unitType;
            const canTrain = this.unitManager.canTrainUnits(unitType, 1);

            button.disabled = !canTrain;
        });
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
                    const buildingName = CONFIG.BUILDINGS[reqType].name;
                    requirementsText += `<div>Requires: ${buildingName} Level ${reqValue}</div>`;
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
