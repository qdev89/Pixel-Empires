/**
 * Hero Combat System for Pixel Empires
 * Handles hero abilities, combat effects, and hero-specific combat mechanics
 */
class HeroCombatSystem {
    /**
     * Initialize the hero combat system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        this.activeAbilities = new Map(); // Map of active ability effects by combat ID
        this.abilityCooldowns = new Map(); // Map of ability cooldowns by hero ID
    }

    /**
     * Use a hero ability in combat
     * @param {string} combatId - ID of the combat
     * @param {string} heroId - ID of the hero
     * @param {string} abilityId - ID of the ability
     * @returns {Object} - Result of using the ability
     */
    useAbility(combatId, heroId, abilityId) {
        // Get hero and ability
        const hero = this.heroManager.getHeroById(heroId);
        const ability = this.heroManager.heroAbilities[abilityId];

        if (!hero || !ability) {
            return { success: false, message: 'Hero or ability not found' };
        }

        // Check if hero has the ability
        if (!hero.abilities.includes(abilityId)) {
            return { success: false, message: `${hero.name} doesn't have this ability` };
        }

        // Check cooldown
        const cooldownKey = `${heroId}_${abilityId}`;
        if (this.abilityCooldowns.has(cooldownKey)) {
            const remainingCooldown = this.abilityCooldowns.get(cooldownKey);
            if (remainingCooldown > 0) {
                return {
                    success: false,
                    message: `${ability.name} is on cooldown for ${remainingCooldown.toFixed(1)} seconds`
                };
            }
        }

        // Check if combat exists
        if (!this.activeAbilities.has(combatId)) {
            this.activeAbilities.set(combatId, []);
        }

        // Check if hero has already used maximum abilities
        const heroAbilities = this.activeAbilities.get(combatId).filter(a => a.heroId === heroId);
        if (heroAbilities.length >= CONFIG.COMBAT.HERO_MAX_ABILITIES_PER_COMBAT) {
            return {
                success: false,
                message: `${hero.name} has already used the maximum number of abilities in this combat`
            };
        }

        // Apply ability effect
        const abilityEffect = this.calculateAbilityEffect(hero, ability);

        // Add to active abilities
        this.activeAbilities.get(combatId).push({
            heroId,
            heroName: hero.name,
            abilityId,
            abilityName: ability.name,
            effect: abilityEffect,
            timestamp: Date.now(),
            duration: ability.duration || 0
        });

        // Set cooldown
        this.abilityCooldowns.set(cooldownKey, ability.cooldown || CONFIG.COMBAT.HERO_ABILITY_COOLDOWN);

        // Generate message based on ability type
        let message = '';
        switch (ability.type) {
            case 'combat':
                message = `${hero.name} used ${ability.name}, dealing ${abilityEffect.value.toFixed(1)} damage!`;
                break;
            case 'support':
                const statName = ability.targetStat === 'all' ? 'all stats' : ability.targetStat;
                message = `${hero.name} used ${ability.name}, boosting ${statName} by ${Math.round((abilityEffect.value - 1) * 100)}%!`;
                break;
            default:
                message = `${hero.name} used ${ability.name}!`;
        }

        // Log ability use
        this.gameState.activityLogManager.addLogEntry('Combat', message);

        return {
            success: true,
            message,
            ability,
            effect: abilityEffect
        };
    }

    /**
     * Calculate the effect of a hero ability
     * @param {Object} hero - The hero using the ability
     * @param {Object} ability - The ability being used
     * @returns {Object} - The calculated effect
     */
    calculateAbilityEffect(hero, ability) {
        // Get hero stats including equipment bonuses
        const heroStats = this.heroManager.calculateHeroTotalStats(hero.id);

        // Base effect value
        let effectValue = ability.power || 1.0;

        // Scale with hero level and relevant stats
        const levelScaling = 1 + (hero.level * 0.05); // 5% per level
        effectValue *= levelScaling;

        // Scale with relevant stat
        if (ability.type === 'combat') {
            // Combat abilities scale with attack
            const attackScaling = 1 + (heroStats.attack / 100);
            effectValue *= attackScaling;

            // Check for weapon bonuses that enhance combat abilities
            const weapon = this.getHeroEquippedItem(hero.id, 'weapon');
            if (weapon && weapon.specialEffects && weapon.specialEffects.abilityBoost) {
                if (weapon.specialEffects.abilityTypes.includes('combat')) {
                    effectValue *= (1 + weapon.specialEffects.abilityBoost);
                }
            }
        } else if (ability.type === 'support') {
            // Support abilities scale with leadership
            const leadershipScaling = 1 + (heroStats.leadership / 100);
            effectValue *= leadershipScaling;

            // Check for accessory bonuses that enhance support abilities
            const accessory = this.getHeroEquippedItem(hero.id, 'accessory');
            if (accessory && accessory.specialEffects && accessory.specialEffects.abilityBoost) {
                if (accessory.specialEffects.abilityTypes.includes('support')) {
                    effectValue *= (1 + accessory.specialEffects.abilityBoost);
                }
            }
        } else if (ability.type === 'utility') {
            // Utility abilities scale with intelligence
            const intelligenceScaling = 1 + ((heroStats.intelligence || 0) / 100);
            effectValue *= intelligenceScaling;
        }

        // Apply rarity bonus for legendary equipment
        const equippedItems = this.getHeroEquippedItems(hero.id);
        const hasLegendaryItem = equippedItems.some(item => item.rarity === 'legendary');
        if (hasLegendaryItem) {
            effectValue *= 1.15; // 15% bonus for having any legendary item
        }

        return {
            type: ability.type,
            targetStat: ability.targetStat,
            value: effectValue,
            duration: ability.duration || 0,
            areaOfEffect: ability.areaOfEffect || false
        };
    }

    /**
     * Get active ability effects for a combat
     * @param {string} combatId - ID of the combat
     * @returns {Array} - Active ability effects
     */
    getActiveEffects(combatId) {
        return this.activeAbilities.get(combatId) || [];
    }

    /**
     * Apply ability effects to combat calculations
     * @param {string} combatId - ID of the combat
     * @param {Object} combatStats - Combat statistics to modify
     * @returns {Object} - Modified combat statistics
     */
    applyAbilityEffects(combatId, combatStats) {
        const activeEffects = this.getActiveEffects(combatId);
        if (activeEffects.length === 0) return combatStats;

        // Clone stats to avoid modifying the original
        const modifiedStats = { ...combatStats };

        for (const effect of activeEffects) {
            if (effect.effect.type === 'combat') {
                // Combat abilities directly add to attack power
                modifiedStats.playerAttack += effect.effect.value;
            } else if (effect.effect.type === 'support') {
                // Support abilities multiply stats
                if (effect.effect.targetStat === 'attack' || effect.effect.targetStat === 'all') {
                    modifiedStats.playerAttack *= effect.effect.value;
                }
                if (effect.effect.targetStat === 'defense' || effect.effect.targetStat === 'all') {
                    modifiedStats.enemyDefense /= effect.effect.value; // Reduce enemy defense
                }
            }
        }

        return modifiedStats;
    }

    /**
     * Update ability cooldowns
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update cooldowns
        for (const [key, cooldown] of this.abilityCooldowns.entries()) {
            const newCooldown = cooldown - deltaTime;
            if (newCooldown <= 0) {
                this.abilityCooldowns.delete(key);
            } else {
                this.abilityCooldowns.set(key, newCooldown);
            }
        }

        // Update active ability durations
        for (const [combatId, abilities] of this.activeAbilities.entries()) {
            const remainingAbilities = [];

            for (const ability of abilities) {
                if (ability.duration > 0) {
                    ability.duration -= deltaTime;
                    if (ability.duration > 0) {
                        remainingAbilities.push(ability);
                    }
                } else {
                    // Abilities with no duration last for the entire combat
                    remainingAbilities.push(ability);
                }
            }

            if (remainingAbilities.length === 0) {
                this.activeAbilities.delete(combatId);
            } else {
                this.activeAbilities.set(combatId, remainingAbilities);
            }
        }
    }

    /**
     * Clear ability effects for a combat when it ends
     * @param {string} combatId - ID of the combat to clear
     */
    clearCombatEffects(combatId) {
        this.activeAbilities.delete(combatId);
    }

    /**
     * Get ability cooldown for a hero
     * @param {string} heroId - ID of the hero
     * @param {string} abilityId - ID of the ability
     * @returns {number} - Remaining cooldown in seconds
     */
    getAbilityCooldown(heroId, abilityId) {
        const cooldownKey = `${heroId}_${abilityId}`;
        return this.abilityCooldowns.get(cooldownKey) || 0;
    }

    /**
     * Get a hero's equipped item of a specific type
     * @param {string} heroId - ID of the hero
     * @param {string} itemType - Type of item to get (weapon, armor, accessory, etc.)
     * @returns {Object|null} - The equipped item or null if none found
     */
    getHeroEquippedItem(heroId, itemType) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.equipment) return null;

        return hero.equipment[itemType] || null;
    }

    /**
     * Get all equipped items for a hero
     * @param {string} heroId - ID of the hero
     * @returns {Array} - Array of equipped items
     */
    getHeroEquippedItems(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.equipment) return [];

        return Object.values(hero.equipment).filter(item => item !== null);
    }

    /**
     * Award experience to heroes after combat
     * @param {Array} heroes - Heroes that participated in combat
     * @param {boolean} victory - Whether the combat was a victory
     * @param {number} enemyDifficulty - Difficulty of the enemy
     */
    awardCombatExperience(heroes, victory, enemyDifficulty) {
        if (!heroes || heroes.length === 0) return;

        // Base experience based on enemy difficulty
        let baseExperience = 50 + (enemyDifficulty * 10);

        // Adjust for victory/defeat
        if (!victory) {
            baseExperience *= 0.5; // Half experience for defeat
        }

        // Award experience to each hero
        for (const heroId of heroes) {
            const hero = this.heroManager.getHeroById(heroId);
            if (!hero) continue;

            // Get current level before adding experience
            const currentLevel = hero.level;

            // Award experience
            this.heroManager.addHeroExperience(heroId, baseExperience);

            // Check if hero leveled up
            if (hero.level > currentLevel) {
                // Create level up notification
                this.createLevelUpNotification(hero, currentLevel, hero.level);

                // Log level up
                this.gameState.activityLogManager.addLogEntry(
                    'Hero',
                    `${hero.name} leveled up to level ${hero.level}!`
                );
            } else {
                // Log experience gain
                this.gameState.activityLogManager.addLogEntry(
                    'Hero',
                    `${hero.name} gained ${baseExperience} experience from combat`
                );
            }
        }
    }

    /**
     * Create a level up notification
     * @param {Object} hero - The hero that leveled up
     * @param {number} oldLevel - The hero's previous level
     * @param {number} newLevel - The hero's new level
     */
    createLevelUpNotification(hero, oldLevel, newLevel) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'hero-level-up-notification';

        // Calculate stat increases
        const oldStats = this.calculateHeroBaseStats(hero, oldLevel);
        const newStats = this.calculateHeroBaseStats(hero, newLevel);

        // Create notification content
        notification.innerHTML = `
            <div class="level-up-header">
                <div class="hero-portrait">${hero.portrait}</div>
                <div class="level-up-title">
                    <h3>${hero.name} Leveled Up!</h3>
                    <div class="level-change">Level ${oldLevel} → ${newLevel}</div>
                </div>
            </div>
            <div class="stat-increases">
                <div class="stat-increase">
                    <span class="stat-name">Attack</span>
                    <span class="stat-change">+${newStats.attack - oldStats.attack}</span>
                </div>
                <div class="stat-increase">
                    <span class="stat-name">Defense</span>
                    <span class="stat-change">+${newStats.defense - oldStats.defense}</span>
                </div>
                <div class="stat-increase">
                    <span class="stat-name">Leadership</span>
                    <span class="stat-change">+${newStats.leadership - oldStats.leadership}</span>
                </div>
            </div>
            <button class="close-notification">×</button>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Add animation class after a small delay (for animation to work)
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);

        // Add close button event
        const closeButton = notification.querySelector('.close-notification');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                notification.classList.remove('active');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            });
        }

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (notification.classList.contains('active')) {
                notification.classList.remove('active');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 5000);
    }

    /**
     * Calculate hero base stats for a given level
     * @param {Object} hero - The hero
     * @param {number} level - The level to calculate stats for
     * @returns {Object} - The calculated base stats
     */
    calculateHeroBaseStats(hero, level) {
        if (!hero || !this.heroManager || !this.heroManager.heroTypes) {
            return { attack: 0, defense: 0, leadership: 0 };
        }

        const heroType = this.heroManager.heroTypes[hero.type];
        if (!heroType) {
            return { attack: 0, defense: 0, leadership: 0 };
        }

        // Base stats from hero type
        const baseAttack = heroType.baseStats.attack || 0;
        const baseDefense = heroType.baseStats.defense || 0;
        const baseLeadership = heroType.baseStats.leadership || 0;

        // Stat growth per level
        const attackGrowth = heroType.statGrowth.attack || 0;
        const defenseGrowth = heroType.statGrowth.defense || 0;
        const leadershipGrowth = heroType.statGrowth.leadership || 0;

        // Calculate stats for the given level
        return {
            attack: Math.round(baseAttack + (attackGrowth * (level - 1))),
            defense: Math.round(baseDefense + (defenseGrowth * (level - 1))),
            leadership: Math.round(baseLeadership + (leadershipGrowth * (level - 1)))
        };
    }

    /**
     * Update hero status after combat
     * @param {Array} heroes - Heroes that participated in combat
     * @param {boolean} victory - Whether the combat was a victory
     */
    updateHeroStatusAfterCombat(heroes, victory) {
        if (!heroes || heroes.length === 0) return;

        for (const heroId of heroes) {
            const hero = this.heroManager.getHeroById(heroId);
            if (!hero) continue;

            if (victory) {
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

// HeroCombatSystem class is now ready to be instantiated in main.js
