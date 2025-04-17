/**
 * Buildings Management
 * Handles building construction and upgrades
 */

class BuildingManager {
    constructor(gameState) {
        this.gameState = gameState;
    }
    
    /**
     * Get building data for a specific type
     */
    getBuildingData(buildingType) {
        return CONFIG.BUILDINGS[buildingType];
    }
    
    /**
     * Check if a building can be built or upgraded
     */
    canBuildOrUpgrade(buildingType) {
        const buildingConfig = CONFIG.BUILDINGS[buildingType];
        const currentLevel = this.gameState.buildings[buildingType]?.level || 0;
        
        // Check if already at max level
        if (currentLevel >= buildingConfig.maxLevel) {
            return false;
        }
        
        // Get cost for the next level
        const cost = buildingConfig.levels[currentLevel].cost;
        
        // Check if we have enough resources
        return this.gameState.resources.FOOD >= cost.FOOD && 
               this.gameState.resources.ORE >= cost.ORE;
    }
    
    /**
     * Get the cost to build or upgrade a building
     */
    getBuildCost(buildingType) {
        const buildingConfig = CONFIG.BUILDINGS[buildingType];
        const currentLevel = this.gameState.buildings[buildingType]?.level || 0;
        
        // Return cost for the next level
        return buildingConfig.levels[currentLevel].cost;
    }
    
    /**
     * Start building construction or upgrade
     */
    startBuilding(buildingType) {
        // Default position for now
        const x = 1 + Object.keys(this.gameState.buildings).length % 3;
        const y = 1 + Math.floor(Object.keys(this.gameState.buildings).length / 3);
        
        return this.gameState.startBuilding(buildingType, x, y);
    }
    
    /**
     * Get the current build queue
     */
    getBuildQueue() {
        return this.gameState.buildQueue;
    }
    
    /**
     * Get all buildings with their current levels
     */
    getAllBuildings() {
        return this.gameState.buildings;
    }
}

// Create global building manager
const buildingManager = new BuildingManager(gameState);
