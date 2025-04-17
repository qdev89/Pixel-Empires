/**
 * Save System
 * Handles saving and loading game state
 */
class SaveSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.saveSlots = 3; // Number of save slots
        this.currentSlot = 1; // Default slot
        
        // Load save metadata
        this.loadSaveMetadata();
    }
    
    /**
     * Load save metadata (timestamps, etc.)
     */
    loadSaveMetadata() {
        this.saveMetadata = [];
        
        for (let i = 1; i <= this.saveSlots; i++) {
            const saveKey = `pixelEmpires_save_${i}`;
            const metadataKey = `pixelEmpires_metadata_${i}`;
            
            // Check if save exists
            const saveExists = localStorage.getItem(saveKey) !== null;
            let metadata = null;
            
            if (saveExists) {
                try {
                    metadata = JSON.parse(localStorage.getItem(metadataKey)) || {
                        timestamp: Date.now(),
                        turn: 1,
                        playerName: 'Player'
                    };
                } catch (e) {
                    console.error('Error parsing save metadata:', e);
                    metadata = {
                        timestamp: Date.now(),
                        turn: 1,
                        playerName: 'Player'
                    };
                }
            }
            
            this.saveMetadata.push({
                slot: i,
                exists: saveExists,
                metadata: metadata
            });
        }
    }
    
    /**
     * Save the current game state
     * @param {number} slot - Save slot number
     * @returns {boolean} - Success status
     */
    saveGame(slot = this.currentSlot) {
        try {
            // Create a simplified version of the game state for saving
            const saveData = {
                resources: this.gameState.resources,
                buildings: this.gameState.buildings,
                units: this.gameState.units,
                technologies: this.gameState.technologies,
                turn: this.gameState.turn,
                map: this.gameState.map,
                buildQueue: this.gameState.buildQueue,
                trainingQueue: this.gameState.trainingQueue,
                researchQueue: this.gameState.researchQueue,
                combatReports: this.gameState.combatReports.slice(0, 10) // Only save the 10 most recent reports
            };
            
            // Create metadata
            const metadata = {
                timestamp: Date.now(),
                turn: this.gameState.turn,
                playerName: 'Player', // Could be customizable in the future
                resources: {
                    food: Math.floor(this.gameState.resources.FOOD),
                    ore: Math.floor(this.gameState.resources.ORE)
                },
                units: {
                    spearmen: this.gameState.units.SPEARMAN,
                    archers: this.gameState.units.ARCHER,
                    cavalry: this.gameState.units.CAVALRY
                }
            };
            
            // Save to localStorage
            const saveKey = `pixelEmpires_save_${slot}`;
            const metadataKey = `pixelEmpires_metadata_${slot}`;
            
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            localStorage.setItem(metadataKey, JSON.stringify(metadata));
            
            // Update metadata cache
            this.saveMetadata[slot - 1] = {
                slot: slot,
                exists: true,
                metadata: metadata
            };
            
            this.currentSlot = slot;
            return true;
        } catch (e) {
            console.error('Error saving game:', e);
            return false;
        }
    }
    
    /**
     * Load a saved game
     * @param {number} slot - Save slot number
     * @returns {boolean} - Success status
     */
    loadGame(slot = this.currentSlot) {
        try {
            const saveKey = `pixelEmpires_save_${slot}`;
            const saveData = localStorage.getItem(saveKey);
            
            if (!saveData) {
                console.error('No save data found in slot', slot);
                return false;
            }
            
            const parsedData = JSON.parse(saveData);
            
            // Apply the saved data to the game state
            this.gameState.resources = parsedData.resources;
            this.gameState.buildings = parsedData.buildings;
            this.gameState.units = parsedData.units;
            this.gameState.technologies = parsedData.technologies;
            this.gameState.turn = parsedData.turn;
            this.gameState.map = parsedData.map;
            this.gameState.buildQueue = parsedData.buildQueue || [];
            this.gameState.trainingQueue = parsedData.trainingQueue || [];
            this.gameState.researchQueue = parsedData.researchQueue || [];
            this.gameState.combatReports = parsedData.combatReports || [];
            
            // Recalculate derived values
            this.gameState.calculateStorageCapacity();
            
            // Update the current slot
            this.currentSlot = slot;
            
            // Trigger UI update
            this.gameState.onStateChange();
            
            return true;
        } catch (e) {
            console.error('Error loading game:', e);
            return false;
        }
    }
    
    /**
     * Delete a saved game
     * @param {number} slot - Save slot number
     * @returns {boolean} - Success status
     */
    deleteSave(slot) {
        try {
            const saveKey = `pixelEmpires_save_${slot}`;
            const metadataKey = `pixelEmpires_metadata_${slot}`;
            
            localStorage.removeItem(saveKey);
            localStorage.removeItem(metadataKey);
            
            // Update metadata cache
            this.saveMetadata[slot - 1] = {
                slot: slot,
                exists: false,
                metadata: null
            };
            
            return true;
        } catch (e) {
            console.error('Error deleting save:', e);
            return false;
        }
    }
    
    /**
     * Get save metadata for all slots
     * @returns {Array} - Array of save metadata
     */
    getSaveMetadata() {
        return this.saveMetadata;
    }
    
    /**
     * Format a timestamp for display
     * @param {number} timestamp - Timestamp in milliseconds
     * @returns {string} - Formatted date string
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
}
