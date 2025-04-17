/**
 * Units Management
 * Handles unit training and combat
 */

class UnitManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Get unit data for a specific type
     */
    getUnitData(unitType) {
        return CONFIG.UNITS[unitType];
    }

    /**
     * Check if units can be trained
     */
    canTrainUnits(unitType, quantity) {
        const unitConfig = CONFIG.UNITS[unitType];
        const totalCost = {
            FOOD: unitConfig.cost.FOOD * quantity,
            ORE: unitConfig.cost.ORE * quantity
        };

        // Check if we have barracks
        if (!this.gameState.buildings.BARRACKS || this.gameState.buildings.BARRACKS.level < 1) {
            return false;
        }

        // Check if we have enough resources
        return this.gameState.resources.FOOD >= totalCost.FOOD &&
               this.gameState.resources.ORE >= totalCost.ORE;
    }

    /**
     * Get the cost to train units
     */
    getTrainingCost(unitType, quantity) {
        const unitConfig = CONFIG.UNITS[unitType];
        return {
            FOOD: unitConfig.cost.FOOD * quantity,
            ORE: unitConfig.cost.ORE * quantity
        };
    }

    /**
     * Start training units
     */
    trainUnits(unitType, quantity) {
        return this.gameState.trainUnits(unitType, quantity);
    }

    /**
     * Get the current training queue
     */
    getTrainingQueue() {
        return this.gameState.trainingQueue;
    }

    /**
     * Get all units with their current counts
     */
    getAllUnits() {
        return this.gameState.units;
    }

    /**
     * Calculate total food upkeep for all units
     */
    calculateTotalUpkeep() {
        let totalFoodUpkeep = 0;

        for (const [unitType, count] of Object.entries(this.gameState.units)) {
            totalFoodUpkeep += CONFIG.UNITS[unitType].upkeep.FOOD * count;
        }

        return { FOOD: totalFoodUpkeep };
    }
}

// UnitManager class is now ready to be instantiated in main.js
