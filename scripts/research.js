/**
 * Research Management
 * Handles technology research and effects
 */

class ResearchManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Get technology data for a specific type and ID
     */
    getTechnologyData(category, techId) {
        return CONFIG.TECHNOLOGIES[category][techId];
    }

    /**
     * Check if a technology can be researched
     */
    canResearch(category, techId) {
        const techConfig = CONFIG.TECHNOLOGIES[category][techId];

        // Check if already researched
        if (this.gameState.technologies[category][techId]) {
            return false;
        }

        // Check if we have enough resources
        const cost = techConfig.cost;
        if (this.gameState.resources.FOOD < cost.FOOD ||
            this.gameState.resources.ORE < cost.ORE) {
            return false;
        }

        // Check building requirements
        const requirements = techConfig.requirements;
        for (const [buildingType, requiredLevel] of Object.entries(requirements)) {
            if (buildingType === 'TECHNOLOGIES') {
                // Check technology dependencies
                for (const [reqCategory, reqTechs] of Object.entries(requirements.TECHNOLOGIES)) {
                    for (const [reqTechId, required] of Object.entries(reqTechs)) {
                        if (required && !this.gameState.technologies[reqCategory][reqTechId]) {
                            return false;
                        }
                    }
                }
            } else {
                // Check building level requirements
                const building = this.gameState.buildings[buildingType];
                if (!building || building.level < requiredLevel) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Start researching a technology
     */
    startResearch(category, techId) {
        if (!this.canResearch(category, techId)) {
            return false;
        }

        const techConfig = CONFIG.TECHNOLOGIES[category][techId];

        // Deduct resources
        this.gameState.resources.FOOD -= techConfig.cost.FOOD;
        this.gameState.resources.ORE -= techConfig.cost.ORE;

        // Calculate research time based on Library level
        let researchTime = techConfig.researchTime;
        if (this.gameState.buildings.LIBRARY) {
            const libraryLevel = this.gameState.buildings.LIBRARY.level;
            const researchSpeed = CONFIG.BUILDINGS.LIBRARY.levels[libraryLevel - 1].researchSpeed;
            researchTime /= researchSpeed;
        }

        // Add to research queue
        this.gameState.researchQueue.push({
            category: category,
            techId: techId,
            timeRemaining: researchTime
        });

        // Trigger UI update
        this.gameState.onStateChange();

        return true;
    }

    /**
     * Process research queue (called from gameState.update)
     */
    processResearchQueue(deltaTime) {
        if (this.gameState.researchQueue.length === 0) {
            return;
        }

        // Process the first item in the queue
        const currentResearch = this.gameState.researchQueue[0];
        currentResearch.timeRemaining -= deltaTime;

        if (currentResearch.timeRemaining <= 0) {
            // Research complete
            this.completeResearch(currentResearch);
            this.gameState.researchQueue.shift();

            // Trigger UI update
            this.gameState.onStateChange();
        }
    }

    /**
     * Complete research and apply effects
     */
    completeResearch(research) {
        const { category, techId } = research;
        const techName = CONFIG.TECHNOLOGIES[category][techId].name;

        // Mark as researched
        this.gameState.technologies[category][techId] = true;

        // Log the research completion
        this.gameState.activityLogManager.addLogEntry('Research', `Completed research: ${techName}`);

        // Apply technology effects
        this.applyTechnologyEffects();
    }

    /**
     * Apply all researched technology effects
     */
    applyTechnologyEffects() {
        // Reset all bonuses
        this.gameState.bonuses = {
            unitAttack: 0,
            unitDefense: 0,
            foodProduction: 0,
            oreProduction: 0,
            storageCapacity: 0,
            wallDefense: 0,
            advantageMultiplier: 0,
            defensiveCasualtyReduction: 0
        };

        // Apply effects from all researched technologies
        for (const [category, techs] of Object.entries(this.gameState.technologies)) {
            for (const [techId, researched] of Object.entries(techs)) {
                if (researched) {
                    const techConfig = CONFIG.TECHNOLOGIES[category][techId];
                    const effects = techConfig.effects;

                    // Apply each effect
                    if (effects.unitAttackBonus) {
                        this.gameState.bonuses.unitAttack += effects.unitAttackBonus;
                    }
                    if (effects.unitDefenseBonus) {
                        this.gameState.bonuses.unitDefense += effects.unitDefenseBonus;
                    }
                    if (effects.foodProductionBonus) {
                        this.gameState.bonuses.foodProduction += effects.foodProductionBonus;
                    }
                    if (effects.oreProductionBonus) {
                        this.gameState.bonuses.oreProduction += effects.oreProductionBonus;
                    }
                    if (effects.storageCapacityBonus) {
                        this.gameState.bonuses.storageCapacity += effects.storageCapacityBonus;
                    }
                    if (effects.wallDefenseBonus) {
                        this.gameState.bonuses.wallDefense += effects.wallDefenseBonus;
                    }
                    if (effects.advantageBonus) {
                        this.gameState.bonuses.advantageMultiplier += effects.advantageBonus;
                    }
                    if (effects.defensiveCasualtyReduction) {
                        this.gameState.bonuses.defensiveCasualtyReduction += effects.defensiveCasualtyReduction;
                    }
                }
            }
        }
    }

    /**
     * Get the current research queue
     */
    getResearchQueue() {
        return this.gameState.researchQueue;
    }

    /**
     * Get all available technologies
     */
    getAvailableTechnologies() {
        const available = {};

        for (const category of Object.keys(CONFIG.TECHNOLOGIES)) {
            available[category] = {};

            for (const techId of Object.keys(CONFIG.TECHNOLOGIES[category])) {
                if (this.canResearch(category, techId)) {
                    available[category][techId] = CONFIG.TECHNOLOGIES[category][techId];
                }
            }
        }

        return available;
    }

    /**
     * Get all researched technologies
     */
    getResearchedTechnologies() {
        return this.gameState.technologies;
    }
}

// ResearchManager class is now ready to be instantiated in main.js
