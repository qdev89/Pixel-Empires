/**
 * Hero Synergy System
 * Handles synergy bonuses between heroes based on types, traits, and specializations
 */
class HeroSynergySystem {
    /**
     * Initialize the hero synergy system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        
        // Define synergy types
        this.synergyTypes = {
            // Type synergies
            TYPE: {
                name: "Type Synergy",
                description: "Bonuses from having heroes of the same or complementary types",
                icon: "🔄",
                synergies: {
                    // Same type synergies
                    WARRIOR_PAIR: {
                        name: "Warrior Duo",
                        description: "Two warriors fighting together",
                        requirements: { types: ["WARRIOR"], count: 2 },
                        bonuses: { attack: 0.1, defense: 0.1 } // +10% attack and defense
                    },
                    ARCHER_PAIR: {
                        name: "Archer Duo",
                        description: "Two archers providing covering fire",
                        requirements: { types: ["ARCHER"], count: 2 },
                        bonuses: { attack: 0.15, criticalChance: 0.05 } // +15% attack, +5% crit
                    },
                    MAGE_PAIR: {
                        name: "Mage Duo",
                        description: "Two mages combining their magical powers",
                        requirements: { types: ["MAGE"], count: 2 },
                        bonuses: { intelligence: 0.2, abilityPower: 0.15 } // +20% int, +15% ability power
                    },
                    HEALER_PAIR: {
                        name: "Healer Duo",
                        description: "Two healers working together",
                        requirements: { types: ["HEALER"], count: 2 },
                        bonuses: { healing: 0.25, defense: 0.1 } // +25% healing, +10% defense
                    },
                    
                    // Complementary type synergies
                    WARRIOR_HEALER: {
                        name: "Protector and Healer",
                        description: "A warrior protecting a healer",
                        requirements: { types: ["WARRIOR", "HEALER"], count: 1, each: true },
                        bonuses: { defense: 0.15, healing: 0.15 } // +15% defense, +15% healing
                    },
                    WARRIOR_ARCHER: {
                        name: "Front and Back",
                        description: "A warrior protecting an archer",
                        requirements: { types: ["WARRIOR", "ARCHER"], count: 1, each: true },
                        bonuses: { defense: 0.1, attack: 0.15 } // +10% defense, +15% attack
                    },
                    MAGE_WARRIOR: {
                        name: "Spell and Sword",
                        description: "A mage empowering a warrior",
                        requirements: { types: ["MAGE", "WARRIOR"], count: 1, each: true },
                        bonuses: { attack: 0.15, abilityPower: 0.15 } // +15% attack, +15% ability power
                    },
                    ARCHER_MAGE: {
                        name: "Arrows and Spells",
                        description: "Archers and mages attacking from range",
                        requirements: { types: ["ARCHER", "MAGE"], count: 1, each: true },
                        bonuses: { criticalChance: 0.1, abilityPower: 0.1 } // +10% crit, +10% ability power
                    }
                }
            },
            
            // Specialization synergies
            SPECIALIZATION: {
                name: "Specialization Synergy",
                description: "Bonuses from having heroes with complementary specializations",
                icon: "⚙️",
                synergies: {
                    BERSERKER_GUARDIAN: {
                        name: "Offense and Defense",
                        description: "A berserker and guardian working together",
                        requirements: { specializations: ["BERSERKER", "GUARDIAN"], count: 1, each: true },
                        bonuses: { attack: 0.15, defense: 0.15 } // +15% attack, +15% defense
                    },
                    HEALER_BERSERKER: {
                        name: "Heal and Harm",
                        description: "A healer supporting a berserker",
                        requirements: { specializations: ["HEALER", "BERSERKER"], count: 1, each: true },
                        bonuses: { attack: 0.2, healing: 0.2 } // +20% attack, +20% healing
                    },
                    TACTICIAN_ANY: {
                        name: "Strategic Command",
                        description: "A tactician leading any team",
                        requirements: { specializations: ["TACTICIAN"], count: 1 },
                        bonuses: { leadership: 0.2, formationBonus: 0.1 } // +20% leadership, +10% formation bonus
                    },
                    BARD_ANY: {
                        name: "Inspiring Performance",
                        description: "A bard inspiring any team",
                        requirements: { specializations: ["BARD"], count: 1 },
                        bonuses: { morale: 0.2, experience: 0.1 } // +20% morale, +10% experience
                    },
                    SCOUT_ANY: {
                        name: "Scouting Advantage",
                        description: "A scout providing intel for the team",
                        requirements: { specializations: ["SCOUT"], count: 1 },
                        bonuses: { evasion: 0.1, lootBonus: 0.15 } // +10% evasion, +15% loot
                    },
                    RANGER_SCOUT: {
                        name: "Wilderness Experts",
                        description: "Rangers and scouts working together",
                        requirements: { specializations: ["RANGER", "SCOUT"], count: 1, each: true },
                        bonuses: { accuracy: 0.2, perception: 0.2 } // +20% accuracy, +20% perception
                    },
                    COMBAT_TRIO: {
                        name: "Combat Specialists",
                        description: "Three combat specialists working together",
                        requirements: { categories: ["combat"], count: 3 },
                        bonuses: { attack: 0.2, defense: 0.1, speed: 0.1 } // +20% attack, +10% defense, +10% speed
                    },
                    SUPPORT_DUO: {
                        name: "Support Network",
                        description: "Two support specialists working together",
                        requirements: { categories: ["support"], count: 2 },
                        bonuses: { healing: 0.2, leadership: 0.2 } // +20% healing, +20% leadership
                    }
                }
            },
            
            // Trait synergies
            TRAIT: {
                name: "Trait Synergy",
                description: "Bonuses from having heroes with complementary traits",
                icon: "🧩",
                synergies: {
                    BRAVE_TEAM: {
                        name: "Courageous Band",
                        description: "A team of brave heroes",
                        requirements: { traits: ["BRAVE"], count: 2 },
                        bonuses: { morale: 0.2, retreatPenalty: -0.5 } // +20% morale, -50% retreat penalty
                    },
                    INTELLIGENT_TEAM: {
                        name: "Think Tank",
                        description: "A team of intelligent heroes",
                        requirements: { traits: ["INTELLIGENT"], count: 2 },
                        bonuses: { experience: 0.2, abilityPower: 0.15 } // +20% experience, +15% ability power
                    },
                    STRONG_CHARISMATIC: {
                        name: "Inspiring Strength",
                        description: "Strong heroes led by a charismatic leader",
                        requirements: { traits: ["STRONG", "CHARISMATIC"], count: 1, each: true },
                        bonuses: { attack: 0.15, leadership: 0.15 } // +15% attack, +15% leadership
                    },
                    LUCKY_TEAM: {
                        name: "Fortune Favors",
                        description: "A team blessed with luck",
                        requirements: { traits: ["LUCKY"], count: 2 },
                        bonuses: { criticalChance: 0.1, lootBonus: 0.2 } // +10% crit, +20% loot
                    },
                    BALANCED_TEAM: {
                        name: "Balanced Personalities",
                        description: "A team with diverse positive traits",
                        requirements: { traitTypes: ["positive"], count: 3, unique: true },
                        bonuses: { attack: 0.1, defense: 0.1, speed: 0.1 } // +10% to all main stats
                    }
                }
            }
        };
    }
    
    /**
     * Calculate synergy bonuses for a team of heroes
     * @param {Array} heroIds - Array of hero IDs in the team
     * @returns {Object} - Calculated synergy bonuses and active synergies
     */
    calculateTeamSynergies(heroIds) {
        if (!heroIds || heroIds.length === 0) {
            return { bonuses: {}, activeSynergies: [] };
        }
        
        // Get hero objects
        const heroes = heroIds.map(id => this.heroManager.getHeroById(id)).filter(hero => hero);
        
        // Initialize results
        const result = {
            bonuses: {},
            activeSynergies: []
        };
        
        // Check each synergy type
        for (const [synergyTypeKey, synergyType] of Object.entries(this.synergyTypes)) {
            // Check each synergy in this type
            for (const [synergyKey, synergy] of Object.entries(synergyType.synergies)) {
                if (this.checkSynergyRequirements(heroes, synergy.requirements)) {
                    // Add to active synergies
                    result.activeSynergies.push({
                        id: synergyKey,
                        name: synergy.name,
                        description: synergy.description,
                        type: synergyTypeKey,
                        typeName: synergyType.name,
                        icon: synergyType.icon
                    });
                    
                    // Add bonuses
                    for (const [stat, bonus] of Object.entries(synergy.bonuses)) {
                        if (result.bonuses[stat]) {
                            result.bonuses[stat] += bonus;
                        } else {
                            result.bonuses[stat] = bonus;
                        }
                    }
                }
            }
        }
        
        return result;
    }
    
    /**
     * Check if a team meets the requirements for a synergy
     * @param {Array} heroes - Array of hero objects
     * @param {Object} requirements - Synergy requirements
     * @returns {boolean} - Whether the requirements are met
     */
    checkSynergyRequirements(heroes, requirements) {
        // Check type requirements
        if (requirements.types) {
            const typeCounts = {};
            
            // Count heroes of each required type
            for (const hero of heroes) {
                if (requirements.types.includes(hero.type)) {
                    typeCounts[hero.type] = (typeCounts[hero.type] || 0) + 1;
                }
            }
            
            // Check if requirements are met
            if (requirements.each) {
                // Need at least one of each type
                for (const type of requirements.types) {
                    if (!typeCounts[type] || typeCounts[type] < requirements.count) {
                        return false;
                    }
                }
            } else {
                // Need a total count across all types
                const totalCount = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
                if (totalCount < requirements.count) {
                    return false;
                }
            }
        }
        
        // Check specialization requirements
        if (requirements.specializations) {
            const specializationCounts = {};
            
            // Count heroes with each required specialization
            for (const hero of heroes) {
                if (hero.specialization && requirements.specializations.includes(hero.specialization)) {
                    specializationCounts[hero.specialization] = (specializationCounts[hero.specialization] || 0) + 1;
                }
            }
            
            // Check if requirements are met
            if (requirements.each) {
                // Need at least one of each specialization
                for (const spec of requirements.specializations) {
                    if (!specializationCounts[spec] || specializationCounts[spec] < requirements.count) {
                        return false;
                    }
                }
            } else {
                // Need a total count across all specializations
                const totalCount = Object.values(specializationCounts).reduce((sum, count) => sum + count, 0);
                if (totalCount < requirements.count) {
                    return false;
                }
            }
        }
        
        // Check specialization category requirements
        if (requirements.categories) {
            const categoryCounts = {};
            
            // Count heroes in each category
            for (const hero of heroes) {
                if (hero.specialization && this.gameState.heroSpecializationsSystem) {
                    const spec = this.gameState.heroSpecializationsSystem.getSpecialization(hero.specialization);
                    if (spec && spec.category && requirements.categories.includes(spec.category)) {
                        categoryCounts[spec.category] = (categoryCounts[spec.category] || 0) + 1;
                    }
                }
            }
            
            // Check if requirements are met
            if (requirements.each) {
                // Need at least one of each category
                for (const category of requirements.categories) {
                    if (!categoryCounts[category] || categoryCounts[category] < requirements.count) {
                        return false;
                    }
                }
            } else {
                // Need a total count across all categories
                const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
                if (totalCount < requirements.count) {
                    return false;
                }
            }
        }
        
        // Check trait requirements
        if (requirements.traits) {
            const traitCounts = {};
            
            // Count heroes with each required trait
            for (const hero of heroes) {
                if (hero.traits) {
                    for (const trait of hero.traits) {
                        if (requirements.traits.includes(trait)) {
                            traitCounts[trait] = (traitCounts[trait] || 0) + 1;
                        }
                    }
                }
            }
            
            // Check if requirements are met
            if (requirements.each) {
                // Need at least one of each trait
                for (const trait of requirements.traits) {
                    if (!traitCounts[trait] || traitCounts[trait] < requirements.count) {
                        return false;
                    }
                }
            } else {
                // Need a total count across all traits
                const totalCount = Object.values(traitCounts).reduce((sum, count) => sum + count, 0);
                if (totalCount < requirements.count) {
                    return false;
                }
            }
        }
        
        // Check trait type requirements
        if (requirements.traitTypes) {
            const traitTypeCounts = {};
            const uniqueTraits = new Set();
            
            // Count heroes with traits of each required type
            for (const hero of heroes) {
                if (hero.traits && this.gameState.heroTraitsSystem) {
                    for (const traitId of hero.traits) {
                        const trait = this.gameState.heroTraitsSystem.getTrait(traitId);
                        if (trait && trait.type && requirements.traitTypes.includes(trait.type)) {
                            traitTypeCounts[trait.type] = (traitTypeCounts[trait.type] || 0) + 1;
                            
                            // Track unique traits if needed
                            if (requirements.unique) {
                                uniqueTraits.add(traitId);
                            }
                        }
                    }
                }
            }
            
            // Check if requirements are met
            if (requirements.each) {
                // Need at least one of each trait type
                for (const traitType of requirements.traitTypes) {
                    if (!traitTypeCounts[traitType] || traitTypeCounts[traitType] < requirements.count) {
                        return false;
                    }
                }
            } else if (requirements.unique) {
                // Need a certain number of unique traits of the specified types
                if (uniqueTraits.size < requirements.count) {
                    return false;
                }
            } else {
                // Need a total count across all trait types
                const totalCount = Object.values(traitTypeCounts).reduce((sum, count) => sum + count, 0);
                if (totalCount < requirements.count) {
                    return false;
                }
            }
        }
        
        // All requirements met
        return true;
    }
    
    /**
     * Apply synergy bonuses to combat stats
     * @param {Array} heroIds - Array of hero IDs in the team
     * @param {Object} stats - Combat stats to modify
     * @returns {Object} - Modified combat stats
     */
    applySynergyBonuses(heroIds, stats) {
        const synergies = this.calculateTeamSynergies(heroIds);
        const modifiedStats = { ...stats };
        
        // Apply bonuses to stats
        for (const [stat, bonus] of Object.entries(synergies.bonuses)) {
            // Handle special cases
            if (stat === 'formationBonus') {
                // This will be applied separately in combat resolution
                modifiedStats.formationBonus = (modifiedStats.formationBonus || 0) + bonus;
            } else if (stat === 'lootBonus') {
                // This will be applied to loot after combat
                modifiedStats.lootBonus = (modifiedStats.lootBonus || 0) + bonus;
            } else if (stat === 'experience') {
                // This will be applied to experience gain after combat
                modifiedStats.experienceBonus = (modifiedStats.experienceBonus || 0) + bonus;
            } else if (modifiedStats[stat] !== undefined) {
                // Apply percentage bonus to existing stat
                modifiedStats[stat] *= (1 + bonus);
            }
        }
        
        return modifiedStats;
    }
    
    /**
     * Create UI to display active synergies
     * @param {Array} heroIds - Array of hero IDs in the team
     * @param {HTMLElement} container - Container element for the UI
     */
    createSynergyUI(heroIds, container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Calculate synergies
        const synergies = this.calculateTeamSynergies(heroIds);
        
        if (synergies.activeSynergies.length === 0) {
            container.innerHTML = '<div class="no-synergies">No active synergies</div>';
            return;
        }
        
        // Create synergy list
        const synergyList = document.createElement('div');
        synergyList.className = 'synergy-list';
        
        // Group synergies by type
        const groupedSynergies = {};
        for (const synergy of synergies.activeSynergies) {
            if (!groupedSynergies[synergy.type]) {
                groupedSynergies[synergy.type] = {
                    name: synergy.typeName,
                    icon: synergy.icon,
                    synergies: []
                };
            }
            groupedSynergies[synergy.type].synergies.push(synergy);
        }
        
        // Create synergy groups
        for (const [type, group] of Object.entries(groupedSynergies)) {
            const groupElement = document.createElement('div');
            groupElement.className = 'synergy-group';
            
            // Add group header
            const groupHeader = document.createElement('div');
            groupHeader.className = 'synergy-group-header';
            groupHeader.innerHTML = `
                <div class="synergy-group-icon">${group.icon}</div>
                <div class="synergy-group-name">${group.name}</div>
            `;
            groupElement.appendChild(groupHeader);
            
            // Add synergies in this group
            for (const synergy of group.synergies) {
                const synergyElement = document.createElement('div');
                synergyElement.className = 'synergy-item';
                
                // Get bonuses for this synergy
                const bonusText = this.formatSynergyBonuses(
                    this.synergyTypes[synergy.type].synergies[synergy.id].bonuses
                );
                
                synergyElement.innerHTML = `
                    <div class="synergy-name">${synergy.name}</div>
                    <div class="synergy-description">${synergy.description}</div>
                    <div class="synergy-bonuses">${bonusText}</div>
                `;
                
                groupElement.appendChild(synergyElement);
            }
            
            synergyList.appendChild(groupElement);
        }
        
        container.appendChild(synergyList);
    }
    
    /**
     * Format synergy bonuses for display
     * @param {Object} bonuses - Synergy bonuses
     * @returns {string} - Formatted HTML
     */
    formatSynergyBonuses(bonuses) {
        let html = '';
        
        for (const [stat, value] of Object.entries(bonuses)) {
            const formattedValue = (value > 0 ? '+' : '') + (value * 100).toFixed(0) + '%';
            html += `<div class="synergy-bonus">${formattedValue} ${this.formatStatName(stat)}</div>`;
        }
        
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

// HeroSynergySystem class is now ready to be instantiated in main.js
