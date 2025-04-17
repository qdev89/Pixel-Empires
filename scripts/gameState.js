/**
 * Game State Management
 * Handles the core game state and logic
 */

class GameState {
    constructor() {
        // Initialize game state from config
        this.resources = { ...CONFIG.INITIAL_STATE.resources };
        this.buildings = { ...CONFIG.INITIAL_STATE.buildings };
        this.units = { ...CONFIG.INITIAL_STATE.units };
        this.technologies = { ...CONFIG.INITIAL_STATE.technologies };
        this.mapSize = { ...CONFIG.INITIAL_STATE.mapSize };

        // Additional state properties
        this.lastTick = Date.now();
        this.gameStartTime = Date.now();
        this.buildQueue = [];
        this.trainingQueue = [];
        this.researchQueue = [];
        this.combatReports = [];
        this.isOnline = true; // Online status

        // Calculate initial storage capacity
        this.storageCapacity = {
            FOOD: 100,
            ORE: 100
        };

        // Initialize bonuses from technologies
        this.bonuses = {
            unitAttack: 0,
            unitDefense: 0,
            foodProduction: 0,
            oreProduction: 0,
            storageCapacity: 0,
            wallDefense: 0,
            advantageMultiplier: 0,
            defensiveCasualtyReduction: 0
        };

        // Initialize map with NPC camps
        this.initializeMap();

        // Initialize event manager
        this.eventManager = new EventManager(this);

        // Initialize activity log manager
        this.activityLogManager = new ActivityLogManager(this);

        // Add initial log entry
        this.activityLogManager.addLogEntry('System', 'Game started');

        // Initialize save system
        this.saveSystem = new SaveSystem(this);
    }

    /**
     * Initialize the game map with NPC camps
     */
    initializeMap() {
        this.map = Array(this.mapSize.height).fill().map(() =>
            Array(this.mapSize.width).fill(null)
        );

        // Place player base
        this.map[1][1] = { type: 'PLAYER', id: 'player' };

        // Place NPC camps
        this.placeNPCCamp(3, 3, 'GOBLIN_CAMP');
        this.placeNPCCamp(6, 2, 'BANDIT_HIDEOUT');
        this.placeNPCCamp(2, 7, 'WOLF_DEN');
        this.placeNPCCamp(8, 5, 'TROLL_CAVE');
        this.placeNPCCamp(5, 8, 'GOBLIN_CAMP');
    }

    /**
     * Place an NPC camp on the map
     */
    placeNPCCamp(x, y, campType) {
        if (x < this.mapSize.width && y < this.mapSize.height) {
            const campConfig = CONFIG.NPC_CAMPS[campType];
            this.map[y][x] = {
                type: 'NPC',
                campType: campType,
                difficulty: campConfig.difficulty,
                loot: { ...campConfig.loot },
                id: `${campType}_${x}_${y}_${Date.now()}`
            };
        }
    }

    /**
     * Update game state (called on each game tick)
     */
    update() {
        const now = Date.now();
        const deltaTime = (now - this.lastTick) / 1000; // Convert to seconds
        this.lastTick = now;

        // Calculate storage capacity (affected by technologies)
        this.calculateStorageCapacity();

        // Generate resources
        this.generateResources(deltaTime);

        // Process build queue
        this.processBuildQueue(deltaTime);

        // Process training queue
        this.processTrainingQueue(deltaTime);

        // Process research queue
        if (researchManager) {
            researchManager.processResearchQueue(deltaTime);
        }

        // Apply unit upkeep
        this.applyUnitUpkeep(deltaTime);

        // Update event manager
        if (this.eventManager) {
            this.eventManager.update();
        }
    }

    /**
     * Generate resources based on buildings
     */
    generateResources(deltaTime) {
        let foodProduction = 0;
        let oreProduction = 0;

        // Calculate production from all buildings
        for (const [buildingType, building] of Object.entries(this.buildings)) {
            if (building.level > 0) {
                const config = CONFIG.BUILDINGS[buildingType];
                const level = building.level - 1; // Adjust for 0-based array

                if (buildingType === 'FARM') {
                    foodProduction += config.levels[level].production.FOOD;
                } else if (buildingType === 'MINE') {
                    oreProduction += config.levels[level].production.ORE;
                }
            }
        }

        // Apply technology bonuses to production
        if (this.bonuses.foodProduction > 0) {
            foodProduction *= (1 + this.bonuses.foodProduction);
        }
        if (this.bonuses.oreProduction > 0) {
            oreProduction *= (1 + this.bonuses.oreProduction);
        }

        // Apply production
        this.resources.FOOD = Math.min(
            this.resources.FOOD + (foodProduction * deltaTime),
            this.storageCapacity.FOOD
        );

        this.resources.ORE = Math.min(
            this.resources.ORE + (oreProduction * deltaTime),
            this.storageCapacity.ORE
        );
    }

    /**
     * Calculate storage capacity based on warehouses and technology bonuses
     */
    calculateStorageCapacity() {
        // Skip calculation if unlimited resources are active
        if (this._unlimitedResourcesActive) {
            return;
        }

        let baseCapacity = 100; // Base capacity

        // Add capacity from warehouses
        for (const [buildingType, building] of Object.entries(this.buildings)) {
            if (buildingType === 'WAREHOUSE' && building.level > 0) {
                const config = CONFIG.BUILDINGS.WAREHOUSE;
                const level = building.level - 1; // Adjust for 0-based array
                baseCapacity = config.levels[level].capacity.FOOD; // Both FOOD and ORE have same capacity
            }
        }

        // Apply technology bonuses
        if (this.bonuses.storageCapacity > 0) {
            baseCapacity *= (1 + this.bonuses.storageCapacity);
        }

        // Update storage capacity
        this.storageCapacity = {
            FOOD: baseCapacity,
            ORE: baseCapacity
        };
    }

    /**
     * Process the building queue
     */
    processBuildQueue(deltaTime) {
        if (this.buildQueue.length > 0) {
            const currentBuild = this.buildQueue[0];
            currentBuild.timeRemaining -= deltaTime;

            if (currentBuild.timeRemaining <= 0) {
                // Building is complete
                this.completeBuildingConstruction(currentBuild);
                this.buildQueue.shift();
            }
        }
    }

    /**
     * Complete a building construction
     */
    completeBuildingConstruction(buildItem) {
        const buildingType = buildItem.buildingType;
        const buildingName = CONFIG.BUILDINGS[buildingType].name;

        // If building doesn't exist, create it
        if (!this.buildings[buildingType]) {
            this.buildings[buildingType] = { level: 1, x: buildItem.x, y: buildItem.y };
            // Log the construction
            this.activityLogManager.addLogEntry('Building', `Constructed ${buildingName} (Level 1)`);
        } else {
            // Otherwise upgrade it
            this.buildings[buildingType].level++;
            // Log the upgrade
            this.activityLogManager.addLogEntry('Building', `Upgraded ${buildingName} to Level ${this.buildings[buildingType].level}`);
        }

        // Recalculate storage capacity if we built/upgraded a warehouse
        if (buildingType === 'WAREHOUSE') {
            this.calculateStorageCapacity();
        }

        // Trigger UI update
        this.onStateChange();
    }

    /**
     * Process the unit training queue
     */
    processTrainingQueue(deltaTime) {
        if (this.trainingQueue.length > 0) {
            const currentTraining = this.trainingQueue[0];
            currentTraining.timeRemaining -= deltaTime;

            if (currentTraining.timeRemaining <= 0) {
                // Training is complete
                this.completeUnitTraining(currentTraining);
                this.trainingQueue.shift();
            }
        }
    }

    /**
     * Complete unit training
     */
    completeUnitTraining(trainingItem) {
        const unitType = trainingItem.unitType;
        const unitName = CONFIG.UNITS[unitType].name;
        this.units[unitType] += trainingItem.quantity;

        // Log the training completion
        this.activityLogManager.addLogEntry('Training', `Trained ${trainingItem.quantity} ${unitName}${trainingItem.quantity > 1 ? 's' : ''}`);

        // Trigger UI update
        this.onStateChange();
    }

    /**
     * Apply food upkeep for units
     */
    applyUnitUpkeep(deltaTime) {
        let totalFoodUpkeep = 0;

        // Calculate total food upkeep
        for (const [unitType, count] of Object.entries(this.units)) {
            // Reduce the upkeep rate to make it more balanced
            // Original upkeep is per second, but it's too fast
            // Divide by 10 to make it 10x slower (effectively per 10 seconds)
            const upkeepRate = CONFIG.UNITS[unitType].upkeep.FOOD / 10;
            totalFoodUpkeep += upkeepRate * count;
        }

        // Apply upkeep (per second)
        this.resources.FOOD = Math.max(0, this.resources.FOOD - (totalFoodUpkeep * deltaTime));

        // TODO: Handle starvation if food reaches 0
    }

    /**
     * Start building construction
     */
    startBuilding(buildingType, x, y) {
        const buildingConfig = CONFIG.BUILDINGS[buildingType];
        const currentLevel = this.buildings[buildingType]?.level || 0;

        // Check if we can build/upgrade
        if (currentLevel >= buildingConfig.maxLevel) {
            console.log(`${buildingType} is already at max level`);
            return false;
        }

        // Get cost for the next level
        const cost = buildingConfig.levels[currentLevel].cost;

        // Check if we have enough resources
        if (this.resources.FOOD < cost.FOOD || this.resources.ORE < cost.ORE) {
            console.log(`Not enough resources to build ${buildingType}`);
            return false;
        }

        // Deduct resources
        this.resources.FOOD -= cost.FOOD;
        this.resources.ORE -= cost.ORE;

        // Add to build queue
        this.buildQueue.push({
            buildingType,
            level: currentLevel + 1,
            x,
            y,
            timeRemaining: 10 // 10 seconds build time for now
        });

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Start training units
     */
    trainUnits(unitType, quantity) {
        const unitConfig = CONFIG.UNITS[unitType];
        const totalCost = {
            FOOD: unitConfig.cost.FOOD * quantity,
            ORE: unitConfig.cost.ORE * quantity
        };

        // Check if we have enough resources
        if (this.resources.FOOD < totalCost.FOOD || this.resources.ORE < totalCost.ORE) {
            console.log(`Not enough resources to train ${quantity} ${unitType}`);
            return false;
        }

        // Check if we have barracks
        if (!this.buildings.BARRACKS || this.buildings.BARRACKS.level < 1) {
            console.log(`You need to build a Barracks first`);
            return false;
        }

        // Deduct resources
        this.resources.FOOD -= totalCost.FOOD;
        this.resources.ORE -= totalCost.ORE;

        // Calculate training time based on barracks level
        const barracksLevel = this.buildings.BARRACKS.level - 1;
        const trainingSpeed = CONFIG.BUILDINGS.BARRACKS.levels[barracksLevel].trainingSpeed;
        const trainingTime = (quantity * 5) / trainingSpeed; // 5 seconds per unit, modified by barracks speed

        // Add to training queue
        this.trainingQueue.push({
            unitType,
            quantity,
            timeRemaining: trainingTime
        });

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Attack an NPC camp (deprecated - use combatManager.attackNPCWithUnits instead)
     */
    attackNPC(targetX, targetY, units) {
        console.warn('This method is deprecated. Use combatManager.attackNPCWithUnits instead.');
        return combatManager.attackNPCWithUnits(targetX, targetY, units);
    }

    /**
     * Resolve combat with an NPC camp
     */
    resolveCombat(target, attackingUnits, formation = 'balanced') {
        // Get camp configuration (either from target or from CONFIG)
        const campConfig = target.difficulty ?
            {
                name: CONFIG.NPC_CAMPS[target.campType].name,
                difficulty: target.difficulty,
                loot: target.loot,
                specialAbility: CONFIG.NPC_CAMPS[target.campType].specialAbility,
                weakAgainst: CONFIG.NPC_CAMPS[target.campType].weakAgainst,
                strongAgainst: CONFIG.NPC_CAMPS[target.campType].strongAgainst
            } :
            CONFIG.NPC_CAMPS[target.campType];

        // Determine terrain type at target location
        const terrainSeed = (target.x * 3 + target.y * 7) % 10;
        let terrainType = 'grass';
        if (terrainSeed < 5) {
            terrainType = 'grass';
        } else if (terrainSeed < 7) {
            terrainType = 'forest';
        } else if (terrainSeed < 9) {
            terrainType = 'mountain';
        } else {
            terrainType = 'water';
        }

        // Get terrain effects
        const terrainEffect = CONFIG.COMBAT.TERRAIN_EFFECTS[terrainType];

        // Get formation effects
        const formationEffect = CONFIG.COMBAT.FORMATIONS[formation];

        // Use the combat manager to calculate base attack power
        let playerAttack = combatManager.calculateAttackPower(attackingUnits, target);
        let npcDefense = campConfig.difficulty * 10;

        // Apply terrain effects
        playerAttack *= terrainEffect.attack;
        npcDefense *= terrainEffect.defense;

        // Apply formation effects
        playerAttack *= formationEffect.attack;
        npcDefense *= formationEffect.defense;

        // Apply enemy special ability if it affects attack
        if (campConfig.specialAbility && campConfig.specialAbility.effect.attackReduction) {
            playerAttack *= (1 - campConfig.specialAbility.effect.attackReduction);
        }

        // Apply enemy special ability if it affects defense
        if (campConfig.specialAbility && campConfig.specialAbility.effect.defenseReduction) {
            npcDefense *= (1 - campConfig.specialAbility.effect.defenseReduction);
        }

        // Create detailed unit advantages information
        const unitAdvantages = {};

        // Check for unit type advantages based on camp weaknesses
        for (const [unitType, count] of Object.entries(attackingUnits)) {
            if (count > 0) {
                if (unitType === campConfig.weakAgainst) {
                    let advantageMultiplier = CONFIG.COMBAT.ADVANTAGE_MULTIPLIER;
                    if (this.bonuses.advantageMultiplier > 0) {
                        advantageMultiplier += this.bonuses.advantageMultiplier;
                    }
                    unitAdvantages[unitType] = {
                        target: campConfig.name,
                        multiplier: advantageMultiplier,
                        description: `${CONFIG.UNITS[unitType].name} +${Math.round((advantageMultiplier - 1) * 100)}% vs ${campConfig.name}`
                    };
                } else if (unitType === campConfig.strongAgainst) {
                    let disadvantageMultiplier = CONFIG.COMBAT.DISADVANTAGE_MULTIPLIER;
                    unitAdvantages[unitType] = {
                        target: campConfig.name,
                        multiplier: disadvantageMultiplier,
                        description: `${CONFIG.UNITS[unitType].name} ${Math.round((disadvantageMultiplier - 1) * 100)}% vs ${campConfig.name}`
                    };
                }
            }
        }
        if (attackingUnits.ARCHER > 0 && target.campType === 'BANDIT_HIDEOUT') {
            let advantageMultiplier = 1.2;
            if (this.bonuses.advantageMultiplier > 0) {
                advantageMultiplier += this.bonuses.advantageMultiplier;
            }
            unitAdvantages.ARCHER = {
                target: 'BANDIT',
                multiplier: advantageMultiplier,
                description: `Archers +${Math.round((advantageMultiplier - 1) * 100)}% vs Bandits`
            };
        }

        // Create combat report
        let report = {
            timestamp: new Date().toLocaleTimeString(),
            target: campConfig.name,
            targetType: target.campType,
            targetDifficulty: campConfig.difficulty,
            unitsSent: { ...attackingUnits },
            unitsLost: { SPEARMAN: 0, ARCHER: 0, CAVALRY: 0 },
            result: '',
            loot: { FOOD: 0, ORE: 0 },
            combatDetails: {
                playerAttack: playerAttack,
                npcDefense: npcDefense,
                unitAdvantages: unitAdvantages,
                terrain: {
                    type: terrainType,
                    effect: terrainEffect,
                    description: terrainEffect.description
                },
                formation: {
                    type: formation,
                    effect: formationEffect,
                    name: formationEffect.name,
                    description: formationEffect.description
                },
                enemyAbility: campConfig.specialAbility ? {
                    name: campConfig.specialAbility.name,
                    description: campConfig.specialAbility.description,
                    effect: campConfig.specialAbility.effect
                } : null,
                techBonuses: {
                    attackBonus: this.bonuses.unitAttack > 0 ? `+${Math.round(this.bonuses.unitAttack * 100)}%` : null,
                    defenseBonus: this.bonuses.unitDefense > 0 ? `+${Math.round(this.bonuses.unitDefense * 100)}%` : null,
                    casualtyReduction: this.bonuses.defensiveCasualtyReduction > 0 ?
                        `-${Math.round(this.bonuses.defensiveCasualtyReduction * 100)}%` : null
                }
            }
        };

        if (playerAttack > npcDefense) {
            // Player wins
            report.result = 'victory';

            // Calculate base casualty rates based on unit type advantages
            let spearmanCasualtyRate = 0.25;
            let archerCasualtyRate = 0.25;
            let cavalryCasualtyRate = 0.25;

            // Apply unit type advantage/disadvantage effects on casualties
            for (const [unitType, advantage] of Object.entries(unitAdvantages)) {
                if (unitType === 'SPEARMAN') {
                    if (advantage.multiplier > 1) {
                        // Advantage means fewer casualties
                        spearmanCasualtyRate = 0.2;
                    } else if (advantage.multiplier < 1) {
                        // Disadvantage means more casualties
                        spearmanCasualtyRate = 0.3;
                    }
                } else if (unitType === 'ARCHER') {
                    if (advantage.multiplier > 1) {
                        archerCasualtyRate = 0.2;
                    } else if (advantage.multiplier < 1) {
                        archerCasualtyRate = 0.3;
                    }
                } else if (unitType === 'CAVALRY') {
                    if (advantage.multiplier > 1) {
                        cavalryCasualtyRate = 0.2;
                    } else if (advantage.multiplier < 1) {
                        cavalryCasualtyRate = 0.3;
                    }
                }
            }

            // Apply formation effect on casualty rate
            spearmanCasualtyRate *= formationEffect.casualtyRate;
            archerCasualtyRate *= formationEffect.casualtyRate;
            cavalryCasualtyRate *= formationEffect.casualtyRate;

            // Apply enemy special ability if it affects casualties
            if (campConfig.specialAbility && campConfig.specialAbility.effect.casualtyIncrease) {
                spearmanCasualtyRate *= (1 + campConfig.specialAbility.effect.casualtyIncrease);
                archerCasualtyRate *= (1 + campConfig.specialAbility.effect.casualtyIncrease);
                cavalryCasualtyRate *= (1 + campConfig.specialAbility.effect.casualtyIncrease);
            }

            // Apply defensive technology bonus if applicable
            if (this.bonuses.defensiveCasualtyReduction > 0) {
                spearmanCasualtyRate *= (1 - this.bonuses.defensiveCasualtyReduction);
                archerCasualtyRate *= (1 - this.bonuses.defensiveCasualtyReduction);
                cavalryCasualtyRate *= (1 - this.bonuses.defensiveCasualtyReduction);
            }

            report.unitsLost.SPEARMAN = Math.floor(attackingUnits.SPEARMAN * spearmanCasualtyRate);
            report.unitsLost.ARCHER = Math.floor(attackingUnits.ARCHER * archerCasualtyRate);
            report.unitsLost.CAVALRY = Math.floor(attackingUnits.CAVALRY * cavalryCasualtyRate);

            // Calculate surviving units
            const survivingSpearmen = attackingUnits.SPEARMAN - report.unitsLost.SPEARMAN;
            const survivingArchers = attackingUnits.ARCHER - report.unitsLost.ARCHER;
            const survivingCavalry = attackingUnits.CAVALRY - report.unitsLost.CAVALRY;

            // Calculate base loot
            report.loot = { ...campConfig.loot };

            // Apply enemy special ability if it affects loot
            if (campConfig.specialAbility && campConfig.specialAbility.effect.lootReduction) {
                report.loot.FOOD = Math.floor(report.loot.FOOD * (1 - campConfig.specialAbility.effect.lootReduction));
                report.loot.ORE = Math.floor(report.loot.ORE * (1 - campConfig.specialAbility.effect.lootReduction));
            }

            // Add resources and units back to player
            this.resources.FOOD = Math.min(
                this.resources.FOOD + report.loot.FOOD,
                this.storageCapacity.FOOD
            );

            this.resources.ORE = Math.min(
                this.resources.ORE + report.loot.ORE,
                this.storageCapacity.ORE
            );

            this.units.SPEARMAN += survivingSpearmen;
            this.units.ARCHER += survivingArchers;
            this.units.CAVALRY += survivingCavalry;
        } else {
            // Player loses
            report.result = 'defeat';

            // All units are lost
            report.unitsLost = { ...attackingUnits };

            // No loot
            report.loot = { FOOD: 0, ORE: 0 };
        }

        // Add combat report
        this.combatReports.unshift(report);
        if (this.combatReports.length > 10) {
            this.combatReports.pop(); // Keep only the 10 most recent reports
        }

        // Trigger UI update
        this.onStateChange();

        return report;
    }

    /**
     * Get the current game time in seconds
     * @returns {number} - The game time in seconds
     */
    getGameTime() {
        return Math.floor((Date.now() - this.gameStartTime) / 1000);
    }

    /**
     * Format the game time as HH:MM:SS
     * @returns {string} - The formatted game time
     */
    getFormattedGameTime() {
        const totalSeconds = this.getGameTime();
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }

    /**
     * Toggle online status (for demonstration purposes)
     */
    toggleOnlineStatus() {
        this.isOnline = !this.isOnline;
        this.onStateChange();
    }

    /**
     * Set unlimited resources for testing
     */
    setUnlimitedResources() {
        // First increase storage capacity to hold the resources
        this.storageCapacity.FOOD = 1000000;
        this.storageCapacity.ORE = 1000000;

        // Create a flag to bypass normal storage capacity calculation
        this._unlimitedResourcesActive = true;

        // Then set all resources to 999999
        this.resources.FOOD = 999999;
        this.resources.ORE = 999999;

        // Log the action
        this.activityLogManager.addLogEntry('System', 'Unlimited resources activated for testing');

        // Trigger UI update
        this.onStateChange();
    }

    /**
     * Event handler for state changes
     */
    onStateChange() {
        // This will be set by the UI to update when state changes
    }
}

// GameState class is now ready to be instantiated in main.js
