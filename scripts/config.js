/**
 * Game Configuration
 * Contains all the constants and configuration for the game
 */

const CONFIG = {
    // Resource generation rates (per second)
    RESOURCE_RATES: {
        TOWN_HALL: {
            FOOD: 0,
            ORE: 0
        },
        FARM: {
            FOOD: 1,
            ORE: 0
        },
        MINE: {
            FOOD: 0,
            ORE: 1
        }
    },

    // Building costs and stats
    BUILDINGS: {
        TOWN_HALL: {
            name: "Town Hall",
            description: "Center of your empire",
            levels: [
                { cost: { FOOD: 0, ORE: 0 }, production: { FOOD: 0, ORE: 0 } },
                { cost: { FOOD: 100, ORE: 100 }, production: { FOOD: 0, ORE: 0 } },
                { cost: { FOOD: 300, ORE: 300 }, production: { FOOD: 0, ORE: 0 } }
            ],
            maxLevel: 3
        },
        FARM: {
            name: "Farm",
            description: "Produces food for your empire",
            levels: [
                { cost: { FOOD: 50, ORE: 20 }, production: { FOOD: 1, ORE: 0 } },
                { cost: { FOOD: 100, ORE: 50 }, production: { FOOD: 2, ORE: 0 } },
                { cost: { FOOD: 200, ORE: 100 }, production: { FOOD: 4, ORE: 0 } }
            ],
            maxLevel: 3
        },
        MINE: {
            name: "Mine",
            description: "Produces ore for buildings and units",
            levels: [
                { cost: { FOOD: 20, ORE: 50 }, production: { FOOD: 0, ORE: 1 } },
                { cost: { FOOD: 50, ORE: 100 }, production: { FOOD: 0, ORE: 2 } },
                { cost: { FOOD: 100, ORE: 200 }, production: { FOOD: 0, ORE: 4 } }
            ],
            maxLevel: 3
        },
        WAREHOUSE: {
            name: "Warehouse",
            description: "Increases resource storage capacity",
            levels: [
                { cost: { FOOD: 30, ORE: 30 }, capacity: { FOOD: 200, ORE: 200 } },
                { cost: { FOOD: 80, ORE: 80 }, capacity: { FOOD: 500, ORE: 500 } },
                { cost: { FOOD: 150, ORE: 150 }, capacity: { FOOD: 1000, ORE: 1000 } }
            ],
            maxLevel: 3
        },
        BARRACKS: {
            name: "Barracks",
            description: "Train military units",
            levels: [
                { cost: { FOOD: 50, ORE: 100 }, trainingSpeed: 1 },
                { cost: { FOOD: 100, ORE: 200 }, trainingSpeed: 1.5 },
                { cost: { FOOD: 200, ORE: 400 }, trainingSpeed: 2 }
            ],
            maxLevel: 3
        },
        WALL: {
            name: "Wall",
            description: "Provides defense for your empire",
            levels: [
                { cost: { FOOD: 20, ORE: 80 }, defense: 10 },
                { cost: { FOOD: 50, ORE: 150 }, defense: 25 },
                { cost: { FOOD: 100, ORE: 300 }, defense: 50 }
            ],
            maxLevel: 3
        },
        LIBRARY: {
            name: "Library",
            description: "Research new technologies for your empire",
            levels: [
                { cost: { FOOD: 80, ORE: 120 }, researchSpeed: 1 },
                { cost: { FOOD: 160, ORE: 240 }, researchSpeed: 1.5 },
                { cost: { FOOD: 320, ORE: 480 }, researchSpeed: 2 }
            ],
            maxLevel: 3,
            requirements: { TOWN_HALL: 2 } // Requires Town Hall level 2
        }
    },

    // Unit stats
    UNITS: {
        SPEARMAN: {
            name: "Spearman",
            cost: { FOOD: 20, ORE: 30 },
            stats: {
                attack: 5,
                defense: 3,
                hp: 10,
                carryCapacity: 10
            },
            upkeep: { FOOD: 1 },
            // Unit type advantages
            advantages: {
                CAVALRY: 1.5 // 50% bonus against cavalry
            },
            disadvantages: {
                ARCHER: 0.7 // 30% penalty against archers
            }
        },
        ARCHER: {
            name: "Archer",
            cost: { FOOD: 15, ORE: 40 },
            stats: {
                attack: 7,
                defense: 1,
                hp: 8,
                carryCapacity: 8
            },
            upkeep: { FOOD: 1 },
            // Unit type advantages
            advantages: {
                SPEARMAN: 1.5 // 50% bonus against spearmen
            },
            disadvantages: {
                CAVALRY: 0.7 // 30% penalty against cavalry
            }
        },
        CAVALRY: {
            name: "Cavalry",
            cost: { FOOD: 30, ORE: 25 },
            stats: {
                attack: 6,
                defense: 2,
                hp: 12,
                carryCapacity: 15
            },
            upkeep: { FOOD: 2 },
            // Unit type advantages
            advantages: {
                ARCHER: 1.5 // 50% bonus against archers
            },
            disadvantages: {
                SPEARMAN: 0.7 // 30% penalty against spearmen
            }
        }
    },

    // NPC enemy camps
    NPC_CAMPS: {
        GOBLIN_CAMP: {
            name: "Goblin Camp",
            difficulty: 1,
            units: { GOBLIN: 5 },
            loot: { FOOD: 50, ORE: 30 },
            specialAbility: {
                name: "Ambush",
                description: "Goblins set traps that can injure your units before battle",
                effect: { casualtyIncrease: 0.1 } // 10% more casualties
            },
            weakAgainst: "SPEARMAN",
            strongAgainst: "CAVALRY"
        },
        BANDIT_HIDEOUT: {
            name: "Bandit Hideout",
            difficulty: 2,
            units: { BANDIT: 8 },
            loot: { FOOD: 80, ORE: 50 },
            specialAbility: {
                name: "Plunder",
                description: "Bandits can steal some of your resources even if you win",
                effect: { lootReduction: 0.2 } // 20% less loot
            },
            weakAgainst: "ARCHER",
            strongAgainst: "SPEARMAN"
        },
        WOLF_DEN: {
            name: "Wolf Den",
            difficulty: 1.5,
            units: { WOLF: 6 },
            loot: { FOOD: 70, ORE: 20 },
            specialAbility: {
                name: "Pack Tactics",
                description: "Wolves coordinate their attacks, increasing their effectiveness",
                effect: { defenseReduction: 0.15 } // Reduce player defense by 15%
            },
            weakAgainst: "CAVALRY",
            strongAgainst: "ARCHER"
        },
        TROLL_CAVE: {
            name: "Troll Cave",
            difficulty: 3,
            units: { TROLL: 3 },
            loot: { FOOD: 100, ORE: 120 },
            specialAbility: {
                name: "Regeneration",
                description: "Trolls can heal during battle, making them harder to defeat",
                effect: { attackReduction: 0.2 } // Reduce player attack by 20%
            },
            weakAgainst: "ARCHER",
            strongAgainst: "CAVALRY"
        }
    },

    // Combat settings
    COMBAT: {
        TRAVEL_SPEED: 10, // grid units per second
        LOOT_PERCENTAGE: 0.7, // percentage of resources that can be looted
        ADVANTAGE_MULTIPLIER: 1.5, // multiplier for unit type advantages
        DISADVANTAGE_MULTIPLIER: 0.7, // multiplier for unit type disadvantages
        CAMP_RESPAWN_TIME: 30, // seconds until a defeated camp respawns
        COMBAT_VISUALIZATION_TIME: 1, // seconds to visualize combat

        // Terrain effects on combat
        TERRAIN_EFFECTS: {
            grass: { attack: 1.0, defense: 1.0, description: "Neutral terrain" },
            forest: { attack: 0.8, defense: 1.2, description: "Forests provide cover, reducing attack but increasing defense" },
            mountain: { attack: 1.2, defense: 1.5, description: "Mountains provide high ground advantage for both attack and defense" },
            water: { attack: 0.7, defense: 0.7, description: "Water crossings reduce both attack and defense" }
        },

        // Combat formations
        FORMATIONS: {
            balanced: {
                name: "Balanced",
                description: "Equal distribution of attack and defense",
                attack: 1.0,
                defense: 1.0,
                casualtyRate: 1.0
            },
            aggressive: {
                name: "Aggressive",
                description: "Focus on attack at the expense of defense",
                attack: 1.3,
                defense: 0.7,
                casualtyRate: 1.2
            },
            defensive: {
                name: "Defensive",
                description: "Focus on defense at the expense of attack",
                attack: 0.7,
                defense: 1.3,
                casualtyRate: 0.8
            },
            flanking: {
                name: "Flanking",
                description: "Attempt to outmaneuver the enemy",
                attack: 1.2,
                defense: 0.9,
                casualtyRate: 0.9
            }
        }
    },

    // Research technologies
    TECHNOLOGIES: {
        // Military technologies
        MILITARY: {
            IMPROVED_WEAPONS: {
                name: "Improved Weapons",
                description: "Increases attack of all units by 20%",
                cost: { FOOD: 100, ORE: 200 },
                researchTime: 60, // seconds
                effects: {
                    unitAttackBonus: 0.2 // 20% attack bonus
                },
                requirements: { LIBRARY: 1 } // Requires Library level 1
            },
            IMPROVED_ARMOR: {
                name: "Improved Armor",
                description: "Increases defense of all units by 20%",
                cost: { FOOD: 150, ORE: 150 },
                researchTime: 60,
                effects: {
                    unitDefenseBonus: 0.2 // 20% defense bonus
                },
                requirements: { LIBRARY: 1 }
            },
            ADVANCED_TACTICS: {
                name: "Advanced Tactics",
                description: "Increases unit type advantages by 10%",
                cost: { FOOD: 200, ORE: 200 },
                researchTime: 90,
                effects: {
                    advantageBonus: 0.1 // 10% increase to advantage multiplier
                },
                requirements: { LIBRARY: 2, TECHNOLOGIES: { MILITARY: { IMPROVED_WEAPONS: true, IMPROVED_ARMOR: true } } }
            }
        },

        // Economic technologies
        ECONOMIC: {
            EFFICIENT_FARMING: {
                name: "Efficient Farming",
                description: "Increases food production by 25%",
                cost: { FOOD: 100, ORE: 100 },
                researchTime: 45,
                effects: {
                    foodProductionBonus: 0.25 // 25% food production bonus
                },
                requirements: { LIBRARY: 1, FARM: 1 }
            },
            IMPROVED_MINING: {
                name: "Improved Mining",
                description: "Increases ore production by 25%",
                cost: { FOOD: 100, ORE: 100 },
                researchTime: 45,
                effects: {
                    oreProductionBonus: 0.25 // 25% ore production bonus
                },
                requirements: { LIBRARY: 1, MINE: 1 }
            },
            RESOURCE_MANAGEMENT: {
                name: "Resource Management",
                description: "Increases storage capacity by 30%",
                cost: { FOOD: 150, ORE: 150 },
                researchTime: 60,
                effects: {
                    storageCapacityBonus: 0.3 // 30% storage capacity bonus
                },
                requirements: { LIBRARY: 2, WAREHOUSE: 1 }
            }
        },

        // Defensive technologies
        DEFENSIVE: {
            REINFORCED_WALLS: {
                name: "Reinforced Walls",
                description: "Increases wall defense by 30%",
                cost: { FOOD: 50, ORE: 200 },
                researchTime: 60,
                effects: {
                    wallDefenseBonus: 0.3 // 30% wall defense bonus
                },
                requirements: { LIBRARY: 1, WALL: 1 }
            },
            DEFENSIVE_TACTICS: {
                name: "Defensive Tactics",
                description: "Reduces casualties in defensive battles by 20%",
                cost: { FOOD: 200, ORE: 100 },
                researchTime: 75,
                effects: {
                    defensiveCasualtyReduction: 0.2 // 20% reduction in defensive casualties
                },
                requirements: { LIBRARY: 2, WALL: 2 }
            }
        }
    },

    // Game settings
    GAME_SETTINGS: {
        EVENT_CHECK_INTERVAL: 60, // seconds between event checks
        EVENT_CHANCE: 0.3, // 30% chance of an event occurring on check
        MISSION_CHECK_INTERVAL: 120, // seconds between mission checks
        MISSION_CHANCE: 0.5 // 50% chance of a mission being offered on check
    },

    // Special events
    EVENTS: {
        POSITIVE: [
            {
                id: 'bountiful_harvest',
                title: 'Bountiful Harvest',
                description: 'Favorable weather has led to an exceptional harvest in your territory.',
                effect: { type: 'resource', resource: 'FOOD', amount: 100 },
                weight: 10
            },
            {
                id: 'ore_discovery',
                title: 'Rich Ore Vein',
                description: 'Your miners have discovered a rich vein of ore in the nearby mountains.',
                effect: { type: 'resource', resource: 'ORE', amount: 80 },
                weight: 10
            },
            {
                id: 'wandering_mercenaries',
                title: 'Wandering Mercenaries',
                description: 'A group of mercenaries has arrived, offering their services to your empire.',
                effect: { type: 'units', units: { SPEARMAN: 3, ARCHER: 2 } },
                weight: 8
            },
            {
                id: 'technology_breakthrough',
                title: 'Technology Breakthrough',
                description: 'Your researchers have made a breakthrough, accelerating your current research.',
                effect: { type: 'research', progress: 50 },
                weight: 5
            }
        ],
        NEGATIVE: [
            {
                id: 'food_spoilage',
                title: 'Food Spoilage',
                description: 'Some of your food stores have spoiled due to unexpected humidity.',
                effect: { type: 'resource', resource: 'FOOD', amount: -50 },
                weight: 10
            },
            {
                id: 'tool_breakage',
                title: 'Tool Breakage',
                description: 'Many of your mining tools have broken, requiring replacements.',
                effect: { type: 'resource', resource: 'ORE', amount: -40 },
                weight: 10
            },
            {
                id: 'desertion',
                title: 'Desertion',
                description: 'Some of your troops have deserted during the night.',
                effect: { type: 'units', units: { SPEARMAN: -2, ARCHER: -1 } },
                weight: 8
            },
            {
                id: 'research_setback',
                title: 'Research Setback',
                description: 'An experiment has gone wrong, setting back your research efforts.',
                effect: { type: 'research', progress: -30 },
                weight: 5
            }
        ],
        CHOICE: [
            {
                id: 'trading_caravan',
                title: 'Trading Caravan',
                description: 'A trading caravan is passing through your territory, offering various deals.',
                choices: [
                    {
                        text: 'Trade 50 Food for 40 Ore',
                        effect: { type: 'trade', give: { FOOD: 50 }, receive: { ORE: 40 } },
                        requirement: { type: 'resource', resource: 'FOOD', amount: 50 }
                    },
                    {
                        text: 'Trade 40 Ore for 50 Food',
                        effect: { type: 'trade', give: { ORE: 40 }, receive: { FOOD: 50 } },
                        requirement: { type: 'resource', resource: 'ORE', amount: 40 }
                    },
                    {
                        text: 'Decline all offers',
                        effect: { type: 'none' }
                    }
                ],
                weight: 10
            },
            {
                id: 'foreign_emissary',
                title: 'Foreign Emissary',
                description: 'An emissary from a neighboring kingdom has arrived with a proposition.',
                choices: [
                    {
                        text: 'Accept alliance (gain 3 Cavalry, lose 100 Food)',
                        effect: { type: 'complex', effects: [
                            { type: 'units', units: { CAVALRY: 3 } },
                            { type: 'resource', resource: 'FOOD', amount: -100 }
                        ]},
                        requirement: { type: 'resource', resource: 'FOOD', amount: 100 }
                    },
                    {
                        text: 'Decline alliance',
                        effect: { type: 'none' }
                    },
                    {
                        text: 'Threaten emissary (50% chance of gaining 50 Ore, 50% chance of losing 2 units)',
                        effect: { type: 'random', effects: [
                            { chance: 0.5, effect: { type: 'resource', resource: 'ORE', amount: 50 } },
                            { chance: 0.5, effect: { type: 'units', units: { SPEARMAN: -1, ARCHER: -1 } } }
                        ]}
                    }
                ],
                weight: 8
            },
            {
                id: 'mysterious_stranger',
                title: 'Mysterious Stranger',
                description: 'A hooded figure offers you ancient knowledge in exchange for resources.',
                choices: [
                    {
                        text: 'Pay 80 Ore for research boost',
                        effect: { type: 'complex', effects: [
                            { type: 'resource', resource: 'ORE', amount: -80 },
                            { type: 'research', progress: 100 }
                        ]},
                        requirement: { type: 'resource', resource: 'ORE', amount: 80 }
                    },
                    {
                        text: 'Attempt to capture the stranger',
                        effect: { type: 'random', effects: [
                            { chance: 0.3, effect: { type: 'research', progress: 150 } },
                            { chance: 0.7, effect: { type: 'units', units: { SPEARMAN: -2 } } }
                        ]}
                    },
                    {
                        text: 'Send the stranger away',
                        effect: { type: 'none' }
                    }
                ],
                weight: 5
            }
        ]
    },

    // Missions
    MISSIONS: [
        {
            id: 'resource_stockpile',
            title: 'Resource Stockpile',
            description: 'Build up your resource reserves to prepare for expansion.',
            objectives: [
                { type: 'resource', resource: 'FOOD', amount: 200, current: 0 },
                { type: 'resource', resource: 'ORE', amount: 150, current: 0 }
            ],
            rewards: [
                { type: 'resource', resource: 'FOOD', amount: 50 },
                { type: 'resource', resource: 'ORE', amount: 50 }
            ],
            timeLimit: 300, // seconds
            weight: 10
        },
        {
            id: 'military_buildup',
            title: 'Military Buildup',
            description: 'Train a significant force to defend your territory.',
            objectives: [
                { type: 'units', unit: 'SPEARMAN', amount: 10, current: 0 },
                { type: 'units', unit: 'ARCHER', amount: 5, current: 0 }
            ],
            rewards: [
                { type: 'units', units: { CAVALRY: 3 } }
            ],
            timeLimit: 400, // seconds
            weight: 8
        },
        {
            id: 'defeat_enemies',
            title: 'Clear the Region',
            description: 'Defeat nearby enemy camps to secure your borders.',
            objectives: [
                { type: 'combat', campType: 'GOBLIN_CAMP', amount: 2, current: 0 },
                { type: 'combat', campType: 'BANDIT_HIDEOUT', amount: 1, current: 0 }
            ],
            rewards: [
                { type: 'resource', resource: 'FOOD', amount: 100 },
                { type: 'resource', resource: 'ORE', amount: 100 },
                { type: 'units', units: { SPEARMAN: 5 } }
            ],
            timeLimit: 600, // seconds
            weight: 6
        },
        {
            id: 'research_advancement',
            title: 'Technological Advancement',
            description: 'Complete research projects to advance your civilization.',
            objectives: [
                { type: 'research', amount: 2, current: 0 } // Complete 2 research projects
            ],
            rewards: [
                { type: 'resource', resource: 'ORE', amount: 150 },
                { type: 'research', progress: 50 }
            ],
            timeLimit: 500, // seconds
            weight: 7
        }
    ],

    // Initial game state
    INITIAL_STATE: {
        resources: {
            FOOD: 100,
            ORE: 100
        },
        buildings: {
            TOWN_HALL: { level: 1, x: 1, y: 1 }
        },
        units: {
            SPEARMAN: 0,
            ARCHER: 0,
            CAVALRY: 0
        },
        technologies: {
            MILITARY: {},
            ECONOMIC: {},
            DEFENSIVE: {}
        },
        researchQueue: [],
        mapSize: { width: 10, height: 10 },
        activeEvents: [],
        activeMissions: [],
        completedMissions: [],
        eventHistory: []
    }
};
