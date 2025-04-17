/**
 * Challenges System
 * Manages event challenges and tracks progress
 */

class ChallengeManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.activeEvents = []; // Currently active events
        this.activeChallenges = []; // Currently active challenges
        this.completedEvents = []; // History of completed events
        this.completedChallenges = []; // History of completed challenges
        
        // Timing controls
        this.lastEventTime = 0;
        this.lastEventCheck = 0;
        this.eventCheckInterval = 60; // Check for new events every 60 seconds
        
        // Load event configuration
        this.config = EVENTS_CONFIG;
    }
    
    /**
     * Update the challenge system (called from gameState.update)
     */
    update() {
        const currentTime = this.gameState.getGameTime();
        
        // Check if it's time to potentially trigger a new event
        if (currentTime - this.lastEventCheck >= this.eventCheckInterval) {
            this.checkForNewEvents(currentTime);
            this.lastEventCheck = currentTime;
        }
        
        // Update active events
        this.updateActiveEvents(currentTime);
        
        // Update active challenges
        this.updateActiveChallenges(currentTime);
    }
    
    /**
     * Check if a new event should be triggered
     */
    checkForNewEvents(currentTime) {
        // Don't trigger events if we've reached the max active events
        if (this.activeEvents.length >= this.config.BASE_SETTINGS.maxActiveEvents) {
            return;
        }
        
        // Don't trigger events too frequently
        if (currentTime - this.lastEventTime < this.config.BASE_SETTINGS.minTimeBetweenEvents) {
            return;
        }
        
        // Random chance to trigger an event
        if (Math.random() < this.config.BASE_SETTINGS.eventChance) {
            this.triggerRandomEvent(currentTime);
        }
    }
    
    /**
     * Trigger a random event appropriate for the current game state
     */
    triggerRandomEvent(currentTime) {
        // Filter events that are eligible based on game time
        const eligibleEvents = this.config.EVENTS.filter(event => {
            // Check if event is already active
            const isActive = this.activeEvents.some(activeEvent => activeEvent.id === event.id);
            if (isActive) return false;
            
            // Check if event has been completed recently
            const recentlyCompleted = this.completedEvents.some(
                completed => completed.id === event.id && 
                (currentTime - completed.completionTime) < 1800 // 30 minutes cooldown
            );
            if (recentlyCompleted) return false;
            
            // Check minimum game time requirement
            return currentTime >= event.minGameTime;
        });
        
        if (eligibleEvents.length === 0) {
            return; // No eligible events
        }
        
        // Select a random event from eligible events
        const selectedEvent = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
        
        // Create active event object
        const activeEvent = {
            ...selectedEvent,
            startTime: currentTime,
            endTime: currentTime + selectedEvent.duration,
            progress: 0,
            completed: false,
            claimed: false
        };
        
        // Apply event effects
        this.applyEventEffect(activeEvent);
        
        // Add to active events
        this.activeEvents.push(activeEvent);
        
        // Update last event time
        this.lastEventTime = currentTime;
        
        // Log the event
        this.gameState.activityLogManager.addLogEntry(
            'Event', 
            `New event: ${selectedEvent.title}. ${selectedEvent.description}`
        );
        
        // Trigger UI update
        this.gameState.onStateChange();
    }
    
    /**
     * Apply the effect of an event
     */
    applyEventEffect(event) {
        if (!event.effect || event.effect.type === 'none') {
            return; // No effect to apply
        }
        
        switch (event.effect.type) {
            case 'production_boost':
                // Apply production boost
                if (event.effect.resource === 'FOOD') {
                    this.gameState.eventBonuses.foodProduction = event.effect.multiplier;
                } else if (event.effect.resource === 'ORE') {
                    this.gameState.eventBonuses.oreProduction = event.effect.multiplier;
                }
                break;
                
            case 'production_penalty':
                // Apply production penalty
                if (event.effect.resource === 'FOOD') {
                    this.gameState.eventBonuses.foodProduction = event.effect.multiplier;
                } else if (event.effect.resource === 'ORE') {
                    this.gameState.eventBonuses.oreProduction = event.effect.multiplier;
                }
                break;
                
            case 'spawn_enemy':
                // Spawn enemy camps
                for (let i = 0; i < event.effect.count; i++) {
                    this.gameState.spawnEventNPC(
                        event.effect.enemyType,
                        event.effect.difficulty,
                        event.id
                    );
                }
                break;
                
            case 'construction_speed':
                // Apply construction speed bonus
                this.gameState.eventBonuses.constructionSpeed = event.effect.multiplier;
                break;
                
            case 'research_speed':
                // Apply research speed bonus
                this.gameState.eventBonuses.researchSpeed = event.effect.multiplier;
                break;
                
            case 'training_speed':
                // Apply training speed bonus
                this.gameState.eventBonuses.trainingSpeed = event.effect.multiplier;
                break;
        }
    }
    
    /**
     * Remove the effect of an event
     */
    removeEventEffect(event) {
        if (!event.effect || event.effect.type === 'none') {
            return; // No effect to remove
        }
        
        switch (event.effect.type) {
            case 'production_boost':
            case 'production_penalty':
                // Reset production multipliers
                if (event.effect.resource === 'FOOD') {
                    this.gameState.eventBonuses.foodProduction = 1.0;
                } else if (event.effect.resource === 'ORE') {
                    this.gameState.eventBonuses.oreProduction = 1.0;
                }
                break;
                
            case 'construction_speed':
                // Reset construction speed
                this.gameState.eventBonuses.constructionSpeed = 1.0;
                break;
                
            case 'research_speed':
                // Reset research speed
                this.gameState.eventBonuses.researchSpeed = 1.0;
                break;
                
            case 'training_speed':
                // Reset training speed
                this.gameState.eventBonuses.trainingSpeed = 1.0;
                break;
        }
    }
    
    /**
     * Update all active events
     */
    updateActiveEvents(currentTime) {
        // Process each active event
        for (let i = this.activeEvents.length - 1; i >= 0; i--) {
            const event = this.activeEvents[i];
            
            // Check if event has expired
            if (currentTime >= event.endTime) {
                // Remove event effects
                this.removeEventEffect(event);
                
                // If event was not completed, add to history as failed
                if (!event.completed) {
                    event.failed = true;
                    this.completedEvents.push({
                        ...event,
                        completionTime: currentTime
                    });
                    
                    // Log the event failure
                    this.gameState.activityLogManager.addLogEntry(
                        'Event', 
                        `Event expired: ${event.title}. You did not complete the objectives.`
                    );
                }
                
                // Remove from active events
                this.activeEvents.splice(i, 1);
                
                // Trigger UI update
                this.gameState.onStateChange();
                continue;
            }
            
            // Update event progress based on objective type
            this.updateEventProgress(event, currentTime);
        }
    }
    
    /**
     * Update progress for a specific event
     */
    updateEventProgress(event, currentTime) {
        if (event.completed) return;
        
        switch (event.objectiveType) {
            case 'none':
                // No objective to track, just a bonus event
                event.progress = 100;
                event.completed = true;
                break;
                
            case 'produce_resource':
                // Track resource production
                const resourceKey = event.objective.resource;
                const resourceProduced = this.gameState.eventTracking.resourcesProduced[resourceKey] || 0;
                event.progress = Math.min(100, (resourceProduced / event.objective.amount) * 100);
                
                if (resourceProduced >= event.objective.amount) {
                    event.completed = true;
                }
                break;
                
            case 'defeat_enemies':
                // Track defeated enemies
                const defeatedCount = this.gameState.eventTracking.defeatedEnemies[event.id] || 0;
                event.progress = Math.min(100, (defeatedCount / event.objective.count) * 100);
                
                if (defeatedCount >= event.objective.count) {
                    event.completed = true;
                }
                break;
                
            case 'build_or_upgrade':
                // Track building or upgrading
                const buildCount = this.gameState.eventTracking.buildingsConstructed || 0;
                event.progress = Math.min(100, (buildCount / event.objective.count) * 100);
                
                if (buildCount >= event.objective.count) {
                    event.completed = true;
                }
                break;
                
            case 'build_specific':
                // Check if specific building exists at required level
                const building = this.gameState.buildings[event.objective.buildingType];
                if (building && building.level >= event.objective.level) {
                    event.progress = 100;
                    event.completed = true;
                } else if (building) {
                    // Calculate partial progress
                    event.progress = (building.level / event.objective.level) * 100;
                } else {
                    event.progress = 0;
                }
                break;
                
            case 'complete_research':
                // Track completed research
                const researchCount = this.gameState.eventTracking.researchCompleted || 0;
                event.progress = Math.min(100, (researchCount / event.objective.count) * 100);
                
                if (researchCount >= event.objective.count) {
                    event.completed = true;
                }
                break;
                
            case 'complete_specific_research':
                // Check if specific research is completed
                const tech = this.gameState.technologies[event.objective.category][event.objective.techId];
                if (tech) {
                    event.progress = 100;
                    event.completed = true;
                } else {
                    // Check research queue for progress
                    const inQueue = this.gameState.researchQueue.find(
                        item => item.category === event.objective.category && item.techId === event.objective.techId
                    );
                    
                    if (inQueue) {
                        // Calculate progress based on remaining time
                        const techConfig = CONFIG.TECHNOLOGIES[event.objective.category][event.objective.techId];
                        const totalTime = techConfig.researchTime;
                        const remainingTime = inQueue.timeRemaining;
                        event.progress = ((totalTime - remainingTime) / totalTime) * 100;
                    } else {
                        event.progress = 0;
                    }
                }
                break;
                
            case 'claim':
                // Nothing to update, player needs to claim manually
                break;
                
            case 'train_units':
                // Track trained units
                const trainedCount = this.gameState.eventTracking.unitsTrained || 0;
                event.progress = Math.min(100, (trainedCount / event.objective.count) * 100);
                
                if (trainedCount >= event.objective.count) {
                    event.completed = true;
                }
                break;
        }
        
        // If event was just completed, log it
        if (event.completed && !event.claimed) {
            this.gameState.activityLogManager.addLogEntry(
                'Event', 
                `Event completed: ${event.title}. Claim your reward!`
            );
            
            // Trigger UI update
            this.gameState.onStateChange();
        }
    }
    
    /**
     * Claim reward for a completed event
     */
    claimEventReward(eventId) {
        const eventIndex = this.activeEvents.findIndex(event => event.id === eventId);
        if (eventIndex === -1) return false;
        
        const event = this.activeEvents[eventIndex];
        if (!event.completed || event.claimed) return false;
        
        // Mark as claimed
        event.claimed = true;
        
        // Grant reward
        this.grantReward(event.reward);
        
        // Add to completed events
        this.completedEvents.push({
            ...event,
            completionTime: this.gameState.getGameTime()
        });
        
        // Remove from active events
        this.activeEvents.splice(eventIndex, 1);
        
        // Remove event effects
        this.removeEventEffect(event);
        
        // Log the reward claim
        this.gameState.activityLogManager.addLogEntry(
            'Event', 
            `Claimed reward for event: ${event.title}`
        );
        
        // Trigger UI update
        this.gameState.onStateChange();
        
        return true;
    }
    
    /**
     * Grant a reward to the player
     */
    grantReward(reward) {
        if (!reward || reward === 'none') return;
        
        switch (reward.type) {
            case 'resource':
                // Grant single resource
                const currentAmount = this.gameState.resources[reward.resource] || 0;
                this.gameState.resources[reward.resource] = Math.min(
                    currentAmount + reward.amount,
                    this.gameState.storageCapacity[reward.resource]
                );
                break;
                
            case 'multi_resource':
                // Grant multiple resources
                for (const [resource, amount] of Object.entries(reward.resources)) {
                    const currentAmount = this.gameState.resources[resource] || 0;
                    this.gameState.resources[resource] = Math.min(
                        currentAmount + amount,
                        this.gameState.storageCapacity[resource]
                    );
                }
                break;
                
            case 'unit':
                // Grant units
                const currentUnits = this.gameState.units[reward.unitType] || 0;
                this.gameState.units[reward.unitType] = currentUnits + reward.amount;
                break;
                
            case 'unit_bonus':
                // Apply temporary unit bonus
                if (reward.stat === 'attack') {
                    this.gameState.temporaryBonuses.push({
                        type: 'unitAttack',
                        multiplier: reward.multiplier,
                        endTime: this.gameState.getGameTime() + reward.duration
                    });
                } else if (reward.stat === 'defense') {
                    this.gameState.temporaryBonuses.push({
                        type: 'unitDefense',
                        multiplier: reward.multiplier,
                        endTime: this.gameState.getGameTime() + reward.duration
                    });
                } else if (reward.stat === 'all') {
                    // Apply bonus to all unit stats
                    this.gameState.temporaryBonuses.push({
                        type: 'unitAttack',
                        multiplier: reward.multiplier,
                        endTime: this.gameState.getGameTime() + reward.duration
                    });
                    this.gameState.temporaryBonuses.push({
                        type: 'unitDefense',
                        multiplier: reward.multiplier,
                        endTime: this.gameState.getGameTime() + reward.duration
                    });
                }
                break;
                
            case 'research_progress':
                // Apply progress to current research
                if (this.gameState.researchQueue.length > 0) {
                    const currentResearch = this.gameState.researchQueue[0];
                    const techConfig = CONFIG.TECHNOLOGIES[currentResearch.category][currentResearch.techId];
                    const progressAmount = (techConfig.researchTime * (reward.amount / 100));
                    currentResearch.timeRemaining = Math.max(0, currentResearch.timeRemaining - progressAmount);
                }
                break;
                
            case 'research_speed':
                // Apply temporary research speed bonus
                this.gameState.temporaryBonuses.push({
                    type: 'researchSpeed',
                    multiplier: reward.multiplier,
                    endTime: this.gameState.getGameTime() + reward.duration
                });
                break;
        }
    }
    
    /**
     * Start a specific challenge
     */
    startChallenge(challengeId) {
        // Check if challenge is already active
        if (this.activeChallenges.some(challenge => challenge.id === challengeId)) {
            return false;
        }
        
        // Find challenge in config
        const challengeConfig = this.config.CHALLENGES.find(c => c.id === challengeId);
        if (!challengeConfig) return false;
        
        // Create active challenge object
        const currentTime = this.gameState.getGameTime();
        const activeChallenge = {
            ...challengeConfig,
            startTime: currentTime,
            endTime: currentTime + challengeConfig.duration,
            objectives: challengeConfig.objectives.map(obj => ({
                ...obj,
                progress: 0,
                completed: false
            })),
            progress: 0,
            completed: false,
            claimed: false
        };
        
        // Add to active challenges
        this.activeChallenges.push(activeChallenge);
        
        // Log the challenge start
        this.gameState.activityLogManager.addLogEntry(
            'Challenge', 
            `Started challenge: ${challengeConfig.title}. ${challengeConfig.description}`
        );
        
        // Trigger UI update
        this.gameState.onStateChange();
        
        return true;
    }
    
    /**
     * Update all active challenges
     */
    updateActiveChallenges(currentTime) {
        // Process each active challenge
        for (let i = this.activeChallenges.length - 1; i >= 0; i--) {
            const challenge = this.activeChallenges[i];
            
            // Check if challenge has expired
            if (currentTime >= challenge.endTime) {
                // If challenge was not completed, add to history as failed
                if (!challenge.completed) {
                    challenge.failed = true;
                    this.completedChallenges.push({
                        ...challenge,
                        completionTime: currentTime
                    });
                    
                    // Log the challenge failure
                    this.gameState.activityLogManager.addLogEntry(
                        'Challenge', 
                        `Challenge expired: ${challenge.title}. You did not complete all objectives.`
                    );
                }
                
                // Remove from active challenges
                this.activeChallenges.splice(i, 1);
                
                // Trigger UI update
                this.gameState.onStateChange();
                continue;
            }
            
            // Update challenge objectives progress
            this.updateChallengeProgress(challenge);
        }
    }
    
    /**
     * Update progress for a specific challenge
     */
    updateChallengeProgress(challenge) {
        if (challenge.completed) return;
        
        // Update each objective
        let totalProgress = 0;
        let allCompleted = true;
        
        for (const objective of challenge.objectives) {
            if (objective.completed) {
                totalProgress += 100 / challenge.objectives.length;
                continue;
            }
            
            allCompleted = false;
            
            switch (objective.type) {
                case 'upgrade_building':
                    // Check if building is upgraded to required level
                    const building = this.gameState.buildings[objective.buildingType];
                    if (building && building.level >= objective.level) {
                        objective.progress = 100;
                        objective.completed = true;
                        totalProgress += 100 / challenge.objectives.length;
                    } else if (building) {
                        // Calculate partial progress
                        objective.progress = (building.level / objective.level) * 100;
                        totalProgress += objective.progress / challenge.objectives.length;
                    }
                    break;
                    
                case 'build_building':
                    // Count buildings of specified type
                    const buildingCount = this.gameState.getBuildingCount(objective.buildingType);
                    objective.progress = Math.min(100, (buildingCount / objective.count) * 100);
                    totalProgress += objective.progress / challenge.objectives.length;
                    
                    if (buildingCount >= objective.count) {
                        objective.completed = true;
                    }
                    break;
                    
                case 'train_unit':
                    // Check unit count
                    const unitCount = this.gameState.units[objective.unitType] || 0;
                    objective.progress = Math.min(100, (unitCount / objective.count) * 100);
                    totalProgress += objective.progress / challenge.objectives.length;
                    
                    if (unitCount >= objective.count) {
                        objective.completed = true;
                    }
                    break;
                    
                case 'complete_research':
                    // Count completed research in category
                    const researchCount = Object.values(this.gameState.technologies[objective.category]).filter(Boolean).length;
                    objective.progress = Math.min(100, (researchCount / objective.count) * 100);
                    totalProgress += objective.progress / challenge.objectives.length;
                    
                    if (researchCount >= objective.count) {
                        objective.completed = true;
                    }
                    break;
            }
        }
        
        // Update overall challenge progress
        challenge.progress = totalProgress;
        
        // Check if all objectives are completed
        if (allCompleted) {
            challenge.completed = true;
            
            // Log challenge completion
            this.gameState.activityLogManager.addLogEntry(
                'Challenge', 
                `Challenge completed: ${challenge.title}. Claim your reward!`
            );
            
            // Trigger UI update
            this.gameState.onStateChange();
        }
    }
    
    /**
     * Claim reward for a completed challenge
     */
    claimChallengeReward(challengeId) {
        const challengeIndex = this.activeChallenges.findIndex(challenge => challenge.id === challengeId);
        if (challengeIndex === -1) return false;
        
        const challenge = this.activeChallenges[challengeIndex];
        if (!challenge.completed || challenge.claimed) return false;
        
        // Mark as claimed
        challenge.claimed = true;
        
        // Grant reward
        this.grantReward(challenge.reward);
        
        // Add to completed challenges
        this.completedChallenges.push({
            ...challenge,
            completionTime: this.gameState.getGameTime()
        });
        
        // Remove from active challenges
        this.activeChallenges.splice(challengeIndex, 1);
        
        // Log the reward claim
        this.gameState.activityLogManager.addLogEntry(
            'Challenge', 
            `Claimed reward for challenge: ${challenge.title}`
        );
        
        // Trigger UI update
        this.gameState.onStateChange();
        
        return true;
    }
    
    /**
     * Get all active events
     */
    getActiveEvents() {
        return this.activeEvents;
    }
    
    /**
     * Get all active challenges
     */
    getActiveChallenges() {
        return this.activeChallenges;
    }
    
    /**
     * Get recently completed events
     */
    getRecentCompletedEvents(count = 5) {
        return this.completedEvents.slice(0, count);
    }
    
    /**
     * Get recently completed challenges
     */
    getRecentCompletedChallenges(count = 5) {
        return this.completedChallenges.slice(0, count);
    }
    
    /**
     * Track resource production for events
     */
    trackResourceProduction(resource, amount) {
        if (!this.gameState.eventTracking.resourcesProduced) {
            this.gameState.eventTracking.resourcesProduced = {};
        }
        
        if (!this.gameState.eventTracking.resourcesProduced[resource]) {
            this.gameState.eventTracking.resourcesProduced[resource] = 0;
        }
        
        this.gameState.eventTracking.resourcesProduced[resource] += amount;
    }
    
    /**
     * Track enemy defeat for events
     */
    trackEnemyDefeat(enemyType, eventId) {
        if (!this.gameState.eventTracking.defeatedEnemies) {
            this.gameState.eventTracking.defeatedEnemies = {};
        }
        
        if (!this.gameState.eventTracking.defeatedEnemies[eventId]) {
            this.gameState.eventTracking.defeatedEnemies[eventId] = 0;
        }
        
        this.gameState.eventTracking.defeatedEnemies[eventId]++;
    }
    
    /**
     * Track building construction for events
     */
    trackBuildingConstruction() {
        if (!this.gameState.eventTracking.buildingsConstructed) {
            this.gameState.eventTracking.buildingsConstructed = 0;
        }
        
        this.gameState.eventTracking.buildingsConstructed++;
    }
    
    /**
     * Track research completion for events
     */
    trackResearchCompletion() {
        if (!this.gameState.eventTracking.researchCompleted) {
            this.gameState.eventTracking.researchCompleted = 0;
        }
        
        this.gameState.eventTracking.researchCompleted++;
    }
    
    /**
     * Track unit training for events
     */
    trackUnitTraining(count) {
        if (!this.gameState.eventTracking.unitsTrained) {
            this.gameState.eventTracking.unitsTrained = 0;
        }
        
        this.gameState.eventTracking.unitsTrained += count;
    }
    
    /**
     * Reset event tracking for a new event
     */
    resetEventTracking() {
        this.gameState.eventTracking = {
            resourcesProduced: {},
            defeatedEnemies: {},
            buildingsConstructed: 0,
            researchCompleted: 0,
            unitsTrained: 0
        };
    }
}
