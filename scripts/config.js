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
            loot: { FOOD: 50, ORE: 30 }
        },
        BANDIT_HIDEOUT: {
            name: "Bandit Hideout",
            difficulty: 2,
            units: { BANDIT: 8 },
            loot: { FOOD: 80, ORE: 50 }
        }
    },

    // Combat settings
    COMBAT: {
        TRAVEL_SPEED: 10, // grid units per second
        LOOT_PERCENTAGE: 0.7, // percentage of resources that can be looted
        ADVANTAGE_MULTIPLIER: 1.5, // multiplier for unit type advantages
        DISADVANTAGE_MULTIPLIER: 0.7, // multiplier for unit type disadvantages
        CAMP_RESPAWN_TIME: 30, // seconds until a defeated camp respawns
        COMBAT_VISUALIZATION_TIME: 1 // seconds to visualize combat
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
        mapSize: { width: 10, height: 10 }
    }
};
