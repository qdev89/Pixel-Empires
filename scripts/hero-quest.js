/**
 * Hero Quest System for Pixel Empires
 * Handles hero-specific quests, missions, and rewards
 */
class HeroQuestSystem {
    /**
     * Initialize the hero quest system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        
        // Active quests by hero ID
        this.activeQuests = new Map();
        
        // Completed quests by hero ID
        this.completedQuests = new Map();
        
        // Quest templates
        this.questTemplates = {
            // Combat quests
            DEFEAT_ENEMIES: {
                id: "DEFEAT_ENEMIES",
                name: "Defeat Enemies",
                description: "Defeat a number of enemies in combat",
                icon: "⚔️",
                type: "combat",
                difficulty: {
                    easy: { target: 3, reward: { experience: 50, gold: 100 } },
                    medium: { target: 5, reward: { experience: 100, gold: 200 } },
                    hard: { target: 10, reward: { experience: 200, gold: 400 } }
                },
                heroTypes: ["WARRIOR", "ARCHER", "MAGE"],
                generateObjective: (hero, difficulty) => {
                    return {
                        type: "defeat_enemies",
                        target: this.questTemplates.DEFEAT_ENEMIES.difficulty[difficulty].target,
                        current: 0
                    };
                },
                generateReward: (hero, difficulty) => {
                    return this.questTemplates.DEFEAT_ENEMIES.difficulty[difficulty].reward;
                },
                checkCompletion: (quest) => {
                    return quest.objective.current >= quest.objective.target;
                },
                updateProgress: (quest, data) => {
                    if (data.type === "combat" && data.result === "victory") {
                        quest.objective.current += 1;
                    }
                    return quest;
                }
            },
            
            DEFEAT_BOSS: {
                id: "DEFEAT_BOSS",
                name: "Defeat Boss",
                description: "Defeat a powerful boss enemy",
                icon: "👑",
                type: "combat",
                difficulty: {
                    medium: { target: 1, reward: { experience: 150, gold: 300, item: "random_equipment" } },
                    hard: { target: 1, reward: { experience: 300, gold: 600, item: "rare_equipment" } }
                },
                heroTypes: ["WARRIOR", "ARCHER", "MAGE"],
                generateObjective: (hero, difficulty) => {
                    return {
                        type: "defeat_boss",
                        target: 1,
                        current: 0,
                        bossType: difficulty === "hard" ? "legendary" : "elite"
                    };
                },
                generateReward: (hero, difficulty) => {
                    return this.questTemplates.DEFEAT_BOSS.difficulty[difficulty].reward;
                },
                checkCompletion: (quest) => {
                    return quest.objective.current >= quest.objective.target;
                },
                updateProgress: (quest, data) => {
                    if (data.type === "combat" && data.result === "victory" && data.enemyType === quest.objective.bossType) {
                        quest.objective.current += 1;
                    }
                    return quest;
                }
            },
            
            // Exploration quests
            EXPLORE_REGIONS: {
                id: "EXPLORE_REGIONS",
                name: "Explore Regions",
                description: "Explore new regions on the map",
                icon: "🗺️",
                type: "exploration",
                difficulty: {
                    easy: { target: 3, reward: { experience: 50, gold: 100 } },
                    medium: { target: 5, reward: { experience: 100, gold: 200 } },
                    hard: { target: 10, reward: { experience: 200, gold: 400 } }
                },
                heroTypes: ["SCOUT", "RANGER", "EXPLORER"],
                generateObjective: (hero, difficulty) => {
                    return {
                        type: "explore_regions",
                        target: this.questTemplates.EXPLORE_REGIONS.difficulty[difficulty].target,
                        current: 0,
                        exploredRegions: []
                    };
                },
                generateReward: (hero, difficulty) => {
                    return this.questTemplates.EXPLORE_REGIONS.difficulty[difficulty].reward;
                },
                checkCompletion: (quest) => {
                    return quest.objective.current >= quest.objective.target;
                },
                updateProgress: (quest, data) => {
                    if (data.type === "exploration" && data.regionId && !quest.objective.exploredRegions.includes(data.regionId)) {
                        quest.objective.exploredRegions.push(data.regionId);
                        quest.objective.current += 1;
                    }
                    return quest;
                }
            },
            
            DISCOVER_LOCATIONS: {
                id: "DISCOVER_LOCATIONS",
                name: "Discover Special Locations",
                description: "Discover special locations on the map",
                icon: "🏛️",
                type: "exploration",
                difficulty: {
                    easy: { target: 1, reward: { experience: 75, gold: 150 } },
                    medium: { target: 3, reward: { experience: 150, gold: 300 } },
                    hard: { target: 5, reward: { experience: 300, gold: 600 } }
                },
                heroTypes: ["SCOUT", "RANGER", "EXPLORER", "MAGE"],
                generateObjective: (hero, difficulty) => {
                    return {
                        type: "discover_locations",
                        target: this.questTemplates.DISCOVER_LOCATIONS.difficulty[difficulty].target,
                        current: 0,
                        discoveredLocations: []
                    };
                },
                generateReward: (hero, difficulty) => {
                    return this.questTemplates.DISCOVER_LOCATIONS.difficulty[difficulty].reward;
                },
                checkCompletion: (quest) => {
                    return quest.objective.current >= quest.objective.target;
                },
                updateProgress: (quest, data) => {
                    if (data.type === "discovery" && data.locationId && !quest.objective.discoveredLocations.includes(data.locationId)) {
                        quest.objective.discoveredLocations.push(data.locationId);
                        quest.objective.current += 1;
                    }
                    return quest;
                }
            },
            
            // Collection quests
            COLLECT_RESOURCES: {
                id: "COLLECT_RESOURCES",
                name: "Collect Resources",
                description: "Collect a specific type of resource",
                icon: "📦",
                type: "collection",
                difficulty: {
                    easy: { target: 100, reward: { experience: 50, gold: 100 } },
                    medium: { target: 250, reward: { experience: 100, gold: 200 } },
                    hard: { target: 500, reward: { experience: 200, gold: 400 } }
                },
                heroTypes: ["HARVESTER", "MERCHANT", "SCOUT"],
                generateObjective: (hero, difficulty) => {
                    // Randomly select a resource type
                    const resourceTypes = ["FOOD", "ORE", "WOOD", "CRYSTAL"];
                    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
                    
                    return {
                        type: "collect_resources",
                        resourceType: resourceType,
                        target: this.questTemplates.COLLECT_RESOURCES.difficulty[difficulty].target,
                        current: 0
                    };
                },
                generateReward: (hero, difficulty) => {
                    return this.questTemplates.COLLECT_RESOURCES.difficulty[difficulty].reward;
                },
                checkCompletion: (quest) => {
                    return quest.objective.current >= quest.objective.target;
                },
                updateProgress: (quest, data) => {
                    if (data.type === "resource_collection" && data.resourceType === quest.objective.resourceType) {
                        quest.objective.current += data.amount;
                    }
                    return quest;
                }
            },
            
            // Diplomatic quests
            IMPROVE_RELATIONS: {
                id: "IMPROVE_RELATIONS",
                name: "Improve Relations",
                description: "Improve relations with another faction",
                icon: "🤝",
                type: "diplomatic",
                difficulty: {
                    medium: { target: 10, reward: { experience: 150, gold: 300 } },
                    hard: { target: 20, reward: { experience: 300, gold: 600 } }
                },
                heroTypes: ["DIPLOMAT", "MERCHANT", "NOBLE"],
                generateObjective: (hero, difficulty) => {
                    return {
                        type: "improve_relations",
                        target: this.questTemplates.IMPROVE_RELATIONS.difficulty[difficulty].target,
                        current: 0,
                        factionId: null // Will be set when the quest is assigned
                    };
                },
                generateReward: (hero, difficulty) => {
                    return this.questTemplates.IMPROVE_RELATIONS.difficulty[difficulty].reward;
                },
                checkCompletion: (quest) => {
                    return quest.objective.current >= quest.objective.target;
                },
                updateProgress: (quest, data) => {
                    if (data.type === "diplomatic" && data.action === "improve_relations" && data.factionId === quest.objective.factionId) {
                        quest.objective.current += data.amount;
                    }
                    return quest;
                }
            },
            
            // Special quests for specific hero types
            WARRIOR_TRAINING: {
                id: "WARRIOR_TRAINING",
                name: "Warrior Training",
                description: "Complete combat training exercises",
                icon: "🏋️",
                type: "special",
                difficulty: {
                    easy: { target: 3, reward: { experience: 100, skillPoints: 1 } },
                    medium: { target: 5, reward: { experience: 200, skillPoints: 2 } },
                    hard: { target: 10, reward: { experience: 400, skillPoints: 3 } }
                },
                heroTypes: ["WARRIOR"],
                generateObjective: (hero, difficulty) => {
                    return {
                        type: "training",
                        target: this.questTemplates.WARRIOR_TRAINING.difficulty[difficulty].target,
                        current: 0
                    };
                },
                generateReward: (hero, difficulty) => {
                    return this.questTemplates.WARRIOR_TRAINING.difficulty[difficulty].reward;
                },
                checkCompletion: (quest) => {
                    return quest.objective.current >= quest.objective.target;
                },
                updateProgress: (quest, data) => {
                    if (data.type === "training" && data.heroType === "WARRIOR") {
                        quest.objective.current += 1;
                    }
                    return quest;
                }
            },
            
            MAGE_RESEARCH: {
                id: "MAGE_RESEARCH",
                name: "Arcane Research",
                description: "Research new magical knowledge",
                icon: "📚",
                type: "special",
                difficulty: {
                    easy: { target: 2, reward: { experience: 100, skillPoints: 1 } },
                    medium: { target: 4, reward: { experience: 200, skillPoints: 2 } },
                    hard: { target: 8, reward: { experience: 400, skillPoints: 3 } }
                },
                heroTypes: ["MAGE"],
                generateObjective: (hero, difficulty) => {
                    return {
                        type: "research",
                        target: this.questTemplates.MAGE_RESEARCH.difficulty[difficulty].target,
                        current: 0
                    };
                },
                generateReward: (hero, difficulty) => {
                    return this.questTemplates.MAGE_RESEARCH.difficulty[difficulty].reward;
                },
                checkCompletion: (quest) => {
                    return quest.objective.current >= quest.objective.target;
                },
                updateProgress: (quest, data) => {
                    if (data.type === "research" && data.heroType === "MAGE") {
                        quest.objective.current += 1;
                    }
                    return quest;
                }
            }
        };
    }
    
    /**
     * Generate a quest for a hero
     * @param {string} heroId - The hero ID
     * @param {string} questType - Optional specific quest type
     * @param {string} difficulty - Optional difficulty level (easy, medium, hard)
     * @returns {Object} - The generated quest
     */
    generateQuest(heroId, questType = null, difficulty = null) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) {
            return null;
        }
        
        // Get suitable quest templates for this hero type
        const suitableTemplates = Object.values(this.questTemplates).filter(template => {
            return template.heroTypes.includes(hero.type);
        });
        
        if (suitableTemplates.length === 0) {
            return null;
        }
        
        // Filter by quest type if specified
        let availableTemplates = suitableTemplates;
        if (questType) {
            availableTemplates = suitableTemplates.filter(template => template.type === questType);
            
            if (availableTemplates.length === 0) {
                return null;
            }
        }
        
        // Select a random template
        const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        
        // Determine difficulty if not specified
        if (!difficulty) {
            const difficulties = Object.keys(template.difficulty);
            
            // Select difficulty based on hero level
            if (hero.level < 3) {
                difficulty = "easy";
            } else if (hero.level < 7) {
                difficulty = difficulties.includes("medium") ? "medium" : "easy";
            } else {
                difficulty = difficulties.includes("hard") ? "hard" : (difficulties.includes("medium") ? "medium" : "easy");
            }
            
            // Ensure the selected difficulty exists for this template
            if (!template.difficulty[difficulty]) {
                difficulty = difficulties[0];
            }
        }
        
        // Generate objective
        const objective = template.generateObjective(hero, difficulty);
        
        // Generate reward
        const reward = template.generateReward(hero, difficulty);
        
        // Create quest object
        const quest = {
            id: `${template.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            templateId: template.id,
            name: template.name,
            description: template.description,
            icon: template.icon,
            type: template.type,
            difficulty: difficulty,
            heroId: heroId,
            objective: objective,
            reward: reward,
            status: "active",
            startTime: Date.now(),
            expiryTime: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
            completionTime: null
        };
        
        return quest;
    }
    
    /**
     * Assign a quest to a hero
     * @param {string} heroId - The hero ID
     * @param {string} questType - Optional specific quest type
     * @param {string} difficulty - Optional difficulty level (easy, medium, hard)
     * @returns {Object} - Result with success flag and message
     */
    assignQuest(heroId, questType = null, difficulty = null) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) {
            return { success: false, message: "Hero not found" };
        }
        
        // Check if hero already has maximum quests
        const heroQuests = this.getHeroQuests(heroId);
        const maxQuests = 3; // Maximum 3 active quests per hero
        
        if (heroQuests.length >= maxQuests) {
            return { 
                success: false, 
                message: `${hero.name} already has the maximum number of quests (${maxQuests})` 
            };
        }
        
        // Generate a new quest
        const quest = this.generateQuest(heroId, questType, difficulty);
        
        if (!quest) {
            return { 
                success: false, 
                message: "Could not generate a suitable quest for this hero" 
            };
        }
        
        // Add quest to active quests
        if (!this.activeQuests.has(heroId)) {
            this.activeQuests.set(heroId, []);
        }
        
        this.activeQuests.get(heroId).push(quest);
        
        // Log quest assignment
        if (this.gameState.activityLogManager) {
            this.gameState.activityLogManager.addLogEntry(
                'Quest', 
                `${hero.name} has been assigned the quest "${quest.name}"`
            );
        }
        
        // Trigger state change
        if (this.gameState.onStateChange) {
            this.gameState.onStateChange();
        }
        
        return { 
            success: true, 
            message: `Successfully assigned quest "${quest.name}" to ${hero.name}`,
            quest: quest
        };
    }
    
    /**
     * Get all quests for a hero
     * @param {string} heroId - The hero ID
     * @returns {Array} - The hero's quests
     */
    getHeroQuests(heroId) {
        return this.activeQuests.get(heroId) || [];
    }
    
    /**
     * Get all completed quests for a hero
     * @param {string} heroId - The hero ID
     * @returns {Array} - The hero's completed quests
     */
    getHeroCompletedQuests(heroId) {
        return this.completedQuests.get(heroId) || [];
    }
    
    /**
     * Get a specific quest by ID
     * @param {string} questId - The quest ID
     * @returns {Object|null} - The quest or null if not found
     */
    getQuestById(questId) {
        // Check active quests
        for (const [heroId, quests] of this.activeQuests.entries()) {
            const quest = quests.find(q => q.id === questId);
            if (quest) {
                return quest;
            }
        }
        
        // Check completed quests
        for (const [heroId, quests] of this.completedQuests.entries()) {
            const quest = quests.find(q => q.id === questId);
            if (quest) {
                return quest;
            }
        }
        
        return null;
    }
    
    /**
     * Update quest progress
     * @param {string} heroId - The hero ID
     * @param {Object} data - Progress data
     */
    updateQuestProgress(heroId, data) {
        const heroQuests = this.getHeroQuests(heroId);
        
        if (heroQuests.length === 0) {
            return;
        }
        
        let stateChanged = false;
        
        // Update each quest
        for (const quest of heroQuests) {
            const template = this.questTemplates[quest.templateId];
            
            if (template) {
                // Update progress
                const updatedQuest = template.updateProgress(quest, data);
                
                // Check if quest is completed
                if (template.checkCompletion(updatedQuest) && quest.status === "active") {
                    quest.status = "completed";
                    quest.completionTime = Date.now();
                    
                    // Apply rewards
                    this.applyQuestRewards(heroId, quest);
                    
                    // Log quest completion
                    if (this.gameState.activityLogManager) {
                        this.gameState.activityLogManager.addLogEntry(
                            'Quest', 
                            `${this.heroManager.getHeroById(heroId).name} has completed the quest "${quest.name}"`
                        );
                    }
                    
                    stateChanged = true;
                }
            }
        }
        
        // Move completed quests to completed list
        const completedQuests = heroQuests.filter(q => q.status === "completed");
        const activeQuests = heroQuests.filter(q => q.status === "active");
        
        if (completedQuests.length > 0) {
            if (!this.completedQuests.has(heroId)) {
                this.completedQuests.set(heroId, []);
            }
            
            this.completedQuests.get(heroId).push(...completedQuests);
            this.activeQuests.set(heroId, activeQuests);
            
            stateChanged = true;
        }
        
        // Trigger state change if needed
        if (stateChanged && this.gameState.onStateChange) {
            this.gameState.onStateChange();
        }
    }
    
    /**
     * Apply quest rewards to a hero
     * @param {string} heroId - The hero ID
     * @param {Object} quest - The completed quest
     */
    applyQuestRewards(heroId, quest) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) {
            return;
        }
        
        const reward = quest.reward;
        
        // Apply experience
        if (reward.experience) {
            this.heroManager.addExperience(heroId, reward.experience);
        }
        
        // Apply gold
        if (reward.gold && this.gameState.resources) {
            this.gameState.resources.GOLD = (this.gameState.resources.GOLD || 0) + reward.gold;
        }
        
        // Apply skill points
        if (reward.skillPoints && this.gameState.heroSkillTreeSystem) {
            this.gameState.heroSkillTreeSystem.addSkillPoints(heroId, reward.skillPoints);
        }
        
        // Apply item rewards
        if (reward.item) {
            this.applyItemReward(heroId, reward.item);
        }
        
        // Apply other resource rewards
        for (const [resource, amount] of Object.entries(reward)) {
            if (["experience", "gold", "skillPoints", "item"].includes(resource)) {
                continue;
            }
            
            if (this.gameState.resources) {
                this.gameState.resources[resource] = (this.gameState.resources[resource] || 0) + amount;
            }
        }
    }
    
    /**
     * Apply an item reward to a hero
     * @param {string} heroId - The hero ID
     * @param {string} itemType - The type of item to reward
     */
    applyItemReward(heroId, itemType) {
        // This would integrate with the equipment system
        // For now, just log that an item was rewarded
        if (this.gameState.activityLogManager) {
            this.gameState.activityLogManager.addLogEntry(
                'Quest', 
                `${this.heroManager.getHeroById(heroId).name} received a ${itemType} as a quest reward`
            );
        }
        
        // If hero equipment system exists, generate and add the item
        if (this.gameState.heroEquipmentSystem) {
            let rarity = "common";
            
            if (itemType === "rare_equipment") {
                rarity = "rare";
            } else if (itemType === "epic_equipment") {
                rarity = "epic";
            } else if (itemType === "legendary_equipment") {
                rarity = "legendary";
            }
            
            // Generate a random equipment item
            const item = this.gameState.heroEquipmentSystem.generateRandomEquipment(rarity);
            
            // Add to hero's inventory
            this.gameState.heroEquipmentSystem.addItemToHeroInventory(heroId, item);
        }
    }
    
    /**
     * Abandon a quest
     * @param {string} questId - The quest ID
     * @returns {Object} - Result with success flag and message
     */
    abandonQuest(questId) {
        // Find the quest
        let foundHeroId = null;
        let foundQuest = null;
        
        for (const [heroId, quests] of this.activeQuests.entries()) {
            const questIndex = quests.findIndex(q => q.id === questId);
            
            if (questIndex !== -1) {
                foundHeroId = heroId;
                foundQuest = quests[questIndex];
                
                // Remove the quest
                quests.splice(questIndex, 1);
                break;
            }
        }
        
        if (!foundQuest) {
            return { success: false, message: "Quest not found" };
        }
        
        const hero = this.heroManager.getHeroById(foundHeroId);
        
        // Log quest abandonment
        if (this.gameState.activityLogManager) {
            this.gameState.activityLogManager.addLogEntry(
                'Quest', 
                `${hero.name} has abandoned the quest "${foundQuest.name}"`
            );
        }
        
        // Trigger state change
        if (this.gameState.onStateChange) {
            this.gameState.onStateChange();
        }
        
        return { 
            success: true, 
            message: `Successfully abandoned quest "${foundQuest.name}"`
        };
    }
    
    /**
     * Check for expired quests
     */
    checkExpiredQuests() {
        const now = Date.now();
        let stateChanged = false;
        
        // Check each hero's quests
        for (const [heroId, quests] of this.activeQuests.entries()) {
            const expiredQuests = quests.filter(q => q.expiryTime < now && q.status === "active");
            
            if (expiredQuests.length > 0) {
                // Mark quests as expired
                for (const quest of expiredQuests) {
                    quest.status = "expired";
                    
                    // Log quest expiration
                    if (this.gameState.activityLogManager) {
                        this.gameState.activityLogManager.addLogEntry(
                            'Quest', 
                            `${this.heroManager.getHeroById(heroId).name}'s quest "${quest.name}" has expired`
                        );
                    }
                }
                
                // Remove expired quests
                this.activeQuests.set(
                    heroId, 
                    quests.filter(q => q.status === "active")
                );
                
                stateChanged = true;
            }
        }
        
        // Trigger state change if needed
        if (stateChanged && this.gameState.onStateChange) {
            this.gameState.onStateChange();
        }
    }
    
    /**
     * Update the quest system (called on each game tick)
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Check for expired quests
        this.checkExpiredQuests();
    }
    
    /**
     * Save quest data to game state
     * @returns {Object} - Quest data for saving
     */
    getSaveData() {
        return {
            activeQuests: Array.from(this.activeQuests.entries()),
            completedQuests: Array.from(this.completedQuests.entries())
        };
    }
    
    /**
     * Load quest data from game state
     * @param {Object} data - Saved quest data
     */
    loadSaveData(data) {
        if (data) {
            if (data.activeQuests) {
                this.activeQuests = new Map(data.activeQuests);
            }
            
            if (data.completedQuests) {
                this.completedQuests = new Map(data.completedQuests);
            }
        }
    }
}

// Export the HeroQuestSystem class
if (typeof module !== 'undefined') {
    module.exports = { HeroQuestSystem };
}
