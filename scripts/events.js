/**
 * Special Events System
 * Manages random events that can occur during gameplay
 */
class EventManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.activeEvent = null;
        this.eventCooldown = 0;
        this.eventHistory = [];
        this.eventTypes = {
            RESOURCE_BONUS: {
                id: 'RESOURCE_BONUS',
                name: 'Resource Discovery',
                description: 'Your scouts have discovered additional resources!',
                probability: 0.3,
                minTurn: 5
            },
            ENEMY_RAID: {
                id: 'ENEMY_RAID',
                name: 'Enemy Raid',
                description: 'Your settlement is under attack by raiders!',
                probability: 0.2,
                minTurn: 10
            },
            TRADER: {
                id: 'TRADER',
                name: 'Traveling Merchant',
                description: 'A merchant caravan has arrived offering trades.',
                probability: 0.25,
                minTurn: 8
            },
            DISCOVERY: {
                id: 'DISCOVERY',
                name: 'Scientific Discovery',
                description: 'Your scholars have made a breakthrough!',
                probability: 0.15,
                minTurn: 15
            },
            NATURAL_DISASTER: {
                id: 'NATURAL_DISASTER',
                name: 'Natural Disaster',
                description: 'A disaster has struck your lands!',
                probability: 0.1,
                minTurn: 12
            }
        };
    }

    /**
     * Update the event system each turn
     */
    update() {
        // Decrease cooldown if active
        if (this.eventCooldown > 0) {
            this.eventCooldown--;
            return;
        }

        // Don't trigger events if one is already active
        if (this.activeEvent) {
            return;
        }

        // Random chance to trigger an event
        if (Math.random() < 0.15) { // 15% chance per turn
            this.triggerRandomEvent();
        }
    }

    /**
     * Trigger a random event based on probabilities
     */
    triggerRandomEvent() {
        // Get current turn
        const currentTurn = this.gameState.turn;
        
        // Filter events that are eligible based on minimum turn requirement
        const eligibleEvents = Object.values(this.eventTypes).filter(
            event => currentTurn >= event.minTurn
        );
        
        if (eligibleEvents.length === 0) {
            return; // No eligible events yet
        }
        
        // Calculate total probability
        const totalProbability = eligibleEvents.reduce(
            (sum, event) => sum + event.probability, 0
        );
        
        // Select a random event based on weighted probability
        let random = Math.random() * totalProbability;
        let selectedEvent = null;
        
        for (const event of eligibleEvents) {
            random -= event.probability;
            if (random <= 0) {
                selectedEvent = event;
                break;
            }
        }
        
        if (selectedEvent) {
            this.triggerEvent(selectedEvent.id);
        }
    }

    /**
     * Trigger a specific event
     * @param {string} eventId - The ID of the event to trigger
     */
    triggerEvent(eventId) {
        const eventType = this.eventTypes[eventId];
        if (!eventType) return;
        
        // Create event instance
        const event = {
            id: eventType.id,
            name: eventType.name,
            description: eventType.description,
            turn: this.gameState.turn,
            options: this.generateEventOptions(eventId),
            resolved: false
        };
        
        // Set as active event
        this.activeEvent = event;
        
        // Add to history
        this.eventHistory.push(event);
        
        // Notify UI
        this.gameState.onStateChange();
        
        // Show event modal
        if (window.ui) {
            window.ui.showEventModal(event);
        }
    }

    /**
     * Generate options for a specific event
     * @param {string} eventId - The ID of the event
     * @returns {Array} - Array of option objects
     */
    generateEventOptions(eventId) {
        switch (eventId) {
            case 'RESOURCE_BONUS':
                return this.generateResourceBonusOptions();
            case 'ENEMY_RAID':
                return this.generateEnemyRaidOptions();
            case 'TRADER':
                return this.generateTraderOptions();
            case 'DISCOVERY':
                return this.generateDiscoveryOptions();
            case 'NATURAL_DISASTER':
                return this.generateDisasterOptions();
            default:
                return [];
        }
    }

    /**
     * Generate options for resource bonus event
     */
    generateResourceBonusOptions() {
        const foodBonus = Math.floor(20 + Math.random() * 30);
        const oreBonus = Math.floor(15 + Math.random() * 25);
        
        return [
            {
                id: 'take_food',
                label: `Take food (+${foodBonus})`,
                description: 'Your scouts found fertile hunting grounds.',
                effect: () => {
                    this.gameState.resources.FOOD += foodBonus;
                    this.resolveEvent(`You gained ${foodBonus} food.`);
                }
            },
            {
                id: 'take_ore',
                label: `Take ore (+${oreBonus})`,
                description: 'Your scouts found a rich mineral deposit.',
                effect: () => {
                    this.gameState.resources.ORE += oreBonus;
                    this.resolveEvent(`You gained ${oreBonus} ore.`);
                }
            },
            {
                id: 'take_both',
                label: 'Take both (reduced)',
                description: 'Split your efforts to gather both resources.',
                effect: () => {
                    this.gameState.resources.FOOD += Math.floor(foodBonus * 0.6);
                    this.gameState.resources.ORE += Math.floor(oreBonus * 0.6);
                    this.resolveEvent(`You gained ${Math.floor(foodBonus * 0.6)} food and ${Math.floor(oreBonus * 0.6)} ore.`);
                }
            }
        ];
    }

    /**
     * Generate options for enemy raid event
     */
    generateEnemyRaidOptions() {
        const defenderCount = Math.floor(5 + Math.random() * 10);
        const foodLoss = Math.floor(10 + Math.random() * 20);
        
        return [
            {
                id: 'defend',
                label: 'Defend your settlement',
                description: `Use ${defenderCount} spearmen to fight off the raiders.`,
                condition: () => this.gameState.units.SPEARMAN >= defenderCount,
                effect: () => {
                    // 70% chance of success
                    if (Math.random() < 0.7) {
                        // Lose some units but save resources
                        this.gameState.units.SPEARMAN -= Math.floor(defenderCount * 0.4);
                        this.resolveEvent(`You successfully defended your settlement! You lost ${Math.floor(defenderCount * 0.4)} spearmen in the battle.`);
                    } else {
                        // Lose more units and some resources
                        this.gameState.units.SPEARMAN -= Math.floor(defenderCount * 0.7);
                        this.gameState.resources.FOOD -= Math.floor(foodLoss * 0.5);
                        this.resolveEvent(`Your defense was partially successful. You lost ${Math.floor(defenderCount * 0.7)} spearmen and ${Math.floor(foodLoss * 0.5)} food.`);
                    }
                }
            },
            {
                id: 'hide',
                label: 'Hide your resources',
                description: 'Try to hide your valuable resources before the raiders arrive.',
                effect: () => {
                    // 50% chance of success
                    if (Math.random() < 0.5) {
                        this.resolveEvent('You successfully hid most of your resources. The raiders left with very little.');
                    } else {
                        this.gameState.resources.FOOD -= foodLoss;
                        this.gameState.resources.ORE -= Math.floor(foodLoss * 0.5);
                        this.resolveEvent(`The raiders found your stockpiles. You lost ${foodLoss} food and ${Math.floor(foodLoss * 0.5)} ore.`);
                    }
                }
            },
            {
                id: 'pay',
                label: 'Pay tribute',
                description: 'Give the raiders some resources to leave you alone.',
                effect: () => {
                    this.gameState.resources.FOOD -= Math.floor(foodLoss * 0.7);
                    this.resolveEvent(`You paid the raiders ${Math.floor(foodLoss * 0.7)} food as tribute. They left peacefully.`);
                }
            }
        ];
    }

    /**
     * Generate options for trader event
     */
    generateTraderOptions() {
        const tradeAmount = Math.floor(15 + Math.random() * 15);
        
        return [
            {
                id: 'buy_food',
                label: `Buy food (${tradeAmount} food for ${Math.floor(tradeAmount * 1.2)} ore)`,
                description: 'Purchase food supplies from the merchant.',
                condition: () => this.gameState.resources.ORE >= Math.floor(tradeAmount * 1.2),
                effect: () => {
                    this.gameState.resources.ORE -= Math.floor(tradeAmount * 1.2);
                    this.gameState.resources.FOOD += tradeAmount;
                    this.resolveEvent(`You traded ${Math.floor(tradeAmount * 1.2)} ore for ${tradeAmount} food.`);
                }
            },
            {
                id: 'sell_food',
                label: `Sell food (${tradeAmount} food for ${Math.floor(tradeAmount * 0.8)} ore)`,
                description: 'Sell excess food to the merchant.',
                condition: () => this.gameState.resources.FOOD >= tradeAmount,
                effect: () => {
                    this.gameState.resources.FOOD -= tradeAmount;
                    this.gameState.resources.ORE += Math.floor(tradeAmount * 0.8);
                    this.resolveEvent(`You traded ${tradeAmount} food for ${Math.floor(tradeAmount * 0.8)} ore.`);
                }
            },
            {
                id: 'decline',
                label: 'Decline trade',
                description: 'You decide not to trade with the merchant this time.',
                effect: () => {
                    this.resolveEvent('You declined to trade with the merchant. They moved on to the next settlement.');
                }
            }
        ];
    }

    /**
     * Generate options for discovery event
     */
    generateDiscoveryOptions() {
        // Get available research options
        const availableResearch = this.gameState.researchManager.getAvailableResearch();
        
        if (availableResearch.length === 0) {
            // If no research is available, give resource bonus instead
            const bonus = Math.floor(20 + Math.random() * 20);
            return [
                {
                    id: 'resource_bonus',
                    label: `Receive resources`,
                    description: 'Your scholars found ways to improve resource gathering.',
                    effect: () => {
                        this.gameState.resources.FOOD += bonus;
                        this.gameState.resources.ORE += Math.floor(bonus * 0.7);
                        this.resolveEvent(`Your scholars' findings improved resource gathering. You gained ${bonus} food and ${Math.floor(bonus * 0.7)} ore.`);
                    }
                }
            ];
        }
        
        // Select up to 2 random research options
        const selectedResearch = [];
        const shuffled = [...availableResearch].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < Math.min(2, shuffled.length); i++) {
            selectedResearch.push(shuffled[i]);
        }
        
        // Create options
        const options = selectedResearch.map(research => ({
            id: `research_${research.id}`,
            label: `Research ${research.name}`,
            description: `Your scholars made progress on ${research.name} research.`,
            effect: () => {
                // Add 50% progress to the selected research
                this.gameState.researchManager.addResearchProgress(research.id, 50);
                this.resolveEvent(`Your scholars made significant progress on ${research.name} research.`);
            }
        }));
        
        // Add decline option
        options.push({
            id: 'ignore',
            label: 'Focus on other matters',
            description: 'You decide to focus on immediate concerns instead.',
            effect: () => {
                // Give small resource bonus instead
                const smallBonus = Math.floor(10 + Math.random() * 10);
                this.gameState.resources.FOOD += smallBonus;
                this.gameState.resources.ORE += smallBonus;
                this.resolveEvent(`You focused on immediate concerns and gained ${smallBonus} food and ${smallBonus} ore.`);
            }
        });
        
        return options;
    }

    /**
     * Generate options for natural disaster event
     */
    generateDisasterOptions() {
        const foodLoss = Math.floor(15 + Math.random() * 25);
        const buildingDamage = Math.random() < 0.5 ? 'FARM' : 'MINE';
        
        return [
            {
                id: 'evacuate',
                label: 'Evacuate quickly',
                description: 'Prioritize saving lives over resources.',
                effect: () => {
                    // Lose more resources but no building damage
                    this.gameState.resources.FOOD -= foodLoss;
                    this.gameState.resources.ORE -= Math.floor(foodLoss * 0.5);
                    this.resolveEvent(`You evacuated quickly and saved all your people, but lost ${foodLoss} food and ${Math.floor(foodLoss * 0.5)} ore.`);
                }
            },
            {
                id: 'save_resources',
                label: 'Try to save resources',
                description: 'Risk more damage to buildings but save some resources.',
                effect: () => {
                    // Lose less resources but building takes damage
                    this.gameState.resources.FOOD -= Math.floor(foodLoss * 0.6);
                    this.gameState.resources.ORE -= Math.floor(foodLoss * 0.3);
                    
                    // Damage building if it exists and has level > 0
                    if (this.gameState.buildings[buildingDamage] && this.gameState.buildings[buildingDamage].level > 0) {
                        this.gameState.buildings[buildingDamage].level -= 1;
                        this.resolveEvent(`You saved some resources but your ${CONFIG.BUILDINGS[buildingDamage].name} was damaged and lost a level. You lost ${Math.floor(foodLoss * 0.6)} food and ${Math.floor(foodLoss * 0.3)} ore.`);
                    } else {
                        this.resolveEvent(`You managed to save some resources. You lost ${Math.floor(foodLoss * 0.6)} food and ${Math.floor(foodLoss * 0.3)} ore.`);
                    }
                }
            },
            {
                id: 'call_for_help',
                label: 'Call for help',
                description: 'Use some resources to get help from neighboring settlements.',
                condition: () => this.gameState.resources.FOOD >= 10 && this.gameState.resources.ORE >= 10,
                effect: () => {
                    // Spend resources to minimize losses
                    this.gameState.resources.FOOD -= 10;
                    this.gameState.resources.ORE -= 10;
                    this.resolveEvent('You called for help from neighboring settlements. They helped you minimize the damage in exchange for some resources.');
                }
            }
        ];
    }

    /**
     * Resolve the current event
     * @param {string} outcome - Description of the event outcome
     */
    resolveEvent(outcome) {
        if (!this.activeEvent) return;
        
        // Mark event as resolved
        this.activeEvent.resolved = true;
        this.activeEvent.outcome = outcome;
        
        // Clear active event
        this.activeEvent = null;
        
        // Set cooldown before next event
        this.eventCooldown = 3; // Wait 3 turns before next event
        
        // Update game state
        this.gameState.onStateChange();
    }

    /**
     * Get the active event
     * @returns {Object|null} - The active event or null if none
     */
    getActiveEvent() {
        return this.activeEvent;
    }

    /**
     * Get event history
     * @returns {Array} - Array of past events
     */
    getEventHistory() {
        return this.eventHistory;
    }
}
