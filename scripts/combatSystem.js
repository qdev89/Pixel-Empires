/**
 * Combat System for Pixel Empires
 * Handles combat calculations, battle simulations, and combat-related features
 */
class CombatSystem {
    /**
     * Initialize the combat system
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.activeBattles = []; // Active battles
        this.battleHistory = []; // History of battles
        this.formations = CONFIG.COMBAT.FORMATIONS; // Combat formations
        this.terrainEffects = CONFIG.COMBAT.TERRAIN_EFFECTS; // Terrain effects on combat
        this.weatherEffects = {}; // Weather effects on combat (to be implemented)
        this.currentFormation = 'balanced'; // Default formation
    }
    
    /**
     * Start a battle with an enemy camp
     * @param {Object} enemyCamp - The enemy camp to attack
     * @param {Object} units - The units to send to battle {SPEARMAN: 0, ARCHER: 0, CAVALRY: 0, etc.}
     * @param {string} formation - The combat formation to use
     * @returns {Object} - Battle result
     */
    startBattle(enemyCamp, units, formation = this.currentFormation) {
        // Check if we have enough units
        for (const [unitType, count] of Object.entries(units)) {
            if (count > this.gameState.units[unitType]) {
                console.log(`Not enough ${unitType} units`);
                return null;
            }
        }
        
        // Check if any units are being sent
        const totalUnits = Object.values(units).reduce((sum, count) => sum + count, 0);
        if (totalUnits <= 0) {
            console.log('No units selected for battle');
            return null;
        }
        
        // Remove units from player's army
        for (const [unitType, count] of Object.entries(units)) {
            this.gameState.units[unitType] -= count;
        }
        
        // Create battle
        const battle = {
            id: Date.now(),
            enemyCamp: enemyCamp,
            playerUnits: { ...units },
            formation: formation,
            status: 'active',
            startTime: Date.now(),
            travelTime: this.calculateTravelTime(enemyCamp),
            arrivalTime: Date.now() + this.calculateTravelTime(enemyCamp) * 1000,
            combatTime: 0,
            completionTime: 0,
            progress: 0,
            result: null,
            terrain: this.getTerrainAtLocation(enemyCamp.x, enemyCamp.y),
            weather: this.getCurrentWeather(),
            tacticalAdvantages: this.calculateTacticalAdvantages(units, enemyCamp, formation)
        };
        
        this.activeBattles.push(battle);
        
        // Log the action
        this.gameState.activityLogManager.addLogEntry(
            'Combat',
            `Sent units to attack ${enemyCamp.name}`
        );
        
        return battle;
    }
    
    /**
     * Calculate travel time to enemy camp
     * @param {Object} enemyCamp - The enemy camp
     * @returns {number} - Travel time in seconds
     */
    calculateTravelTime(enemyCamp) {
        // Calculate distance from player's base to enemy camp
        const baseX = this.gameState.buildings.TOWN_HALL.x;
        const baseY = this.gameState.buildings.TOWN_HALL.y;
        const distance = Math.sqrt(Math.pow(enemyCamp.x - baseX, 2) + Math.pow(enemyCamp.y - baseY, 2));
        
        // Calculate travel time based on distance and travel speed
        const travelSpeed = CONFIG.COMBAT.TRAVEL_SPEED;
        let travelTime = distance / travelSpeed;
        
        // Apply movement speed bonuses from technologies
        if (this.gameState.technologies.EXPLORATION && 
            this.gameState.technologies.EXPLORATION.NAVIGATION) {
            const speedBonus = this.gameState.technologies.EXPLORATION.NAVIGATION.effects.movementSpeedBonus || 0;
            travelTime /= (1 + speedBonus);
        }
        
        // Apply terrain penalties
        const terrainPenalty = this.calculateTerrainMovementPenalty(baseX, baseY, enemyCamp.x, enemyCamp.y);
        travelTime *= (1 + terrainPenalty);
        
        // Apply weather penalties
        const weatherPenalty = this.calculateWeatherMovementPenalty();
        travelTime *= (1 + weatherPenalty);
        
        return Math.max(5, Math.round(travelTime)); // Minimum 5 seconds
    }
    
    /**
     * Calculate terrain movement penalty
     * @param {number} startX - Starting X coordinate
     * @param {number} startY - Starting Y coordinate
     * @param {number} endX - Ending X coordinate
     * @param {number} endY - Ending Y coordinate
     * @returns {number} - Movement penalty (0-1)
     */
    calculateTerrainMovementPenalty(startX, startY, endX, endY) {
        // Simplified implementation - in a real game, this would check terrain along the path
        const terrain = this.getTerrainAtLocation(endX, endY);
        
        switch (terrain) {
            case 'mountain':
                return 0.5; // 50% slower in mountains
            case 'forest':
                return 0.3; // 30% slower in forests
            case 'water':
                // Check if water crossing is unlocked
                if (this.gameState.technologies.EXPLORATION && 
                    this.gameState.technologies.EXPLORATION.NAVIGATION && 
                    this.gameState.technologies.EXPLORATION.NAVIGATION.effects.waterCrossing) {
                    return 0.2; // 20% slower with water crossing technology
                }
                return 1.0; // 100% slower (twice as long) without water crossing
            default:
                return 0; // No penalty on grass
        }
    }
    
    /**
     * Calculate weather movement penalty
     * @returns {number} - Movement penalty (0-1)
     */
    calculateWeatherMovementPenalty() {
        const weather = this.getCurrentWeather();
        
        switch (weather) {
            case 'rain':
                return 0.2; // 20% slower in rain
            case 'snow':
                return 0.5; // 50% slower in snow
            case 'storm':
                return 0.7; // 70% slower in storms
            default:
                return 0; // No penalty in clear weather
        }
    }
    
    /**
     * Get terrain at location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string} - Terrain type
     */
    getTerrainAtLocation(x, y) {
        // Simplified terrain calculation based on position
        // In a real game, this would use a terrain map
        const terrainSeed = (x * 3 + y * 7 + Math.floor(x/5) * 11 + Math.floor(y/5) * 13) % 15;
        
        if (terrainSeed < 7) {
            return 'grass';
        } else if (terrainSeed < 10) {
            return 'forest';
        } else if (terrainSeed < 13) {
            return 'mountain';
        } else {
            return 'water';
        }
    }
    
    /**
     * Get current weather
     * @returns {string} - Weather type
     */
    getCurrentWeather() {
        // In a real implementation, this would be based on a weather system
        // For now, just return 'clear'
        return 'clear';
    }
    
    /**
     * Calculate tactical advantages for a battle
     * @param {Object} units - The units in battle
     * @param {Object} enemyCamp - The enemy camp
     * @param {string} formation - The combat formation
     * @returns {Object} - Tactical advantages
     */
    calculateTacticalAdvantages(units, enemyCamp, formation) {
        const advantages = {
            unitTypeAdvantage: 0,
            terrainAdvantage: 0,
            formationAdvantage: 0,
            weatherAdvantage: 0,
            technologyAdvantage: 0,
            total: 0
        };
        
        // Calculate unit type advantage
        if (enemyCamp.weakAgainst) {
            const advantageUnitCount = units[enemyCamp.weakAgainst] || 0;
            const totalUnits = Object.values(units).reduce((sum, count) => sum + count, 0);
            
            if (totalUnits > 0) {
                advantages.unitTypeAdvantage = (advantageUnitCount / totalUnits) * 0.3; // Up to 30% advantage
            }
        }
        
        // Calculate terrain advantage
        const terrain = this.getTerrainAtLocation(enemyCamp.x, enemyCamp.y);
        const terrainEffect = this.terrainEffects[terrain] || { attack: 1.0, defense: 1.0 };
        
        // Simplified terrain advantage calculation
        advantages.terrainAdvantage = ((terrainEffect.attack + terrainEffect.defense) / 2) - 1;
        
        // Calculate formation advantage
        const formationEffect = this.formations[formation] || this.formations.balanced;
        advantages.formationAdvantage = (formationEffect.attack + formationEffect.defense) / 2 - 1;
        
        // Calculate weather advantage
        const weather = this.getCurrentWeather();
        switch (weather) {
            case 'rain':
                // Rain benefits archers less
                const archerRatio = (units.ARCHER || 0) / Object.values(units).reduce((sum, count) => sum + count, 0);
                advantages.weatherAdvantage = -0.1 * archerRatio; // Up to -10% for all archers
                break;
            case 'fog':
                // Fog benefits defensive units
                const defenderRatio = (units.DEFENDER || 0) / Object.values(units).reduce((sum, count) => sum + count, 0);
                advantages.weatherAdvantage = 0.15 * defenderRatio; // Up to 15% for all defenders
                break;
            default:
                advantages.weatherAdvantage = 0;
        }
        
        // Calculate technology advantage
        if (this.gameState.technologies.MILITARY) {
            if (this.gameState.technologies.MILITARY.IMPROVED_WEAPONS) {
                advantages.technologyAdvantage += this.gameState.technologies.MILITARY.IMPROVED_WEAPONS.effects.unitAttackBonus || 0;
            }
            
            if (this.gameState.technologies.MILITARY.IMPROVED_ARMOR) {
                advantages.technologyAdvantage += this.gameState.technologies.MILITARY.IMPROVED_ARMOR.effects.unitDefenseBonus || 0;
            }
            
            if (this.gameState.technologies.MILITARY.ADVANCED_TACTICS) {
                advantages.technologyAdvantage += this.gameState.technologies.MILITARY.ADVANCED_TACTICS.effects.advantageBonus || 0;
            }
        }
        
        // Calculate total advantage
        advantages.total = advantages.unitTypeAdvantage + 
                          advantages.terrainAdvantage + 
                          advantages.formationAdvantage + 
                          advantages.weatherAdvantage + 
                          advantages.technologyAdvantage;
        
        return advantages;
    }
    
    /**
     * Process active battles
     */
    processBattles() {
        const now = Date.now();
        const completedBattles = [];
        
        for (const battle of this.activeBattles) {
            if (battle.status === 'active') {
                // Update progress
                if (now < battle.arrivalTime) {
                    // Still traveling
                    const travelProgress = (now - battle.startTime) / (battle.arrivalTime - battle.startTime);
                    battle.progress = Math.min(50, Math.floor(travelProgress * 50)); // Travel is 50% of progress
                } else if (!battle.combatTime) {
                    // Arrived at enemy camp, start combat
                    battle.combatTime = now;
                    battle.completionTime = now + CONFIG.COMBAT.COMBAT_VISUALIZATION_TIME * 1000;
                    battle.progress = 50; // Combat starts at 50% progress
                } else {
                    // In combat
                    const combatProgress = (now - battle.combatTime) / (battle.completionTime - battle.combatTime);
                    battle.progress = 50 + Math.min(50, Math.floor(combatProgress * 50)); // Combat is 50% of progress
                    
                    // Check if combat is complete
                    if (now >= battle.completionTime) {
                        this.resolveBattle(battle);
                        completedBattles.push(battle);
                    }
                }
            }
        }
        
        // Remove completed battles
        if (completedBattles.length > 0) {
            this.activeBattles = this.activeBattles.filter(
                battle => !completedBattles.includes(battle)
            );
            
            // Add to battle history
            this.battleHistory.push(...completedBattles);
        }
    }
    
    /**
     * Resolve a battle
     * @param {Object} battle - The battle to resolve
     */
    resolveBattle(battle) {
        // Calculate player strength
        let playerStrength = 0;
        for (const [unitType, count] of Object.entries(battle.playerUnits)) {
            const unitConfig = CONFIG.UNITS[unitType];
            let attackValue = unitConfig.stats.attack;
            let defenseValue = unitConfig.stats.defense;
            
            // Apply formation modifiers
            const formation = this.formations[battle.formation];
            attackValue *= formation.attack;
            defenseValue *= formation.defense;
            
            // Apply terrain modifiers
            const terrainEffect = this.terrainEffects[battle.terrain];
            attackValue *= terrainEffect.attack;
            defenseValue *= terrainEffect.defense;
            
            // Apply tactical advantages
            attackValue *= (1 + battle.tacticalAdvantages.total);
            defenseValue *= (1 + battle.tacticalAdvantages.total);
            
            // Apply unit type advantages
            if (battle.enemyCamp.weakAgainst === unitType) {
                attackValue *= CONFIG.COMBAT.ADVANTAGE_MULTIPLIER;
            }
            
            if (battle.enemyCamp.strongAgainst === unitType) {
                attackValue *= CONFIG.COMBAT.DISADVANTAGE_MULTIPLIER;
            }
            
            // Calculate unit strength
            const unitStrength = count * (attackValue + defenseValue);
            playerStrength += unitStrength;
        }
        
        // Calculate enemy strength
        let enemyStrength = 0;
        for (const [unitType, count] of Object.entries(battle.enemyCamp.units)) {
            // Simplified enemy unit stats
            const baseStrength = 10; // Base strength per enemy unit
            enemyStrength += count * baseStrength;
        }
        
        // Apply enemy camp difficulty
        enemyStrength *= battle.enemyCamp.difficulty;
        
        // Apply enemy special ability if applicable
        if (battle.enemyCamp.specialAbility && battle.enemyCamp.specialAbility.effect) {
            const effect = battle.enemyCamp.specialAbility.effect;
            
            if (effect.attackReduction) {
                playerStrength *= (1 - effect.attackReduction);
            }
            
            if (effect.defenseReduction) {
                playerStrength *= (1 - effect.defenseReduction);
            }
            
            if (effect.casualtyIncrease) {
                // This will be applied later
            }
            
            if (effect.lootReduction) {
                // This will be applied later
            }
        }
        
        // Determine battle outcome
        const playerWinProbability = playerStrength / (playerStrength + enemyStrength);
        const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
        const adjustedProbability = Math.max(0.1, Math.min(0.9, playerWinProbability * randomFactor));
        
        const isVictory = Math.random() < adjustedProbability;
        
        // Calculate casualties
        let casualtyRate;
        if (isVictory) {
            // Lower casualties for victory
            casualtyRate = 0.2 + (1 - adjustedProbability) * 0.3; // 20-50% casualties
        } else {
            // Higher casualties for defeat
            casualtyRate = 0.5 + (1 - adjustedProbability) * 0.5; // 50-100% casualties
        }
        
        // Apply formation casualty modifier
        casualtyRate *= this.formations[battle.formation].casualtyRate;
        
        // Apply enemy special ability casualty increase if applicable
        if (battle.enemyCamp.specialAbility && 
            battle.enemyCamp.specialAbility.effect && 
            battle.enemyCamp.specialAbility.effect.casualtyIncrease) {
            casualtyRate *= (1 + battle.enemyCamp.specialAbility.effect.casualtyIncrease);
        }
        
        // Apply defensive technology casualty reduction if applicable
        if (isVictory && 
            this.gameState.technologies.DEFENSIVE && 
            this.gameState.technologies.DEFENSIVE.DEFENSIVE_TACTICS) {
            const reduction = this.gameState.technologies.DEFENSIVE.DEFENSIVE_TACTICS.effects.defensiveCasualtyReduction || 0;
            casualtyRate *= (1 - reduction);
        }
        
        // Calculate surviving units
        const survivingUnits = {};
        for (const [unitType, count] of Object.entries(battle.playerUnits)) {
            // Different units might have different casualty rates in a more complex system
            const unitCasualtyRate = casualtyRate;
            const survivors = Math.floor(count * (1 - unitCasualtyRate));
            survivingUnits[unitType] = survivors;
            
            // Return surviving units to player
            this.gameState.units[unitType] += survivors;
        }
        
        // Calculate loot
        let loot = { ...battle.enemyCamp.loot };
        
        if (!isVictory) {
            // No loot for defeat
            loot = { FOOD: 0, ORE: 0 };
        } else {
            // Apply loot percentage
            for (const resource in loot) {
                loot[resource] = Math.floor(loot[resource] * CONFIG.COMBAT.LOOT_PERCENTAGE);
            }
            
            // Apply enemy special ability loot reduction if applicable
            if (battle.enemyCamp.specialAbility && 
                battle.enemyCamp.specialAbility.effect && 
                battle.enemyCamp.specialAbility.effect.lootReduction) {
                for (const resource in loot) {
                    loot[resource] = Math.floor(loot[resource] * (1 - battle.enemyCamp.specialAbility.effect.lootReduction));
                }
            }
            
            // Add loot to player's resources
            for (const [resource, amount] of Object.entries(loot)) {
                this.gameState.resources[resource] += amount;
            }
        }
        
        // Update battle result
        battle.status = 'completed';
        battle.result = {
            outcome: isVictory ? 'victory' : 'defeat',
            playerStrength: playerStrength,
            enemyStrength: enemyStrength,
            casualtyRate: casualtyRate,
            survivingUnits: survivingUnits,
            loot: loot,
            xp: isVictory ? 50 : 10 // XP gained from battle
        };
        
        // Create combat report
        const combatReport = {
            id: battle.id,
            enemyType: battle.enemyCamp.name,
            location: { x: battle.enemyCamp.x, y: battle.enemyCamp.y },
            time: Date.now(),
            units: battle.playerUnits,
            formation: battle.formation,
            terrain: battle.terrain,
            weather: battle.weather,
            tacticalAdvantages: battle.tacticalAdvantages,
            outcome: battle.result.outcome,
            casualties: {
                sent: battle.playerUnits,
                survived: survivingUnits
            },
            loot: loot
        };
        
        // Add to combat reports
        this.gameState.combatReports.push(combatReport);
        
        // Log the result
        this.gameState.activityLogManager.addLogEntry(
            'Combat',
            `${battle.result.outcome === 'victory' ? 'Victory' : 'Defeat'} against ${battle.enemyCamp.name}`
        );
    }
    
    /**
     * Set combat formation
     * @param {string} formation - The formation to set
     * @returns {boolean} - Whether the formation was set successfully
     */
    setFormation(formation) {
        if (!this.formations[formation]) {
            console.log('Invalid formation');
            return false;
        }
        
        this.currentFormation = formation;
        return true;
    }
    
    /**
     * Get available formations
     * @returns {Object} - Available formations
     */
    getFormations() {
        return this.formations;
    }
    
    /**
     * Get current formation
     * @returns {string} - Current formation
     */
    getCurrentFormation() {
        return this.currentFormation;
    }
    
    /**
     * Get active battles
     * @returns {Array} - Active battles
     */
    getActiveBattles() {
        return this.activeBattles;
    }
    
    /**
     * Get battle history
     * @returns {Array} - Battle history
     */
    getBattleHistory() {
        return this.battleHistory;
    }
    
    /**
     * Update combat system (called on each game tick)
     */
    update() {
        // Process active battles
        this.processBattles();
    }
}

// Export the CombatSystem class
if (typeof module !== 'undefined') {
    module.exports = { CombatSystem };
}
