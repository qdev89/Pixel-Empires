/**
 * Hero Equipment System
 * Handles hero equipment, upgrades, and enchantments
 */
class HeroEquipmentSystem {
    /**
     * Initialize the hero equipment system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        
        // Equipment slots
        this.equipmentSlots = ['weapon', 'armor', 'accessory', 'artifact'];
        
        // Equipment rarity levels
        this.rarityLevels = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        
        // Equipment upgrade costs by rarity
        this.upgradeCosts = {
            common: { ORE: 50, GOLD: 100 },
            uncommon: { ORE: 100, GOLD: 200 },
            rare: { ORE: 200, GOLD: 400 },
            epic: { ORE: 400, GOLD: 800 },
            legendary: { ORE: 800, GOLD: 1600 }
        };
        
        // Equipment upgrade success rates by rarity
        this.upgradeSuccessRates = {
            common: 0.9, // 90% success rate
            uncommon: 0.8, // 80% success rate
            rare: 0.7, // 70% success rate
            epic: 0.6, // 60% success rate
            legendary: 0.5 // 50% success rate
        };
        
        // Equipment stat bonuses by rarity
        this.rarityBonuses = {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 3.0
        };
        
        // Equipment enchantment types
        this.enchantmentTypes = {
            FIRE: {
                name: "Fire",
                icon: "🔥",
                effects: {
                    attack: 0.1, // +10% attack
                    criticalDamage: 0.2 // +20% critical damage
                }
            },
            ICE: {
                name: "Ice",
                icon: "❄️",
                effects: {
                    defense: 0.1, // +10% defense
                    slowEnemy: 0.2 // 20% chance to slow enemy
                }
            },
            LIGHTNING: {
                name: "Lightning",
                icon: "⚡",
                effects: {
                    speed: 0.15, // +15% speed
                    chainAttack: 0.1 // 10% chance for chain attack
                }
            },
            EARTH: {
                name: "Earth",
                icon: "🌱",
                effects: {
                    health: 0.15, // +15% health
                    damageReduction: 0.1 // 10% damage reduction
                }
            },
            WIND: {
                name: "Wind",
                icon: "💨",
                effects: {
                    evasion: 0.1, // +10% evasion
                    speed: 0.1 // +10% speed
                }
            },
            LIGHT: {
                name: "Light",
                icon: "✨",
                effects: {
                    healingReceived: 0.2, // +20% healing received
                    statusResistance: 0.15 // +15% status resistance
                }
            },
            DARK: {
                name: "Dark",
                icon: "🌑",
                effects: {
                    lifeSteal: 0.1, // 10% life steal
                    damageOverTime: 0.15 // 15% chance to apply damage over time
                }
            }
        };
    }
    
    /**
     * Get equipment for a hero
     * @param {string} heroId - The hero ID
     * @returns {Object} - The hero's equipment
     */
    getHeroEquipment(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return {};
        
        return hero.equipment || {};
    }
    
    /**
     * Equip an item on a hero
     * @param {string} heroId - The hero ID
     * @param {Object} item - The item to equip
     * @returns {boolean} - Success or failure
     */
    equipItem(heroId, item) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !item || !item.type) return false;
        
        // Initialize equipment if it doesn't exist
        if (!hero.equipment) {
            hero.equipment = {};
        }
        
        // Check if the slot is valid
        if (!this.equipmentSlots.includes(item.type)) {
            return false;
        }
        
        // Store the previously equipped item
        const previousItem = hero.equipment[item.type];
        
        // Equip the new item
        hero.equipment[item.type] = item;
        
        // Log the equipment change
        this.gameState.activityLogManager.addLogEntry(
            'Hero',
            `${hero.name} equipped ${item.name}.`
        );
        
        // Return the previously equipped item to inventory if it exists
        if (previousItem) {
            if (!hero.inventory) {
                hero.inventory = [];
            }
            hero.inventory.push(previousItem);
            
            this.gameState.activityLogManager.addLogEntry(
                'Hero',
                `${previousItem.name} was returned to inventory.`
            );
        }
        
        return true;
    }
    
    /**
     * Unequip an item from a hero
     * @param {string} heroId - The hero ID
     * @param {string} slot - The equipment slot
     * @returns {Object|null} - The unequipped item or null if none
     */
    unequipItem(heroId, slot) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.equipment || !hero.equipment[slot]) return null;
        
        // Get the item
        const item = hero.equipment[slot];
        
        // Remove from equipment
        hero.equipment[slot] = null;
        
        // Add to inventory
        if (!hero.inventory) {
            hero.inventory = [];
        }
        hero.inventory.push(item);
        
        // Log the unequip
        this.gameState.activityLogManager.addLogEntry(
            'Hero',
            `${hero.name} unequipped ${item.name}.`
        );
        
        return item;
    }
    
    /**
     * Upgrade an equipment item
     * @param {string} heroId - The hero ID
     * @param {string} slot - The equipment slot
     * @returns {Object} - Result of the upgrade attempt
     */
    upgradeEquipment(heroId, slot) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.equipment || !hero.equipment[slot]) {
            return { success: false, message: "No item equipped in that slot." };
        }
        
        const item = hero.equipment[slot];
        
        // Check if item has a level
        if (!item.level) {
            item.level = 1;
        }
        
        // Check if item has reached max level (10)
        if (item.level >= 10) {
            return { success: false, message: "Item has reached maximum level." };
        }
        
        // Get upgrade costs based on rarity
        const rarity = item.rarity || 'common';
        const costs = this.upgradeCosts[rarity];
        
        // Check if player has enough resources
        for (const [resource, amount] of Object.entries(costs)) {
            if (this.gameState.resources[resource] < amount) {
                return { 
                    success: false, 
                    message: `Not enough ${resource.toLowerCase()}. Need ${amount}.` 
                };
            }
        }
        
        // Deduct resources
        for (const [resource, amount] of Object.entries(costs)) {
            this.gameState.resources[resource] -= amount;
        }
        
        // Determine success based on rarity
        const successRate = this.upgradeSuccessRates[rarity];
        const isSuccess = Math.random() < successRate;
        
        if (isSuccess) {
            // Upgrade successful
            item.level += 1;
            
            // Update item bonuses
            this.updateItemBonuses(item);
            
            // Log the upgrade
            this.gameState.activityLogManager.addLogEntry(
                'Hero',
                `${item.name} was successfully upgraded to level ${item.level}!`
            );
            
            return { 
                success: true, 
                message: `${item.name} was successfully upgraded to level ${item.level}!`,
                item: item
            };
        } else {
            // Upgrade failed
            this.gameState.activityLogManager.addLogEntry(
                'Hero',
                `Failed to upgrade ${item.name}.`
            );
            
            return { 
                success: false, 
                message: `Failed to upgrade ${item.name}. Resources were consumed.`,
                item: item
            };
        }
    }
    
    /**
     * Update an item's bonuses based on its level and rarity
     * @param {Object} item - The item to update
     */
    updateItemBonuses(item) {
        if (!item.baseBonuses) {
            // Store the original bonuses as base bonuses
            item.baseBonuses = { ...item.bonuses };
        }
        
        // Calculate level multiplier
        const levelMultiplier = 1 + ((item.level - 1) * 0.1); // 10% per level
        
        // Calculate rarity multiplier
        const rarityMultiplier = this.rarityBonuses[item.rarity] || 1.0;
        
        // Apply multipliers to base bonuses
        const newBonuses = {};
        for (const [stat, value] of Object.entries(item.baseBonuses)) {
            newBonuses[stat] = Math.round(value * levelMultiplier * rarityMultiplier);
        }
        
        // Update item bonuses
        item.bonuses = newBonuses;
        
        // Update item name to show level
        if (!item.originalName) {
            item.originalName = item.name;
        }
        item.name = `${item.originalName} +${item.level}`;
    }
    
    /**
     * Enchant an equipment item
     * @param {string} heroId - The hero ID
     * @param {string} slot - The equipment slot
     * @param {string} enchantmentType - The enchantment type
     * @returns {Object} - Result of the enchantment attempt
     */
    enchantItem(heroId, slot, enchantmentType) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.equipment || !hero.equipment[slot]) {
            return { success: false, message: "No item equipped in that slot." };
        }
        
        const item = hero.equipment[slot];
        const enchantment = this.enchantmentTypes[enchantmentType];
        
        if (!enchantment) {
            return { success: false, message: "Invalid enchantment type." };
        }
        
        // Check if player has enough resources for enchantment
        const enchantmentCost = { GEMS: 50 };
        if (this.gameState.resources.GEMS < enchantmentCost.GEMS) {
            return { 
                success: false, 
                message: `Not enough gems. Need ${enchantmentCost.GEMS}.` 
            };
        }
        
        // Deduct resources
        this.gameState.resources.GEMS -= enchantmentCost.GEMS;
        
        // Apply enchantment
        item.enchantment = enchantmentType;
        
        // Add enchantment effects
        if (!item.enchantmentEffects) {
            item.enchantmentEffects = {};
        }
        
        // Apply enchantment effects
        for (const [effect, value] of Object.entries(enchantment.effects)) {
            item.enchantmentEffects[effect] = value;
        }
        
        // Update item name
        if (!item.originalName) {
            item.originalName = item.name;
        }
        item.name = `${enchantment.name} ${item.originalName}`;
        
        // Add enchantment icon
        item.enchantmentIcon = enchantment.icon;
        
        // Log the enchantment
        this.gameState.activityLogManager.addLogEntry(
            'Hero',
            `${item.originalName} was enchanted with ${enchantment.name}!`
        );
        
        return { 
            success: true, 
            message: `${item.originalName} was enchanted with ${enchantment.name}!`,
            item: item
        };
    }
    
    /**
     * Create UI for equipment management
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    createEquipmentUI(heroId, container) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create equipment section
        const equipmentSection = document.createElement('div');
        equipmentSection.className = 'hero-equipment-section';
        
        // Add header
        const header = document.createElement('h4');
        header.textContent = 'Equipment';
        equipmentSection.appendChild(header);
        
        // Create equipment slots
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'equipment-slots';
        
        for (const slot of this.equipmentSlots) {
            const slotElement = document.createElement('div');
            slotElement.className = 'equipment-slot';
            slotElement.dataset.slot = slot;
            
            const item = hero.equipment && hero.equipment[slot];
            
            if (item) {
                // Show equipped item
                slotElement.innerHTML = `
                    <div class="item-icon ${item.rarity || 'common'}">
                        ${item.enchantmentIcon || ''}${item.icon || '?'}
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-stats">${this.formatItemStats(item)}</div>
                    </div>
                    <div class="item-actions">
                        <button class="upgrade-button" data-slot="${slot}">Upgrade</button>
                        <button class="unequip-button" data-slot="${slot}">Unequip</button>
                    </div>
                `;
            } else {
                // Show empty slot
                slotElement.innerHTML = `
                    <div class="empty-slot">${this.getSlotIcon(slot)}</div>
                    <div class="slot-name">${this.formatSlotName(slot)}</div>
                `;
            }
            
            slotsContainer.appendChild(slotElement);
        }
        
        equipmentSection.appendChild(slotsContainer);
        
        // Create inventory section
        const inventorySection = document.createElement('div');
        inventorySection.className = 'hero-inventory-section';
        
        // Add inventory header
        const inventoryHeader = document.createElement('h4');
        inventoryHeader.textContent = 'Inventory';
        inventorySection.appendChild(inventoryHeader);
        
        // Create inventory container
        const inventoryContainer = document.createElement('div');
        inventoryContainer.className = 'inventory-container';
        
        // Add inventory items
        if (hero.inventory && hero.inventory.length > 0) {
            for (let i = 0; i < hero.inventory.length; i++) {
                const item = hero.inventory[i];
                const itemElement = document.createElement('div');
                itemElement.className = `inventory-item ${item.rarity || 'common'}`;
                itemElement.dataset.index = i;
                
                itemElement.innerHTML = `
                    <div class="item-icon">
                        ${item.enchantmentIcon || ''}${item.icon || '?'}
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-type">${this.formatSlotName(item.type)}</div>
                    </div>
                    <button class="equip-button" data-index="${i}">Equip</button>
                `;
                
                inventoryContainer.appendChild(itemElement);
            }
        } else {
            inventoryContainer.innerHTML = '<div class="empty-inventory">No items in inventory</div>';
        }
        
        inventorySection.appendChild(inventoryContainer);
        
        // Add sections to container
        container.appendChild(equipmentSection);
        container.appendChild(inventorySection);
        
        // Add event listeners
        this.addEquipmentEventListeners(heroId, container);
    }
    
    /**
     * Add event listeners to equipment UI
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    addEquipmentEventListeners(heroId, container) {
        // Upgrade buttons
        const upgradeButtons = container.querySelectorAll('.upgrade-button');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const slot = button.dataset.slot;
                const result = this.upgradeEquipment(heroId, slot);
                
                // Show result message
                this.showEquipmentMessage(result.message, result.success);
                
                // Refresh UI
                this.createEquipmentUI(heroId, container);
            });
        });
        
        // Unequip buttons
        const unequipButtons = container.querySelectorAll('.unequip-button');
        unequipButtons.forEach(button => {
            button.addEventListener('click', () => {
                const slot = button.dataset.slot;
                this.unequipItem(heroId, slot);
                
                // Refresh UI
                this.createEquipmentUI(heroId, container);
            });
        });
        
        // Equip buttons
        const equipButtons = container.querySelectorAll('.equip-button');
        equipButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                const hero = this.heroManager.getHeroById(heroId);
                
                if (hero && hero.inventory && hero.inventory[index]) {
                    const item = hero.inventory[index];
                    
                    // Remove from inventory
                    hero.inventory.splice(index, 1);
                    
                    // Equip item
                    this.equipItem(heroId, item);
                    
                    // Refresh UI
                    this.createEquipmentUI(heroId, container);
                }
            });
        });
    }
    
    /**
     * Show a message in the equipment UI
     * @param {string} message - The message to show
     * @param {boolean} success - Whether the message is a success or failure
     */
    showEquipmentMessage(message, success) {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `equipment-message ${success ? 'success' : 'failure'}`;
        messageElement.textContent = message;
        
        // Add to document
        document.body.appendChild(messageElement);
        
        // Add animation class
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 500);
        }, 3000);
    }
    
    /**
     * Format item stats for display
     * @param {Object} item - The item
     * @returns {string} - Formatted stats HTML
     */
    formatItemStats(item) {
        let statsHtml = '';
        
        // Add level
        if (item.level) {
            statsHtml += `<div class="item-level">Level ${item.level}</div>`;
        }
        
        // Add bonuses
        if (item.bonuses) {
            for (const [stat, value] of Object.entries(item.bonuses)) {
                statsHtml += `<div class="item-stat">+${value} ${this.formatStatName(stat)}</div>`;
            }
        }
        
        // Add enchantment effects
        if (item.enchantmentEffects) {
            for (const [effect, value] of Object.entries(item.enchantmentEffects)) {
                const formattedValue = (value * 100).toFixed(0);
                statsHtml += `<div class="item-enchant">+${formattedValue}% ${this.formatStatName(effect)}</div>`;
            }
        }
        
        return statsHtml;
    }
    
    /**
     * Format a stat name for display
     * @param {string} stat - The stat name
     * @returns {string} - The formatted stat name
     */
    formatStatName(stat) {
        // Convert camelCase to Title Case with spaces
        return stat
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    /**
     * Format a slot name for display
     * @param {string} slot - The slot name
     * @returns {string} - The formatted slot name
     */
    formatSlotName(slot) {
        return slot.charAt(0).toUpperCase() + slot.slice(1);
    }
    
    /**
     * Get an icon for an equipment slot
     * @param {string} slot - The slot name
     * @returns {string} - The slot icon
     */
    getSlotIcon(slot) {
        switch (slot) {
            case 'weapon':
                return '⚔️';
            case 'armor':
                return '🛡️';
            case 'accessory':
                return '💍';
            case 'artifact':
                return '🔮';
            default:
                return '?';
        }
    }
    
    /**
     * Generate a random equipment item
     * @param {string} type - The item type
     * @param {string} rarity - The item rarity
     * @returns {Object} - The generated item
     */
    generateRandomItem(type, rarity = 'common') {
        // Validate type
        if (!this.equipmentSlots.includes(type)) {
            type = this.equipmentSlots[0];
        }
        
        // Validate rarity
        if (!this.rarityLevels.includes(rarity)) {
            rarity = 'common';
        }
        
        // Generate item name
        const itemName = this.generateItemName(type, rarity);
        
        // Generate item icon
        const itemIcon = this.getSlotIcon(type);
        
        // Generate item bonuses based on type and rarity
        const bonuses = this.generateItemBonuses(type, rarity);
        
        // Create item
        const item = {
            id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: itemName,
            type: type,
            rarity: rarity,
            icon: itemIcon,
            bonuses: bonuses,
            level: 1
        };
        
        return item;
    }
    
    /**
     * Generate a name for an item
     * @param {string} type - The item type
     * @param {string} rarity - The item rarity
     * @returns {string} - The generated name
     */
    generateItemName(type, rarity) {
        // Prefixes by rarity
        const prefixes = {
            common: ['Basic', 'Simple', 'Standard', 'Plain'],
            uncommon: ['Fine', 'Quality', 'Sturdy', 'Reliable'],
            rare: ['Superior', 'Exceptional', 'Excellent', 'Refined'],
            epic: ['Magnificent', 'Glorious', 'Majestic', 'Heroic'],
            legendary: ['Mythical', 'Legendary', 'Ancient', 'Divine']
        };
        
        // Item types
        const typeNames = {
            weapon: ['Sword', 'Axe', 'Bow', 'Staff', 'Dagger'],
            armor: ['Armor', 'Plate', 'Mail', 'Cuirass', 'Shield'],
            accessory: ['Ring', 'Amulet', 'Pendant', 'Charm', 'Talisman'],
            artifact: ['Orb', 'Relic', 'Totem', 'Idol', 'Crystal']
        };
        
        // Get random prefix and type name
        const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
        const typeName = typeNames[type][Math.floor(Math.random() * typeNames[type].length)];
        
        return `${prefix} ${typeName}`;
    }
    
    /**
     * Generate bonuses for an item
     * @param {string} type - The item type
     * @param {string} rarity - The item rarity
     * @returns {Object} - The generated bonuses
     */
    generateItemBonuses(type, rarity) {
        const bonuses = {};
        
        // Base bonus values by type
        const baseValues = {
            weapon: { attack: 5 },
            armor: { defense: 5 },
            accessory: { speed: 3, evasion: 2 },
            artifact: { intelligence: 3, leadership: 2 }
        };
        
        // Rarity multipliers
        const rarityMultiplier = this.rarityBonuses[rarity] || 1.0;
        
        // Apply base bonuses with rarity multiplier
        for (const [stat, value] of Object.entries(baseValues[type])) {
            bonuses[stat] = Math.round(value * rarityMultiplier);
        }
        
        // Add additional random bonuses based on rarity
        const additionalBonusCount = {
            common: 0,
            uncommon: 1,
            rare: 1,
            epic: 2,
            legendary: 3
        }[rarity] || 0;
        
        // Possible additional stats
        const additionalStats = ['health', 'criticalChance', 'criticalDamage', 'accuracy', 'luck'];
        
        // Add random additional bonuses
        for (let i = 0; i < additionalBonusCount; i++) {
            const stat = additionalStats[Math.floor(Math.random() * additionalStats.length)];
            const baseValue = Math.floor(Math.random() * 3) + 1; // 1-3
            bonuses[stat] = Math.round(baseValue * rarityMultiplier);
        }
        
        return bonuses;
    }
}

// HeroEquipmentSystem class is now ready to be instantiated in main.js
