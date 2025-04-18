/**
 * Quest System for Pixel Empires
 * Handles quests, missions, and story progression
 */
class QuestSystem {
    /**
     * Initialize the quest system
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.quests = []; // Active quests
        this.completedQuests = []; // Completed quests
        this.questLines = []; // Quest lines (series of related quests)
        this.storyProgress = 0; // Story progression (0-100)
        this.lastQuestCheckTime = Date.now();
        this.questCheckInterval = 60 * 1000; // Check for new quests every minute
        
        // Initialize quest lines
        this.initializeQuestLines();
    }
    
    /**
     * Initialize quest lines
     */
    initializeQuestLines() {
        this.questLines = [
            {
                id: 'empire_foundation',
                name: 'Empire Foundation',
                description: 'Establish the foundations of your empire',
                quests: [
                    {
                        id: 'build_basic_infrastructure',
                        name: 'Basic Infrastructure',
                        description: 'Build the basic infrastructure for your empire',
                        objectives: [
                            { type: 'building', building: 'FARM', level: 1, count: 1, current: 0 },
                            { type: 'building', building: 'MINE', level: 1, count: 1, current: 0 },
                            { type: 'building', building: 'BARRACKS', level: 1, count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 100 },
                            { type: 'resource', resource: 'ORE', amount: 100 },
                            { type: 'xp', amount: 50 }
                        ],
                        timeLimit: 0, // No time limit
                        difficulty: 'tutorial',
                        prerequisiteQuests: []
                    },
                    {
                        id: 'train_first_army',
                        name: 'First Army',
                        description: 'Train your first army to defend your empire',
                        objectives: [
                            { type: 'unit', unit: 'SPEARMAN', count: 5, current: 0 },
                            { type: 'unit', unit: 'ARCHER', count: 3, current: 0 }
                        ],
                        rewards: [
                            { type: 'unit', unit: 'CAVALRY', count: 2 },
                            { type: 'resource', resource: 'FOOD', amount: 50 },
                            { type: 'xp', amount: 75 }
                        ],
                        timeLimit: 0,
                        difficulty: 'easy',
                        prerequisiteQuests: ['build_basic_infrastructure']
                    },
                    {
                        id: 'research_technology',
                        name: 'Technological Advancement',
                        description: 'Research your first technology',
                        objectives: [
                            { type: 'building', building: 'LIBRARY', level: 1, count: 1, current: 0 },
                            { type: 'research', category: 'any', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 150 },
                            { type: 'resource', resource: 'ORE', amount: 150 },
                            { type: 'xp', amount: 100 }
                        ],
                        timeLimit: 0,
                        difficulty: 'easy',
                        prerequisiteQuests: ['train_first_army']
                    }
                ],
                progress: 0,
                isComplete: false
            },
            {
                id: 'territorial_expansion',
                name: 'Territorial Expansion',
                description: 'Expand your empire\'s territory',
                quests: [
                    {
                        id: 'claim_first_territory',
                        name: 'First Territory',
                        description: 'Claim your first territory',
                        objectives: [
                            { type: 'territory', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 100 },
                            { type: 'resource', resource: 'ORE', amount: 100 },
                            { type: 'xp', amount: 75 }
                        ],
                        timeLimit: 0,
                        difficulty: 'easy',
                        prerequisiteQuests: ['build_basic_infrastructure']
                    },
                    {
                        id: 'build_outpost',
                        name: 'Frontier Outpost',
                        description: 'Build an outpost in your claimed territory',
                        objectives: [
                            { type: 'outpost', outpostType: 'any', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 150 },
                            { type: 'resource', resource: 'ORE', amount: 150 },
                            { type: 'xp', amount: 100 }
                        ],
                        timeLimit: 0,
                        difficulty: 'medium',
                        prerequisiteQuests: ['claim_first_territory']
                    },
                    {
                        id: 'secure_resource_node',
                        name: 'Resource Security',
                        description: 'Secure a resource node within your territory',
                        objectives: [
                            { type: 'resource_node', nodeType: 'any', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 200 },
                            { type: 'resource', resource: 'ORE', amount: 200 },
                            { type: 'xp', amount: 150 }
                        ],
                        timeLimit: 0,
                        difficulty: 'medium',
                        prerequisiteQuests: ['build_outpost']
                    }
                ],
                progress: 0,
                isComplete: false
            },
            {
                id: 'military_campaign',
                name: 'Military Campaign',
                description: 'Defeat enemies and secure your borders',
                quests: [
                    {
                        id: 'defeat_goblin_camp',
                        name: 'Goblin Threat',
                        description: 'Defeat a nearby goblin camp threatening your empire',
                        objectives: [
                            { type: 'combat', enemyType: 'GOBLIN_CAMP', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 150 },
                            { type: 'resource', resource: 'ORE', amount: 150 },
                            { type: 'xp', amount: 100 }
                        ],
                        timeLimit: 0,
                        difficulty: 'medium',
                        prerequisiteQuests: ['train_first_army']
                    },
                    {
                        id: 'defeat_bandit_hideout',
                        name: 'Bandit Menace',
                        description: 'Clear out a bandit hideout that has been raiding your territories',
                        objectives: [
                            { type: 'combat', enemyType: 'BANDIT_HIDEOUT', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 200 },
                            { type: 'resource', resource: 'ORE', amount: 200 },
                            { type: 'unit', unit: 'SPEARMAN', count: 3 },
                            { type: 'xp', amount: 150 }
                        ],
                        timeLimit: 0,
                        difficulty: 'medium',
                        prerequisiteQuests: ['defeat_goblin_camp']
                    },
                    {
                        id: 'defeat_troll_cave',
                        name: 'Troll Infestation',
                        description: 'Eliminate the trolls that have established a cave near your empire',
                        objectives: [
                            { type: 'combat', enemyType: 'TROLL_CAVE', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 300 },
                            { type: 'resource', resource: 'ORE', amount: 300 },
                            { type: 'unit', unit: 'ARCHER', count: 3 },
                            { type: 'xp', amount: 200 }
                        ],
                        timeLimit: 0,
                        difficulty: 'hard',
                        prerequisiteQuests: ['defeat_bandit_hideout']
                    }
                ],
                progress: 0,
                isComplete: false
            },
            {
                id: 'diplomatic_relations',
                name: 'Diplomatic Relations',
                description: 'Establish diplomatic relations with other factions',
                quests: [
                    {
                        id: 'research_diplomacy',
                        name: 'Art of Diplomacy',
                        description: 'Research the Diplomacy technology',
                        objectives: [
                            { type: 'research', category: 'DIPLOMATIC', technology: 'DIPLOMACY', current: false }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 200 },
                            { type: 'resource', resource: 'ORE', amount: 200 },
                            { type: 'xp', amount: 150 }
                        ],
                        timeLimit: 0,
                        difficulty: 'medium',
                        prerequisiteQuests: ['research_technology']
                    },
                    {
                        id: 'establish_first_relation',
                        name: 'First Contact',
                        description: 'Establish your first diplomatic relation with another faction',
                        objectives: [
                            { type: 'diplomatic_relation', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 250 },
                            { type: 'resource', resource: 'ORE', amount: 250 },
                            { type: 'unit', unit: 'DIPLOMAT', count: 1 },
                            { type: 'xp', amount: 200 }
                        ],
                        timeLimit: 0,
                        difficulty: 'medium',
                        prerequisiteQuests: ['research_diplomacy']
                    },
                    {
                        id: 'form_alliance',
                        name: 'Strategic Alliance',
                        description: 'Form an alliance with another faction',
                        objectives: [
                            { type: 'alliance', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 400 },
                            { type: 'resource', resource: 'ORE', amount: 400 },
                            { type: 'unit', unit: 'DIPLOMAT', count: 2 },
                            { type: 'xp', amount: 300 }
                        ],
                        timeLimit: 0,
                        difficulty: 'hard',
                        prerequisiteQuests: ['establish_first_relation']
                    }
                ],
                progress: 0,
                isComplete: false
            },
            {
                id: 'economic_prosperity',
                name: 'Economic Prosperity',
                description: 'Develop a thriving economy for your empire',
                quests: [
                    {
                        id: 'resource_stockpile',
                        name: 'Resource Stockpile',
                        description: 'Build up a significant stockpile of resources',
                        objectives: [
                            { type: 'resource_amount', resource: 'FOOD', amount: 500, current: 0 },
                            { type: 'resource_amount', resource: 'ORE', amount: 500, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 100 },
                            { type: 'resource', resource: 'ORE', amount: 100 },
                            { type: 'xp', amount: 150 }
                        ],
                        timeLimit: 0,
                        difficulty: 'medium',
                        prerequisiteQuests: ['build_basic_infrastructure']
                    },
                    {
                        id: 'establish_trade_route',
                        name: 'Trade Network',
                        description: 'Establish your first trade route',
                        objectives: [
                            { type: 'research', category: 'ECONOMIC', technology: 'TRADE_ROUTES', current: false },
                            { type: 'trade_route', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 300 },
                            { type: 'resource', resource: 'ORE', amount: 300 },
                            { type: 'xp', amount: 250 }
                        ],
                        timeLimit: 0,
                        difficulty: 'hard',
                        prerequisiteQuests: ['resource_stockpile']
                    },
                    {
                        id: 'discover_special_resource',
                        name: 'Rare Discovery',
                        description: 'Discover and harvest a special resource',
                        objectives: [
                            { type: 'special_resource', count: 1, current: 0 }
                        ],
                        rewards: [
                            { type: 'resource', resource: 'FOOD', amount: 400 },
                            { type: 'resource', resource: 'ORE', amount: 400 },
                            { type: 'special_resource', resource: 'random', amount: 50 },
                            { type: 'xp', amount: 300 }
                        ],
                        timeLimit: 0,
                        difficulty: 'hard',
                        prerequisiteQuests: ['establish_trade_route']
                    }
                ],
                progress: 0,
                isComplete: false
            }
        ];
    }
    
    /**
     * Check for available quests and add them to active quests
     */
    checkForAvailableQuests() {
        for (const questLine of this.questLines) {
            if (questLine.isComplete) continue;
            
            for (const quest of questLine.quests) {
                // Skip if quest is already active or completed
                const isActive = this.quests.some(q => q.id === quest.id);
                const isCompleted = this.completedQuests.some(q => q.id === quest.id);
                
                if (isActive || isCompleted) continue;
                
                // Check prerequisites
                const prerequisitesMet = quest.prerequisiteQuests.every(prereqId => 
                    this.completedQuests.some(q => q.id === prereqId)
                );
                
                if (prerequisitesMet) {
                    // Add quest to active quests
                    const newQuest = { ...quest, startTime: Date.now(), progress: 0 };
                    this.quests.push(newQuest);
                    
                    // Log the new quest
                    this.gameState.activityLogManager.addLogEntry(
                        'Quest',
                        `New quest available: ${quest.name}`
                    );
                }
            }
        }
    }
    
    /**
     * Update quest progress based on game state
     */
    updateQuestProgress() {
        for (const quest of this.quests) {
            let totalObjectives = quest.objectives.length;
            let completedObjectives = 0;
            
            for (const objective of quest.objectives) {
                switch (objective.type) {
                    case 'building':
                        // Check if the required buildings exist
                        const buildings = Object.entries(this.gameState.buildings)
                            .filter(([type, building]) => 
                                (objective.building === 'any' || type === objective.building) && 
                                building.level >= objective.level
                            );
                        
                        objective.current = Math.min(buildings.length, objective.count);
                        break;
                        
                    case 'unit':
                        // Check if the required units exist
                        const unitCount = this.gameState.units[objective.unit] || 0;
                        objective.current = Math.min(unitCount, objective.count);
                        break;
                        
                    case 'research':
                        // Check if the required technology is researched
                        if (objective.category === 'any') {
                            // Count any researched technology
                            let researchCount = 0;
                            for (const category in this.gameState.technologies) {
                                for (const tech in this.gameState.technologies[category]) {
                                    if (this.gameState.technologies[category][tech]) {
                                        researchCount++;
                                    }
                                }
                            }
                            objective.current = Math.min(researchCount, objective.count);
                        } else {
                            // Check specific technology
                            const isResearched = this.gameState.technologies[objective.category] && 
                                                this.gameState.technologies[objective.category][objective.technology];
                            objective.current = isResearched ? true : false;
                        }
                        break;
                        
                    case 'territory':
                        // Check claimed territories
                        objective.current = Math.min(this.gameState.claimedTerritories.length, objective.count);
                        break;
                        
                    case 'outpost':
                        // Check built outposts
                        const outposts = this.gameState.outposts.filter(outpost => 
                            objective.outpostType === 'any' || outpost.type === objective.outpostType
                        );
                        objective.current = Math.min(outposts.length, objective.count);
                        break;
                        
                    case 'resource_node':
                        // Check secured resource nodes
                        const securedNodes = this.gameState.claimedTerritories.reduce((count, territory) => {
                            const nodesInTerritory = this.gameState.resourceNodes.filter(node => 
                                (objective.nodeType === 'any' || node.type === objective.nodeType) &&
                                node.x >= territory.x && node.x < territory.x + territory.width &&
                                node.y >= territory.y && node.y < territory.y + territory.height
                            );
                            return count + nodesInTerritory.length;
                        }, 0);
                        objective.current = Math.min(securedNodes, objective.count);
                        break;
                        
                    case 'combat':
                        // Check defeated enemies
                        const defeatedEnemies = this.gameState.combatReports.filter(report => 
                            report.outcome === 'victory' && 
                            (objective.enemyType === 'any' || report.enemyType === objective.enemyType)
                        );
                        objective.current = Math.min(defeatedEnemies.length, objective.count);
                        break;
                        
                    case 'diplomatic_relation':
                        // Check established diplomatic relations
                        objective.current = Math.min(this.gameState.diplomaticRelations.length, objective.count);
                        break;
                        
                    case 'alliance':
                        // Check formed alliances
                        const alliances = this.gameState.diplomaticRelations.filter(relation => 
                            relation.status === 'ALLIANCE'
                        );
                        objective.current = Math.min(alliances.length, objective.count);
                        break;
                        
                    case 'resource_amount':
                        // Check resource amounts
                        const resourceAmount = this.gameState.resources[objective.resource] || 0;
                        objective.current = Math.min(resourceAmount, objective.amount);
                        break;
                        
                    case 'trade_route':
                        // Check established trade routes
                        if (this.gameState.tradeSystem) {
                            objective.current = Math.min(this.gameState.tradeSystem.tradeRoutes.length, objective.count);
                        }
                        break;
                        
                    case 'special_resource':
                        // Check discovered special resources
                        if (this.gameState.specialResourceNodes) {
                            const discoveredSpecialResources = this.gameState.specialResourceNodes.filter(node => 
                                node.discovered
                            );
                            objective.current = Math.min(discoveredSpecialResources.length, objective.count);
                        }
                        break;
                }
                
                // Check if objective is completed
                if (objective.type === 'research' && typeof objective.current === 'boolean') {
                    if (objective.current) completedObjectives++;
                } else if (objective.type === 'resource_amount') {
                    if (objective.current >= objective.amount) completedObjectives++;
                } else {
                    if (objective.current >= objective.count) completedObjectives++;
                }
            }
            
            // Update quest progress
            quest.progress = Math.floor((completedObjectives / totalObjectives) * 100);
            
            // Check if quest is completed
            if (quest.progress === 100 && !quest.isCompleted) {
                this.completeQuest(quest);
            }
        }
        
        // Update quest line progress
        for (const questLine of this.questLines) {
            const totalQuests = questLine.quests.length;
            const completedQuests = questLine.quests.filter(quest => 
                this.completedQuests.some(q => q.id === quest.id)
            ).length;
            
            questLine.progress = Math.floor((completedQuests / totalQuests) * 100);
            questLine.isComplete = questLine.progress === 100;
        }
        
        // Update overall story progress
        const totalQuestLines = this.questLines.length;
        const completedQuestLines = this.questLines.filter(ql => ql.isComplete).length;
        const questLineProgress = this.questLines.reduce((sum, ql) => sum + ql.progress, 0) / totalQuestLines;
        
        this.storyProgress = Math.floor(questLineProgress);
    }
    
    /**
     * Complete a quest and give rewards
     * @param {Object} quest - The quest to complete
     */
    completeQuest(quest) {
        // Mark as completed
        quest.isCompleted = true;
        quest.completionTime = Date.now();
        
        // Give rewards
        for (const reward of quest.rewards) {
            switch (reward.type) {
                case 'resource':
                    this.gameState.resources[reward.resource] += reward.amount;
                    break;
                    
                case 'unit':
                    this.gameState.units[reward.unit] += reward.count;
                    break;
                    
                case 'xp':
                    // XP system would be implemented separately
                    break;
                    
                case 'special_resource':
                    if (reward.resource === 'random') {
                        // Give a random special resource
                        const specialResources = ['CRYSTAL', 'ANCIENT_ARTIFACT', 'RARE_METAL', 'ANCIENT_KNOWLEDGE'];
                        const randomResource = specialResources[Math.floor(Math.random() * specialResources.length)];
                        
                        // Add to player's resources (would need to be implemented)
                        if (!this.gameState.resources[randomResource]) {
                            this.gameState.resources[randomResource] = 0;
                        }
                        this.gameState.resources[randomResource] += reward.amount;
                    } else {
                        // Give the specified special resource
                        if (!this.gameState.resources[reward.resource]) {
                            this.gameState.resources[reward.resource] = 0;
                        }
                        this.gameState.resources[reward.resource] += reward.amount;
                    }
                    break;
            }
        }
        
        // Move from active to completed quests
        const questIndex = this.quests.findIndex(q => q.id === quest.id);
        if (questIndex !== -1) {
            this.quests.splice(questIndex, 1);
        }
        this.completedQuests.push(quest);
        
        // Log completion
        this.gameState.activityLogManager.addLogEntry(
            'Quest',
            `Completed quest: ${quest.name}`
        );
        
        // Check for newly available quests
        this.checkForAvailableQuests();
    }
    
    /**
     * Get active quests
     * @returns {Array} - Array of active quests
     */
    getActiveQuests() {
        return this.quests;
    }
    
    /**
     * Get completed quests
     * @returns {Array} - Array of completed quests
     */
    getCompletedQuests() {
        return this.completedQuests;
    }
    
    /**
     * Get quest lines
     * @returns {Array} - Array of quest lines
     */
    getQuestLines() {
        return this.questLines;
    }
    
    /**
     * Get story progress
     * @returns {number} - Story progress (0-100)
     */
    getStoryProgress() {
        return this.storyProgress;
    }
    
    /**
     * Update quest system (called on each game tick)
     */
    update() {
        const now = Date.now();
        
        // Check for new quests periodically
        if (now - this.lastQuestCheckTime >= this.questCheckInterval) {
            this.checkForAvailableQuests();
            this.lastQuestCheckTime = now;
        }
        
        // Update quest progress
        this.updateQuestProgress();
    }
}

// Export the QuestSystem class
if (typeof module !== 'undefined') {
    module.exports = { QuestSystem };
}
