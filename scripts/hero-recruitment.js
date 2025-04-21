/**
 * Hero Recruitment System
 * Handles hero recruitment, tavern mechanics, and hero availability
 */
class HeroRecruitmentSystem {
    /**
     * Initialize the hero recruitment system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        
        // Available heroes for recruitment
        this.availableHeroes = [];
        
        // Maximum number of heroes available at once
        this.maxAvailableHeroes = 3;
        
        // Time between hero refreshes (in milliseconds)
        this.refreshTime = 3600000; // 1 hour
        
        // Last refresh time
        this.lastRefreshTime = Date.now();
        
        // Recruitment costs by rarity
        this.recruitmentCosts = {
            common: { GOLD: 100 },
            uncommon: { GOLD: 250 },
            rare: { GOLD: 500 },
            epic: { GOLD: 1000 },
            legendary: { GOLD: 2500 }
        };
        
        // Manual refresh cost
        this.refreshCost = { GOLD: 50 };
        
        // Initialize available heroes
        this.refreshAvailableHeroes();
    }
    
    /**
     * Refresh the list of available heroes
     * @param {boolean} forced - Whether this is a forced refresh (costs resources)
     * @returns {Object} - Result of the refresh
     */
    refreshAvailableHeroes(forced = false) {
        const now = Date.now();
        
        // Check if enough time has passed for a free refresh
        const timeSinceLastRefresh = now - this.lastRefreshTime;
        const freeRefreshAvailable = timeSinceLastRefresh >= this.refreshTime;
        
        // If this is a forced refresh and not enough time has passed, check resources
        if (forced && !freeRefreshAvailable) {
            // Check if player has enough resources
            for (const [resource, amount] of Object.entries(this.refreshCost)) {
                if (this.gameState.resources[resource] < amount) {
                    return { 
                        success: false, 
                        message: `Not enough ${resource.toLowerCase()}. Need ${amount}.` 
                    };
                }
            }
            
            // Deduct resources
            for (const [resource, amount] of Object.entries(this.refreshCost)) {
                this.gameState.resources[resource] -= amount;
            }
        }
        
        // Clear current available heroes
        this.availableHeroes = [];
        
        // Generate new heroes
        for (let i = 0; i < this.maxAvailableHeroes; i++) {
            const hero = this.generateRecruitableHero();
            this.availableHeroes.push(hero);
        }
        
        // Update last refresh time
        this.lastRefreshTime = now;
        
        return { 
            success: true, 
            message: forced ? "Heroes refreshed (paid)" : "Heroes refreshed",
            heroes: this.availableHeroes
        };
    }
    
    /**
     * Generate a random hero for recruitment
     * @returns {Object} - The generated hero
     */
    generateRecruitableHero() {
        // Determine hero rarity
        const rarity = this.determineHeroRarity();
        
        // Generate hero type
        const heroTypes = Object.keys(this.heroManager.heroTypes);
        const type = heroTypes[Math.floor(Math.random() * heroTypes.length)];
        
        // Get hero type data
        const typeData = this.heroManager.heroTypes[type];
        
        // Generate hero name
        const name = this.generateHeroName(type);
        
        // Generate hero portrait
        const portrait = typeData.portraits[Math.floor(Math.random() * typeData.portraits.length)];
        
        // Generate hero level (1 for now)
        const level = 1;
        
        // Generate hero stats based on type and rarity
        const stats = this.generateHeroStats(type, rarity, level);
        
        // Generate hero traits
        let traits = [];
        if (this.gameState.heroTraitsSystem) {
            // More positive traits for higher rarities
            const positiveCount = Math.min(2, Math.max(1, Math.floor(this.getRarityValue(rarity) / 2)));
            const neutralCount = 1;
            const negativeCount = Math.max(0, 2 - positiveCount);
            
            traits = this.gameState.heroTraitsSystem.generateRandomTraits(
                positiveCount, neutralCount, negativeCount
            );
        }
        
        // Generate hero abilities
        const abilities = this.generateHeroAbilities(type, rarity);
        
        // Create hero object
        const hero = {
            id: `hero_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name,
            type,
            portrait,
            level,
            experience: 0,
            stats,
            abilities,
            traits,
            rarity,
            status: 'recruitable',
            recruitmentCost: this.getRecruitmentCost(rarity)
        };
        
        return hero;
    }
    
    /**
     * Determine the rarity of a generated hero
     * @returns {string} - The hero rarity
     */
    determineHeroRarity() {
        const rarityChances = {
            common: 0.5,     // 50%
            uncommon: 0.3,   // 30%
            rare: 0.15,      // 15%
            epic: 0.04,      // 4%
            legendary: 0.01  // 1%
        };
        
        const roll = Math.random();
        let cumulativeChance = 0;
        
        for (const [rarity, chance] of Object.entries(rarityChances)) {
            cumulativeChance += chance;
            if (roll < cumulativeChance) {
                return rarity;
            }
        }
        
        return 'common'; // Fallback
    }
    
    /**
     * Generate a name for a hero
     * @param {string} type - The hero type
     * @returns {string} - The generated name
     */
    generateHeroName(type) {
        // First names
        const firstNames = {
            male: [
                "Alaric", "Brom", "Cedric", "Darian", "Eadric", "Finn", "Gareth", "Hadrian",
                "Ivan", "Jorah", "Kael", "Leif", "Magnus", "Nolan", "Orion", "Percival",
                "Quentin", "Roland", "Silas", "Tristan", "Ulric", "Varian", "Wulfric", "Yorath",
                "Zephyr"
            ],
            female: [
                "Aria", "Brienne", "Celia", "Delia", "Elara", "Freya", "Gwendolyn", "Helena",
                "Isolde", "Jaina", "Kira", "Lyra", "Mira", "Nessa", "Ophelia", "Phoebe",
                "Quinn", "Rhea", "Seraphina", "Thea", "Una", "Valeria", "Willow", "Xandra",
                "Yara", "Zara"
            ]
        };
        
        // Last names
        const lastNames = [
            "Blackwood", "Crowley", "Dawnbringer", "Emberforge", "Frostborn", "Grimheart",
            "Highwind", "Ironshield", "Jadefire", "Knightfall", "Lightbringer", "Moonshadow",
            "Nightwalker", "Oakenheart", "Proudmoore", "Quicksilver", "Ravencrest", "Silverhand",
            "Thorngage", "Undercroft", "Voidwalker", "Whitestar", "Yelloweye", "Zephyrheart"
        ];
        
        // Type-specific titles
        const titles = {
            WARRIOR: ["the Brave", "the Strong", "the Valiant", "the Mighty", "the Bold"],
            ARCHER: ["the Swift", "the Precise", "the Hawk-eyed", "the Sharp", "the Ranger"],
            MAGE: ["the Wise", "the Arcane", "the Mystical", "the Learned", "the Sage"],
            HEALER: ["the Merciful", "the Blessed", "the Divine", "the Pious", "the Devoted"],
            ROGUE: ["the Silent", "the Shadow", "the Cunning", "the Nimble", "the Elusive"],
            PALADIN: ["the Righteous", "the Just", "the Holy", "the Radiant", "the Virtuous"]
        };
        
        // Determine gender (50/50 chance)
        const gender = Math.random() < 0.5 ? 'male' : 'female';
        
        // Get random names
        const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        // 30% chance to add a title
        if (Math.random() < 0.3 && titles[type]) {
            const title = titles[type][Math.floor(Math.random() * titles[type].length)];
            return `${firstName} ${title}`;
        }
        
        // 70% chance for first + last name
        return `${firstName} ${lastName}`;
    }
    
    /**
     * Generate stats for a hero
     * @param {string} type - The hero type
     * @param {string} rarity - The hero rarity
     * @param {number} level - The hero level
     * @returns {Object} - The generated stats
     */
    generateHeroStats(type, rarity, level) {
        // Get base stats from hero type
        const typeData = this.heroManager.heroTypes[type];
        if (!typeData || !typeData.baseStats) {
            return { attack: 5, defense: 5, leadership: 5 };
        }
        
        // Get rarity multiplier
        const rarityMultiplier = this.getRarityMultiplier(rarity);
        
        // Calculate stats
        const stats = {};
        
        for (const [stat, value] of Object.entries(typeData.baseStats)) {
            // Apply rarity bonus
            const rarityBonus = value * (rarityMultiplier - 1);
            
            // Apply level scaling
            const levelBonus = (level - 1) * typeData.statGrowth[stat];
            
            // Calculate final value
            stats[stat] = Math.round(value + rarityBonus + levelBonus);
        }
        
        return stats;
    }
    
    /**
     * Generate abilities for a hero
     * @param {string} type - The hero type
     * @param {string} rarity - The hero rarity
     * @returns {Array} - The generated abilities
     */
    generateHeroAbilities(type, rarity) {
        // Get available abilities
        const availableAbilities = [];
        
        // Add type-specific abilities
        if (this.heroManager.heroTypes[type] && this.heroManager.heroTypes[type].abilities) {
            availableAbilities.push(...this.heroManager.heroTypes[type].abilities);
        }
        
        // Add generic abilities
        if (this.heroManager.genericAbilities) {
            availableAbilities.push(...this.heroManager.genericAbilities);
        }
        
        if (availableAbilities.length === 0) {
            return [];
        }
        
        // Determine number of abilities based on rarity
        const abilityCount = Math.min(
            availableAbilities.length,
            Math.max(1, Math.floor(this.getRarityValue(rarity) / 2))
        );
        
        // Shuffle abilities and take the first few
        const shuffled = [...availableAbilities].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, abilityCount);
    }
    
    /**
     * Get the recruitment cost for a hero
     * @param {string} rarity - The hero rarity
     * @returns {Object} - The recruitment cost
     */
    getRecruitmentCost(rarity) {
        return this.recruitmentCosts[rarity] || this.recruitmentCosts.common;
    }
    
    /**
     * Get a numeric value for a rarity
     * @param {string} rarity - The rarity
     * @returns {number} - The rarity value
     */
    getRarityValue(rarity) {
        const rarityValues = {
            common: 1,
            uncommon: 2,
            rare: 3,
            epic: 4,
            legendary: 5
        };
        
        return rarityValues[rarity] || 1;
    }
    
    /**
     * Get a multiplier for a rarity
     * @param {string} rarity - The rarity
     * @returns {number} - The rarity multiplier
     */
    getRarityMultiplier(rarity) {
        const rarityMultipliers = {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 3.0
        };
        
        return rarityMultipliers[rarity] || 1.0;
    }
    
    /**
     * Recruit a hero
     * @param {number} index - The index of the hero in the available heroes list
     * @returns {Object} - Result of the recruitment
     */
    recruitHero(index) {
        // Check if index is valid
        if (index < 0 || index >= this.availableHeroes.length) {
            return { 
                success: false, 
                message: "Invalid hero index." 
            };
        }
        
        // Get the hero
        const hero = this.availableHeroes[index];
        
        // Check if player has enough resources
        for (const [resource, amount] of Object.entries(hero.recruitmentCost)) {
            if (this.gameState.resources[resource] < amount) {
                return { 
                    success: false, 
                    message: `Not enough ${resource.toLowerCase()}. Need ${amount}.` 
                };
            }
        }
        
        // Deduct resources
        for (const [resource, amount] of Object.entries(hero.recruitmentCost)) {
            this.gameState.resources[resource] -= amount;
        }
        
        // Update hero status
        hero.status = 'active';
        
        // Add hero to the player's roster
        this.heroManager.addHero(hero);
        
        // Remove hero from available heroes
        this.availableHeroes.splice(index, 1);
        
        // Log the recruitment
        this.gameState.activityLogManager.addLogEntry(
            'Hero',
            `Recruited ${hero.name}, a ${hero.rarity} ${this.heroManager.heroTypes[hero.type].name}.`
        );
        
        return { 
            success: true, 
            message: `Successfully recruited ${hero.name}!`,
            hero: hero
        };
    }
    
    /**
     * Create UI for the tavern (hero recruitment)
     * @param {HTMLElement} container - The container element
     */
    createTavernUI(container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create tavern header
        const tavernHeader = document.createElement('div');
        tavernHeader.className = 'tavern-header';
        
        // Calculate time until next free refresh
        const timeUntilRefresh = Math.max(0, this.refreshTime - (Date.now() - this.lastRefreshTime));
        const minutesUntilRefresh = Math.ceil(timeUntilRefresh / 60000);
        
        tavernHeader.innerHTML = `
            <h3>Tavern</h3>
            <div class="tavern-refresh-info">
                <span>Next free refresh in: ${minutesUntilRefresh} minutes</span>
                <button id="refresh-heroes-button" class="refresh-button">
                    Refresh Heroes (${this.refreshCost.GOLD} Gold)
                </button>
            </div>
        `;
        
        container.appendChild(tavernHeader);
        
        // Create heroes container
        const heroesContainer = document.createElement('div');
        heroesContainer.className = 'tavern-heroes-container';
        
        // Add available heroes
        if (this.availableHeroes.length === 0) {
            heroesContainer.innerHTML = '<div class="no-heroes">No heroes available for recruitment</div>';
        } else {
            for (let i = 0; i < this.availableHeroes.length; i++) {
                const hero = this.availableHeroes[i];
                const heroCard = this.createHeroRecruitmentCard(hero, i);
                heroesContainer.appendChild(heroCard);
            }
        }
        
        container.appendChild(heroesContainer);
        
        // Add event listeners
        const refreshButton = document.getElementById('refresh-heroes-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                const result = this.refreshAvailableHeroes(true);
                
                if (result.success) {
                    // Refresh the UI
                    this.createTavernUI(container);
                } else {
                    // Show error message
                    alert(result.message);
                }
            });
        }
    }
    
    /**
     * Create a hero recruitment card
     * @param {Object} hero - The hero
     * @param {number} index - The index of the hero
     * @returns {HTMLElement} - The hero card element
     */
    createHeroRecruitmentCard(hero, index) {
        const heroCard = document.createElement('div');
        heroCard.className = `tavern-hero-card ${hero.rarity}`;
        heroCard.dataset.index = index;
        
        // Get hero type data
        const typeData = this.heroManager.heroTypes[hero.type];
        
        // Format traits
        let traitsHtml = '';
        if (hero.traits && hero.traits.length > 0 && this.gameState.heroTraitsSystem) {
            traitsHtml = '<div class="hero-traits">';
            for (const traitId of hero.traits) {
                const trait = this.gameState.heroTraitsSystem.getTrait(traitId);
                if (trait) {
                    traitsHtml += `
                        <div class="trait-item ${trait.type}" title="${trait.name}: ${trait.description}">
                            <div class="trait-icon">${trait.icon}</div>
                        </div>
                    `;
                }
            }
            traitsHtml += '</div>';
        }
        
        // Format abilities
        let abilitiesHtml = '';
        if (hero.abilities && hero.abilities.length > 0) {
            abilitiesHtml = '<div class="hero-abilities">';
            for (const abilityId of hero.abilities) {
                const ability = this.heroManager.heroAbilities[abilityId];
                if (ability) {
                    abilitiesHtml += `
                        <div class="ability-item ${ability.type || 'unknown'}" title="${ability.name}: ${ability.description}">
                            <div class="ability-icon">${ability.icon || '✨'}</div>
                        </div>
                    `;
                }
            }
            abilitiesHtml += '</div>';
        }
        
        // Format recruitment cost
        let costHtml = '<div class="recruitment-cost">';
        for (const [resource, amount] of Object.entries(hero.recruitmentCost)) {
            costHtml += `<div class="cost-item">${amount} ${resource}</div>`;
        }
        costHtml += '</div>';
        
        // Create hero card content
        heroCard.innerHTML = `
            <div class="hero-rarity-badge">${this.formatRarity(hero.rarity)}</div>
            <div class="hero-portrait">${hero.portrait}</div>
            <div class="hero-info">
                <div class="hero-name">${hero.name}</div>
                <div class="hero-type">${typeData ? typeData.name : hero.type}</div>
                <div class="hero-stats">
                    <div class="hero-stat"><span class="stat-icon">⚔️</span> ${hero.stats.attack}</div>
                    <div class="hero-stat"><span class="stat-icon">🛡️</span> ${hero.stats.defense}</div>
                    <div class="hero-stat"><span class="stat-icon">👑</span> ${hero.stats.leadership}</div>
                </div>
                ${traitsHtml}
                ${abilitiesHtml}
                ${costHtml}
                <button class="recruit-button" data-index="${index}">Recruit</button>
            </div>
        `;
        
        // Add event listener to recruit button
        const recruitButton = heroCard.querySelector('.recruit-button');
        if (recruitButton) {
            recruitButton.addEventListener('click', () => {
                const result = this.recruitHero(index);
                
                if (result.success) {
                    // Show success message
                    alert(result.message);
                    
                    // Refresh the UI
                    this.createTavernUI(heroCard.parentNode.parentNode);
                } else {
                    // Show error message
                    alert(result.message);
                }
            });
        }
        
        return heroCard;
    }
    
    /**
     * Format a rarity for display
     * @param {string} rarity - The rarity
     * @returns {string} - The formatted rarity
     */
    formatRarity(rarity) {
        return rarity.charAt(0).toUpperCase() + rarity.slice(1);
    }
    
    /**
     * Update the recruitment system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Check if it's time for a free refresh
        const now = Date.now();
        const timeSinceLastRefresh = now - this.lastRefreshTime;
        
        if (timeSinceLastRefresh >= this.refreshTime) {
            // Refresh available heroes
            this.refreshAvailableHeroes();
        }
    }
}

// HeroRecruitmentSystem class is now ready to be instantiated in main.js
