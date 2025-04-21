/**
 * Hero Equipment Sets System for Pixel Empires
 * Handles equipment sets, set bonuses, and advanced equipment features
 */
class HeroEquipmentSetsSystem {
    /**
     * Initialize the hero equipment sets system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     * @param {HeroEquipmentSystem} equipmentSystem - The hero equipment system
     */
    constructor(gameState, heroManager, equipmentSystem) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        this.equipmentSystem = equipmentSystem;
        
        // Equipment sets
        this.equipmentSets = {
            // Warrior sets
            WARRIOR_MIGHT: {
                id: "WARRIOR_MIGHT",
                name: "Warrior's Might",
                description: "A set of equipment that enhances a warrior's strength and durability.",
                icon: "⚔️",
                heroTypes: ["WARRIOR"],
                pieces: [
                    { type: "weapon", id: "might_sword" },
                    { type: "armor", id: "might_armor" },
                    { type: "accessory", id: "might_amulet" }
                ],
                setBonuses: [
                    { pieces: 2, bonuses: { attack: 0.1, defense: 0.1 } },
                    { pieces: 3, bonuses: { attack: 0.2, defense: 0.2, health: 0.1 } }
                ]
            },
            
            BERSERKER_RAGE: {
                id: "BERSERKER_RAGE",
                name: "Berserker's Rage",
                description: "A set of equipment that enhances a warrior's offensive capabilities.",
                icon: "🔥",
                heroTypes: ["WARRIOR"],
                pieces: [
                    { type: "weapon", id: "rage_axe" },
                    { type: "armor", id: "rage_armor" },
                    { type: "accessory", id: "rage_pendant" }
                ],
                setBonuses: [
                    { pieces: 2, bonuses: { attack: 0.15, criticalChance: 0.05 } },
                    { pieces: 3, bonuses: { attack: 0.25, criticalChance: 0.1, criticalDamage: 0.2 } }
                ]
            },
            
            // Archer sets
            HUNTER_PRECISION: {
                id: "HUNTER_PRECISION",
                name: "Hunter's Precision",
                description: "A set of equipment that enhances an archer's accuracy and critical hits.",
                icon: "🏹",
                heroTypes: ["ARCHER"],
                pieces: [
                    { type: "weapon", id: "precision_bow" },
                    { type: "armor", id: "precision_armor" },
                    { type: "accessory", id: "precision_quiver" }
                ],
                setBonuses: [
                    { pieces: 2, bonuses: { criticalChance: 0.1, accuracy: 0.1 } },
                    { pieces: 3, bonuses: { criticalChance: 0.15, criticalDamage: 0.3, accuracy: 0.2 } }
                ]
            },
            
            RANGER_MOBILITY: {
                id: "RANGER_MOBILITY",
                name: "Ranger's Mobility",
                description: "A set of equipment that enhances an archer's speed and evasion.",
                icon: "💨",
                heroTypes: ["ARCHER"],
                pieces: [
                    { type: "weapon", id: "mobility_bow" },
                    { type: "armor", id: "mobility_armor" },
                    { type: "accessory", id: "mobility_boots" }
                ],
                setBonuses: [
                    { pieces: 2, bonuses: { speed: 0.15, evasion: 0.1 } },
                    { pieces: 3, bonuses: { speed: 0.25, evasion: 0.2, attackSpeed: 0.1 } }
                ]
            },
            
            // Mage sets
            ARCHMAGE_POWER: {
                id: "ARCHMAGE_POWER",
                name: "Archmage's Power",
                description: "A set of equipment that enhances a mage's magical power.",
                icon: "✨",
                heroTypes: ["MAGE"],
                pieces: [
                    { type: "weapon", id: "power_staff" },
                    { type: "armor", id: "power_robes" },
                    { type: "accessory", id: "power_orb" }
                ],
                setBonuses: [
                    { pieces: 2, bonuses: { magicPower: 0.15, manaRegeneration: 0.1 } },
                    { pieces: 3, bonuses: { magicPower: 0.3, manaRegeneration: 0.2, spellCritical: 0.1 } }
                ]
            },
            
            ELEMENTALIST_MASTERY: {
                id: "ELEMENTALIST_MASTERY",
                name: "Elementalist's Mastery",
                description: "A set of equipment that enhances a mage's elemental magic.",
                icon: "🌪️",
                heroTypes: ["MAGE"],
                pieces: [
                    { type: "weapon", id: "elemental_wand" },
                    { type: "armor", id: "elemental_robes" },
                    { type: "accessory", id: "elemental_focus" }
                ],
                setBonuses: [
                    { pieces: 2, bonuses: { elementalDamage: 0.15, spellPenetration: 0.1 } },
                    { pieces: 3, bonuses: { elementalDamage: 0.25, spellPenetration: 0.2, cooldownReduction: 0.1 } }
                ]
            },
            
            // Universal sets
            ANCIENT_POWER: {
                id: "ANCIENT_POWER",
                name: "Ancient Power",
                description: "A set of ancient artifacts that enhances any hero's abilities.",
                icon: "🏺",
                heroTypes: ["WARRIOR", "ARCHER", "MAGE"],
                pieces: [
                    { type: "weapon", id: "ancient_weapon" },
                    { type: "armor", id: "ancient_armor" },
                    { type: "accessory", id: "ancient_relic" },
                    { type: "artifact", id: "ancient_artifact" }
                ],
                setBonuses: [
                    { pieces: 2, bonuses: { attack: 0.1, defense: 0.1 } },
                    { pieces: 3, bonuses: { attack: 0.15, defense: 0.15, health: 0.1 } },
                    { pieces: 4, bonuses: { attack: 0.2, defense: 0.2, health: 0.15, specialAbilityPower: 0.2 } }
                ]
            },
            
            DRAGON_SLAYER: {
                id: "DRAGON_SLAYER",
                name: "Dragon Slayer",
                description: "A set of equipment forged from dragon parts, effective against powerful enemies.",
                icon: "🐉",
                heroTypes: ["WARRIOR", "ARCHER", "MAGE"],
                pieces: [
                    { type: "weapon", id: "dragon_weapon" },
                    { type: "armor", id: "dragon_armor" },
                    { type: "accessory", id: "dragon_talisman" }
                ],
                setBonuses: [
                    { pieces: 2, bonuses: { bossAttack: 0.2, damageReduction: 0.1 } },
                    { pieces: 3, bonuses: { bossAttack: 0.4, damageReduction: 0.2, fireResistance: 0.5 } }
                ]
            }
        };
        
        // Equipment set pieces
        this.setItems = {
            // Warrior's Might set
            might_sword: {
                id: "might_sword",
                name: "Sword of Might",
                description: "A powerful sword that enhances strength.",
                type: "weapon",
                icon: "🗡️",
                rarity: "rare",
                setId: "WARRIOR_MIGHT",
                bonuses: { attack: 15, strength: 10 }
            },
            might_armor: {
                id: "might_armor",
                name: "Armor of Might",
                description: "Heavy armor that provides excellent protection.",
                type: "armor",
                icon: "🛡️",
                rarity: "rare",
                setId: "WARRIOR_MIGHT",
                bonuses: { defense: 20, health: 50 }
            },
            might_amulet: {
                id: "might_amulet",
                name: "Amulet of Might",
                description: "An amulet that enhances physical power.",
                type: "accessory",
                icon: "📿",
                rarity: "rare",
                setId: "WARRIOR_MIGHT",
                bonuses: { strength: 15, health: 30 }
            },
            
            // Berserker's Rage set
            rage_axe: {
                id: "rage_axe",
                name: "Axe of Rage",
                description: "A fierce axe that deals devastating damage.",
                type: "weapon",
                icon: "🪓",
                rarity: "rare",
                setId: "BERSERKER_RAGE",
                bonuses: { attack: 20, criticalChance: 0.05 }
            },
            rage_armor: {
                id: "rage_armor",
                name: "Armor of Rage",
                description: "Light armor that allows for quick, powerful attacks.",
                type: "armor",
                icon: "👕",
                rarity: "rare",
                setId: "BERSERKER_RAGE",
                bonuses: { defense: 12, attackSpeed: 0.1 }
            },
            rage_pendant: {
                id: "rage_pendant",
                name: "Pendant of Rage",
                description: "A pendant that enhances fury in battle.",
                type: "accessory",
                icon: "🔮",
                rarity: "rare",
                setId: "BERSERKER_RAGE",
                bonuses: { criticalDamage: 0.2, berserkChance: 0.1 }
            },
            
            // Hunter's Precision set
            precision_bow: {
                id: "precision_bow",
                name: "Bow of Precision",
                description: "A finely crafted bow with exceptional accuracy.",
                type: "weapon",
                icon: "🏹",
                rarity: "rare",
                setId: "HUNTER_PRECISION",
                bonuses: { attack: 15, accuracy: 0.15 }
            },
            precision_armor: {
                id: "precision_armor",
                name: "Armor of Precision",
                description: "Light armor that doesn't hinder precise movements.",
                type: "armor",
                icon: "🧥",
                rarity: "rare",
                setId: "HUNTER_PRECISION",
                bonuses: { defense: 10, criticalChance: 0.1 }
            },
            precision_quiver: {
                id: "precision_quiver",
                name: "Quiver of Precision",
                description: "A quiver containing perfectly balanced arrows.",
                type: "accessory",
                icon: "🎯",
                rarity: "rare",
                setId: "HUNTER_PRECISION",
                bonuses: { criticalDamage: 0.2, accuracy: 0.1 }
            },
            
            // More set items...
            // (Additional set items would be defined here)
        };
    }
    
    /**
     * Get all equipment sets
     * @returns {Object} - All equipment sets
     */
    getAllEquipmentSets() {
        return this.equipmentSets;
    }
    
    /**
     * Get equipment sets suitable for a hero type
     * @param {string} heroType - The hero type
     * @returns {Array} - Suitable equipment sets
     */
    getEquipmentSetsForHeroType(heroType) {
        return Object.values(this.equipmentSets).filter(set => {
            return set.heroTypes.includes(heroType);
        });
    }
    
    /**
     * Get a specific equipment set
     * @param {string} setId - The set ID
     * @returns {Object|null} - The equipment set or null if not found
     */
    getEquipmentSet(setId) {
        return this.equipmentSets[setId] || null;
    }
    
    /**
     * Get a specific set item
     * @param {string} itemId - The item ID
     * @returns {Object|null} - The set item or null if not found
     */
    getSetItem(itemId) {
        return this.setItems[itemId] || null;
    }
    
    /**
     * Check if an item is part of a set
     * @param {Object} item - The item to check
     * @returns {Object|null} - The set the item belongs to, or null
     */
    getItemSet(item) {
        if (!item || !item.setId) return null;
        
        return this.getEquipmentSet(item.setId);
    }
    
    /**
     * Get the number of set pieces a hero has equipped
     * @param {string} heroId - The hero ID
     * @param {string} setId - The set ID
     * @returns {number} - The number of set pieces equipped
     */
    getEquippedSetPieces(heroId, setId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.equipment) return 0;
        
        let count = 0;
        
        // Check each equipment slot
        for (const slot of this.equipmentSystem.equipmentSlots) {
            const item = hero.equipment[slot];
            
            if (item && item.setId === setId) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * Get all set bonuses for a hero
     * @param {string} heroId - The hero ID
     * @returns {Object} - All active set bonuses
     */
    getHeroSetBonuses(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.equipment) return {};
        
        const setBonuses = {};
        const setsCounted = new Set();
        
        // Check each equipment slot
        for (const slot of this.equipmentSystem.equipmentSlots) {
            const item = hero.equipment[slot];
            
            if (item && item.setId && !setsCounted.has(item.setId)) {
                setsCounted.add(item.setId);
                
                // Get the set
                const set = this.getEquipmentSet(item.setId);
                if (!set) continue;
                
                // Count equipped pieces
                const equippedPieces = this.getEquippedSetPieces(heroId, item.setId);
                
                // Apply set bonuses
                for (const bonus of set.setBonuses) {
                    if (equippedPieces >= bonus.pieces) {
                        // Add set name to bonuses
                        if (!setBonuses[set.id]) {
                            setBonuses[set.id] = {
                                name: set.name,
                                pieces: equippedPieces,
                                bonuses: {}
                            };
                        }
                        
                        // Add bonuses
                        for (const [stat, value] of Object.entries(bonus.bonuses)) {
                            setBonuses[set.id].bonuses[stat] = value;
                        }
                    }
                }
            }
        }
        
        return setBonuses;
    }
    
    /**
     * Apply set bonuses to hero stats
     * @param {string} heroId - The hero ID
     * @param {Object} stats - The hero's base stats
     * @returns {Object} - Stats with set bonuses applied
     */
    applySetBonusesToStats(heroId, stats) {
        const setBonuses = this.getHeroSetBonuses(heroId);
        
        // Clone stats to avoid modifying the original
        const newStats = { ...stats };
        
        // Apply set bonuses
        for (const setId in setBonuses) {
            const bonuses = setBonuses[setId].bonuses;
            
            for (const [stat, value] of Object.entries(bonuses)) {
                // Handle percentage bonuses
                if (typeof value === 'number' && value <= 1) {
                    // Percentage bonus
                    if (newStats[stat]) {
                        newStats[stat] *= (1 + value);
                    } else {
                        newStats[stat] = value;
                    }
                } else {
                    // Flat bonus
                    if (newStats[stat]) {
                        newStats[stat] += value;
                    } else {
                        newStats[stat] = value;
                    }
                }
            }
        }
        
        return newStats;
    }
    
    /**
     * Generate a random set item
     * @param {string} setId - The set ID
     * @param {string} slot - Optional specific slot
     * @returns {Object|null} - The generated item or null if not possible
     */
    generateRandomSetItem(setId, slot = null) {
        const set = this.getEquipmentSet(setId);
        if (!set) return null;
        
        // Get available pieces
        let availablePieces = set.pieces;
        
        // Filter by slot if specified
        if (slot) {
            availablePieces = availablePieces.filter(piece => piece.type === slot);
        }
        
        if (availablePieces.length === 0) return null;
        
        // Select a random piece
        const piece = availablePieces[Math.floor(Math.random() * availablePieces.length)];
        
        // Get the item template
        const itemTemplate = this.getSetItem(piece.id);
        if (!itemTemplate) return null;
        
        // Clone the template
        const item = { ...itemTemplate };
        
        // Add unique ID
        item.uniqueId = `${item.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // Initialize level
        item.level = 1;
        
        return item;
    }
    
    /**
     * Add a set item to a hero's inventory
     * @param {string} heroId - The hero ID
     * @param {string} setId - The set ID
     * @param {string} slot - Optional specific slot
     * @returns {Object} - Result with success flag and message
     */
    addSetItemToHeroInventory(heroId, setId, slot = null) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) {
            return { success: false, message: "Hero not found" };
        }
        
        // Generate a random set item
        const item = this.generateRandomSetItem(setId, slot);
        
        if (!item) {
            return { success: false, message: "Could not generate set item" };
        }
        
        // Initialize inventory if needed
        if (!hero.inventory) {
            hero.inventory = [];
        }
        
        // Add item to inventory
        hero.inventory.push(item);
        
        // Log item acquisition
        if (this.gameState.activityLogManager) {
            this.gameState.activityLogManager.addLogEntry(
                'Hero', 
                `${hero.name} acquired ${item.name} (${this.getEquipmentSet(setId).name} set piece)`
            );
        }
        
        // Trigger state change
        if (this.gameState.onStateChange) {
            this.gameState.onStateChange();
        }
        
        return { 
            success: true, 
            message: `Added ${item.name} to ${hero.name}'s inventory`,
            item: item
        };
    }
    
    /**
     * Create UI for equipment sets
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    createEquipmentSetsUI(heroId, container) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Get hero's equipment sets
        const heroType = hero.type;
        const availableSets = this.getEquipmentSetsForHeroType(heroType);
        
        // Create sets section
        const setsSection = document.createElement('div');
        setsSection.className = 'hero-sets-section';
        
        // Add header
        const header = document.createElement('h4');
        header.textContent = 'Equipment Sets';
        setsSection.appendChild(header);
        
        // Create sets container
        const setsContainer = document.createElement('div');
        setsContainer.className = 'equipment-sets-container';
        
        // Add each set
        for (const set of availableSets) {
            const setElement = document.createElement('div');
            setElement.className = 'equipment-set';
            
            // Count equipped pieces
            const equippedPieces = this.getEquippedSetPieces(heroId, set.id);
            
            // Set header
            const setHeader = document.createElement('div');
            setHeader.className = 'set-header';
            setHeader.innerHTML = `
                <div class="set-icon">${set.icon}</div>
                <div class="set-info">
                    <div class="set-name">${set.name}</div>
                    <div class="set-progress">${equippedPieces}/${set.pieces.length} pieces</div>
                </div>
            `;
            
            setElement.appendChild(setHeader);
            
            // Set pieces
            const setPieces = document.createElement('div');
            setPieces.className = 'set-pieces';
            
            for (const piece of set.pieces) {
                const pieceItem = this.getSetItem(piece.id);
                
                if (pieceItem) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'set-piece';
                    
                    // Check if this piece is equipped
                    const isEquipped = hero.equipment && 
                                      hero.equipment[pieceItem.type] && 
                                      hero.equipment[pieceItem.type].id === pieceItem.id;
                    
                    if (isEquipped) {
                        pieceElement.classList.add('equipped');
                    }
                    
                    pieceElement.innerHTML = `
                        <div class="piece-icon ${pieceItem.rarity}">${pieceItem.icon}</div>
                        <div class="piece-info">
                            <div class="piece-name">${pieceItem.name}</div>
                            <div class="piece-type">${this.formatSlotName(pieceItem.type)}</div>
                        </div>
                    `;
                    
                    setPieces.appendChild(pieceElement);
                }
            }
            
            setElement.appendChild(setPieces);
            
            // Set bonuses
            const setBonuses = document.createElement('div');
            setBonuses.className = 'set-bonuses';
            
            for (const bonus of set.setBonuses) {
                const bonusElement = document.createElement('div');
                bonusElement.className = 'set-bonus';
                
                if (equippedPieces >= bonus.pieces) {
                    bonusElement.classList.add('active');
                }
                
                bonusElement.innerHTML = `
                    <div class="bonus-header">${bonus.pieces} Piece Bonus:</div>
                    <div class="bonus-stats">${this.formatBonuses(bonus.bonuses)}</div>
                `;
                
                setBonuses.appendChild(bonusElement);
            }
            
            setElement.appendChild(setBonuses);
            
            setsContainer.appendChild(setElement);
        }
        
        setsSection.appendChild(setsContainer);
        container.appendChild(setsSection);
    }
    
    /**
     * Format slot name for display
     * @param {string} slot - The equipment slot
     * @returns {string} - Formatted slot name
     */
    formatSlotName(slot) {
        if (!slot) return '';
        
        // Capitalize first letter and replace underscores with spaces
        return slot.charAt(0).toUpperCase() + slot.slice(1).replace(/_/g, ' ');
    }
    
    /**
     * Format bonuses for display
     * @param {Object} bonuses - The bonuses to format
     * @returns {string} - Formatted bonuses
     */
    formatBonuses(bonuses) {
        if (!bonuses) return '';
        
        const formattedBonuses = [];
        
        for (const [stat, value] of Object.entries(bonuses)) {
            let formattedValue = value;
            
            // Format percentage values
            if (typeof value === 'number' && value <= 1) {
                formattedValue = `${Math.round(value * 100)}%`;
            }
            
            // Format stat name
            const formattedStat = this.formatStatName(stat);
            
            formattedBonuses.push(`${formattedStat}: ${formattedValue}`);
        }
        
        return formattedBonuses.join(', ');
    }
    
    /**
     * Format stat name for display
     * @param {string} stat - The stat name
     * @returns {string} - Formatted stat name
     */
    formatStatName(stat) {
        if (!stat) return '';
        
        // Handle camelCase
        const words = stat.replace(/([A-Z])/g, ' $1').toLowerCase();
        
        // Capitalize first letter
        return words.charAt(0).toUpperCase() + words.slice(1);
    }
    
    /**
     * Save equipment sets data to game state
     * @returns {Object} - Equipment sets data for saving
     */
    getSaveData() {
        // We don't need to save the equipment sets themselves
        // as they are defined in the constructor
        return {};
    }
    
    /**
     * Load equipment sets data from game state
     * @param {Object} data - Saved equipment sets data
     */
    loadSaveData(data) {
        // Nothing to load here
    }
}

// Export the HeroEquipmentSetsSystem class
if (typeof module !== 'undefined') {
    module.exports = { HeroEquipmentSetsSystem };
}
