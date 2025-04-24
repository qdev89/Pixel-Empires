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

        // Initialize map UI
        this.mapUI = new MapUI(this.gameState, this);

        // Set up state change handler
        this.gameState.onStateChange = () => this.updateUI();

        // Map state is now handled by MapUI class
        // Removed old map state variables to avoid conflicts

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
            // Map elements are now handled by MapUI class
            // Removed old map elements to avoid conflicts

            research: {
                currentResearch: document.getElementById('current-research'),
                progressBar: document.getElementById('research-progress-bar'),
                tabs: document.querySelector('.sub-tabs'),
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
        this.initializeMapControls(); // Now just a stub
        this.initializeEmpireTabs();
        // Map rendering is now handled by MapUI class
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

        // Set up cheat button for unlimited resources
        if (this.elements.gameControls.cheatButton) {
            this.elements.gameControls.cheatButton.addEventListener('click', () => {
                this.gameState.setUnlimitedResources();
                this.updateUI();
            });
        }

        // Territory claim button is now handled by MapUI class

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
     * Now handled by MapUI class
     */
    initializeMapControls() {
        // Map controls are now handled by MapUI class
        console.log('Map controls initialized by MapUI class');
    }

    /**
     * Map transform and minimap viewport functions are now handled by MapUI class
     */

    /**
     * Initialize research UI
     */
    initializeResearchUI() {
        // Check if research tabs element exists
        if (!this.elements.research.tabs) {
            console.warn('Research tabs element not found. Skipping research UI initialization.');
            return;
        }

        // Set up research tab buttons
        const tabButtons = this.elements.research.tabs.querySelectorAll('.sub-tab-button');

        if (tabButtons.length === 0) {
            console.warn('No research tab buttons found. Skipping research UI initialization.');
            return;
        }

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
     * Now handled by MapUI class
     */
    renderMap() {
        // Map rendering is now handled by MapUI class
        console.log('Map rendering handled by MapUI class');
    }

    /**
     * Generate resource nodes on the map
     * Now handled by MapUI class
     */
    generateResourceNodes() {
        // Resource node generation is now handled by MapUI class
        console.log('Resource node generation handled by MapUI class');
    }

    /**
     * Generate special resource nodes on the map
     * Now handled by MapUI class
     */
    generateSpecialResourceNodes() {
        // Special resource node generation is now handled by MapUI class
        console.log('Special resource node generation handled by MapUI class');
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
     * Resource collectors removed as per user preference
     */
    updateHarvestingOperations() {
        // Resource collectors removed as per user preference
        return;
    }

    /**
     * Render the minimap
     * Now handled by MapUI class
     */
    renderMinimap() {
        // Minimap rendering is now handled by MapUI class
        console.log('Minimap rendering handled by MapUI class');
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

        // Resource collectors removed as per user preference

        // Update event history if events UI exists
        if (this.eventsUI) {
            this.eventsUI.updateEventHistory();
        }

        // Update diplomacy UI if it exists
        if (this.diplomacyUI) {
            this.diplomacyUI.update();
        }

        // Update map UI if it exists and is fully initialized
        try {
            if (this.mapUI) {
                this.mapUI.update();
            }
        } catch (error) {
            console.warn('Map UI not fully initialized yet:', error.message);
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
