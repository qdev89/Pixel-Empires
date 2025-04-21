/**
 * Hero System for Pixel Empires
 * Handles hero units with special abilities, progression, and equipment
 */
class HeroManager {
    /**
     * Initialize the hero manager
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.heroes = []; // List of active heroes
        this.availableHeroes = []; // Heroes available for recruitment
        this.heroTypes = CONFIG.HEROES.TYPES;
        this.heroAbilities = CONFIG.HEROES.ABILITIES;
        this.heroEquipment = CONFIG.HEROES.EQUIPMENT;
        
        // Initialize with some available heroes for recruitment
        this.generateAvailableHeroes(3);
    }
    
    /**
     * Generate a list of heroes available for recruitment
     * @param {number} count - Number of heroes to generate
     */
    generateAvailableHeroes(count) {
        this.availableHeroes = [];
        
        for (let i = 0; i < count; i++) {
            // Get random hero type
            const heroTypeKeys = Object.keys(this.heroTypes);
            const randomType = heroTypeKeys[Math.floor(Math.random() * heroTypeKeys.length)];
            const heroType = this.heroTypes[randomType];
            
            // Generate hero with random traits
            const hero = this.generateHero(randomType, heroType);
            
            // Add to available heroes
            this.availableHeroes.push(hero);
        }
    }
    
    /**
     * Generate a new hero
     * @param {string} typeId - Hero type ID
     * @param {Object} heroType - Hero type data
     * @returns {Object} - New hero object
     */
    generateHero(typeId, heroType) {
        // Generate unique ID
        const heroId = `hero_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Generate random name based on hero type
        const name = this.generateHeroName(heroType.namePrefixes, heroType.nameSuffixes);
        
        // Generate random traits
        const traits = this.generateHeroTraits(heroType.possibleTraits);
        
        // Create hero object
        const hero = {
            id: heroId,
            name: name,
            type: typeId,
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            stats: { ...heroType.baseStats },
            abilities: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            traits: traits,
            status: 'available', // available, active, resting, injured
            location: null, // Current map location
            portrait: heroType.portrait || '👤',
            specialization: heroType.specialization,
            description: heroType.description,
            recruitCost: this.calculateRecruitCost(heroType),
            inventory: []
        };
        
        // Add starting ability if available
        if (heroType.startingAbility) {
            hero.abilities.push(heroType.startingAbility);
        }
        
        return hero;
    }
    
    /**
     * Generate a random hero name
     * @param {Array} prefixes - List of name prefixes
     * @param {Array} suffixes - List of name suffixes
     * @returns {string} - Generated name
     */
    generateHeroName(prefixes, suffixes) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix} ${suffix}`;
    }
    
    /**
     * Generate random traits for a hero
     * @param {Array} possibleTraits - List of possible traits
     * @returns {Array} - Selected traits
     */
    generateHeroTraits(possibleTraits) {
        const traitCount = 1 + Math.floor(Math.random() * 2); // 1-2 traits
        const selectedTraits = [];
        
        // Copy and shuffle possible traits
        const shuffledTraits = [...possibleTraits].sort(() => 0.5 - Math.random());
        
        // Select random traits
        for (let i = 0; i < Math.min(traitCount, shuffledTraits.length); i++) {
            selectedTraits.push(shuffledTraits[i]);
        }
        
        return selectedTraits;
    }
    
    /**
     * Calculate recruitment cost for a hero
     * @param {Object} heroType - Hero type data
     * @returns {Object} - Recruitment cost
     */
    calculateRecruitCost(heroType) {
        return {
            FOOD: heroType.baseCost.FOOD + Math.floor(Math.random() * 50),
            ORE: heroType.baseCost.ORE + Math.floor(Math.random() * 30)
        };
    }
    
    /**
     * Recruit a hero from the available heroes
     * @param {string} heroId - ID of the hero to recruit
     * @returns {boolean} - Success or failure
     */
    recruitHero(heroId) {
        // Find hero in available heroes
        const heroIndex = this.availableHeroes.findIndex(h => h.id === heroId);
        
        if (heroIndex === -1) {
            console.log(`Hero ${heroId} not found in available heroes`);
            return false;
        }
        
        const hero = this.availableHeroes[heroIndex];
        
        // Check if we have enough resources
        if (this.gameState.resources.FOOD < hero.recruitCost.FOOD || 
            this.gameState.resources.ORE < hero.recruitCost.ORE) {
            console.log(`Not enough resources to recruit ${hero.name}`);
            return false;
        }
        
        // Check if we have reached the hero limit
        if (this.heroes.length >= CONFIG.HEROES.MAX_HEROES) {
            console.log(`Maximum number of heroes reached (${CONFIG.HEROES.MAX_HEROES})`);
            return false;
        }
        
        // Deduct resources
        this.gameState.resources.FOOD -= hero.recruitCost.FOOD;
        this.gameState.resources.ORE -= hero.recruitCost.ORE;
        
        // Add hero to active heroes
        hero.status = 'active';
        this.heroes.push(hero);
        
        // Remove from available heroes
        this.availableHeroes.splice(heroIndex, 1);
        
        // Log recruitment
        this.gameState.activityLogManager.addLogEntry(
            'Hero', 
            `Recruited ${hero.name}, a level ${hero.level} ${this.heroTypes[hero.type].name}`
        );
        
        // Generate a new hero to replace the recruited one
        this.generateAvailableHeroes(1);
        
        // Trigger state change
        this.gameState.onStateChange();
        
        return true;
    }
    
    /**
     * Dismiss a hero from active service
     * @param {string} heroId - ID of the hero to dismiss
     * @returns {boolean} - Success or failure
     */
    dismissHero(heroId) {
        // Find hero in active heroes
        const heroIndex = this.heroes.findIndex(h => h.id === heroId);
        
        if (heroIndex === -1) {
            console.log(`Hero ${heroId} not found in active heroes`);
            return false;
        }
        
        const hero = this.heroes[heroIndex];
        
        // Remove hero from active heroes
        this.heroes.splice(heroIndex, 1);
        
        // Log dismissal
        this.gameState.activityLogManager.addLogEntry(
            'Hero', 
            `Dismissed ${hero.name}, a level ${hero.level} ${this.heroTypes[hero.type].name}`
        );
        
        // Trigger state change
        this.gameState.onStateChange();
        
        return true;
    }
    
    /**
     * Assign a hero to a location on the map
     * @param {string} heroId - ID of the hero to assign
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - Success or failure
     */
    assignHeroToLocation(heroId, x, y) {
        // Find hero
        const hero = this.heroes.find(h => h.id === heroId);
        
        if (!hero) {
            console.log(`Hero ${heroId} not found`);
            return false;
        }
        
        // Check if hero is available
        if (hero.status !== 'active') {
            console.log(`Hero ${hero.name} is not available (status: ${hero.status})`);
            return false;
        }
        
        // Assign to location
        hero.location = { x, y };
        
        // Log assignment
        this.gameState.activityLogManager.addLogEntry(
            'Hero', 
            `Assigned ${hero.name} to location (${x}, ${y})`
        );
        
        // Trigger state change
        this.gameState.onStateChange();
        
        return true;
    }
    
    /**
     * Add experience to a hero
     * @param {string} heroId - ID of the hero
     * @param {number} amount - Amount of experience to add
     * @returns {boolean} - Whether the hero leveled up
     */
    addHeroExperience(heroId, amount) {
        // Find hero
        const hero = this.heroes.find(h => h.id === heroId);
        
        if (!hero) {
            console.log(`Hero ${heroId} not found`);
            return false;
        }
        
        // Add experience
        hero.experience += amount;
        
        // Check for level up
        let leveledUp = false;
        
        while (hero.experience >= hero.experienceToNextLevel) {
            // Level up
            hero.level++;
            hero.experience -= hero.experienceToNextLevel;
            
            // Increase experience required for next level
            hero.experienceToNextLevel = Math.floor(hero.experienceToNextLevel * 1.5);
            
            // Increase stats
            this.improveHeroStats(hero);
            
            // Check for new abilities
            this.checkForNewAbilities(hero);
            
            leveledUp = true;
            
            // Log level up
            this.gameState.activityLogManager.addLogEntry(
                'Hero', 
                `${hero.name} reached level ${hero.level}!`
            );
        }
        
        // Trigger state change if leveled up
        if (leveledUp) {
            this.gameState.onStateChange();
        }
        
        return leveledUp;
    }
    
    /**
     * Improve hero stats on level up
     * @param {Object} hero - Hero object
     */
    improveHeroStats(hero) {
        const heroType = this.heroTypes[hero.type];
        
        // Increase stats based on hero type growth rates
        for (const [stat, value] of Object.entries(heroType.growthRates)) {
            hero.stats[stat] += value;
        }
    }
    
    /**
     * Check if hero should learn new abilities on level up
     * @param {Object} hero - Hero object
     */
    checkForNewAbilities(hero) {
        const heroType = this.heroTypes[hero.type];
        
        // Check for level-based abilities
        if (heroType.abilities) {
            for (const ability of heroType.abilities) {
                if (ability.unlockLevel === hero.level && !hero.abilities.includes(ability.id)) {
                    // Add new ability
                    hero.abilities.push(ability.id);
                    
                    // Log new ability
                    this.gameState.activityLogManager.addLogEntry(
                        'Hero', 
                        `${hero.name} learned a new ability: ${this.heroAbilities[ability.id].name}!`
                    );
                }
            }
        }
    }
    
    /**
     * Equip an item on a hero
     * @param {string} heroId - ID of the hero
     * @param {string} itemId - ID of the item to equip
     * @param {string} slot - Equipment slot (weapon, armor, accessory)
     * @returns {boolean} - Success or failure
     */
    equipItem(heroId, itemId, slot) {
        // Find hero
        const hero = this.heroes.find(h => h.id === heroId);
        
        if (!hero) {
            console.log(`Hero ${heroId} not found`);
            return false;
        }
        
        // Find item in hero's inventory
        const itemIndex = hero.inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
            console.log(`Item ${itemId} not found in hero's inventory`);
            return false;
        }
        
        const item = hero.inventory[itemIndex];
        
        // Check if item can be equipped in the specified slot
        if (item.type !== slot) {
            console.log(`Item ${item.name} cannot be equipped in ${slot} slot`);
            return false;
        }
        
        // Unequip current item if any
        if (hero.equipment[slot]) {
            // Add current equipment back to inventory
            hero.inventory.push(hero.equipment[slot]);
        }
        
        // Equip new item
        hero.equipment[slot] = item;
        
        // Remove from inventory
        hero.inventory.splice(itemIndex, 1);
        
        // Log equipment change
        this.gameState.activityLogManager.addLogEntry(
            'Hero', 
            `${hero.name} equipped ${item.name}`
        );
        
        // Trigger state change
        this.gameState.onStateChange();
        
        return true;
    }
    
    /**
     * Unequip an item from a hero
     * @param {string} heroId - ID of the hero
     * @param {string} slot - Equipment slot (weapon, armor, accessory)
     * @returns {boolean} - Success or failure
     */
    unequipItem(heroId, slot) {
        // Find hero
        const hero = this.heroes.find(h => h.id === heroId);
        
        if (!hero) {
            console.log(`Hero ${heroId} not found`);
            return false;
        }
        
        // Check if hero has an item equipped in the slot
        if (!hero.equipment[slot]) {
            console.log(`No item equipped in ${slot} slot`);
            return false;
        }
        
        // Add equipped item to inventory
        hero.inventory.push(hero.equipment[slot]);
        
        // Unequip item
        const itemName = hero.equipment[slot].name;
        hero.equipment[slot] = null;
        
        // Log unequip
        this.gameState.activityLogManager.addLogEntry(
            'Hero', 
            `${hero.name} unequipped ${itemName}`
        );
        
        // Trigger state change
        this.gameState.onStateChange();
        
        return true;
    }
    
    /**
     * Use a hero ability
     * @param {string} heroId - ID of the hero
     * @param {string} abilityId - ID of the ability to use
     * @param {Object} target - Target for the ability
     * @returns {Object} - Result of using the ability
     */
    useHeroAbility(heroId, abilityId, target) {
        // Find hero
        const hero = this.heroes.find(h => h.id === heroId);
        
        if (!hero) {
            console.log(`Hero ${heroId} not found`);
            return { success: false, message: 'Hero not found' };
        }
        
        // Check if hero has the ability
        if (!hero.abilities.includes(abilityId)) {
            console.log(`Hero ${hero.name} does not have ability ${abilityId}`);
            return { success: false, message: 'Hero does not have this ability' };
        }
        
        // Get ability data
        const ability = this.heroAbilities[abilityId];
        
        if (!ability) {
            console.log(`Ability ${abilityId} not found`);
            return { success: false, message: 'Ability not found' };
        }
        
        // Check if hero is in the right status to use abilities
        if (hero.status !== 'active') {
            console.log(`Hero ${hero.name} cannot use abilities (status: ${hero.status})`);
            return { success: false, message: `Hero cannot use abilities (${hero.status})` };
        }
        
        // Apply ability effect based on type
        let result = { success: true, message: '', effects: [] };
        
        switch (ability.type) {
            case 'combat':
                result = this.applyCombatAbility(hero, ability, target);
                break;
                
            case 'support':
                result = this.applySupportAbility(hero, ability, target);
                break;
                
            case 'exploration':
                result = this.applyExplorationAbility(hero, ability, target);
                break;
                
            default:
                console.log(`Unknown ability type: ${ability.type}`);
                return { success: false, message: 'Unknown ability type' };
        }
        
        // Log ability use
        if (result.success) {
            this.gameState.activityLogManager.addLogEntry(
                'Hero', 
                `${hero.name} used ${ability.name}`
            );
        }
        
        // Trigger state change
        this.gameState.onStateChange();
        
        return result;
    }
    
    /**
     * Apply a combat ability
     * @param {Object} hero - Hero object
     * @param {Object} ability - Ability data
     * @param {Object} target - Target for the ability
     * @returns {Object} - Result of using the ability
     */
    applyCombatAbility(hero, ability, target) {
        // Implementation will depend on combat system integration
        // For now, return a placeholder result
        return {
            success: true,
            message: `${hero.name} used ${ability.name} in combat`,
            effects: [
                { type: 'damage', value: ability.power * hero.stats.attack }
            ]
        };
    }
    
    /**
     * Apply a support ability
     * @param {Object} hero - Hero object
     * @param {Object} ability - Ability data
     * @param {Object} target - Target for the ability
     * @returns {Object} - Result of using the ability
     */
    applySupportAbility(hero, ability, target) {
        // Implementation will depend on support system integration
        // For now, return a placeholder result
        return {
            success: true,
            message: `${hero.name} used ${ability.name} for support`,
            effects: [
                { type: 'buff', stat: ability.targetStat, value: ability.power }
            ]
        };
    }
    
    /**
     * Apply an exploration ability
     * @param {Object} hero - Hero object
     * @param {Object} ability - Ability data
     * @param {Object} target - Target for the ability
     * @returns {Object} - Result of using the ability
     */
    applyExplorationAbility(hero, ability, target) {
        // Implementation will depend on exploration system integration
        // For now, return a placeholder result
        return {
            success: true,
            message: `${hero.name} used ${ability.name} for exploration`,
            effects: [
                { type: 'reveal', radius: ability.power }
            ]
        };
    }
    
    /**
     * Get all active heroes
     * @returns {Array} - List of active heroes
     */
    getActiveHeroes() {
        return this.heroes;
    }
    
    /**
     * Get heroes available for recruitment
     * @returns {Array} - List of available heroes
     */
    getAvailableHeroes() {
        return this.availableHeroes;
    }
    
    /**
     * Get a specific hero by ID
     * @param {string} heroId - ID of the hero
     * @returns {Object|null} - Hero object or null if not found
     */
    getHeroById(heroId) {
        return this.heroes.find(h => h.id === heroId) || null;
    }
    
    /**
     * Calculate hero's total stats including equipment bonuses
     * @param {string} heroId - ID of the hero
     * @returns {Object} - Total stats
     */
    calculateHeroTotalStats(heroId) {
        const hero = this.getHeroById(heroId);
        
        if (!hero) {
            console.log(`Hero ${heroId} not found`);
            return null;
        }
        
        // Start with base stats
        const totalStats = { ...hero.stats };
        
        // Add equipment bonuses
        for (const [slot, item] of Object.entries(hero.equipment)) {
            if (item && item.bonuses) {
                for (const [stat, bonus] of Object.entries(item.bonuses)) {
                    totalStats[stat] = (totalStats[stat] || 0) + bonus;
                }
            }
        }
        
        // Add trait bonuses
        for (const trait of hero.traits) {
            if (trait.bonuses) {
                for (const [stat, bonus] of Object.entries(trait.bonuses)) {
                    totalStats[stat] = (totalStats[stat] || 0) + bonus;
                }
            }
        }
        
        return totalStats;
    }
    
    /**
     * Update heroes (called on each game tick)
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Process hero recovery
        for (const hero of this.heroes) {
            if (hero.status === 'resting') {
                // Recover hero over time
                hero.restTime -= deltaTime;
                
                if (hero.restTime <= 0) {
                    hero.status = 'active';
                    
                    // Log recovery
                    this.gameState.activityLogManager.addLogEntry(
                        'Hero', 
                        `${hero.name} has recovered and is ready for action`
                    );
                }
            }
        }
        
        // Refresh available heroes periodically
        this.refreshTimer = (this.refreshTimer || 0) + deltaTime;
        
        if (this.refreshTimer >= CONFIG.HEROES.REFRESH_INTERVAL) {
            this.refreshTimer = 0;
            
            // Refresh one hero
            if (this.availableHeroes.length > 0) {
                this.availableHeroes.shift();
                this.generateAvailableHeroes(1);
            }
        }
    }
    
    /**
     * Save hero data to game state
     * @returns {Object} - Hero data for saving
     */
    getSaveData() {
        return {
            heroes: this.heroes,
            availableHeroes: this.availableHeroes,
            refreshTimer: this.refreshTimer
        };
    }
    
    /**
     * Load hero data from game state
     * @param {Object} data - Saved hero data
     */
    loadSaveData(data) {
        if (data) {
            this.heroes = data.heroes || [];
            this.availableHeroes = data.availableHeroes || [];
            this.refreshTimer = data.refreshTimer || 0;
        }
    }
}

// Export the HeroManager class
if (typeof module !== 'undefined') {
    module.exports = { HeroManager };
}
