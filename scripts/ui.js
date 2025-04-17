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

        // Set up state change handler
        this.gameState.onStateChange = () => this.updateUI();

        // DOM elements
        this.elements = {
            resources: {
                food: document.getElementById('food-count'),
                ore: document.getElementById('ore-count')
            },
            buildingsGrid: document.getElementById('buildings-grid'),
            buildingButtons: document.getElementById('building-buttons'),
            unitStats: {
                spearman: document.getElementById('spearman-count'),
                archer: document.getElementById('archer-count'),
                cavalry: document.getElementById('cavalry-count')
            },
            trainingControls: document.getElementById('training-controls'),
            attackButton: document.getElementById('attack-button'),
            combatReports: document.getElementById('combat-reports'),
            gameMap: document.getElementById('game-map'),
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
        this.renderMap();
        this.updateUI();

        // Start resource production animations after a delay
        setTimeout(() => {
            animationManager.startResourceProductionAnimations(this.gameState, this.elements);
        }, 2000); // Start after 2 seconds to let the UI settle
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
                        animationManager.createBuildingConstructionAnimation(buildingType, tile, () => {
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

        // Set explicit grid template based on map size
        mapGrid.style.gridTemplateColumns = `repeat(${this.gameState.mapSize.width}, 32px)`;
        mapGrid.style.gridTemplateRows = `repeat(${this.gameState.mapSize.height}, 32px)`;

        // Render map cells
        for (let y = 0; y < this.gameState.mapSize.height; y++) {
            for (let x = 0; x < this.gameState.mapSize.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell';

                const mapCell = this.gameState.map[y][x];

                if (mapCell) {
                    if (mapCell.type === 'PLAYER') {
                        cell.style.backgroundColor = '#2a4';
                        cell.textContent = 'P';
                    } else if (mapCell.type === 'NPC') {
                        cell.style.backgroundColor = '#a42';
                        cell.textContent = 'E';

                        // Add click handler for attacking
                        cell.addEventListener('click', () => {
                            this.combatManager.attackNPC(x, y);
                        });
                        cell.style.cursor = 'pointer';
                    }
                }

                mapGrid.appendChild(cell);
            }
        }

        mapElement.appendChild(mapGrid);
    }

    /**
     * Update the UI with current game state
     */
    updateUI() {
        // Get previous values for animation
        const prevFood = parseInt(this.elements.resources.food.textContent) || 0;
        const prevOre = parseInt(this.elements.resources.ore.textContent) || 0;

        // Get current values
        const currentFood = Math.floor(this.gameState.resources.FOOD);
        const currentOre = Math.floor(this.gameState.resources.ORE);

        // Calculate differences for animation
        const foodDiff = currentFood - prevFood;
        const oreDiff = currentOre - prevOre;

        // Create resource gain animations if significant change
        if (foodDiff > 5) {
            animationManager.createResourceGainAnimation('FOOD', foodDiff, this.elements.resources.food);
        }

        if (oreDiff > 5) {
            animationManager.createResourceGainAnimation('ORE', oreDiff, this.elements.resources.ore);
        }

        // Update resource values
        this.elements.resources.food.textContent = currentFood;
        this.elements.resources.ore.textContent = currentOre;

        // Update buildings grid
        this.updateBuildingsGrid();

        // Update building buttons
        this.updateBuildingButtons();

        // Update unit stats
        this.elements.unitStats.spearman.textContent = this.gameState.units.SPEARMAN;
        this.elements.unitStats.archer.textContent = this.gameState.units.ARCHER;
        this.elements.unitStats.cavalry.textContent = this.gameState.units.CAVALRY;

        // Update training controls
        this.updateTrainingControls();

        // Update research UI
        this.updateResearchStatus();
        this.updateResearchOptions();

        // Update attack button
        this.elements.attackButton.disabled = (this.gameState.units.SPEARMAN <= 0 && this.gameState.units.ARCHER <= 0 && this.gameState.units.CAVALRY <= 0);

        // Update combat reports
        this.updateCombatReports();
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
        const activeCombats = combatManager.getActiveCombats();
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
