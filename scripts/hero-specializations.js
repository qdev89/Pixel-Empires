/**
 * Hero Specializations System
 * Defines hero specializations and their unique bonuses
 */
class HeroSpecializationsSystem {
    /**
     * Initialize the hero specializations system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        
        // Define specializations
        this.specializations = {
            // Combat specializations
            BERSERKER: {
                name: "Berserker",
                description: "Gains increased attack power as health decreases",
                icon: "🪓",
                category: "combat",
                bonuses: {
                    attack: 0.2, // +20% attack
                    criticalChance: 0.1, // +10% critical hit chance
                },
                specialAbility: {
                    name: "Rage",
                    description: "Deals 50% more damage when below 50% health",
                    trigger: "lowHealth",
                    effect: (hero, combat) => {
                        if (hero.currentHealth / hero.maxHealth < 0.5) {
                            return { attackMultiplier: 1.5 };
                        }
                        return {};
                    }
                }
            },
            GUARDIAN: {
                name: "Guardian",
                description: "Protects allies and has increased defense",
                icon: "🛡️",
                category: "combat",
                bonuses: {
                    defense: 0.3, // +30% defense
                    health: 0.2, // +20% health
                },
                specialAbility: {
                    name: "Protect",
                    description: "Reduces damage to all allies by 20%",
                    trigger: "combat",
                    effect: (hero, combat) => {
                        return { allyDamageReduction: 0.2 };
                    }
                }
            },
            RANGER: {
                name: "Ranger",
                description: "Specializes in ranged combat and scouting",
                icon: "🏹",
                category: "combat",
                bonuses: {
                    attack: 0.15, // +15% attack
                    accuracy: 0.2, // +20% accuracy
                },
                specialAbility: {
                    name: "Precise Shot",
                    description: "Has a 20% chance to deal double damage",
                    trigger: "attack",
                    effect: (hero, combat) => {
                        if (Math.random() < 0.2) {
                            return { damageMultiplier: 2 };
                        }
                        return {};
                    }
                }
            },
            
            // Support specializations
            HEALER: {
                name: "Healer",
                description: "Can heal allies during and after combat",
                icon: "💉",
                category: "support",
                bonuses: {
                    leadership: 0.2, // +20% leadership
                    intelligence: 0.2, // +20% intelligence
                },
                specialAbility: {
                    name: "Healing Touch",
                    description: "Heals all heroes for 20% of their max health after combat",
                    trigger: "postCombat",
                    effect: (hero, combat) => {
                        return { healPercent: 0.2 };
                    }
                }
            },
            BARD: {
                name: "Bard",
                description: "Inspires allies with songs and tales",
                icon: "🎵",
                category: "support",
                bonuses: {
                    leadership: 0.3, // +30% leadership
                    morale: 0.2, // +20% morale
                },
                specialAbility: {
                    name: "Inspiring Song",
                    description: "Increases all allies' attack by 15%",
                    trigger: "combat",
                    effect: (hero, combat) => {
                        return { allyAttackBonus: 0.15 };
                    }
                }
            },
            TACTICIAN: {
                name: "Tactician",
                description: "Excels at planning and strategic combat",
                icon: "📋",
                category: "support",
                bonuses: {
                    leadership: 0.25, // +25% leadership
                    intelligence: 0.25, // +25% intelligence
                },
                specialAbility: {
                    name: "Strategic Advantage",
                    description: "Increases formation effectiveness by 25%",
                    trigger: "combat",
                    effect: (hero, combat) => {
                        return { formationBonus: 0.25 };
                    }
                }
            },
            
            // Utility specializations
            SCOUT: {
                name: "Scout",
                description: "Excels at exploration and finding resources",
                icon: "🔍",
                category: "utility",
                bonuses: {
                    speed: 0.3, // +30% speed
                    perception: 0.3, // +30% perception
                },
                specialAbility: {
                    name: "Keen Eye",
                    description: "Increases resource loot by 25%",
                    trigger: "loot",
                    effect: (hero, combat) => {
                        return { lootBonus: 0.25 };
                    }
                }
            },
            DIPLOMAT: {
                name: "Diplomat",
                description: "Skilled at negotiations and diplomacy",
                icon: "🤝",
                category: "utility",
                bonuses: {
                    charisma: 0.3, // +30% charisma
                    intelligence: 0.2, // +20% intelligence
                },
                specialAbility: {
                    name: "Peaceful Resolution",
                    description: "10% chance to avoid combat and still gain rewards",
                    trigger: "preCombat",
                    effect: (hero, combat) => {
                        if (Math.random() < 0.1) {
                            return { avoidCombat: true, gainRewards: true };
                        }
                        return {};
                    }
                }
            },
            MERCHANT: {
                name: "Merchant",
                description: "Skilled at trading and resource management",
                icon: "💰",
                category: "utility",
                bonuses: {
                    charisma: 0.2, // +20% charisma
                    luck: 0.2, // +20% luck
                },
                specialAbility: {
                    name: "Haggler",
                    description: "Increases gold loot by 30%",
                    trigger: "loot",
                    effect: (hero, combat) => {
                        return { goldBonus: 0.3 };
                    }
                }
            }
        };
    }
    
    /**
     * Get all available specializations
     * @returns {Object} - All specializations
     */
    getAllSpecializations() {
        return this.specializations;
    }
    
    /**
     * Get specializations by category
     * @param {string} category - The category to filter by
     * @returns {Object} - Specializations in the category
     */
    getSpecializationsByCategory(category) {
        const result = {};
        
        for (const [id, spec] of Object.entries(this.specializations)) {
            if (spec.category === category) {
                result[id] = spec;
            }
        }
        
        return result;
    }
    
    /**
     * Get a specialization by ID
     * @param {string} specializationId - The specialization ID
     * @returns {Object|null} - The specialization or null if not found
     */
    getSpecialization(specializationId) {
        return this.specializations[specializationId] || null;
    }
    
    /**
     * Assign a specialization to a hero
     * @param {string} heroId - The hero ID
     * @param {string} specializationId - The specialization ID
     * @returns {boolean} - Success or failure
     */
    assignSpecialization(heroId, specializationId) {
        const hero = this.heroManager.getHeroById(heroId);
        const specialization = this.getSpecialization(specializationId);
        
        if (!hero || !specialization) {
            return false;
        }
        
        // Check if hero meets requirements for this specialization
        if (!this.heroMeetsRequirements(hero, specialization)) {
            return false;
        }
        
        // Assign specialization
        hero.specialization = specializationId;
        
        // Log the specialization assignment
        this.gameState.activityLogManager.addLogEntry(
            'Hero',
            `${hero.name} has become a ${specialization.name}!`
        );
        
        return true;
    }
    
    /**
     * Check if a hero meets the requirements for a specialization
     * @param {Object} hero - The hero
     * @param {Object} specialization - The specialization
     * @returns {boolean} - Whether the hero meets the requirements
     */
    heroMeetsRequirements(hero, specialization) {
        // For now, all heroes can take any specialization
        // In the future, we could add level requirements, stat requirements, etc.
        return true;
    }
    
    /**
     * Apply specialization bonuses to hero stats
     * @param {Object} hero - The hero
     * @param {Object} stats - The hero's base stats
     * @returns {Object} - The modified stats
     */
    applySpecializationBonuses(hero, stats) {
        if (!hero.specialization) {
            return stats;
        }
        
        const specialization = this.getSpecialization(hero.specialization);
        if (!specialization || !specialization.bonuses) {
            return stats;
        }
        
        const modifiedStats = { ...stats };
        
        // Apply percentage bonuses
        for (const [stat, bonus] of Object.entries(specialization.bonuses)) {
            if (modifiedStats[stat] !== undefined) {
                modifiedStats[stat] *= (1 + bonus);
            } else {
                modifiedStats[stat] = bonus;
            }
        }
        
        return modifiedStats;
    }
    
    /**
     * Apply specialization ability effects in combat
     * @param {string} heroId - The hero ID
     * @param {string} trigger - The trigger type
     * @param {Object} combat - The combat context
     * @returns {Object} - The ability effects
     */
    applySpecializationAbility(heroId, trigger, combat) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero || !hero.specialization) {
            return {};
        }
        
        const specialization = this.getSpecialization(hero.specialization);
        if (!specialization || !specialization.specialAbility) {
            return {};
        }
        
        const ability = specialization.specialAbility;
        if (ability.trigger !== trigger) {
            return {};
        }
        
        // Apply the ability effect
        return ability.effect(hero, combat);
    }
    
    /**
     * Get available specializations for a hero
     * @param {string} heroId - The hero ID
     * @returns {Object} - Available specializations
     */
    getAvailableSpecializations(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) {
            return {};
        }
        
        const result = {};
        
        for (const [id, spec] of Object.entries(this.specializations)) {
            if (this.heroMeetsRequirements(hero, spec)) {
                result[id] = spec;
            }
        }
        
        return result;
    }
    
    /**
     * Create UI for selecting a specialization
     * @param {string} heroId - The hero ID
     * @param {Function} onSelect - Callback when a specialization is selected
     */
    createSpecializationSelectionUI(heroId, onSelect) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return;
        
        const availableSpecs = this.getAvailableSpecializations(heroId);
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'specialization-modal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h3>Choose a Specialization for ${hero.name}</h3>
                <div class="specialization-container">
                    ${this.generateSpecializationHTML(availableSpecs)}
                </div>
                <button id="cancel-specialization" class="cancel-button">Cancel</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeButton = modal.querySelector('.close-button');
        const cancelButton = modal.querySelector('#cancel-specialization');
        const specCards = modal.querySelectorAll('.specialization-card');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }
        
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }
        
        specCards.forEach(card => {
            card.addEventListener('click', () => {
                const specId = card.dataset.specId;
                if (onSelect) {
                    onSelect(specId);
                }
                document.body.removeChild(modal);
            });
        });
        
        // Show the modal
        modal.style.display = 'flex';
    }
    
    /**
     * Generate HTML for specialization cards
     * @param {Object} specializations - The specializations to display
     * @returns {string} - The HTML string
     */
    generateSpecializationHTML(specializations) {
        let html = '';
        
        // Group by category
        const categories = {
            combat: { name: 'Combat', specs: {} },
            support: { name: 'Support', specs: {} },
            utility: { name: 'Utility', specs: {} }
        };
        
        for (const [id, spec] of Object.entries(specializations)) {
            if (categories[spec.category]) {
                categories[spec.category].specs[id] = spec;
            }
        }
        
        // Generate HTML for each category
        for (const category of Object.values(categories)) {
            if (Object.keys(category.specs).length === 0) continue;
            
            html += `<div class="specialization-category">
                <h4>${category.name} Specializations</h4>
                <div class="specialization-grid">`;
            
            for (const [id, spec] of Object.entries(category.specs)) {
                html += `
                    <div class="specialization-card" data-spec-id="${id}">
                        <div class="specialization-icon">${spec.icon}</div>
                        <div class="specialization-info">
                            <div class="specialization-name">${spec.name}</div>
                            <div class="specialization-description">${spec.description}</div>
                        </div>
                        <div class="specialization-bonuses">
                            ${this.generateBonusesHTML(spec.bonuses)}
                        </div>
                        <div class="specialization-ability">
                            <div class="ability-name">${spec.specialAbility.name}</div>
                            <div class="ability-description">${spec.specialAbility.description}</div>
                        </div>
                    </div>
                `;
            }
            
            html += `</div></div>`;
        }
        
        return html;
    }
    
    /**
     * Generate HTML for specialization bonuses
     * @param {Object} bonuses - The bonuses to display
     * @returns {string} - The HTML string
     */
    generateBonusesHTML(bonuses) {
        let html = '<div class="bonus-list">';
        
        for (const [stat, value] of Object.entries(bonuses)) {
            const formattedValue = (value * 100).toFixed(0);
            html += `<div class="bonus-item">+${formattedValue}% ${this.formatStatName(stat)}</div>`;
        }
        
        html += '</div>';
        return html;
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
}

// HeroSpecializationsSystem class is now ready to be instantiated in main.js
