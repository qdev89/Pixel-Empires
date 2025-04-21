/**
 * Hero Skill Tree System for Pixel Empires
 * Handles hero skill progression, skill trees, and skill point allocation
 */
class HeroSkillTreeSystem {
    /**
     * Initialize the hero skill tree system
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        
        // Skill trees for different hero types
        this.skillTrees = {
            // Warrior skill tree
            WARRIOR: {
                name: "Warrior",
                description: "Master of weapons and physical combat",
                branches: {
                    OFFENSE: {
                        name: "Offense",
                        description: "Focus on dealing damage",
                        skills: [
                            {
                                id: "power_strike",
                                name: "Power Strike",
                                description: "A powerful attack that deals 150% damage",
                                icon: "⚔️",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "150% damage", value: 1.5 },
                                    { level: 2, description: "175% damage", value: 1.75 },
                                    { level: 3, description: "200% damage", value: 2.0 }
                                ],
                                requirements: { level: 1 },
                                type: "active",
                                cooldown: 3,
                                cost: { energy: 20 }
                            },
                            {
                                id: "cleave",
                                name: "Cleave",
                                description: "Attack hits multiple enemies",
                                icon: "🪓",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "Hits 2 enemies", value: 2 },
                                    { level: 2, description: "Hits 3 enemies", value: 3 },
                                    { level: 3, description: "Hits all enemies", value: 0 }
                                ],
                                requirements: { level: 3, skills: { power_strike: 1 } },
                                type: "active",
                                cooldown: 4,
                                cost: { energy: 30 }
                            },
                            {
                                id: "weapon_mastery",
                                name: "Weapon Mastery",
                                description: "Increases attack damage",
                                icon: "🗡️",
                                maxLevel: 5,
                                effects: [
                                    { level: 1, description: "+5% attack", value: 0.05 },
                                    { level: 2, description: "+10% attack", value: 0.10 },
                                    { level: 3, description: "+15% attack", value: 0.15 },
                                    { level: 4, description: "+20% attack", value: 0.20 },
                                    { level: 5, description: "+25% attack", value: 0.25 }
                                ],
                                requirements: { level: 2 },
                                type: "passive"
                            }
                        ]
                    },
                    DEFENSE: {
                        name: "Defense",
                        description: "Focus on survival and protection",
                        skills: [
                            {
                                id: "shield_wall",
                                name: "Shield Wall",
                                description: "Reduces damage taken",
                                icon: "🛡️",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "25% damage reduction", value: 0.25 },
                                    { level: 2, description: "35% damage reduction", value: 0.35 },
                                    { level: 3, description: "50% damage reduction", value: 0.50 }
                                ],
                                requirements: { level: 1 },
                                type: "active",
                                cooldown: 5,
                                cost: { energy: 25 }
                            },
                            {
                                id: "resilience",
                                name: "Resilience",
                                description: "Increases maximum health",
                                icon: "❤️",
                                maxLevel: 5,
                                effects: [
                                    { level: 1, description: "+5% health", value: 0.05 },
                                    { level: 2, description: "+10% health", value: 0.10 },
                                    { level: 3, description: "+15% health", value: 0.15 },
                                    { level: 4, description: "+20% health", value: 0.20 },
                                    { level: 5, description: "+25% health", value: 0.25 }
                                ],
                                requirements: { level: 2 },
                                type: "passive"
                            },
                            {
                                id: "taunt",
                                name: "Taunt",
                                description: "Forces enemies to attack this hero",
                                icon: "😠",
                                maxLevel: 2,
                                effects: [
                                    { level: 1, description: "2 turn duration", value: 2 },
                                    { level: 2, description: "3 turn duration", value: 3 }
                                ],
                                requirements: { level: 4, skills: { shield_wall: 2 } },
                                type: "active",
                                cooldown: 4,
                                cost: { energy: 20 }
                            }
                        ]
                    },
                    LEADERSHIP: {
                        name: "Leadership",
                        description: "Focus on supporting allies",
                        skills: [
                            {
                                id: "rally",
                                name: "Rally",
                                description: "Increases attack of all allies",
                                icon: "🚩",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "+10% attack for 2 turns", value: { bonus: 0.10, duration: 2 } },
                                    { level: 2, description: "+15% attack for 2 turns", value: { bonus: 0.15, duration: 2 } },
                                    { level: 3, description: "+20% attack for 3 turns", value: { bonus: 0.20, duration: 3 } }
                                ],
                                requirements: { level: 3 },
                                type: "active",
                                cooldown: 4,
                                cost: { energy: 25 }
                            },
                            {
                                id: "inspire",
                                name: "Inspire",
                                description: "Increases critical hit chance for all allies",
                                icon: "✨",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "+5% crit chance for 2 turns", value: { bonus: 0.05, duration: 2 } },
                                    { level: 2, description: "+10% crit chance for 2 turns", value: { bonus: 0.10, duration: 2 } },
                                    { level: 3, description: "+15% crit chance for 3 turns", value: { bonus: 0.15, duration: 3 } }
                                ],
                                requirements: { level: 5, skills: { rally: 2 } },
                                type: "active",
                                cooldown: 5,
                                cost: { energy: 30 }
                            }
                        ]
                    }
                }
            },
            
            // Archer skill tree
            ARCHER: {
                name: "Archer",
                description: "Master of ranged combat and precision",
                branches: {
                    PRECISION: {
                        name: "Precision",
                        description: "Focus on accuracy and critical hits",
                        skills: [
                            {
                                id: "aimed_shot",
                                name: "Aimed Shot",
                                description: "A precise shot with increased critical chance",
                                icon: "🏹",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "+20% crit chance", value: 0.20 },
                                    { level: 2, description: "+35% crit chance", value: 0.35 },
                                    { level: 3, description: "+50% crit chance", value: 0.50 }
                                ],
                                requirements: { level: 1 },
                                type: "active",
                                cooldown: 3,
                                cost: { energy: 15 }
                            },
                            {
                                id: "eagle_eye",
                                name: "Eagle Eye",
                                description: "Increases critical hit damage",
                                icon: "👁️",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "+20% crit damage", value: 0.20 },
                                    { level: 2, description: "+40% crit damage", value: 0.40 },
                                    { level: 3, description: "+60% crit damage", value: 0.60 }
                                ],
                                requirements: { level: 3, skills: { aimed_shot: 1 } },
                                type: "passive"
                            }
                        ]
                    },
                    MOBILITY: {
                        name: "Mobility",
                        description: "Focus on movement and evasion",
                        skills: [
                            {
                                id: "quick_shot",
                                name: "Quick Shot",
                                description: "A fast attack that doesn't end the turn",
                                icon: "⚡",
                                maxLevel: 2,
                                effects: [
                                    { level: 1, description: "80% damage, no turn end", value: 0.80 },
                                    { level: 2, description: "100% damage, no turn end", value: 1.00 }
                                ],
                                requirements: { level: 2 },
                                type: "active",
                                cooldown: 4,
                                cost: { energy: 20 }
                            },
                            {
                                id: "evasion",
                                name: "Evasion",
                                description: "Chance to dodge attacks",
                                icon: "💨",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "+10% dodge chance", value: 0.10 },
                                    { level: 2, description: "+15% dodge chance", value: 0.15 },
                                    { level: 3, description: "+20% dodge chance", value: 0.20 }
                                ],
                                requirements: { level: 3 },
                                type: "passive"
                            }
                        ]
                    }
                }
            },
            
            // Mage skill tree
            MAGE: {
                name: "Mage",
                description: "Master of arcane magic and elemental powers",
                branches: {
                    FIRE: {
                        name: "Fire Magic",
                        description: "Focus on destructive fire spells",
                        skills: [
                            {
                                id: "fireball",
                                name: "Fireball",
                                description: "Launches a ball of fire at the enemy",
                                icon: "🔥",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "120% damage", value: 1.20 },
                                    { level: 2, description: "140% damage", value: 1.40 },
                                    { level: 3, description: "160% damage", value: 1.60 }
                                ],
                                requirements: { level: 1 },
                                type: "active",
                                cooldown: 2,
                                cost: { mana: 20 }
                            },
                            {
                                id: "flame_wave",
                                name: "Flame Wave",
                                description: "Damages all enemies with a wave of fire",
                                icon: "🌊",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "80% damage to all", value: 0.80 },
                                    { level: 2, description: "100% damage to all", value: 1.00 },
                                    { level: 3, description: "120% damage to all", value: 1.20 }
                                ],
                                requirements: { level: 4, skills: { fireball: 2 } },
                                type: "active",
                                cooldown: 4,
                                cost: { mana: 35 }
                            }
                        ]
                    },
                    ICE: {
                        name: "Ice Magic",
                        description: "Focus on control and defensive ice spells",
                        skills: [
                            {
                                id: "frost_bolt",
                                name: "Frost Bolt",
                                description: "Damages and slows an enemy",
                                icon: "❄️",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "100% damage, 20% slow", value: { damage: 1.00, slow: 0.20 } },
                                    { level: 2, description: "120% damage, 30% slow", value: { damage: 1.20, slow: 0.30 } },
                                    { level: 3, description: "140% damage, 40% slow", value: { damage: 1.40, slow: 0.40 } }
                                ],
                                requirements: { level: 1 },
                                type: "active",
                                cooldown: 3,
                                cost: { mana: 15 }
                            },
                            {
                                id: "ice_barrier",
                                name: "Ice Barrier",
                                description: "Creates a protective shield of ice",
                                icon: "🧊",
                                maxLevel: 3,
                                effects: [
                                    { level: 1, description: "Absorbs 100 damage", value: 100 },
                                    { level: 2, description: "Absorbs 200 damage", value: 200 },
                                    { level: 3, description: "Absorbs 300 damage", value: 300 }
                                ],
                                requirements: { level: 3, skills: { frost_bolt: 1 } },
                                type: "active",
                                cooldown: 5,
                                cost: { mana: 25 }
                            }
                        ]
                    }
                }
            }
        };
    }
    
    /**
     * Get the skill tree for a specific hero type
     * @param {string} heroType - The hero type
     * @returns {Object} - The skill tree for the hero type
     */
    getSkillTree(heroType) {
        return this.skillTrees[heroType] || null;
    }
    
    /**
     * Get all skill trees
     * @returns {Object} - All skill trees
     */
    getAllSkillTrees() {
        return this.skillTrees;
    }
    
    /**
     * Get hero skill points
     * @param {string} heroId - The hero ID
     * @returns {number} - The number of skill points
     */
    getHeroSkillPoints(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return 0;
        
        // If hero doesn't have skillPoints property, initialize it
        if (hero.skillPoints === undefined) {
            hero.skillPoints = this.calculateInitialSkillPoints(hero);
        }
        
        return hero.skillPoints;
    }
    
    /**
     * Calculate initial skill points based on hero level
     * @param {Object} hero - The hero object
     * @returns {number} - The number of skill points
     */
    calculateInitialSkillPoints(hero) {
        // 1 skill point per level
        return hero.level;
    }
    
    /**
     * Get hero learned skills
     * @param {string} heroId - The hero ID
     * @returns {Object} - The hero's learned skills with their levels
     */
    getHeroSkills(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return {};
        
        // If hero doesn't have learnedSkills property, initialize it
        if (!hero.learnedSkills) {
            hero.learnedSkills = {};
        }
        
        return hero.learnedSkills;
    }
    
    /**
     * Check if a hero can learn a skill
     * @param {string} heroId - The hero ID
     * @param {string} skillId - The skill ID
     * @returns {Object} - Result with success flag and message
     */
    canLearnSkill(heroId, skillId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) {
            return { success: false, message: "Hero not found" };
        }
        
        // Get hero's skill tree
        const skillTree = this.getSkillTree(hero.type);
        if (!skillTree) {
            return { success: false, message: "Skill tree not found for this hero type" };
        }
        
        // Find the skill in the skill tree
        let skill = null;
        let branch = null;
        
        for (const branchKey in skillTree.branches) {
            const currentBranch = skillTree.branches[branchKey];
            const foundSkill = currentBranch.skills.find(s => s.id === skillId);
            
            if (foundSkill) {
                skill = foundSkill;
                branch = currentBranch;
                break;
            }
        }
        
        if (!skill) {
            return { success: false, message: "Skill not found in hero's skill tree" };
        }
        
        // Get hero's learned skills
        const learnedSkills = this.getHeroSkills(heroId);
        
        // Check if hero already learned this skill
        const currentLevel = learnedSkills[skillId] || 0;
        
        // Check if skill is already at max level
        if (currentLevel >= skill.maxLevel) {
            return { success: false, message: "Skill already at maximum level" };
        }
        
        // Check hero level requirement
        if (hero.level < skill.requirements.level) {
            return { 
                success: false, 
                message: `Hero must be level ${skill.requirements.level} to learn this skill` 
            };
        }
        
        // Check prerequisite skills
        if (skill.requirements.skills) {
            for (const [reqSkillId, reqLevel] of Object.entries(skill.requirements.skills)) {
                const heroSkillLevel = learnedSkills[reqSkillId] || 0;
                
                if (heroSkillLevel < reqLevel) {
                    return { 
                        success: false, 
                        message: `Requires ${reqSkillId} at level ${reqLevel}` 
                    };
                }
            }
        }
        
        // Check if hero has enough skill points
        const skillPoints = this.getHeroSkillPoints(heroId);
        
        if (skillPoints < 1) {
            return { success: false, message: "Not enough skill points" };
        }
        
        return { 
            success: true, 
            message: "Can learn skill",
            skill,
            branch,
            currentLevel
        };
    }
    
    /**
     * Learn a skill for a hero
     * @param {string} heroId - The hero ID
     * @param {string} skillId - The skill ID
     * @returns {Object} - Result with success flag and message
     */
    learnSkill(heroId, skillId) {
        // Check if hero can learn the skill
        const canLearn = this.canLearnSkill(heroId, skillId);
        
        if (!canLearn.success) {
            return canLearn;
        }
        
        const hero = this.heroManager.getHeroById(heroId);
        
        // Get hero's learned skills
        const learnedSkills = this.getHeroSkills(heroId);
        
        // Get current skill level
        const currentLevel = learnedSkills[skillId] || 0;
        
        // Increment skill level
        learnedSkills[skillId] = currentLevel + 1;
        
        // Deduct skill point
        hero.skillPoints--;
        
        // If this is a new skill (level 1), add it to hero's abilities
        if (currentLevel === 0 && canLearn.skill.type === "active") {
            if (!hero.abilities) {
                hero.abilities = [];
            }
            
            if (!hero.abilities.includes(skillId)) {
                hero.abilities.push(skillId);
            }
        }
        
        // Log skill learning
        if (this.gameState.activityLogManager) {
            this.gameState.activityLogManager.addLogEntry(
                'Hero', 
                `${hero.name} learned ${canLearn.skill.name} (Level ${currentLevel + 1})`
            );
        }
        
        // Trigger state change
        if (this.gameState.onStateChange) {
            this.gameState.onStateChange();
        }
        
        return { 
            success: true, 
            message: `Successfully learned ${canLearn.skill.name} (Level ${currentLevel + 1})`,
            newLevel: currentLevel + 1
        };
    }
    
    /**
     * Reset skills for a hero
     * @param {string} heroId - The hero ID
     * @returns {Object} - Result with success flag and message
     */
    resetSkills(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) {
            return { success: false, message: "Hero not found" };
        }
        
        // Calculate total skill points based on level
        const totalSkillPoints = this.calculateInitialSkillPoints(hero);
        
        // Reset learned skills
        hero.learnedSkills = {};
        
        // Reset skill points
        hero.skillPoints = totalSkillPoints;
        
        // Reset abilities (keep starting ability if any)
        const heroType = this.heroManager.heroTypes[hero.type];
        if (heroType && heroType.startingAbility) {
            hero.abilities = [heroType.startingAbility];
        } else {
            hero.abilities = [];
        }
        
        // Log skill reset
        if (this.gameState.activityLogManager) {
            this.gameState.activityLogManager.addLogEntry(
                'Hero', 
                `${hero.name}'s skills have been reset`
            );
        }
        
        // Trigger state change
        if (this.gameState.onStateChange) {
            this.gameState.onStateChange();
        }
        
        return { 
            success: true, 
            message: `Successfully reset skills for ${hero.name}`,
            skillPoints: totalSkillPoints
        };
    }
    
    /**
     * Get skill effect for a hero
     * @param {string} heroId - The hero ID
     * @param {string} skillId - The skill ID
     * @returns {Object|null} - The skill effect or null if not found
     */
    getSkillEffect(heroId, skillId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return null;
        
        // Get hero's learned skills
        const learnedSkills = this.getHeroSkills(heroId);
        
        // Get skill level
        const skillLevel = learnedSkills[skillId] || 0;
        
        // If skill not learned, return null
        if (skillLevel === 0) return null;
        
        // Get hero's skill tree
        const skillTree = this.getSkillTree(hero.type);
        if (!skillTree) return null;
        
        // Find the skill in the skill tree
        let skill = null;
        
        for (const branchKey in skillTree.branches) {
            const branch = skillTree.branches[branchKey];
            const foundSkill = branch.skills.find(s => s.id === skillId);
            
            if (foundSkill) {
                skill = foundSkill;
                break;
            }
        }
        
        if (!skill) return null;
        
        // Get effect for current level
        const effect = skill.effects.find(e => e.level === skillLevel);
        
        if (!effect) return null;
        
        return {
            skill,
            level: skillLevel,
            effect: effect.value
        };
    }
    
    /**
     * Get all skill effects for a hero
     * @param {string} heroId - The hero ID
     * @returns {Object} - All skill effects
     */
    getAllSkillEffects(heroId) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return {};
        
        // Get hero's learned skills
        const learnedSkills = this.getHeroSkills(heroId);
        
        // Get all skill effects
        const effects = {};
        
        for (const skillId in learnedSkills) {
            const effect = this.getSkillEffect(heroId, skillId);
            
            if (effect) {
                effects[skillId] = effect;
            }
        }
        
        return effects;
    }
    
    /**
     * Add skill points to a hero
     * @param {string} heroId - The hero ID
     * @param {number} points - The number of points to add
     * @returns {Object} - Result with success flag and message
     */
    addSkillPoints(heroId, points) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) {
            return { success: false, message: "Hero not found" };
        }
        
        // If hero doesn't have skillPoints property, initialize it
        if (hero.skillPoints === undefined) {
            hero.skillPoints = this.calculateInitialSkillPoints(hero);
        }
        
        // Add skill points
        hero.skillPoints += points;
        
        // Log skill points addition
        if (this.gameState.activityLogManager) {
            this.gameState.activityLogManager.addLogEntry(
                'Hero', 
                `${hero.name} gained ${points} skill points`
            );
        }
        
        // Trigger state change
        if (this.gameState.onStateChange) {
            this.gameState.onStateChange();
        }
        
        return { 
            success: true, 
            message: `Added ${points} skill points to ${hero.name}`,
            totalPoints: hero.skillPoints
        };
    }
    
    /**
     * Update hero skill points on level up
     * @param {string} heroId - The hero ID
     * @param {number} newLevel - The new hero level
     */
    onHeroLevelUp(heroId, newLevel) {
        // Add 1 skill point per level
        this.addSkillPoints(heroId, 1);
    }
    
    /**
     * Save skill tree data to game state
     * @returns {Object} - Skill tree data for saving
     */
    getSaveData() {
        // We don't need to save the skill trees themselves, just the hero data
        // which is already saved by the hero manager
        return {};
    }
    
    /**
     * Load skill tree data from game state
     * @param {Object} data - Saved skill tree data
     */
    loadSaveData(data) {
        // Nothing to load here since the skill trees are defined in the constructor
        // and hero data is loaded by the hero manager
    }
}

// Export the HeroSkillTreeSystem class
if (typeof module !== 'undefined') {
    module.exports = { HeroSkillTreeSystem };
}
