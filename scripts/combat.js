/**
 * Combat System
 * Handles combat operations and calculations
 */

class CombatManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.activeCombats = new Map(); // Track active combats by target ID
    }

    /**
     * Get all NPC camps on the map
     */
    getNPCCamps() {
        const camps = [];

        for (let y = 0; y < this.gameState.mapSize.height; y++) {
            for (let x = 0; x < this.gameState.mapSize.width; x++) {
                const cell = this.gameState.map[y][x];
                if (cell && cell.type === 'NPC') {
                    camps.push({
                        x,
                        y,
                        campType: cell.campType,
                        name: CONFIG.NPC_CAMPS[cell.campType].name,
                        difficulty: CONFIG.NPC_CAMPS[cell.campType].difficulty,
                        id: cell.id
                    });
                }
            }
        }

        return camps;
    }

    /**
     * Attack an NPC camp with all available units
     */
    attackNPC(targetX, targetY) {
        // Show the combat UI for unit selection
        if (combatUI) {
            combatUI.showModal(targetX, targetY);
            return true;
        } else {
            // Fallback to old behavior if UI not available
            const units = {
                SPEARMAN: this.gameState.units.SPEARMAN,
                ARCHER: this.gameState.units.ARCHER,
                CAVALRY: this.gameState.units.CAVALRY
            };
            return this.attackNPCWithUnits(targetX, targetY, units);
        }
    }

    /**
     * Attack an NPC camp with specific units
     */
    attackNPCWithUnits(targetX, targetY, units) {
        // Check if we have any units to send
        if (units.SPEARMAN <= 0 && units.ARCHER <= 0 && units.CAVALRY <= 0) {
            console.log('No units to attack with');
            return false;
        }

        // Check if target is valid
        if (targetX >= this.gameState.mapSize.width || targetY >= this.gameState.mapSize.height || !this.gameState.map[targetY][targetX]) {
            console.log('Invalid target location');
            return false;
        }

        const target = this.gameState.map[targetY][targetX];
        if (target.type !== 'NPC') {
            console.log('Target is not an NPC camp');
            return false;
        }

        // Check if we're already attacking this target
        if (this.activeCombats.has(target.id)) {
            console.log('Already attacking this target');
            return false;
        }

        // Calculate travel time
        const travelTime = this.calculateTravelTime(targetX, targetY);

        // Deduct units from player
        this.gameState.units.SPEARMAN -= units.SPEARMAN;
        this.gameState.units.ARCHER -= units.ARCHER;
        this.gameState.units.CAVALRY -= units.CAVALRY;

        // Add to active combats
        this.activeCombats.set(target.id, {
            target,
            units,
            startTime: Date.now(),
            travelTime: travelTime * 1000, // Convert to milliseconds
            returnTime: null,
            status: 'traveling' // traveling, fighting, returning
        });

        // Schedule combat resolution
        setTimeout(() => {
            this.resolveCombat(target.id);
        }, travelTime * 1000);

        // Trigger UI update
        this.gameState.onStateChange();
        return true;
    }

    /**
     * Resolve combat for a specific target
     */
    resolveCombat(targetId) {
        const combat = this.activeCombats.get(targetId);
        if (!combat) return;

        // Update combat status
        combat.status = 'fighting';
        this.gameState.onStateChange();

        // Create battle visualization
        const battleContainer = document.createElement('div');
        battleContainer.className = 'combat-visualization';
        document.body.appendChild(battleContainer);

        // Show battle visualization
        setTimeout(() => {
            battleContainer.classList.add('active');

            // Create battle scene
            const battleScene = document.createElement('div');
            battleScene.className = 'combat-scene';
            battleContainer.appendChild(battleScene);

            // Add background
            const background = document.createElement('div');
            background.className = 'combat-background';
            battleScene.appendChild(background);

            // Show battle animation
            const enemyType = combat.target.campType === 'GOBLIN_CAMP' ? 'goblin' : 'bandit';
            const enemyCount = Math.ceil(combat.target.difficulty);

            unitAnimationManager.createBattleSceneAnimation(
                combat.units,
                enemyType,
                enemyCount,
                battleScene,
                () => {
                    // Animation complete, hide battle visualization
                    battleContainer.classList.remove('active');
                    setTimeout(() => {
                        if (battleContainer.parentNode) {
                            battleContainer.parentNode.removeChild(battleContainer);
                        }
                    }, 500);
                },
                true // Player wins by default, will be updated after combat resolution
            );

            // Resolve the actual combat
            const report = this.gameState.resolveCombat(combat.target, combat.units);

            // Log the combat result
            const campName = CONFIG.NPC_CAMPS[combat.target.campType].name;
            if (report.result === 'victory') {
                this.gameState.activityLogManager.addLogEntry('Combat',
                    `Victory against ${campName}! Gained ${report.loot.FOOD} food and ${report.loot.ORE} ore.`);
            } else {
                this.gameState.activityLogManager.addLogEntry('Combat',
                    `Defeat against ${campName}. All units were lost.`);
            }

            // Update battle animation based on result
            if (report.result === 'defeat') {
                // Update animation to show player defeat
                const battleAnimations = unitAnimationManager.activeAnimations;
                for (const [animId, anim] of battleAnimations.entries()) {
                    if (animId.startsWith('battle-scene') && anim.element.parentNode === battleScene) {
                        anim.playerWins = false;
                    }
                }
            }

            // Update combat status
            combat.status = 'returning';
            combat.returnTime = Date.now() + (combat.travelTime / 2); // Return is faster
            this.gameState.onStateChange();

            // Schedule combat cleanup
            setTimeout(() => {
                this.activeCombats.delete(targetId);
                this.gameState.onStateChange();

                // Respawn camp after a delay if it was defeated
                if (report.result === 'victory') {
                    setTimeout(() => {
                        this.respawnCamp(combat.target);
                    }, CONFIG.COMBAT.CAMP_RESPAWN_TIME * 1000);
                }
            }, combat.travelTime / 2);
        }, 1000); // 1 second delay before battle visualization
    }

    /**
     * Respawn an NPC camp with potentially increased difficulty
     */
    respawnCamp(target) {
        const campConfig = CONFIG.NPC_CAMPS[target.campType];
        const x = target.x;
        const y = target.y;

        // Check if the camp location is still valid
        if (this.gameState.map[y][x] && this.gameState.map[y][x].id === target.id) {
            // Respawn the camp, potentially with increased difficulty
            const newDifficulty = Math.min(campConfig.difficulty + 0.5, 10);
            const newLoot = {
                FOOD: Math.floor(campConfig.loot.FOOD * (1 + (newDifficulty - campConfig.difficulty) * 0.2)),
                ORE: Math.floor(campConfig.loot.ORE * (1 + (newDifficulty - campConfig.difficulty) * 0.2))
            };

            // Update the camp in the game state
            this.gameState.map[y][x] = {
                type: 'NPC',
                campType: target.campType,
                id: `${target.campType}_${x}_${y}_${Date.now()}`, // New ID to prevent combat conflicts
                difficulty: newDifficulty,
                loot: newLoot
            };

            // Trigger UI update
            this.gameState.onStateChange();
        }
    }

    /**
     * Get all combat reports
     */
    getCombatReports() {
        return this.gameState.combatReports;
    }

    /**
     * Get active combats
     */
    getActiveCombats() {
        return Array.from(this.activeCombats.values());
    }

    /**
     * Calculate travel time to a target
     */
    calculateTravelTime(targetX, targetY) {
        const playerX = 1, playerY = 1; // Player base position
        const distance = Math.sqrt(Math.pow(targetX - playerX, 2) + Math.pow(targetY - playerY, 2));
        return distance / CONFIG.COMBAT.TRAVEL_SPEED;
    }

    /**
     * Calculate attack power for units against a target
     */
    calculateAttackPower(units, target) {
        let totalAttack = 0;
        const campType = target.campType;

        // Calculate attack for each unit type
        for (const [unitType, count] of Object.entries(units)) {
            if (count > 0) {
                // Get base attack and apply technology bonuses
                let unitBaseAttack = CONFIG.UNITS[unitType].stats.attack;
                if (this.gameState.bonuses.unitAttack > 0) {
                    unitBaseAttack *= (1 + this.gameState.bonuses.unitAttack);
                }

                let unitAttack = count * unitBaseAttack;

                // Apply unit type advantages
                if (unitType === 'SPEARMAN' && campType === 'GOBLIN_CAMP') {
                    let advantageMultiplier = 1.2; // 20% base bonus against goblins
                    if (this.gameState.bonuses.advantageMultiplier > 0) {
                        advantageMultiplier += this.gameState.bonuses.advantageMultiplier;
                    }
                    unitAttack *= advantageMultiplier;
                } else if (unitType === 'ARCHER' && campType === 'BANDIT_HIDEOUT') {
                    let advantageMultiplier = 1.2; // 20% base bonus against bandits
                    if (this.gameState.bonuses.advantageMultiplier > 0) {
                        advantageMultiplier += this.gameState.bonuses.advantageMultiplier;
                    }
                    unitAttack *= advantageMultiplier;
                }

                totalAttack += unitAttack;
            }
        }

        return totalAttack;
    }
}

// CombatManager class is now ready to be instantiated in main.js
