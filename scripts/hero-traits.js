/**
 * Hero Traits System
 * Defines hero traits that provide unique characteristics and bonuses
 */
class HeroTraitsSystem {
    /**
     * Initialize the hero traits system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        
        // Define traits
        this.traits = {
            // Positive traits
            BRAVE: {
                name: "Brave",
                description: "Never backs down from a challenge",
                icon: "⚔️",
                type: "positive",
                bonuses: {
                    attack: 0.1, // +10% attack
                    morale: 0.15 // +15% morale
                },
                effects: {
                    retreatPenalty: -0.5 // -50% retreat penalty
                }
            },
            INTELLIGENT: {
                name: "Intelligent",
                description: "Quick-witted and strategic",
                icon: "🧠",
                type: "positive",
                bonuses: {
                    intelligence: 0.2, // +20% intelligence
                    experience: 0.1 // +10% experience gain
                },
                effects: {
                    researchBonus: 0.1 // +10% research speed when assigned
                }
            },
            STRONG: {
                name: "Strong",
                description: "Physically powerful and resilient",
                icon: "💪",
                type: "positive",
                bonuses: {
                    attack: 0.15, // +15% attack
                    health: 0.1 // +10% health
                },
                effects: {
                    carryCapacity: 0.2 // +20% resource carrying capacity
                }
            },
            CHARISMATIC: {
                name: "Charismatic",
                description: "Natural leader who inspires others",
                icon: "🗣️",
                type: "positive",
                bonuses: {
                    leadership: 0.2, // +20% leadership
                    charisma: 0.2 // +20% charisma
                },
                effects: {
                    allyMoraleBonus: 0.1 // +10% morale to all allies
                }
            },
            LUCKY: {
                name: "Lucky",
                description: "Fortune seems to favor this hero",
                icon: "🍀",
                type: "positive",
                bonuses: {
                    luck: 0.25, // +25% luck
                    criticalChance: 0.05 // +5% critical hit chance
                },
                effects: {
                    lootBonus: 0.15 // +15% loot from battles
                }
            },
            AGILE: {
                name: "Agile",
                description: "Quick and nimble in combat",
                icon: "🏃",
                type: "positive",
                bonuses: {
                    speed: 0.2, // +20% speed
                    evasion: 0.1 // +10% evasion
                },
                effects: {
                    initiativeBonus: 0.2 // +20% initiative in combat
                }
            },
            
            // Neutral traits
            CAUTIOUS: {
                name: "Cautious",
                description: "Careful and methodical",
                icon: "🛡️",
                type: "neutral",
                bonuses: {
                    defense: 0.15, // +15% defense
                    attack: -0.05 // -5% attack
                },
                effects: {
                    damageReduction: 0.1 // +10% damage reduction
                }
            },
            STUBBORN: {
                name: "Stubborn",
                description: "Refuses to give up, for better or worse",
                icon: "🪨",
                type: "neutral",
                bonuses: {
                    health: 0.1, // +10% health
                    intelligence: -0.1 // -10% intelligence
                },
                effects: {
                    statusResistance: 0.2 // +20% resistance to negative status effects
                }
            },
            CURIOUS: {
                name: "Curious",
                description: "Always exploring and investigating",
                icon: "🔍",
                type: "neutral",
                bonuses: {
                    intelligence: 0.1, // +10% intelligence
                    defense: -0.05 // -5% defense
                },
                effects: {
                    explorationBonus: 0.2 // +20% exploration speed
                }
            },
            
            // Negative traits
            ARROGANT: {
                name: "Arrogant",
                description: "Overconfident and dismissive of others",
                icon: "👑",
                type: "negative",
                bonuses: {
                    attack: 0.05, // +5% attack
                    leadership: -0.15 // -15% leadership
                },
                effects: {
                    teamworkPenalty: 0.1 // -10% effectiveness when working with others
                }
            },
            COWARDLY: {
                name: "Cowardly",
                description: "Easily frightened in dangerous situations",
                icon: "😨",
                type: "negative",
                bonuses: {
                    speed: 0.1, // +10% speed (to run away)
                    attack: -0.15 // -15% attack
                },
                effects: {
                    retreatChance: 0.2 // +20% chance to retreat from battle
                }
            },
            GREEDY: {
                name: "Greedy",
                description: "Always seeking personal gain",
                icon: "💰",
                type: "negative",
                bonuses: {
                    luck: 0.1, // +10% luck (for finding treasure)
                    loyalty: -0.2 // -20% loyalty
                },
                effects: {
                    resourceCost: 0.15 // +15% resource cost for upkeep
                }
            },
            RECKLESS: {
                name: "Reckless",
                description: "Acts without thinking of consequences",
                icon: "💥",
                type: "negative",
                bonuses: {
                    attack: 0.15, // +15% attack
                    defense: -0.2 // -20% defense
                },
                effects: {
                    injuryChance: 0.15 // +15% chance of injury in combat
                }
            }
        };
    }
    
    /**
     * Get all available traits
     * @returns {Object} - All traits
     */
    getAllTraits() {
        return this.traits;
    }
    
    /**
     * Get traits by type
     * @param {string} type - The type to filter by (positive, neutral, negative)
     * @returns {Object} - Traits of the specified type
     */
    getTraitsByType(type) {
        const result = {};
        
        for (const [id, trait] of Object.entries(this.traits)) {
            if (trait.type === type) {
                result[id] = trait;
            }
        }
        
        return result;
    }
    
    /**
     * Get a trait by ID
     * @param {string} traitId - The trait ID
     * @returns {Object|null} - The trait or null if not found
     */
    getTrait(traitId) {
        return this.traits[traitId] || null;
    }
    
    /**
     * Generate random traits for a hero
     * @param {number} positiveCount - Number of positive traits
     * @param {number} neutralCount - Number of neutral traits
     * @param {number} negativeCount - Number of negative traits
     * @returns {Array} - Array of trait IDs
     */
    generateRandomTraits(positiveCount = 1, neutralCount = 1, negativeCount = 1) {
        const positiveTraits = Object.keys(this.getTraitsByType('positive'));
        const neutralTraits = Object.keys(this.getTraitsByType('neutral'));
        const negativeTraits = Object.keys(this.getTraitsByType('negative'));
        
        const selectedTraits = [];
        
        // Helper function to get random items from an array
        const getRandomItems = (array, count) => {
            const shuffled = [...array].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };
        
        // Select traits
        selectedTraits.push(...getRandomItems(positiveTraits, positiveCount));
        selectedTraits.push(...getRandomItems(neutralTraits, neutralCount));
        selectedTraits.push(...getRandomItems(negativeTraits, negativeCount));
        
        return selectedTraits;
    }
    
    /**
     * Assign traits to a hero
     * @param {string} heroId - The hero ID
     * @param {Array} traitIds - Array of trait IDs to assign
     * @returns {boolean} - Success or failure
     */
    assignTraits(heroId, traitIds) {
        const hero = this.heroManager.getHeroById(heroId);
        
        if (!hero) {
            return false;
        }
        
        // Initialize traits array if it doesn't exist
        if (!hero.traits) {
            hero.traits = [];
        }
        
        // Add new traits
        for (const traitId of traitIds) {
            if (this.traits[traitId] && !hero.traits.includes(traitId)) {
                hero.traits.push(traitId);
                
                // Log the trait assignment
                this.gameState.activityLogManager.addLogEntry(
                    'Hero',
                    `${hero.name} has gained the ${this.traits[traitId].name} trait.`
                );
            }
        }
        
        return true;
    }
    
    /**
     * Remove a trait from a hero
     * @param {string} heroId - The hero ID
     * @param {string} traitId - The trait ID to remove
     * @returns {boolean} - Success or failure
     */
    removeTrait(heroId, traitId) {
        const hero = this.heroManager.getHeroById(heroId);
        
        if (!hero || !hero.traits) {
            return false;
        }
        
        const index = hero.traits.indexOf(traitId);
        if (index === -1) {
            return false;
        }
        
        // Remove the trait
        hero.traits.splice(index, 1);
        
        // Log the trait removal
        this.gameState.activityLogManager.addLogEntry(
            'Hero',
            `${hero.name} has lost the ${this.traits[traitId].name} trait.`
        );
        
        return true;
    }
    
    /**
     * Apply trait bonuses to hero stats
     * @param {Object} hero - The hero
     * @param {Object} stats - The hero's base stats
     * @returns {Object} - The modified stats
     */
    applyTraitBonuses(hero, stats) {
        if (!hero.traits || hero.traits.length === 0) {
            return stats;
        }
        
        const modifiedStats = { ...stats };
        
        // Apply bonuses from each trait
        for (const traitId of hero.traits) {
            const trait = this.getTrait(traitId);
            if (!trait || !trait.bonuses) {
                continue;
            }
            
            // Apply percentage bonuses
            for (const [stat, bonus] of Object.entries(trait.bonuses)) {
                if (modifiedStats[stat] !== undefined) {
                    modifiedStats[stat] *= (1 + bonus);
                } else {
                    modifiedStats[stat] = bonus;
                }
            }
        }
        
        return modifiedStats;
    }
    
    /**
     * Get all effects from a hero's traits
     * @param {string} heroId - The hero ID
     * @returns {Object} - Combined effects from all traits
     */
    getHeroTraitEffects(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.traits || hero.traits.length === 0) {
            return {};
        }
        
        const effects = {};
        
        // Combine effects from all traits
        for (const traitId of hero.traits) {
            const trait = this.getTrait(traitId);
            if (!trait || !trait.effects) {
                continue;
            }
            
            // Merge effects
            for (const [effect, value] of Object.entries(trait.effects)) {
                if (effects[effect] !== undefined) {
                    effects[effect] += value;
                } else {
                    effects[effect] = value;
                }
            }
        }
        
        return effects;
    }
    
    /**
     * Create UI for displaying hero traits
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    createTraitsUI(heroId, container) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.traits || hero.traits.length === 0 || !container) {
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Create traits section
        const traitsSection = document.createElement('div');
        traitsSection.className = 'hero-traits-section';
        
        // Add header
        const header = document.createElement('h4');
        header.textContent = 'Traits';
        traitsSection.appendChild(header);
        
        // Create traits container
        const traitsContainer = document.createElement('div');
        traitsContainer.className = 'traits-container';
        
        // Add each trait
        for (const traitId of hero.traits) {
            const trait = this.getTrait(traitId);
            if (!trait) continue;
            
            const traitElement = document.createElement('div');
            traitElement.className = `trait-item ${trait.type}`;
            traitElement.title = `${trait.name}: ${trait.description}`;
            
            traitElement.innerHTML = `
                <div class="trait-icon">${trait.icon}</div>
                <div class="trait-name">${trait.name}</div>
            `;
            
            traitsContainer.appendChild(traitElement);
        }
        
        traitsSection.appendChild(traitsContainer);
        container.appendChild(traitsSection);
    }
}

// HeroTraitsSystem class is now ready to be instantiated in main.js
