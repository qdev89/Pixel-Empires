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
        this.harvestingOperations = []; // Track active harvesting operations
        this.claimedTerritories = []; // Track claimed territories
        this.outposts = []; // Track outposts in territories
        this.territoryMaintenanceCosts = {}; // Track maintenance costs for territories
        this.lastResourceRegenerationTime = Date.now(); // Track when resources were last regenerated
        this.territoryConflicts = []; // Track territory conflicts
        this.specializedUnits = {}; // Track specialized units
        this.diplomaticRelations = []; // Track diplomatic relations with other players
        this.specialResourceNodes = []; // Track special resource nodes
        this.isOnline = true; // Online status

        // Initialize additional systems
        this.tradeSystem = null; // Will be initialized after game state is fully loaded
        this.combatSystem = null; // Will be initialized after game state is fully loaded
        this.questSystem = null; // Will be initialized after game state is fully loaded
        this.weatherSystem = null; // Will be initialized after game state is fully loaded
        this.heroManager = null; // Will be initialized after game state is fully loaded

        // Game speed settings (1.0 = normal speed)
        this.gameSpeed = 1.0;
        this.availableGameSpeeds = [0.5, 1.0, 2.0, 4.0]; // Half, normal, double, quadruple speed

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

        // Initialize event bonuses
        this.eventBonuses = {
            foodProduction: 1.0,
            oreProduction: 1.0,
            constructionSpeed: 1.0,
            researchSpeed: 1.0,
            trainingSpeed: 1.0
        };

        // Initialize temporary bonuses
        this.temporaryBonuses = [];

        // Initialize event tracking
        this.eventTracking = {
            resourcesProduced: {},
            defeatedEnemies: {},
            buildingsConstructed: 0,
            researchCompleted: 0,
            unitsTrained: 0
        };

        // Initialize map with NPC camps
        this.initializeMap();

        // Initialize event manager
        this.eventManager = new EventManager(this);

        // Initialize challenge manager
        this.challengeManager = new ChallengeManager(this);

        // Initialize activity log manager
        this.activityLogManager = new ActivityLogManager(this);

        // Add initial log entry
        this.activityLogManager.addLogEntry('System', 'Game started');

        // Initialize save system
        this.saveSystem = new SaveSystem(this);

        // Initialize additional systems
        this.initializeAdditionalSystems();
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
     * Initialize additional game systems
     */
    initializeAdditionalSystems() {
        // Initialize trade system
        if (typeof TradeSystem !== 'undefined') {
            this.tradeSystem = new TradeSystem(this);
        }

        // Initialize combat system
        if (typeof CombatSystem !== 'undefined') {
            this.combatSystem = new CombatSystem(this);
        }

        // Initialize quest system
        if (typeof QuestSystem !== 'undefined') {
            this.questSystem = new QuestSystem(this);
        }

        // Initialize weather system
        if (typeof WeatherSystem !== 'undefined') {
            this.weatherSystem = new WeatherSystem(this);
        }

        // Initialize unit experience system
        if (typeof UnitExperienceSystem !== 'undefined') {
            this.unitExperienceSystem = new UnitExperienceSystem(this);
        }

        // Initialize hero manager
        if (typeof HeroManager !== 'undefined') {
            this.heroManager = new HeroManager(this);
        }
    }

    /**
     * Update game state (called on each game tick)
     */
    update() {
        const now = Date.now();
        let deltaTime = (now - this.lastTick) / 1000; // Convert to seconds

        // Apply game speed multiplier
        deltaTime *= this.gameSpeed;

        this.lastTick = now;

        // Update weather system
        if (this.weatherSystem) {
            this.weatherSystem.update();
        }

        // Calculate storage capacity (affected by technologies)
        this.calculateStorageCapacity();

        // Generate resources (affected by weather and season)
        this.generateResources(deltaTime);

        // Process build queue (affected by season)
        this.processBuildQueue(deltaTime);

        // Process training queue
        this.processTrainingQueue(deltaTime);

        // Process harvesting operations (affected by weather)
        this.processHarvestingOperations(deltaTime);

        // Process resource node regeneration (affected by season)
        this.processResourceNodeRegeneration();

        // Apply territory maintenance costs (every minute)
        this.applyTerritoryMaintenanceCosts(deltaTime);

        // Process outpost construction and upgrades
        this.processOutpostConstruction();
        this.processOutpostUpgrades();

        // Process territory conflicts
        this.processTerritoryConflicts(deltaTime);

        // Process diplomatic relations
        this.processDiplomaticRelations(deltaTime);

        // Process trade system
        if (this.tradeSystem) {
            this.tradeSystem.update();
        }

        // Process combat system
        if (this.combatSystem) {
            this.combatSystem.update();
        }

        // Process quest system
        if (this.questSystem) {
            this.questSystem.update();
        }

        // Process unit experience system
        if (this.unitExperienceSystem) {
            this.unitExperienceSystem.update();
        }

        // Process weather system
        if (this.weatherSystem) {
            this.weatherSystem.update();
        }

        // Process hero manager
        if (this.heroManager) {
            this.heroManager.update(deltaTime);
        }

        // Process research queue (affected by season)
        if (researchManager) {
            researchManager.processResearchQueue(deltaTime);
        }

        // Apply unit upkeep
        this.applyUnitUpkeep(deltaTime);

        // Update event manager
        if (this.eventManager) {
            this.eventManager.update();
        }

        // Update challenge manager
        if (this.challengeManager) {
            this.challengeManager.update();
        }

        // Update temporary bonuses
        this.updateTemporaryBonuses();
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

        // Apply event bonuses
        foodProduction *= this.eventBonuses.foodProduction;
        oreProduction *= this.eventBonuses.oreProduction;

        // Apply weather and season effects if available
        if (this.weatherSystem) {
            foodProduction *= this.weatherSystem.getResourceProductionModifier('FOOD');
            oreProduction *= this.weatherSystem.getResourceProductionModifier('ORE');
        }

        // Calculate actual gains
        const foodGain = foodProduction * deltaTime;
        const oreGain = oreProduction * deltaTime;

        // Apply production
        this.resources.FOOD = Math.min(
            this.resources.FOOD + foodGain,
            this.storageCapacity.FOOD
        );

        this.resources.ORE = Math.min(
            this.resources.ORE + oreGain,
            this.storageCapacity.ORE
        );

        // Track resource production for events
        if (this.challengeManager) {
            this.challengeManager.trackResourceProduction('FOOD', foodGain);
            this.challengeManager.trackResourceProduction('ORE', oreGain);
        }
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
            // Apply event bonuses to construction speed
            let speedMultiplier = this.eventBonuses.constructionSpeed;

            // Apply season effects if available
            if (this.weatherSystem) {
                speedMultiplier *= this.weatherSystem.getBuildSpeedModifier();
            }

            const currentBuild = this.buildQueue[0];
            currentBuild.timeRemaining -= deltaTime * speedMultiplier;

            if (currentBuild.timeRemaining <= 0) {
                // Building is complete
                this.completeBuildingConstruction(currentBuild);
                this.buildQueue.shift();

                // Track building construction for events
                if (this.challengeManager) {
                    this.challengeManager.trackBuildingConstruction();
                }
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
            // Apply event bonuses to training speed
            const speedMultiplier = this.eventBonuses.trainingSpeed;

            const currentTraining = this.trainingQueue[0];
            currentTraining.timeRemaining -= deltaTime * speedMultiplier;

            if (currentTraining.timeRemaining <= 0) {
                // Training is complete
                this.completeUnitTraining(currentTraining);
                this.trainingQueue.shift();

                // Track unit training for events
                if (this.challengeManager) {
                    this.challengeManager.trackUnitTraining(currentTraining.quantity);
                }
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
     * @param {Object} target - The target NPC camp
     * @param {Object} attackingUnits - Units sent to battle
     * @param {string} formation - Combat formation used
     * @param {Array} heroes - Heroes participating in battle
     * @returns {Object} - Combat report
     */
    resolveCombat(target, attackingUnits, formation = 'balanced', heroes = []) {
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
        let playerAttack = combatManager.calculateAttackPower(attackingUnits, target, heroes);
        let npcDefense = campConfig.difficulty * 10;

        // Add hero combat bonuses
        if (heroes && heroes.length > 0 && this.heroManager) {
            for (const hero of heroes) {
                // Add hero leadership bonus
                if (hero.stats.leadership) {
                    const leadershipBonus = hero.stats.leadership * 0.01; // 1% per leadership point
                    playerAttack *= (1 + leadershipBonus);
                }

                // Add hero specialization bonus
                const heroType = this.heroManager.heroTypes[hero.type];
                if (heroType && heroType.specialization === 'combat') {
                    playerAttack *= 1.1; // 10% bonus for combat heroes
                }
            }
        }

        // Apply hero ability effects if available
        if (this.heroCombatSystem && target.id) {
            const combatStats = { playerAttack, npcDefense };
            const modifiedStats = this.heroCombatSystem.applyAbilityEffects(target.id, combatStats);
            playerAttack = modifiedStats.playerAttack;
            npcDefense = modifiedStats.enemyDefense;
        }

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
            heroes: heroes ? heroes.map(h => ({
                id: h.id,
                name: h.name,
                type: h.type,
                level: h.level
            })) : [],
            result: '',
            loot: { FOOD: 0, ORE: 0 },
            heroExperience: 0,
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

        // Store the event ID if this is an event-related enemy
        const eventId = target.eventId;

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

            // Add hero experience
            report.heroExperience = 100 + (campConfig.difficulty * 10);

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

            // Track enemy defeat for events if this was an event-related enemy
            if (eventId && this.challengeManager) {
                this.challengeManager.trackEnemyDefeat(target.campType, eventId);
            }
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
     * Update temporary bonuses and remove expired ones
     */
    updateTemporaryBonuses() {
        const currentTime = this.getGameTime();
        const activeBonuses = [];

        for (const bonus of this.temporaryBonuses) {
            if (currentTime < bonus.endTime) {
                activeBonuses.push(bonus);
            }
        }

        // Replace the array with only active bonuses
        this.temporaryBonuses = activeBonuses;
    }

    /**
     * Spawn an NPC camp for an event
     */
    spawnEventNPC(campType, difficultyMultiplier, eventId) {
        // Find an empty cell for the camp
        const emptyCells = [];

        for (let y = 0; y < this.mapSize.height; y++) {
            for (let x = 0; x < this.mapSize.width; x++) {
                if (!this.map[y][x]) {
                    emptyCells.push({x, y});
                }
            }
        }

        if (emptyCells.length === 0) {
            console.error('No empty cells for event NPC');
            return null;
        }

        // Select a random empty cell
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

        // Create the NPC camp
        const npcCamp = {
            type: 'NPC',
            campType: campType,
            id: 'event_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            eventId: eventId,
            difficultyMultiplier: difficultyMultiplier
        };

        // Place on map
        this.map[cell.y][cell.x] = npcCamp;

        // Log the event
        this.activityLogManager.addLogEntry(
            'Event',
            `A ${CONFIG.NPC_CAMPS[campType].name} has appeared on the map!`
        );

        // Trigger UI update
        this.onStateChange();

        return npcCamp;
    }

    /**
     * Get count of buildings of a specific type
     */
    getBuildingCount(buildingType) {
        let count = 0;

        // Count buildings in the buildings object
        if (this.buildings[buildingType] && this.buildings[buildingType].level > 0) {
            count++;
        }

        // Count buildings on the map
        for (let y = 0; y < this.mapSize.height; y++) {
            for (let x = 0; x < this.mapSize.width; x++) {
                const cell = this.map[y][x];
                if (cell && cell.type === 'BUILDING' && cell.buildingType === buildingType) {
                    count++;
                }
            }
        }

        return count;
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
     * Set game speed
     * @param {number} speedIndex - Index in the availableGameSpeeds array
     */
    setGameSpeed(speedIndex) {
        if (speedIndex >= 0 && speedIndex < this.availableGameSpeeds.length) {
            this.gameSpeed = this.availableGameSpeeds[speedIndex];
            this.activityLogManager.addLogEntry('System', `Game speed set to ${this.gameSpeed}x`);
            this.onStateChange();
            return true;
        }
        return false;
    }

    /**
     * Cycle to the next game speed
     */
    cycleGameSpeed() {
        const currentIndex = this.availableGameSpeeds.indexOf(this.gameSpeed);
        const nextIndex = (currentIndex + 1) % this.availableGameSpeeds.length;
        this.setGameSpeed(nextIndex);
    }

    /**
     * Set unlimited resources for testing
     * Sets all resources to 999999 as requested by the user
     */
    setUnlimitedResources() {
        // First increase storage capacity to hold the resources
        this.storageCapacity.FOOD = 1000000;
        this.storageCapacity.ORE = 1000000;

        // Create a flag to bypass normal storage capacity calculation
        this._unlimitedResourcesActive = true;

        // Set all resources to exactly 999999 as requested
        this.resources.FOOD = 999999;
        this.resources.ORE = 999999;

        // Also add units for testing
        this.units.SPEARMAN = 999999;
        this.units.ARCHER = 999999;
        this.units.CAVALRY = 999999;

        // Log the action
        this.activityLogManager.addLogEntry('System', 'TEST MODE ACTIVATED: All resources and units set to 999999');

        // Trigger UI update
        this.onStateChange();
    }

    /**
     * Start a harvesting operation at a resource node
     * @param {Object} node - The resource node to harvest from
     * @param {Object} units - The units to send for harvesting {SPEARMAN: 0, ARCHER: 0, CAVALRY: 0}
     * @returns {boolean} - Whether the operation was started successfully
     */
    startHarvesting(node, units) {
        // Check if we have enough units
        if (units.SPEARMAN > this.units.SPEARMAN ||
            units.ARCHER > this.units.ARCHER ||
            units.CAVALRY > this.units.CAVALRY) {
            console.log('Not enough units available for harvesting');
            return false;
        }

        // Check if any units are being sent
        const totalUnits = units.SPEARMAN + units.ARCHER + units.CAVALRY;
        if (totalUnits <= 0) {
            console.log('No units selected for harvesting');
            return false;
        }

        // Calculate travel time based on distance (1 second per tile)
        const playerBase = this.findPlayerBase();
        if (!playerBase) {
            console.log('Player base not found');
            return false;
        }

        const distance = Math.sqrt(
            Math.pow(node.x - playerBase.x, 2) +
            Math.pow(node.y - playerBase.y, 2)
        );

        const travelTime = distance * 1; // 1 second per tile

        // Remove units from player's army
        this.units.SPEARMAN -= units.SPEARMAN;
        this.units.ARCHER -= units.ARCHER;
        this.units.CAVALRY -= units.CAVALRY;

        // Create harvesting operation
        const operation = {
            id: Date.now(), // Unique ID
            nodeId: `${node.type}_${node.x}_${node.y}`,
            node: { ...node }, // Copy node data
            units: { ...units },
            status: 'traveling', // traveling, harvesting, returning
            startTime: Date.now(),
            travelTime: travelTime * 1000, // Convert to milliseconds
            harvestTime: 0, // Will be set when harvesting starts
            resourcesHarvested: 0,
            returnTime: 0, // Will be set when returning starts
            completionTime: 0 // Will be set when operation completes
        };

        this.harvestingOperations.push(operation);

        // Log the action
        this.activityLogManager.addLogEntry(
            'Harvesting',
            `Sent ${totalUnits} units to harvest ${node.type} at (${node.x}, ${node.y})`
        );

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Process harvesting operations
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    processHarvestingOperations(deltaTime) {
        if (this.harvestingOperations.length === 0) return;

        const now = Date.now();
        const completedOperations = [];

        for (let i = 0; i < this.harvestingOperations.length; i++) {
            const operation = this.harvestingOperations[i];

            if (operation.status === 'traveling') {
                // Check if units have arrived at the resource node
                if (now >= operation.startTime + operation.travelTime) {
                    // Start harvesting
                    operation.status = 'harvesting';
                    operation.harvestTime = now;

                    // Calculate harvesting duration based on units (more units = faster harvesting)
                    // Base time: 30 seconds, reduced by 1 second per unit, minimum 5 seconds
                    const totalUnits = operation.units.SPEARMAN + operation.units.ARCHER + operation.units.CAVALRY;
                    const harvestDuration = Math.max(30 - totalUnits, 5);
                    operation.harvestDuration = harvestDuration * 1000; // Convert to milliseconds
                }
            }
            else if (operation.status === 'harvesting') {
                // Check if harvesting is complete
                if (now >= operation.harvestTime + operation.harvestDuration) {
                    // Calculate resources harvested based on node type and units
                    const totalUnits = operation.units.SPEARMAN + operation.units.ARCHER + operation.units.CAVALRY;
                    const baseAmount = operation.node.harvestRate * totalUnits;

                    // Cavalry are more efficient at harvesting (1.5x)
                    const cavalryBonus = operation.units.CAVALRY * 0.5 * operation.node.harvestRate;
                    operation.resourcesHarvested = Math.min(baseAmount + cavalryBonus, operation.node.amount);

                    // Update node's remaining resources
                    operation.node.amount -= operation.resourcesHarvested;

                    // Start returning to base
                    operation.status = 'returning';
                    operation.returnTime = now;
                }
            }
            else if (operation.status === 'returning') {
                // Check if units have returned to base
                if (now >= operation.returnTime + operation.travelTime) {
                    // Add harvested resources to player's stockpile
                    if (operation.node.type === 'FOOD') {
                        this.resources.FOOD = Math.min(
                            this.resources.FOOD + operation.resourcesHarvested,
                            this.storageCapacity.FOOD
                        );
                    } else if (operation.node.type === 'ORE') {
                        this.resources.ORE = Math.min(
                            this.resources.ORE + operation.resourcesHarvested,
                            this.storageCapacity.ORE
                        );
                    }

                    // Return units to player's army
                    this.units.SPEARMAN += operation.units.SPEARMAN;
                    this.units.ARCHER += operation.units.ARCHER;
                    this.units.CAVALRY += operation.units.CAVALRY;

                    // Mark operation as completed
                    operation.status = 'completed';
                    operation.completionTime = now;
                    completedOperations.push(operation);

                    // Log the completion
                    this.activityLogManager.addLogEntry(
                        'Harvesting',
                        `Harvested ${operation.resourcesHarvested} ${operation.node.type} from (${operation.node.x}, ${operation.node.y})`
                    );
                }
            }
        }

        // Remove completed operations
        if (completedOperations.length > 0) {
            this.harvestingOperations = this.harvestingOperations.filter(
                op => !completedOperations.includes(op)
            );

            // Trigger UI update
            this.onStateChange();
        }
    }

    /**
     * Find the player's base on the map
     * @returns {Object|null} - The player base coordinates or null if not found
     */
    findPlayerBase() {
        for (let y = 0; y < this.mapSize.height; y++) {
            for (let x = 0; x < this.mapSize.width; x++) {
                if (this.map[y] && this.map[y][x] && this.map[y][x].type === 'PLAYER') {
                    return { x, y };
                }
            }
        }
        return null;
    }

    /**
     * Claim territory around a location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} radius - Radius of territory to claim (in tiles)
     * @returns {boolean} - Whether the territory was claimed successfully
     */
    claimTerritory(x, y, radius) {
        // Check if we have enough resources to claim territory
        const claimCost = {
            FOOD: 100 * radius,
            ORE: 150 * radius
        };

        if (this.resources.FOOD < claimCost.FOOD || this.resources.ORE < claimCost.ORE) {
            console.log('Not enough resources to claim territory');
            return false;
        }

        // Deduct resources
        this.resources.FOOD -= claimCost.FOOD;
        this.resources.ORE -= claimCost.ORE;

        // Create territory claim
        const territory = {
            id: Date.now(),
            x,
            y,
            radius,
            claimedAt: Date.now(),
            resourceNodes: [], // Resource nodes within this territory
            outposts: [], // Outposts built in this territory
            benefits: { // Benefits provided by this territory
                harvestingBonus: 0,
                resourceBonus: 0,
                defenseBonus: 0,
                regenerationBonus: 0
            },
            maintenanceCost: { // Maintenance cost per minute
                FOOD: 10 * radius,
                ORE: 5 * radius
            }
        };

        // Find resource nodes within this territory
        if (ui && ui.resourceNodes) {
            territory.resourceNodes = ui.resourceNodes.filter(node => {
                const distance = Math.sqrt(
                    Math.pow(node.x - x, 2) +
                    Math.pow(node.y - y, 2)
                );
                return distance <= radius;
            });
        }

        this.claimedTerritories.push(territory);

        // Set up maintenance costs
        this.territoryMaintenanceCosts[territory.id] = {
            lastCollected: Date.now(),
            costs: territory.maintenanceCost
        };

        // Log the action
        this.activityLogManager.addLogEntry(
            'Territory',
            `Claimed territory at (${x}, ${y}) with radius ${radius}`
        );

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Process resource node regeneration
     * Regenerates resource nodes over time
     */
    processResourceNodeRegeneration() {
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        // Only regenerate every 5 minutes
        if (now - this.lastResourceRegenerationTime < fiveMinutes) {
            return;
        }

        this.lastResourceRegenerationTime = now;

        // Get all resource nodes from UI
        if (!ui || !ui.resourceNodes || ui.resourceNodes.length === 0) {
            return;
        }

        // Calculate regeneration amount for each node
        for (const node of ui.resourceNodes) {
            // Skip nodes that are at max capacity
            if (node.amount >= 1000) continue;

            // Base regeneration amount
            let regenerationAmount = 0;

            if (node.type === 'FOOD') {
                regenerationAmount = 50; // Food regenerates faster
            } else if (node.type === 'ORE') {
                regenerationAmount = 30; // Ore regenerates slower
            }

            // Check if node is within a claimed territory
            const territory = this.getTerritoryContainingNode(node);
            if (territory) {
                // Apply territory regeneration bonus
                regenerationAmount *= (1 + territory.benefits.regenerationBonus / 100);
            }

            // Apply season effects if available
            if (this.weatherSystem) {
                regenerationAmount *= this.weatherSystem.getResourceRegenerationModifier();
            }

            // Apply regeneration
            node.amount = Math.min(1000, node.amount + Math.floor(regenerationAmount));
        }

        // Log regeneration
        this.activityLogManager.addLogEntry(
            'Resources',
            'Resource nodes have regenerated some of their resources.'
        );

        // Trigger UI update
        this.onStateChange();
    }

    /**
     * Apply territory maintenance costs
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    applyTerritoryMaintenanceCosts(deltaTime) {
        const now = Date.now();
        const oneMinute = 60 * 1000; // 1 minute in milliseconds

        // Process each territory's maintenance costs
        for (const territory of this.claimedTerritories) {
            const maintenanceInfo = this.territoryMaintenanceCosts[territory.id];
            if (!maintenanceInfo) continue;

            // Check if it's time to collect maintenance
            if (now - maintenanceInfo.lastCollected >= oneMinute) {
                // Deduct maintenance costs
                this.resources.FOOD = Math.max(0, this.resources.FOOD - maintenanceInfo.costs.FOOD);
                this.resources.ORE = Math.max(0, this.resources.ORE - maintenanceInfo.costs.ORE);

                // Update last collected time
                maintenanceInfo.lastCollected = now;

                // Log maintenance collection
                this.activityLogManager.addLogEntry(
                    'Territory',
                    `Maintenance costs collected for territory at (${territory.x}, ${territory.y}): ${maintenanceInfo.costs.FOOD} Food, ${maintenanceInfo.costs.ORE} Ore`
                );
            }
        }
    }

    /**
     * Get the territory containing a specific node
     * @param {Object} node - The resource node
     * @returns {Object|null} - The territory containing the node, or null if not found
     */
    getTerritoryContainingNode(node) {
        for (const territory of this.claimedTerritories) {
            const distance = Math.sqrt(
                Math.pow(node.x - territory.x, 2) +
                Math.pow(node.y - territory.y, 2)
            );

            if (distance <= territory.radius) {
                return territory;
            }
        }

        return null;
    }

    /**
     * Check if a location is within claimed territory
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} - The territory containing the location, or null if not found
     */
    getTerritory(x, y) {
        for (const territory of this.claimedTerritories) {
            const distance = Math.sqrt(
                Math.pow(x - territory.x, 2) +
                Math.pow(y - territory.y, 2)
            );

            if (distance <= territory.radius) {
                return territory;
            }
        }

        return null;
    }

    /**
     * Check if a location is within claimed territory
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether the location is within claimed territory
     */
    isWithinClaimedTerritory(x, y) {
        return this.getTerritory(x, y) !== null;
    }

    /**
     * Build an outpost in a territory
     * @param {string} outpostType - The type of outpost to build (OUTPOST, RESOURCE_STATION, GUARD_POST)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Whether the outpost was built successfully
     */
    buildOutpost(outpostType, x, y) {
        // Check if the location is within a claimed territory
        const territory = this.getTerritory(x, y);
        if (!territory) {
            console.log('Cannot build outpost outside of claimed territory');
            return false;
        }

        // Check if the outpost type is valid
        if (!CONFIG.BUILDINGS[outpostType] || !CONFIG.BUILDINGS[outpostType].isOutpost) {
            console.log('Invalid outpost type');
            return false;
        }

        // Check if there's already an outpost at this location
        const existingOutpost = this.outposts.find(outpost =>
            outpost.x === x && outpost.y === y
        );

        if (existingOutpost) {
            console.log('There is already an outpost at this location');
            return false;
        }

        // Check requirements
        const requirements = CONFIG.BUILDINGS[outpostType].requirements;
        if (requirements) {
            for (const [reqBuilding, reqLevel] of Object.entries(requirements)) {
                // Check if the required building exists in the territory
                const hasRequiredBuilding = territory.outposts.some(outpost =>
                    outpost.type === reqBuilding && outpost.level >= reqLevel
                );

                if (!hasRequiredBuilding) {
                    console.log(`Requires ${CONFIG.BUILDINGS[reqBuilding].name} level ${reqLevel}`);
                    return false;
                }
            }
        }

        // Get the cost for level 1
        const buildingConfig = CONFIG.BUILDINGS[outpostType];
        const cost = buildingConfig.levels[0].cost;

        // Check if we have enough resources
        if (this.resources.FOOD < cost.FOOD || this.resources.ORE < cost.ORE) {
            console.log('Not enough resources to build outpost');
            return false;
        }

        // Deduct resources
        this.resources.FOOD -= cost.FOOD;
        this.resources.ORE -= cost.ORE;

        // Create the outpost
        const outpost = {
            id: Date.now(),
            type: outpostType,
            name: buildingConfig.name,
            x,
            y,
            level: 1,
            territoryId: territory.id,
            buildTime: buildingConfig.buildTime,
            startTime: Date.now(),
            completionTime: Date.now() + (buildingConfig.buildTime * 1000),
            status: 'building'
        };

        // Add to outposts list
        this.outposts.push(outpost);

        // Add to territory outposts list
        territory.outposts.push({
            id: outpost.id,
            type: outpostType,
            level: 1
        });

        // Log the action
        this.activityLogManager.addLogEntry(
            'Building',
            `Started building ${buildingConfig.name} at (${x}, ${y})`
        );

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Process outpost construction
     */
    processOutpostConstruction() {
        const now = Date.now();
        const completedOutposts = [];

        for (const outpost of this.outposts) {
            if (outpost.status === 'building' && now >= outpost.completionTime) {
                // Outpost construction completed
                outpost.status = 'completed';
                completedOutposts.push(outpost);

                // Find the territory
                const territory = this.claimedTerritories.find(t => t.id === outpost.territoryId);
                if (territory) {
                    // Apply outpost benefits to territory
                    this.applyOutpostBenefits(outpost, territory);
                }

                // Log completion
                this.activityLogManager.addLogEntry(
                    'Building',
                    `${outpost.name} construction completed at (${outpost.x}, ${outpost.y})`
                );
            }
        }

        if (completedOutposts.length > 0) {
            // Trigger UI update
            this.onStateChange();
        }
    }

    /**
     * Apply outpost benefits to a territory
     * @param {Object} outpost - The outpost
     * @param {Object} territory - The territory
     */
    applyOutpostBenefits(outpost, territory) {
        const buildingConfig = CONFIG.BUILDINGS[outpost.type];
        const levelConfig = buildingConfig.levels[outpost.level - 1];

        if (outpost.type === 'OUTPOST') {
            territory.benefits.harvestingBonus += levelConfig.harvestingBonus;
            territory.benefits.territoryBonus += levelConfig.territoryBonus;
        } else if (outpost.type === 'RESOURCE_STATION') {
            territory.benefits.resourceBonus += levelConfig.resourceBonus;
            territory.benefits.regenerationBonus += levelConfig.regenerationBonus;
        } else if (outpost.type === 'GUARD_POST') {
            territory.benefits.defenseBonus += levelConfig.defenseBonus;
            // Add guard units logic here if needed
        }
    }

    /**
     * Upgrade an outpost
     * @param {number} outpostId - The ID of the outpost to upgrade
     * @returns {boolean} - Whether the upgrade was started successfully
     */
    upgradeOutpost(outpostId) {
        // Find the outpost
        const outpost = this.outposts.find(o => o.id === outpostId);
        if (!outpost) {
            console.log('Outpost not found');
            return false;
        }

        // Check if the outpost is already being upgraded
        if (outpost.status === 'building' || outpost.status === 'upgrading') {
            console.log('Outpost is already being upgraded');
            return false;
        }

        // Check if the outpost is at max level
        const buildingConfig = CONFIG.BUILDINGS[outpost.type];
        if (outpost.level >= buildingConfig.levels.length) {
            console.log('Outpost is already at max level');
            return false;
        }

        // Get the cost for the next level
        const nextLevel = outpost.level + 1;
        const upgradeCost = buildingConfig.levels[nextLevel - 1].cost;

        // Check if we have enough resources
        if (this.resources.FOOD < upgradeCost.FOOD || this.resources.ORE < upgradeCost.ORE) {
            console.log('Not enough resources to upgrade outpost');
            return false;
        }

        // Deduct resources
        this.resources.FOOD -= upgradeCost.FOOD;
        this.resources.ORE -= upgradeCost.ORE;

        // Set upgrade properties
        outpost.status = 'upgrading';
        outpost.startTime = Date.now();
        outpost.completionTime = Date.now() + (buildingConfig.buildTime * nextLevel * 1000); // Longer time for higher levels

        // Log the action
        this.activityLogManager.addLogEntry(
            'Building',
            `Started upgrading ${outpost.name} at (${outpost.x}, ${outpost.y}) to level ${nextLevel}`
        );

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Process outpost upgrades
     */
    processOutpostUpgrades() {
        const now = Date.now();
        const upgradedOutposts = [];

        for (const outpost of this.outposts) {
            if (outpost.status === 'upgrading' && now >= outpost.completionTime) {
                // Find the territory
                const territory = this.claimedTerritories.find(t => t.id === outpost.territoryId);
                if (territory) {
                    // Remove old benefits
                    this.removeOutpostBenefits(outpost, territory);
                }

                // Upgrade completed
                outpost.level += 1;
                outpost.status = 'completed';
                upgradedOutposts.push(outpost);

                // Update territory outpost record
                if (territory) {
                    const territoryOutpost = territory.outposts.find(o => o.id === outpost.id);
                    if (territoryOutpost) {
                        territoryOutpost.level = outpost.level;
                    }

                    // Apply new benefits
                    this.applyOutpostBenefits(outpost, territory);
                }

                // Log completion
                this.activityLogManager.addLogEntry(
                    'Building',
                    `${outpost.name} upgraded to level ${outpost.level} at (${outpost.x}, ${outpost.y})`
                );
            }
        }

        if (upgradedOutposts.length > 0) {
            // Trigger UI update
            this.onStateChange();
        }
    }

    /**
     * Remove outpost benefits from a territory
     * @param {Object} outpost - The outpost
     * @param {Object} territory - The territory
     */
    removeOutpostBenefits(outpost, territory) {
        const buildingConfig = CONFIG.BUILDINGS[outpost.type];
        const levelConfig = buildingConfig.levels[outpost.level - 1];

        if (outpost.type === 'OUTPOST') {
            territory.benefits.harvestingBonus -= levelConfig.harvestingBonus;
            territory.benefits.territoryBonus -= levelConfig.territoryBonus;
        } else if (outpost.type === 'RESOURCE_STATION') {
            territory.benefits.resourceBonus -= levelConfig.resourceBonus;
            territory.benefits.regenerationBonus -= levelConfig.regenerationBonus;
        } else if (outpost.type === 'GUARD_POST') {
            territory.benefits.defenseBonus -= levelConfig.defenseBonus;
            // Remove guard units logic here if needed
        }
    }

    /**
     * Start a territory conflict with another player
     * @param {number} territoryId - The ID of the territory to contest
     * @param {Object} units - The units to send to the conflict {SPEARMAN: 0, ARCHER: 0, CAVALRY: 0, etc.}
     * @param {string} playerId - The ID of the player to conflict with
     * @returns {boolean} - Whether the conflict was started successfully
     */
    startTerritoryConflict(territoryId, units, playerId) {
        // Find the territory
        const territory = this.claimedTerritories.find(t => t.id === territoryId);
        if (!territory) {
            console.log('Territory not found');
            return false;
        }

        // Check if we have enough units
        for (const [unitType, count] of Object.entries(units)) {
            if (count > this.units[unitType]) {
                console.log(`Not enough ${unitType} units`);
                return false;
            }
        }

        // Check if any units are being sent
        const totalUnits = Object.values(units).reduce((sum, count) => sum + count, 0);
        if (totalUnits <= 0) {
            console.log('No units selected for conflict');
            return false;
        }

        // Check diplomatic relations
        const relation = this.diplomaticRelations.find(r => r.playerId === playerId);
        if (relation && relation.status === 'ALLIANCE') {
            console.log('Cannot start conflict with an ally');
            return false;
        }

        // Remove units from player's army
        for (const [unitType, count] of Object.entries(units)) {
            this.units[unitType] -= count;
        }

        // Create conflict
        const conflict = {
            id: Date.now(),
            territoryId,
            targetPlayerId: playerId,
            units: { ...units },
            status: 'active',
            startTime: Date.now(),
            duration: 300 * 1000, // 5 minutes in milliseconds
            completionTime: Date.now() + (300 * 1000),
            progress: 0,
            outcome: null
        };

        this.territoryConflicts.push(conflict);

        // Log the action
        this.activityLogManager.addLogEntry(
            'Conflict',
            `Started territory conflict for territory at (${territory.x}, ${territory.y})`
        );

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Process territory conflicts
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    processTerritoryConflicts(deltaTime) {
        if (this.territoryConflicts.length === 0) return;

        const now = Date.now();
        const completedConflicts = [];

        for (const conflict of this.territoryConflicts) {
            if (conflict.status === 'active') {
                // Update progress
                const elapsed = now - conflict.startTime;
                const total = conflict.duration;
                conflict.progress = Math.min(100, (elapsed / total) * 100);

                // Check if conflict is complete
                if (now >= conflict.completionTime) {
                    // Determine outcome
                    this.resolveConflict(conflict);
                    completedConflicts.push(conflict);
                }
            }
        }

        // Remove completed conflicts
        if (completedConflicts.length > 0) {
            this.territoryConflicts = this.territoryConflicts.filter(
                c => !completedConflicts.includes(c)
            );

            // Trigger UI update
            this.onStateChange();
        }
    }

    /**
     * Resolve a territory conflict
     * @param {Object} conflict - The conflict to resolve
     */
    resolveConflict(conflict) {
        // For now, just use a simple random outcome with weighted probability
        // In a real game, this would involve complex battle calculations

        // Calculate total unit strength
        let totalStrength = 0;
        for (const [unitType, count] of Object.entries(conflict.units)) {
            const unitConfig = CONFIG.UNITS[unitType];
            const attackValue = unitConfig.stats.attack;
            const defenseValue = unitConfig.stats.defense;

            // Use specialized units' bonuses if applicable
            let bonus = 1.0;
            if (unitType === 'DEFENDER' && unitConfig.isSpecialized) {
                bonus += unitConfig.territoryDefenseBonus / 100;
            }

            totalStrength += count * (attackValue + defenseValue) * bonus;
        }

        // Simulate enemy strength (would be based on actual enemy data in a real game)
        const enemyStrength = Math.random() * 100 + 50; // Random value between 50 and 150

        // Determine outcome
        const winProbability = totalStrength / (totalStrength + enemyStrength);
        const isVictory = Math.random() < winProbability;

        conflict.status = 'completed';
        conflict.outcome = isVictory ? 'victory' : 'defeat';

        // Apply outcome effects
        if (isVictory) {
            // Find the territory
            const territory = this.claimedTerritories.find(t => t.id === conflict.territoryId);
            if (territory) {
                // Transfer territory ownership (in a real game, this would involve more complex logic)
                territory.owner = this.playerId;

                // Return some units (casualties would be calculated in a real game)
                const casualtyRate = 0.3; // 30% casualties
                for (const [unitType, count] of Object.entries(conflict.units)) {
                    const survivingUnits = Math.floor(count * (1 - casualtyRate));
                    this.units[unitType] += survivingUnits;
                }

                // Log victory
                this.activityLogManager.addLogEntry(
                    'Conflict',
                    `Victory in territory conflict for territory at (${territory.x}, ${territory.y})`
                );
            }
        } else {
            // In case of defeat, units are lost
            // Log defeat
            const territory = this.claimedTerritories.find(t => t.id === conflict.territoryId);
            if (territory) {
                this.activityLogManager.addLogEntry(
                    'Conflict',
                    `Defeat in territory conflict for territory at (${territory.x}, ${territory.y})`
                );
            } else {
                this.activityLogManager.addLogEntry(
                    'Conflict',
                    `Defeat in territory conflict`
                );
            }
        }
    }

    /**
     * Establish a diplomatic relation with another player
     * @param {string} playerId - The ID of the player to establish relations with
     * @param {string} status - The status of the relation (NEUTRAL, ALLIANCE, WAR)
     * @returns {boolean} - Whether the relation was established successfully
     */
    establishDiplomaticRelation(playerId, status) {
        // Check if relation already exists
        const existingRelation = this.diplomaticRelations.find(r => r.playerId === playerId);

        if (existingRelation) {
            // Update existing relation
            existingRelation.status = status;
            existingRelation.lastUpdated = Date.now();
        } else {
            // Create new relation
            const relation = {
                playerId,
                status,
                established: Date.now(),
                lastUpdated: Date.now(),
                favorLevel: 50 // Neutral favor level (0-100)
            };

            this.diplomaticRelations.push(relation);
        }

        // Apply diplomatic bonuses from specialized units
        if (this.specializedUnits.DIPLOMAT && this.specializedUnits.DIPLOMAT > 0) {
            const diplomatConfig = CONFIG.UNITS.DIPLOMAT;
            if (diplomatConfig.isSpecialized) {
                // Apply diplomatic influence bonus
                const relation = this.diplomaticRelations.find(r => r.playerId === playerId);
                if (relation) {
                    const influenceBonus = diplomatConfig.diplomaticInfluence * this.specializedUnits.DIPLOMAT;
                    relation.favorLevel = Math.min(100, relation.favorLevel + influenceBonus);
                }
            }
        }

        // Log the action
        this.activityLogManager.addLogEntry(
            'Diplomacy',
            `Established ${status} relation with player ${playerId}`
        );

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Process diplomatic relations
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    processDiplomaticRelations(deltaTime) {
        if (this.diplomaticRelations.length === 0) return;

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // In a real game, this would involve complex diplomatic calculations
        // For now, just decay favor level over time for non-alliance relations
        for (const relation of this.diplomaticRelations) {
            if (relation.status !== 'ALLIANCE') {
                // Check if it's been at least a day since last update
                if (now - relation.lastUpdated >= oneDay) {
                    // Decay favor level
                    relation.favorLevel = Math.max(0, relation.favorLevel - 5);
                    relation.lastUpdated = now;

                    // Log significant changes
                    if (relation.favorLevel <= 20 && relation.status !== 'WAR') {
                        relation.status = 'WAR';
                        this.activityLogManager.addLogEntry(
                            'Diplomacy',
                            `Relations with player ${relation.playerId} have deteriorated to WAR`
                        );
                    } else if (relation.favorLevel >= 80 && relation.status !== 'ALLIANCE') {
                        relation.status = 'ALLIANCE';
                        this.activityLogManager.addLogEntry(
                            'Diplomacy',
                            `Relations with player ${relation.playerId} have improved to ALLIANCE`
                        );
                    }
                }
            }
        }
    }

    /**
     * Train specialized units
     * @param {string} unitType - The type of specialized unit to train
     * @param {number} count - The number of units to train
     * @returns {boolean} - Whether the training was started successfully
     */
    trainSpecializedUnit(unitType, count) {
        // Check if the unit type is valid and specialized
        const unitConfig = CONFIG.UNITS[unitType];
        if (!unitConfig || !unitConfig.isSpecialized) {
            console.log('Invalid specialized unit type');
            return false;
        }

        // Check if we have enough resources
        const totalCost = {
            FOOD: unitConfig.cost.FOOD * count,
            ORE: unitConfig.cost.ORE * count
        };

        if (this.resources.FOOD < totalCost.FOOD || this.resources.ORE < totalCost.ORE) {
            console.log('Not enough resources to train specialized units');
            return false;
        }

        // Deduct resources
        this.resources.FOOD -= totalCost.FOOD;
        this.resources.ORE -= totalCost.ORE;

        // Add to training queue
        const trainingTime = 20; // seconds per unit

        const trainingItem = {
            type: unitType,
            count: count,
            timeRemaining: trainingTime * count,
            totalTime: trainingTime * count
        };

        this.trainingQueue.push(trainingItem);

        // Initialize specialized units tracking if needed
        if (!this.specializedUnits[unitType]) {
            this.specializedUnits[unitType] = 0;
        }

        // Log the action
        this.activityLogManager.addLogEntry(
            'Training',
            `Started training ${count} ${unitConfig.name} units`
        );

        // Trigger UI update
        this.onStateChange();
        return true;
    }

    /**
     * Event handler for state changes
     */
    onStateChange() {
        // This will be set by the UI to update when state changes
    }

    /**
     * Save game state
     */
    saveGame() {
        if (this.saveSystem) {
            this.saveSystem.saveGame();
        }
    }

    /**
     * Get hero manager
     * @returns {HeroManager} - The hero manager
     */
    getHeroManager() {
        return this.heroManager;
    }

    /**
     * Set unlimited resources for testing
     * Sets all resources to 999999 and enables unlimited resource mode
     */
    setUnlimitedResources() {
        // Set all resources to a very high number
        this.resources.FOOD = 999999;
        this.resources.ORE = 999999;

        // Set flag to indicate unlimited resources are active
        this._unlimitedResourcesActive = true;

        // Log the action
        if (this.activityLogManager) {
            this.activityLogManager.addLogEntry('System', 'Unlimited resources activated for testing');
        }

        // Trigger UI update
        this.onStateChange();

        // Show confirmation message to user
        alert('Unlimited resources activated for testing!');
    }
}

// GameState class is now ready to be instantiated in main.js
