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
     * @param {number} targetX - X coordinate of target
     * @param {number} targetY - Y coordinate of target
     * @param {Object} units - Units to send {SPEARMAN: 0, ARCHER: 0, CAVALRY: 0}
     * @param {string} formation - Combat formation to use
     * @param {Array} heroIds - IDs of heroes to send to battle
     * @returns {boolean} - Success or failure
     */
    attackNPCWithUnits(targetX, targetY, units, formation = 'balanced', heroIds = []) {
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

        // Process heroes for combat
        const heroes = [];
        const heroManager = this.gameState.heroManager;

        if (heroManager && heroIds.length > 0) {
            // Validate and prepare heroes for combat
            for (const heroId of heroIds) {
                const hero = heroManager.getHeroById(heroId);
                if (hero && hero.status === 'active') {
                    // Calculate hero's total stats including equipment
                    const heroStats = heroManager.calculateHeroTotalStats(heroId);
                    heroes.push({
                        id: hero.id,
                        name: hero.name,
                        type: hero.type,
                        level: hero.level,
                        stats: heroStats,
                        abilities: hero.abilities,
                        portrait: hero.portrait
                    });

                    // Set hero status to 'in_combat'
                    hero.status = 'in_combat';
                }
            }
        }

        // Add to active combats
        this.activeCombats.set(target.id, {
            target,
            units,
            heroes,
            formation,
            startTime: Date.now(),
            travelTime: travelTime * 1000, // Convert to milliseconds
            returnTime: null,
            status: 'traveling', // traveling, fighting, returning
            heroAbilitiesUsed: [] // Track hero abilities used during combat
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

            // Create hero display if heroes are present
            if (combat.heroes && combat.heroes.length > 0) {
                const heroesContainer = document.createElement('div');
                heroesContainer.className = 'combat-heroes';
                battleScene.appendChild(heroesContainer);

                for (const hero of combat.heroes) {
                    const heroElement = document.createElement('div');
                    heroElement.className = 'combat-hero';
                    heroElement.innerHTML = `
                        <div class="hero-portrait">${hero.portrait}</div>
                        <div class="hero-name">${hero.name}</div>
                    `;
                    heroesContainer.appendChild(heroElement);

                    // Add hero abilities if available
                    if (hero.abilities && hero.abilities.length > 0) {
                        const abilitiesContainer = document.createElement('div');
                        abilitiesContainer.className = 'hero-abilities';

                        for (const abilityId of hero.abilities) {
                            const ability = this.gameState.heroManager.heroAbilities[abilityId];
                            if (!ability) continue;

                            const abilityButton = document.createElement('button');
                            abilityButton.className = 'hero-ability-button';
                            abilityButton.innerHTML = `${ability.icon || '✨'}`;
                            abilityButton.title = `${ability.name}: ${ability.description}`;

                            // Add click event to use ability
                            abilityButton.addEventListener('click', () => {
                                // Use hero ability in combat
                                const result = this.useHeroAbility(combat.target.id, hero.id, abilityId);

                                if (result.success) {
                                    // Show ability effect
                                    const effectElement = document.createElement('div');
                                    effectElement.className = 'ability-effect';
                                    effectElement.textContent = result.message;
                                    battleScene.appendChild(effectElement);

                                    // Remove after animation
                                    setTimeout(() => {
                                        if (effectElement.parentNode) {
                                            effectElement.parentNode.removeChild(effectElement);
                                        }
                                    }, 2000);

                                    // Disable button after use
                                    abilityButton.disabled = true;
                                    abilityButton.classList.add('used');

                                    // Add visual effect based on ability type
                                    if (result.ability && result.ability.type) {
                                        const effectClass = `ability-effect-${result.ability.type}`;
                                        battleScene.classList.add(effectClass);

                                        // Remove effect class after animation
                                        setTimeout(() => {
                                            battleScene.classList.remove(effectClass);
                                        }, 1500);
                                    }

                                    // Play hero ability animation if available
                                    if (this.gameState.heroCombatAnimations) {
                                        this.gameState.heroCombatAnimations.playAbilityAnimation(
                                            hero, result.ability, battleScene
                                        );
                                    }
                                } else if (result.message) {
                                    // Show error message
                                    const errorElement = document.createElement('div');
                                    errorElement.className = 'ability-error';
                                    errorElement.textContent = result.message;
                                    battleScene.appendChild(errorElement);

                                    // Remove after animation
                                    setTimeout(() => {
                                        if (errorElement.parentNode) {
                                            errorElement.parentNode.removeChild(errorElement);
                                        }
                                    }, 2000);
                                }
                            });

                            abilitiesContainer.appendChild(abilityButton);
                        }

                        heroElement.appendChild(abilitiesContainer);
                    }
                }
            }

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

            // Resolve the actual combat with formation and heroes
            const report = this.gameState.resolveCombat(combat.target, combat.units, combat.formation || 'balanced', combat.heroes || []);

            // Log the combat result
            const campName = CONFIG.NPC_CAMPS[combat.target.campType].name;
            if (report.result === 'victory') {
                let logMessage = `Victory against ${campName}! Gained ${report.loot.FOOD} food and ${report.loot.ORE} ore.`;

                // Add hero experience info if heroes participated
                if (combat.heroes && combat.heroes.length > 0) {
                    logMessage += ` Heroes gained ${report.heroExperience} experience.`;
                }

                this.gameState.activityLogManager.addLogEntry('Combat', logMessage);
            } else {
                let logMessage = `Defeat against ${campName}. All units were lost.`;

                // Add hero info if heroes participated
                if (combat.heroes && combat.heroes.length > 0) {
                    logMessage += ` Heroes retreated from battle.`;
                }

                this.gameState.activityLogManager.addLogEntry('Combat', logMessage);
            }

            // Create combat report if report system is available
            if (this.gameState.heroCombatReportSystem) {
                const combatReport = this.gameState.heroCombatReportSystem.createCombatReport(combat, report);

                // Show report button
                this.showReportButton(combatReport);
            }

            // Update heroes after combat
            if (combat.heroes && combat.heroes.length > 0) {
                // Get hero IDs
                const heroIds = combat.heroes.map(hero => hero.id);

                // Use hero combat system if available
                if (this.gameState.heroCombatSystem) {
                    // Award experience
                    this.gameState.heroCombatSystem.awardCombatExperience(
                        heroIds,
                        report.result === 'victory',
                        combat.target.difficulty || 1
                    );

                    // Update hero status
                    this.gameState.heroCombatSystem.updateHeroStatusAfterCombat(
                        heroIds,
                        report.result === 'victory'
                    );

                    // Clear combat effects
                    this.gameState.heroCombatSystem.clearCombatEffects(combat.target.id);
                } else {
                    // Fallback to basic hero updates
                    for (const battleHero of combat.heroes) {
                        const hero = this.gameState.heroManager.getHeroById(battleHero.id);
                        if (!hero) continue;

                        // Award experience
                        this.gameState.heroManager.addHeroExperience(hero.id, report.heroExperience || 0);

                        // Update hero status based on battle outcome
                        if (report.result === 'victory') {
                            // Heroes have a small chance of being injured even in victory
                            const injuryChance = 0.1; // 10% chance

                            if (Math.random() < injuryChance) {
                                hero.status = 'injured';
                                hero.recoveryTime = 300; // 5 minutes to recover

                                this.gameState.activityLogManager.addLogEntry(
                                    'Hero',
                                    `${hero.name} was injured in battle and needs time to recover.`
                                );
                            } else {
                                hero.status = 'active';
                            }
                        } else {
                            // Higher chance of injury in defeat
                            const injuryChance = 0.5; // 50% chance

                            if (Math.random() < injuryChance) {
                                hero.status = 'injured';
                                hero.recoveryTime = 600; // 10 minutes to recover

                                this.gameState.activityLogManager.addLogEntry(
                                    'Hero',
                                    `${hero.name} was injured in the defeat and needs time to recover.`
                                );
                            } else {
                                hero.status = 'resting';
                                hero.restTime = 300; // 5 minutes to rest

                                this.gameState.activityLogManager.addLogEntry(
                                    'Hero',
                                    `${hero.name} is resting after the battle.`
                                );
                            }
                        }
                    }
                }
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
     * Show the combat report button
     * @param {Object} report - The combat report
     */
    showReportButton(report) {
        if (!report) return;

        // Create a button to view the report
        const reportButton = document.createElement('button');
        reportButton.className = 'view-report-button';
        reportButton.textContent = 'View Combat Report';

        // Add click event to show report
        reportButton.addEventListener('click', () => {
            if (this.gameState.heroCombatReportSystem) {
                this.gameState.heroCombatReportSystem.showReportModal();
            }
        });

        // Add to activity log
        const activityLog = document.getElementById('activity-log-container');
        if (activityLog) {
            // Create a container for the button
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'report-button-container';
            buttonContainer.appendChild(reportButton);

            // Add to activity log
            activityLog.appendChild(buttonContainer);

            // Auto-remove after 30 seconds
            setTimeout(() => {
                if (buttonContainer.parentNode) {
                    buttonContainer.parentNode.removeChild(buttonContainer);
                }
            }, 30000);
        }
    }

    /**
     * Calculate attack power for units against a target
     * @param {Object} units - Units to calculate attack power for
     * @param {Object} target - Target to attack
     * @param {Array} heroes - Heroes participating in combat
     * @returns {number} - Total attack power
     */
    calculateAttackPower(units, target, heroes = []) {
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

        // Add hero attack power if heroes are present
        if (heroes && heroes.length > 0 && this.gameState.heroManager) {
            for (const hero of heroes) {
                // Base hero attack
                let heroAttack = hero.stats.attack || 0;

                // Apply level bonus
                const levelMultiplier = 1 + (hero.level * 0.1); // 10% per level
                heroAttack *= levelMultiplier;

                // Apply specialization bonus
                const heroType = this.gameState.heroManager.heroTypes[hero.type];
                if (heroType && heroType.specialization === 'combat') {
                    heroAttack *= 1.2; // 20% bonus for combat heroes
                }

                // Heroes are more powerful than regular units
                totalAttack += heroAttack * CONFIG.COMBAT.HERO_STRENGTH_MULTIPLIER;
            }
        }

        return totalAttack;
    }

    /**
     * Use a hero ability during combat
     * @param {string} targetId - ID of the combat target
     * @param {string} heroId - ID of the hero
     * @param {string} abilityId - ID of the ability to use
     * @returns {Object} - Result of using the ability
     */
    useHeroAbility(targetId, heroId, abilityId) {
        // Find the combat
        const combat = this.activeCombats.get(targetId);
        if (!combat) {
            return { success: false, message: 'Combat not found' };
        }

        // Check if combat is in fighting phase
        if (combat.status !== 'fighting') {
            return { success: false, message: 'Combat is not in fighting phase' };
        }

        // Find the hero in combat
        const hero = combat.heroes.find(h => h.id === heroId);
        if (!hero) {
            return { success: false, message: 'Hero not participating in combat' };
        }

        // Use the hero combat system if available
        if (this.gameState.heroCombatSystem) {
            const result = this.gameState.heroCombatSystem.useAbility(targetId, heroId, abilityId);

            if (result.success) {
                // Record ability use in combat
                combat.heroAbilitiesUsed.push({
                    heroId,
                    heroName: hero.name,
                    abilityId,
                    abilityName: result.ability.name,
                    timestamp: Date.now(),
                    effect: result.effect
                });
            }

            return result;
        }

        // Fallback if hero combat system is not available
        // Check if hero has the ability
        if (!hero.abilities.includes(abilityId)) {
            return { success: false, message: 'Hero does not have this ability' };
        }

        // Check if ability has already been used
        if (combat.heroAbilitiesUsed.some(a => a.heroId === heroId && a.abilityId === abilityId)) {
            return { success: false, message: 'Ability already used in this combat' };
        }

        // Get ability data
        const ability = this.gameState.heroManager.heroAbilities[abilityId];
        if (!ability) {
            return { success: false, message: 'Ability not found' };
        }

        // Record ability use
        combat.heroAbilitiesUsed.push({
            heroId,
            heroName: hero.name,
            abilityId,
            abilityName: ability.name,
            timestamp: Date.now()
        });

        // Apply ability effect (will be used in combat resolution)
        let message = '';

        switch (ability.type) {
            case 'combat':
                message = `${hero.name} used ${ability.name}, dealing damage to enemies!`;
                break;

            case 'support':
                message = `${hero.name} used ${ability.name}, boosting your forces!`;
                break;

            default:
                message = `${hero.name} used ${ability.name}!`;
        }

        // Log ability use
        this.gameState.activityLogManager.addLogEntry('Combat', message);

        return {
            success: true,
            message,
            ability: ability
        };
    }
}

// CombatManager class is now ready to be instantiated in main.js
