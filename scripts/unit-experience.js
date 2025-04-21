/**
 * Unit Experience System for Pixel Empires
 * Handles unit experience, morale, and veteran status
 */
class UnitExperienceSystem {
    /**
     * Initialize the unit experience system
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        
        // Initialize unit experience tracking
        this.unitExperience = {
            SPEARMAN: { experience: 0, level: 0, morale: 100 },
            ARCHER: { experience: 0, level: 0, morale: 100 },
            CAVALRY: { experience: 0, level: 0, morale: 100 },
            DEFENDER: { experience: 0, level: 0, morale: 100 },
            SCOUT: { experience: 0, level: 0, morale: 100 },
            HARVESTER: { experience: 0, level: 0, morale: 100 },
            DIPLOMAT: { experience: 0, level: 0, morale: 100 }
        };
        
        // Experience thresholds for leveling up
        this.experienceThresholds = [
            0,      // Level 0 (Recruit)
            100,    // Level 1 (Regular)
            300,    // Level 2 (Veteran)
            600,    // Level 3 (Elite)
            1000,   // Level 4 (Champion)
            1500    // Level 5 (Legendary)
        ];
        
        // Stat bonuses per level (multipliers)
        this.levelBonuses = [
            { attack: 1.0, defense: 1.0, hp: 1.0, morale: 1.0 },       // Level 0
            { attack: 1.1, defense: 1.1, hp: 1.1, morale: 1.05 },      // Level 1
            { attack: 1.2, defense: 1.2, hp: 1.2, morale: 1.1 },       // Level 2
            { attack: 1.35, defense: 1.35, hp: 1.3, morale: 1.15 },    // Level 3
            { attack: 1.5, defense: 1.5, hp: 1.4, morale: 1.2 },       // Level 4
            { attack: 1.75, defense: 1.75, hp: 1.5, morale: 1.25 }     // Level 5
        ];
        
        // Unit rank names
        this.rankNames = [
            "Recruit",
            "Regular",
            "Veteran",
            "Elite",
            "Champion",
            "Legendary"
        ];
        
        // Morale effects
        this.moraleEffects = {
            veryLow: { threshold: 30, attackMod: 0.7, defenseMod: 0.7, retreatChance: 0.3 },
            low: { threshold: 60, attackMod: 0.85, defenseMod: 0.85, retreatChance: 0.1 },
            normal: { threshold: 90, attackMod: 1.0, defenseMod: 1.0, retreatChance: 0.0 },
            high: { threshold: 120, attackMod: 1.1, defenseMod: 1.1, retreatChance: 0.0 },
            veryHigh: { threshold: 150, attackMod: 1.2, defenseMod: 1.2, retreatChance: 0.0 }
        };
    }
    
    /**
     * Award experience to units after combat
     * @param {Object} units - Units that participated in combat
     * @param {boolean} victory - Whether the combat was a victory
     * @param {number} enemyDifficulty - Difficulty of the enemy
     */
    awardCombatExperience(units, victory, enemyDifficulty) {
        if (!units || Object.keys(units).length === 0) return;
        
        // Base experience based on enemy difficulty
        let baseExperience = 20 + (enemyDifficulty * 5);
        
        // Adjust for victory/defeat
        if (!victory) {
            baseExperience *= 0.5; // Half experience for defeat
        }
        
        // Award experience to each unit type
        for (const [unitType, count] of Object.entries(units)) {
            if (count > 0 && this.unitExperience[unitType]) {
                // Award experience
                const totalExp = baseExperience * count;
                this.unitExperience[unitType].experience += totalExp;
                
                // Check for level up
                this.checkForLevelUp(unitType);
                
                // Log experience gain
                this.gameState.activityLogManager.addLogEntry(
                    'Units',
                    `${unitType} units gained ${totalExp} experience points.`
                );
            }
        }
        
        // Update morale based on combat outcome
        this.updateMoraleAfterCombat(units, victory, enemyDifficulty);
    }
    
    /**
     * Check if a unit type has enough experience to level up
     * @param {string} unitType - The unit type to check
     */
    checkForLevelUp(unitType) {
        if (!this.unitExperience[unitType]) return;
        
        const currentExp = this.unitExperience[unitType].experience;
        const currentLevel = this.unitExperience[unitType].level;
        
        // Check if we have enough experience for the next level
        if (currentLevel < this.experienceThresholds.length - 1 && 
            currentExp >= this.experienceThresholds[currentLevel + 1]) {
            
            // Level up
            this.unitExperience[unitType].level++;
            const newLevel = this.unitExperience[unitType].level;
            
            // Log level up
            this.gameState.activityLogManager.addLogEntry(
                'Units',
                `${unitType} units have reached rank ${this.rankNames[newLevel]}!`
            );
            
            // Trigger UI update
            this.gameState.onStateChange();
        }
    }
    
    /**
     * Update unit morale after combat
     * @param {Object} units - Units that participated in combat
     * @param {boolean} victory - Whether the combat was a victory
     * @param {number} enemyDifficulty - Difficulty of the enemy
     */
    updateMoraleAfterCombat(units, victory, enemyDifficulty) {
        if (!units || Object.keys(units).length === 0) return;
        
        // Calculate morale change
        let moraleChange;
        if (victory) {
            moraleChange = 5 + (enemyDifficulty * 2); // +5 to +15 for victory
        } else {
            moraleChange = -10 - (enemyDifficulty * 2); // -10 to -20 for defeat
        }
        
        // Apply morale change to each unit type
        for (const [unitType, count] of Object.entries(units)) {
            if (count > 0 && this.unitExperience[unitType]) {
                // Apply morale change
                this.unitExperience[unitType].morale = Math.max(0, Math.min(150, 
                    this.unitExperience[unitType].morale + moraleChange));
                
                // Log significant morale changes
                if (Math.abs(moraleChange) >= 10) {
                    const direction = moraleChange > 0 ? "increased" : "decreased";
                    this.gameState.activityLogManager.addLogEntry(
                        'Units',
                        `${unitType} morale ${direction} by ${Math.abs(moraleChange)}.`
                    );
                }
            }
        }
    }
    
    /**
     * Get morale status for a unit type
     * @param {string} unitType - The unit type
     * @returns {string} - Morale status (veryLow, low, normal, high, veryHigh)
     */
    getMoraleStatus(unitType) {
        if (!this.unitExperience[unitType]) return 'normal';
        
        const morale = this.unitExperience[unitType].morale;
        
        if (morale < this.moraleEffects.veryLow.threshold) return 'veryLow';
        if (morale < this.moraleEffects.low.threshold) return 'low';
        if (morale < this.moraleEffects.normal.threshold) return 'normal';
        if (morale < this.moraleEffects.high.threshold) return 'high';
        return 'veryHigh';
    }
    
    /**
     * Get morale modifiers for a unit type
     * @param {string} unitType - The unit type
     * @returns {Object} - Morale modifiers
     */
    getMoraleModifiers(unitType) {
        const status = this.getMoraleStatus(unitType);
        return this.moraleEffects[status];
    }
    
    /**
     * Get level bonuses for a unit type
     * @param {string} unitType - The unit type
     * @returns {Object} - Level bonuses
     */
    getLevelBonuses(unitType) {
        if (!this.unitExperience[unitType]) return this.levelBonuses[0];
        
        const level = this.unitExperience[unitType].level;
        return this.levelBonuses[level];
    }
    
    /**
     * Get combined combat modifiers (level + morale) for a unit type
     * @param {string} unitType - The unit type
     * @returns {Object} - Combined modifiers
     */
    getCombatModifiers(unitType) {
        const levelBonuses = this.getLevelBonuses(unitType);
        const moraleModifiers = this.getMoraleModifiers(unitType);
        
        return {
            attack: levelBonuses.attack * moraleModifiers.attackMod,
            defense: levelBonuses.defense * moraleModifiers.defenseMod,
            hp: levelBonuses.hp,
            retreatChance: moraleModifiers.retreatChance
        };
    }
    
    /**
     * Get unit rank name
     * @param {string} unitType - The unit type
     * @returns {string} - Rank name
     */
    getUnitRank(unitType) {
        if (!this.unitExperience[unitType]) return this.rankNames[0];
        
        const level = this.unitExperience[unitType].level;
        return this.rankNames[level];
    }
    
    /**
     * Get unit experience data
     * @param {string} unitType - The unit type
     * @returns {Object} - Experience data
     */
    getUnitExperienceData(unitType) {
        if (!this.unitExperience[unitType]) return null;
        
        const data = this.unitExperience[unitType];
        const level = data.level;
        const nextLevelThreshold = level < this.experienceThresholds.length - 1 ? 
            this.experienceThresholds[level + 1] : null;
        
        return {
            experience: data.experience,
            level: level,
            rank: this.rankNames[level],
            morale: data.morale,
            moraleStatus: this.getMoraleStatus(unitType),
            nextLevelThreshold: nextLevelThreshold,
            progress: nextLevelThreshold ? 
                (data.experience - this.experienceThresholds[level]) / 
                (nextLevelThreshold - this.experienceThresholds[level]) : 1.0
        };
    }
    
    /**
     * Boost unit morale
     * @param {string} unitType - The unit type to boost
     * @param {number} amount - Amount to boost morale
     */
    boostMorale(unitType, amount) {
        if (!this.unitExperience[unitType]) return;
        
        // Apply morale boost
        this.unitExperience[unitType].morale = Math.max(0, Math.min(150, 
            this.unitExperience[unitType].morale + amount));
        
        // Log morale boost
        this.gameState.activityLogManager.addLogEntry(
            'Units',
            `${unitType} morale boosted by ${amount}.`
        );
        
        // Trigger UI update
        this.gameState.onStateChange();
    }
    
    /**
     * Reset unit experience (for testing)
     */
    resetUnitExperience() {
        for (const unitType of Object.keys(this.unitExperience)) {
            this.unitExperience[unitType] = { experience: 0, level: 0, morale: 100 };
        }
        
        // Trigger UI update
        this.gameState.onStateChange();
    }
    
    /**
     * Update unit experience system (called on each game tick)
     */
    update() {
        // Gradually restore morale over time
        for (const unitType of Object.keys(this.unitExperience)) {
            const data = this.unitExperience[unitType];
            
            // Only restore morale if below normal
            if (data.morale < 100) {
                // Restore 1 morale point every 5 minutes (300 seconds)
                const restoreAmount = 1 / 300; // Per second
                data.morale = Math.min(100, data.morale + restoreAmount);
            }
        }
    }
}

// Export the UnitExperienceSystem class
if (typeof module !== 'undefined') {
    module.exports = { UnitExperienceSystem };
}
