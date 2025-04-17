/**
 * Events Configuration
 * Defines all event types, challenges, and rewards for the game
 */

const EVENTS_CONFIG = {
    // Event categories
    CATEGORIES: {
        RESOURCE: "resource",
        COMBAT: "combat",
        BUILDING: "building",
        RESEARCH: "research",
        SPECIAL: "special"
    },

    // Event difficulty levels
    DIFFICULTY: {
        EASY: { name: "Easy", multiplier: 1.0 },
        MEDIUM: { name: "Medium", multiplier: 1.5 },
        HARD: { name: "Hard", multiplier: 2.0 }
    },

    // Base event settings
    BASE_SETTINGS: {
        minTimeBetweenEvents: 300, // 5 minutes in seconds
        maxActiveEvents: 3,
        baseEventDuration: 600, // 10 minutes in seconds
        eventChance: 0.1 // 10% chance per check
    },

    // Event definitions
    EVENTS: [
        // Resource Events
        {
            id: "resource_boom",
            title: "Resource Boom",
            description: "A rich vein of ore has been discovered! Ore production is increased for a limited time.",
            category: "resource",
            duration: 300, // 5 minutes
            difficulty: "EASY",
            minGameTime: 300, // 5 minutes into game
            effect: {
                type: "production_boost",
                resource: "ORE",
                multiplier: 1.5 // 50% boost
            },
            objectiveType: "none", // No objective, just a bonus
            reward: "none" // No additional reward
        },
        {
            id: "food_shortage",
            title: "Food Shortage",
            description: "A blight has affected your farms. Overcome this by producing extra food.",
            category: "resource",
            duration: 600, // 10 minutes
            difficulty: "MEDIUM",
            minGameTime: 600, // 10 minutes into game
            effect: {
                type: "production_penalty",
                resource: "FOOD",
                multiplier: 0.8 // 20% penalty
            },
            objectiveType: "produce_resource",
            objective: {
                resource: "FOOD",
                amount: 200
            },
            reward: {
                type: "resource",
                resource: "FOOD",
                amount: 150
            }
        },
        
        // Combat Events
        {
            id: "bandit_raid",
            title: "Bandit Raid",
            description: "A group of bandits is threatening your territory. Defeat them to secure your empire!",
            category: "combat",
            duration: 900, // 15 minutes
            difficulty: "MEDIUM",
            minGameTime: 900, // 15 minutes into game
            effect: {
                type: "spawn_enemy",
                enemyType: "BANDIT_CAMP",
                count: 1,
                difficulty: 1.2
            },
            objectiveType: "defeat_enemies",
            objective: {
                enemyType: "BANDIT_CAMP",
                count: 1
            },
            reward: {
                type: "resource",
                resource: "ORE",
                amount: 200
            }
        },
        {
            id: "goblin_horde",
            title: "Goblin Horde",
            description: "A horde of goblins has been spotted nearby. Defeat them before they grow too strong!",
            category: "combat",
            duration: 1200, // 20 minutes
            difficulty: "HARD",
            minGameTime: 1800, // 30 minutes into game
            effect: {
                type: "spawn_enemy",
                enemyType: "GOBLIN_CAMP",
                count: 2,
                difficulty: 1.3
            },
            objectiveType: "defeat_enemies",
            objective: {
                enemyType: "GOBLIN_CAMP",
                count: 2
            },
            reward: {
                type: "multi_resource",
                resources: {
                    FOOD: 150,
                    ORE: 150
                }
            }
        },
        
        // Building Events
        {
            id: "construction_opportunity",
            title: "Construction Opportunity",
            description: "Your workers are motivated! Complete building projects for bonus resources.",
            category: "building",
            duration: 900, // 15 minutes
            difficulty: "EASY",
            minGameTime: 600, // 10 minutes into game
            effect: {
                type: "construction_speed",
                multiplier: 1.25 // 25% faster building
            },
            objectiveType: "build_or_upgrade",
            objective: {
                count: 2 // Build or upgrade any 2 buildings
            },
            reward: {
                type: "resource",
                resource: "ORE",
                amount: 100
            }
        },
        {
            id: "defensive_preparations",
            title: "Defensive Preparations",
            description: "Intelligence suggests an attack is coming. Strengthen your defenses!",
            category: "building",
            duration: 1200, // 20 minutes
            difficulty: "MEDIUM",
            minGameTime: 1200, // 20 minutes into game
            effect: {
                type: "none"
            },
            objectiveType: "build_specific",
            objective: {
                buildingType: "WALL",
                level: 2
            },
            reward: {
                type: "unit",
                unitType: "SPEARMAN",
                amount: 5
            }
        },
        
        // Research Events
        {
            id: "research_breakthrough",
            title: "Research Breakthrough",
            description: "Your scholars have had a breakthrough! Research speed is temporarily increased.",
            category: "research",
            duration: 900, // 15 minutes
            difficulty: "EASY",
            minGameTime: 1800, // 30 minutes into game
            effect: {
                type: "research_speed",
                multiplier: 1.5 // 50% faster research
            },
            objectiveType: "complete_research",
            objective: {
                count: 1 // Complete any research
            },
            reward: {
                type: "research_progress",
                amount: 50 // 50% progress on next research
            }
        },
        {
            id: "military_innovation",
            title: "Military Innovation",
            description: "Your military advisors have new ideas for improving your forces.",
            category: "research",
            duration: 1200, // 20 minutes
            difficulty: "MEDIUM",
            minGameTime: 2400, // 40 minutes into game
            effect: {
                type: "none"
            },
            objectiveType: "complete_specific_research",
            objective: {
                category: "MILITARY",
                techId: "IMPROVED_WEAPONS"
            },
            reward: {
                type: "unit",
                unitType: "ARCHER",
                amount: 3
            }
        },
        
        // Special Events
        {
            id: "resource_cache",
            title: "Resource Cache",
            description: "A hidden cache of resources has been discovered! Claim it before time runs out.",
            category: "special",
            duration: 600, // 10 minutes
            difficulty: "EASY",
            minGameTime: 300, // 5 minutes into game
            effect: {
                type: "none"
            },
            objectiveType: "claim",
            objective: {
                type: "click" // Just need to click to claim
            },
            reward: {
                type: "multi_resource",
                resources: {
                    FOOD: 100,
                    ORE: 100
                }
            }
        },
        {
            id: "training_opportunity",
            title: "Training Opportunity",
            description: "Your troops are eager to train. Train units for a special bonus!",
            category: "special",
            duration: 900, // 15 minutes
            difficulty: "MEDIUM",
            minGameTime: 1200, // 20 minutes into game
            effect: {
                type: "training_speed",
                multiplier: 1.3 // 30% faster training
            },
            objectiveType: "train_units",
            objective: {
                count: 10 // Train any 10 units
            },
            reward: {
                type: "unit_bonus",
                stat: "attack",
                multiplier: 1.1, // 10% attack bonus
                duration: 1800 // 30 minutes
            }
        }
    ],
    
    // Challenge definitions - longer-term objectives
    CHALLENGES: [
        {
            id: "empire_builder",
            title: "Empire Builder",
            description: "Expand your empire by upgrading your Town Hall and constructing various buildings.",
            difficulty: "MEDIUM",
            duration: 3600, // 1 hour
            objectives: [
                { type: "upgrade_building", buildingType: "TOWN_HALL", level: 2 },
                { type: "build_building", buildingType: "FARM", count: 2 },
                { type: "build_building", buildingType: "MINE", count: 2 }
            ],
            reward: {
                type: "multi_resource",
                resources: {
                    FOOD: 300,
                    ORE: 300
                }
            }
        },
        {
            id: "military_might",
            title: "Military Might",
            description: "Build a powerful army to defend your empire.",
            difficulty: "HARD",
            duration: 4800, // 1 hour 20 minutes
            objectives: [
                { type: "train_unit", unitType: "SPEARMAN", count: 10 },
                { type: "train_unit", unitType: "ARCHER", count: 5 },
                { type: "train_unit", unitType: "CAVALRY", count: 3 }
            ],
            reward: {
                type: "unit_bonus",
                stat: "all",
                multiplier: 1.15, // 15% bonus to all unit stats
                duration: 3600 // 1 hour
            }
        },
        {
            id: "research_mastery",
            title: "Research Mastery",
            description: "Advance your civilization through research and technology.",
            difficulty: "HARD",
            duration: 7200, // 2 hours
            objectives: [
                { type: "build_building", buildingType: "LIBRARY", level: 2 },
                { type: "complete_research", category: "MILITARY", count: 1 },
                { type: "complete_research", category: "ECONOMIC", count: 1 }
            ],
            reward: {
                type: "research_speed",
                multiplier: 1.5, // 50% faster research
                duration: 3600 // 1 hour
            }
        }
    ]
};
