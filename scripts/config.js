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
        },

        // Outpost buildings for territories
        OUTPOST: {
            name: "Outpost",
            description: "Basic outpost for claimed territories",
            levels: [
                { cost: { FOOD: 100, ORE: 150 }, territoryBonus: 10, harvestingBonus: 15 },
                { cost: { FOOD: 200, ORE: 300 }, territoryBonus: 20, harvestingBonus: 30 },
                { cost: { FOOD: 400, ORE: 600 }, territoryBonus: 35, harvestingBonus: 50 }
            ],
            maxLevel: 3,
            isOutpost: true,
            buildTime: 120 // seconds
        },
        RESOURCE_STATION: {
            name: "Resource Station",
            description: "Increases resource production in territory",
            levels: [
                { cost: { FOOD: 150, ORE: 200 }, resourceBonus: 25, regenerationBonus: 20 },
                { cost: { FOOD: 300, ORE: 400 }, resourceBonus: 50, regenerationBonus: 40 },
                { cost: { FOOD: 600, ORE: 800 }, resourceBonus: 100, regenerationBonus: 80 }
            ],
            maxLevel: 3,
            isOutpost: true,
            buildTime: 180, // seconds
            requirements: { OUTPOST: 1 } // Requires Outpost level 1
        },
        GUARD_POST: {
            name: "Guard Post",
            description: "Provides defense for territory and resources",
            levels: [
                { cost: { FOOD: 120, ORE: 180 }, defenseBonus: 20, guardUnits: 5 },
                { cost: { FOOD: 240, ORE: 360 }, defenseBonus: 40, guardUnits: 10 },
                { cost: { FOOD: 480, ORE: 720 }, defenseBonus: 70, guardUnits: 20 }
            ],
            maxLevel: 3,
            isOutpost: true,
            buildTime: 150, // seconds
            requirements: { OUTPOST: 1 } // Requires Outpost level 1
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
        },

        // Specialized units
        HARVESTER: {
            name: "Harvester",
            cost: { FOOD: 25, ORE: 15 },
            stats: {
                attack: 2,
                defense: 3,
                hp: 8,
                carryCapacity: 25 // Higher carry capacity
            },
            upkeep: { FOOD: 1 },
            specialization: "harvesting",
            harvestBonus: 50, // 50% more resources when harvesting
            isSpecialized: true
        },
        SCOUT: {
            name: "Scout",
            cost: { FOOD: 20, ORE: 10 },
            stats: {
                attack: 3,
                defense: 2,
                hp: 6,
                carryCapacity: 5
            },
            upkeep: { FOOD: 1 },
            specialization: "exploration",
            visionRange: 2, // Can see 2 tiles further
            movementSpeed: 2.0, // Moves twice as fast
            isSpecialized: true
        },
        DEFENDER: {
            name: "Defender",
            cost: { FOOD: 15, ORE: 25 },
            stats: {
                attack: 4,
                defense: 10, // High defense
                hp: 15,
                carryCapacity: 8
            },
            upkeep: { FOOD: 1 },
            specialization: "defense",
            territoryDefenseBonus: 30, // 30% more defense in territories
            isSpecialized: true
        },
        DIPLOMAT: {
            name: "Diplomat",
            cost: { FOOD: 30, ORE: 10 },
            stats: {
                attack: 1,
                defense: 1,
                hp: 5,
                carryCapacity: 10
            },
            upkeep: { FOOD: 2 },
            specialization: "diplomacy",
            diplomaticInfluence: 20, // 20% better diplomatic relations
            isSpecialized: true
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
        TRAVEL_SPEED: 0.5, // grid units per second
        LOOT_PERCENTAGE: 0.8, // percentage of resources that can be looted
        ADVANTAGE_MULTIPLIER: 1.5, // multiplier for unit type advantages
        DISADVANTAGE_MULTIPLIER: 0.7, // multiplier for unit type disadvantages
        CAMP_RESPAWN_TIME: 300, // seconds until a defeated camp respawns (5 minutes)
        COMBAT_VISUALIZATION_TIME: 10, // seconds to visualize combat

        // Hero combat settings
        HERO_STRENGTH_MULTIPLIER: 5.0, // Heroes are 5x stronger than regular units
        HERO_ABILITY_COOLDOWN: 3,      // Cooldown between hero ability uses (in seconds)
        HERO_MAX_ABILITIES_PER_COMBAT: 2, // Maximum number of abilities a hero can use in a single combat

        // Terrain effects on combat
        TERRAIN_EFFECTS: {
            grass: {
                name: "Grassland",
                description: "Open terrain with no special effects",
                attack: 1.0,
                defense: 1.0,
                movementSpeed: 1.0,
                unitAdvantages: {
                    CAVALRY: 1.2 // Cavalry gets 20% bonus on grassland
                },
                visualEffect: "none",
                ambushChance: 0.05 // 5% chance of ambush
            },
            forest: {
                name: "Forest",
                description: "Provides cover for defenders and archers",
                attack: 0.9,
                defense: 1.2,
                movementSpeed: 0.8,
                unitAdvantages: {
                    ARCHER: 1.15, // Archers get 15% bonus in forests
                    SCOUT: 1.1 // Scouts get 10% bonus in forests
                },
                unitDisadvantages: {
                    CAVALRY: 0.8 // Cavalry gets 20% penalty in forests
                },
                visualEffect: "forest_cover",
                ambushChance: 0.15 // 15% chance of ambush
            },
            mountain: {
                name: "Mountain",
                description: "Difficult terrain that favors defenders",
                attack: 0.7,
                defense: 1.4,
                movementSpeed: 0.6,
                unitAdvantages: {
                    DEFENDER: 1.3 // Defenders get 30% bonus in mountains
                },
                unitDisadvantages: {
                    CAVALRY: 0.7, // Cavalry gets 30% penalty in mountains
                    SPEARMAN: 0.9 // Spearmen get 10% penalty in mountains
                },
                visualEffect: "high_ground",
                ambushChance: 0.1 // 10% chance of ambush
            },
            water: {
                name: "Water",
                description: "Crossing water is difficult without proper technology",
                attack: 0.6,
                defense: 0.8,
                movementSpeed: 0.4,
                unitAdvantages: {},
                unitDisadvantages: {
                    SPEARMAN: 0.7, // Spearmen get 30% penalty in water
                    ARCHER: 0.8, // Archers get 20% penalty in water
                    CAVALRY: 0.6 // Cavalry gets 40% penalty in water
                },
                visualEffect: "water_splash",
                ambushChance: 0.0 // No ambush in water
            },
            desert: {
                name: "Desert",
                description: "Hot, dry terrain that drains stamina",
                attack: 0.8,
                defense: 0.9,
                movementSpeed: 0.7,
                unitAdvantages: {
                    SCOUT: 1.2 // Scouts get 20% bonus in desert
                },
                unitDisadvantages: {
                    SPEARMAN: 0.9, // Spearmen get 10% penalty in desert
                    DEFENDER: 0.8 // Defenders get 20% penalty in desert
                },
                visualEffect: "heat_haze",
                ambushChance: 0.05 // 5% chance of ambush
            },
            swamp: {
                name: "Swamp",
                description: "Muddy terrain that slows movement and reduces combat effectiveness",
                attack: 0.7,
                defense: 0.8,
                movementSpeed: 0.5,
                unitAdvantages: {},
                unitDisadvantages: {
                    CAVALRY: 0.6, // Cavalry gets 40% penalty in swamp
                    SPEARMAN: 0.8, // Spearmen get 20% penalty in swamp
                    ARCHER: 0.9 // Archers get 10% penalty in swamp
                },
                visualEffect: "mud_splash",
                ambushChance: 0.2 // 20% chance of ambush
            },
            hills: {
                name: "Hills",
                description: "Elevated terrain that provides tactical advantages",
                attack: 0.9,
                defense: 1.2,
                movementSpeed: 0.8,
                unitAdvantages: {
                    ARCHER: 1.25 // Archers get 25% bonus in hills
                },
                unitDisadvantages: {
                    CAVALRY: 0.9 // Cavalry gets 10% penalty in hills
                },
                visualEffect: "elevated_position",
                ambushChance: 0.1 // 10% chance of ambush
            },
            plains: {
                name: "Plains",
                description: "Wide open terrain ideal for large-scale battles",
                attack: 1.1,
                defense: 0.9,
                movementSpeed: 1.1,
                unitAdvantages: {
                    CAVALRY: 1.3, // Cavalry gets 30% bonus on plains
                    SPEARMAN: 1.1 // Spearmen get 10% bonus on plains
                },
                unitDisadvantages: {},
                visualEffect: "open_field",
                ambushChance: 0.0 // No ambush on plains
            }
        },

        // Combat formations
        FORMATIONS: {
            balanced: {
                name: "Balanced",
                description: "Equal distribution of attack and defense",
                attack: 1.0,
                defense: 1.0,
                casualtyRate: 1.0,
                unitBonuses: {},
                terrainAdvantages: [],
                specialEffects: [],
                icon: "⚖️",
                visualEffect: "balanced_formation"
            },
            aggressive: {
                name: "Aggressive",
                description: "+30% attack, -30% defense, +20% casualties",
                attack: 1.3,
                defense: 0.7,
                casualtyRate: 1.2,
                unitBonuses: {
                    SPEARMAN: { attack: 1.1 }, // Spearmen get +10% attack in aggressive formation
                    CAVALRY: { attack: 1.2 }  // Cavalry get +20% attack in aggressive formation
                },
                terrainAdvantages: ["plains", "grass"],
                specialEffects: ["first_strike"], // Attack first in combat
                icon: "⚔️",
                visualEffect: "aggressive_charge"
            },
            defensive: {
                name: "Defensive",
                description: "-30% attack, +30% defense, -20% casualties",
                attack: 0.7,
                defense: 1.3,
                casualtyRate: 0.8,
                unitBonuses: {
                    SPEARMAN: { defense: 1.2 }, // Spearmen get +20% defense in defensive formation
                    DEFENDER: { defense: 1.3 }  // Defenders get +30% defense in defensive formation
                },
                terrainAdvantages: ["forest", "mountain", "hills"],
                specialEffects: ["shield_wall"], // Reduced damage from first enemy attack
                icon: "🛡️",
                visualEffect: "shield_wall"
            },
            flanking: {
                name: "Flanking",
                description: "+20% attack, -10% defense, -10% casualties",
                attack: 1.2,
                defense: 0.9,
                casualtyRate: 0.9,
                unitBonuses: {
                    CAVALRY: { attack: 1.3, speed: 1.2 }, // Cavalry get +30% attack and +20% speed in flanking
                    SCOUT: { attack: 1.2, speed: 1.3 }    // Scouts get +20% attack and +30% speed in flanking
                },
                terrainAdvantages: ["plains", "hills"],
                specialEffects: ["surprise_attack"], // Chance to bypass enemy defense
                icon: "↪️",
                visualEffect: "flanking_maneuver"
            },
            skirmish: {
                name: "Skirmish",
                description: "Mobile hit-and-run tactics",
                attack: 1.1,
                defense: 0.8,
                casualtyRate: 0.7,
                unitBonuses: {
                    ARCHER: { attack: 1.25, range: 1.2 }, // Archers get +25% attack and +20% range
                    SCOUT: { speed: 1.4, evasion: 1.3 }   // Scouts get +40% speed and +30% evasion
                },
                terrainAdvantages: ["forest", "hills"],
                specialEffects: ["hit_and_run"], // Chance to avoid counterattack
                icon: "🏹",
                visualEffect: "skirmish_movement"
            },
            phalanx: {
                name: "Phalanx",
                description: "Tight formation with spears and shields",
                attack: 0.9,
                defense: 1.4,
                casualtyRate: 0.9,
                unitBonuses: {
                    SPEARMAN: { attack: 1.2, defense: 1.3 }, // Spearmen get +20% attack and +30% defense
                    DEFENDER: { defense: 1.4 }              // Defenders get +40% defense
                },
                terrainAdvantages: ["plains", "grass"],
                specialEffects: ["counter_attack"], // Automatic counterattack
                icon: "🔱",
                visualEffect: "phalanx_wall"
            },
            wedge: {
                name: "Wedge",
                description: "V-shaped formation to break enemy lines",
                attack: 1.4,
                defense: 0.8,
                casualtyRate: 1.3,
                unitBonuses: {
                    CAVALRY: { attack: 1.4, penetration: 1.5 }, // Cavalry get +40% attack and +50% penetration
                    SPEARMAN: { attack: 1.2 }                  // Spearmen get +20% attack
                },
                terrainAdvantages: ["plains"],
                specialEffects: ["breakthrough"], // Chance to break enemy formation
                icon: "▼",
                visualEffect: "wedge_charge"
            },
            ambush: {
                name: "Ambush",
                description: "Hidden formation for surprise attacks",
                attack: 1.5,
                defense: 0.6,
                casualtyRate: 0.8,
                unitBonuses: {
                    ARCHER: { attack: 1.3, critical: 1.4 }, // Archers get +30% attack and +40% critical chance
                    SCOUT: { stealth: 1.5, critical: 1.3 }  // Scouts get +50% stealth and +30% critical chance
                },
                terrainAdvantages: ["forest", "hills", "mountain"],
                specialEffects: ["surprise_round"], // Extra attack round at start of combat
                icon: "🥷",
                visualEffect: "ambush_surprise"
            }
        },

        // Weather effects on combat
        WEATHER_EFFECTS: {
            clear: {
                name: "Clear",
                description: "Clear weather with no special effects",
                attack: 1.0,
                defense: 1.0,
                movementSpeed: 1.0,
                unitEffects: {},
                visualEffect: "clear_sky",
                probability: 0.5 // 50% chance of clear weather
            },
            rain: {
                name: "Rain",
                description: "Rainy weather that reduces archer effectiveness",
                attack: 0.9,
                defense: 1.0,
                movementSpeed: 0.8,
                unitEffects: {
                    ARCHER: { attack: 0.7, range: 0.8 }, // Archers get -30% attack and -20% range
                    CAVALRY: { speed: 0.8 }             // Cavalry gets -20% speed
                },
                terrainEffects: {
                    grass: { movementSpeed: 0.7 },  // Grass becomes muddy
                    plains: { movementSpeed: 0.7 }, // Plains become muddy
                    forest: { defense: 1.1 }         // Forest provides more cover in rain
                },
                visualEffect: "rain_drops",
                probability: 0.2 // 20% chance of rain
            },
            fog: {
                name: "Fog",
                description: "Foggy weather that reduces visibility and attack range",
                attack: 0.8,
                defense: 1.1,
                movementSpeed: 0.9,
                unitEffects: {
                    ARCHER: { attack: 0.6, range: 0.5 }, // Archers get -40% attack and -50% range
                    SCOUT: { vision: 0.5 }              // Scouts get -50% vision
                },
                terrainEffects: {
                    forest: { defense: 1.3 }, // Forest provides even more cover in fog
                    hills: { defense: 1.2 }   // Hills provide more cover in fog
                },
                visualEffect: "fog_overlay",
                probability: 0.15 // 15% chance of fog
            },
            snow: {
                name: "Snow",
                description: "Snowy weather that slows movement but provides camouflage",
                attack: 0.9,
                defense: 1.0,
                movementSpeed: 0.7,
                unitEffects: {
                    CAVALRY: { speed: 0.6, attack: 0.8 }, // Cavalry gets -40% speed and -20% attack
                    SPEARMAN: { movementSpeed: 0.8 }      // Spearmen get -20% movement speed
                },
                terrainEffects: {
                    mountain: { defense: 1.2 }, // Mountains provide more defense in snow
                    forest: { attack: 0.8 }     // Forests reduce attack in snow
                },
                visualEffect: "snow_overlay",
                probability: 0.1 // 10% chance of snow
            },
            sandstorm: {
                name: "Sandstorm",
                description: "Violent sandstorm that reduces visibility and combat effectiveness",
                attack: 0.7,
                defense: 0.8,
                movementSpeed: 0.6,
                unitEffects: {
                    ARCHER: { attack: 0.5, range: 0.4 }, // Archers get -50% attack and -60% range
                    CAVALRY: { speed: 0.7 },             // Cavalry gets -30% speed
                    SPEARMAN: { attack: 0.8 }            // Spearmen get -20% attack
                },
                terrainEffects: {
                    desert: { movementSpeed: 0.5, attack: 0.6 } // Desert becomes much worse in sandstorm
                },
                visualEffect: "sandstorm_overlay",
                probability: 0.05 // 5% chance of sandstorm
            }
        }
    },

    // Research technologies
    TECHNOLOGIES: {
        // Military technologies
        MILITARY: {
            // Tier 1 - Basic military technologies
            IMPROVED_WEAPONS: {
                name: "Improved Weapons",
                description: "Increases attack of all units by 20%",
                cost: { FOOD: 100, ORE: 200 },
                researchTime: 60, // seconds
                tier: 1,
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
                tier: 1,
                effects: {
                    unitDefenseBonus: 0.2 // 20% defense bonus
                },
                requirements: { LIBRARY: 1 }
            },

            // Tier 2 - Advanced military technologies
            ADVANCED_TACTICS: {
                name: "Advanced Tactics",
                description: "Increases unit type advantages by 10%",
                cost: { FOOD: 200, ORE: 200 },
                researchTime: 90,
                tier: 2,
                effects: {
                    advantageBonus: 0.1 // 10% increase to advantage multiplier
                },
                requirements: { LIBRARY: 2, TECHNOLOGIES: { MILITARY: { IMPROVED_WEAPONS: true, IMPROVED_ARMOR: true } } }
            },
            SPECIALIZED_TRAINING: {
                name: "Specialized Training",
                description: "Unlocks specialized unit types",
                cost: { FOOD: 250, ORE: 250 },
                researchTime: 120,
                tier: 2,
                effects: {
                    unlockSpecializedUnits: true
                },
                requirements: { LIBRARY: 2, BARRACKS: 2, TECHNOLOGIES: { MILITARY: { IMPROVED_WEAPONS: true } } }
            },

            // Tier 3 - Elite military technologies
            ELITE_FORCES: {
                name: "Elite Forces",
                description: "Increases all unit stats by 15%",
                cost: { FOOD: 400, ORE: 400 },
                researchTime: 180,
                tier: 3,
                effects: {
                    unitAttackBonus: 0.15,
                    unitDefenseBonus: 0.15,
                    unitHealthBonus: 0.15
                },
                requirements: { LIBRARY: 3, TECHNOLOGIES: { MILITARY: { ADVANCED_TACTICS: true, SPECIALIZED_TRAINING: true } } }
            },
            SIEGE_WARFARE: {
                name: "Siege Warfare",
                description: "Unlocks siege units and increases damage to buildings by 50%",
                cost: { FOOD: 300, ORE: 500 },
                researchTime: 240,
                tier: 3,
                effects: {
                    unlockSiegeUnits: true,
                    buildingDamageBonus: 0.5
                },
                requirements: { LIBRARY: 3, WORKSHOP: 2, TECHNOLOGIES: { MILITARY: { ADVANCED_TACTICS: true } } }
            }
        },

        // Economic technologies
        ECONOMIC: {
            // Tier 1 - Basic economic technologies
            EFFICIENT_FARMING: {
                name: "Efficient Farming",
                description: "Increases food production by 25%",
                cost: { FOOD: 100, ORE: 100 },
                researchTime: 45,
                tier: 1,
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
                tier: 1,
                effects: {
                    oreProductionBonus: 0.25 // 25% ore production bonus
                },
                requirements: { LIBRARY: 1, MINE: 1 }
            },

            // Tier 2 - Advanced economic technologies
            RESOURCE_MANAGEMENT: {
                name: "Resource Management",
                description: "Increases storage capacity by 30%",
                cost: { FOOD: 150, ORE: 150 },
                researchTime: 60,
                tier: 2,
                effects: {
                    storageCapacityBonus: 0.3 // 30% storage capacity bonus
                },
                requirements: { LIBRARY: 2, STORAGE: 1, TECHNOLOGIES: { ECONOMIC: { EFFICIENT_FARMING: true, IMPROVED_MINING: true } } }
            },
            TRADE_ROUTES: {
                name: "Trade Routes",
                description: "Unlocks trading system and improves trade rates by 20%",
                cost: { FOOD: 200, ORE: 150 },
                researchTime: 90,
                tier: 2,
                effects: {
                    unlockTrading: true,
                    tradeRateBonus: 0.2
                },
                requirements: { LIBRARY: 2, MARKET: 1 }
            },

            // Tier 3 - Elite economic technologies
            ADVANCED_AGRICULTURE: {
                name: "Advanced Agriculture",
                description: "Increases food production by 50% and unlocks special crops",
                cost: { FOOD: 300, ORE: 200 },
                researchTime: 120,
                tier: 3,
                effects: {
                    foodProductionBonus: 0.5,
                    unlockSpecialCrops: true
                },
                requirements: { LIBRARY: 3, FARM: 3, TECHNOLOGIES: { ECONOMIC: { EFFICIENT_FARMING: true, RESOURCE_MANAGEMENT: true } } }
            },
            BANKING: {
                name: "Banking",
                description: "Enables resource loans and interest generation",
                cost: { FOOD: 250, ORE: 350 },
                researchTime: 150,
                tier: 3,
                effects: {
                    unlockBanking: true,
                    passiveIncomeRate: 0.05 // 5% passive income
                },
                requirements: { LIBRARY: 3, MARKET: 2, TECHNOLOGIES: { ECONOMIC: { TRADE_ROUTES: true } } }
            }
        },

        // Defensive technologies
        DEFENSIVE: {
            // Tier 1 - Basic defensive technologies
            REINFORCED_WALLS: {
                name: "Reinforced Walls",
                description: "Increases wall defense by 30%",
                cost: { FOOD: 50, ORE: 200 },
                researchTime: 60,
                tier: 1,
                effects: {
                    wallDefenseBonus: 0.3 // 30% wall defense bonus
                },
                requirements: { LIBRARY: 1, WALL: 1 }
            },
            WATCHTOWERS: {
                name: "Watchtowers",
                description: "Increases vision range by 2 tiles and provides early warning of attacks",
                cost: { FOOD: 100, ORE: 150 },
                researchTime: 60,
                tier: 1,
                effects: {
                    visionRangeBonus: 2,
                    earlyWarning: true
                },
                requirements: { LIBRARY: 1, WATCHTOWER: 1 }
            },

            // Tier 2 - Advanced defensive technologies
            DEFENSIVE_TACTICS: {
                name: "Defensive Tactics",
                description: "Reduces casualties in defensive battles by 20%",
                cost: { FOOD: 200, ORE: 100 },
                researchTime: 75,
                tier: 2,
                effects: {
                    defensiveCasualtyReduction: 0.2 // 20% reduction in defensive casualties
                },
                requirements: { LIBRARY: 2, WALL: 2, TECHNOLOGIES: { DEFENSIVE: { REINFORCED_WALLS: true } } }
            },
            TRAPS_AND_BARRIERS: {
                name: "Traps and Barriers",
                description: "Adds passive damage to attacking enemies and slows their approach",
                cost: { FOOD: 150, ORE: 250 },
                researchTime: 90,
                tier: 2,
                effects: {
                    passiveDefenseDamage: 10,
                    enemyMovementPenalty: 0.3
                },
                requirements: { LIBRARY: 2, WORKSHOP: 1, TECHNOLOGIES: { DEFENSIVE: { WATCHTOWERS: true } } }
            },

            // Tier 3 - Elite defensive technologies
            FORTIFICATIONS: {
                name: "Advanced Fortifications",
                description: "Increases all defensive structures' effectiveness by 40%",
                cost: { FOOD: 300, ORE: 500 },
                researchTime: 180,
                tier: 3,
                effects: {
                    allDefensesBonus: 0.4
                },
                requirements: { LIBRARY: 3, WALL: 3, TECHNOLOGIES: { DEFENSIVE: { DEFENSIVE_TACTICS: true, TRAPS_AND_BARRIERS: true } } }
            },
            AUTOMATED_DEFENSES: {
                name: "Automated Defenses",
                description: "Defensive structures can attack without requiring units",
                cost: { FOOD: 400, ORE: 400 },
                researchTime: 210,
                tier: 3,
                effects: {
                    unlockAutomatedDefenses: true,
                    automatedDefenseDamage: 15
                },
                requirements: { LIBRARY: 3, WORKSHOP: 2, TECHNOLOGIES: { DEFENSIVE: { TRAPS_AND_BARRIERS: true } } }
            }
        },

        // Diplomatic technologies - New category
        DIPLOMATIC: {
            // Tier 1 - Basic diplomatic technologies
            DIPLOMACY: {
                name: "Diplomacy",
                description: "Unlocks diplomatic relations with other players",
                cost: { FOOD: 150, ORE: 100 },
                researchTime: 60,
                tier: 1,
                effects: {
                    unlockDiplomacy: true
                },
                requirements: { LIBRARY: 1 }
            },
            EMISSARIES: {
                name: "Emissaries",
                description: "Allows sending diplomats to other players, improving relations",
                cost: { FOOD: 200, ORE: 50 },
                researchTime: 75,
                tier: 1,
                effects: {
                    diplomaticInfluenceBonus: 0.2
                },
                requirements: { LIBRARY: 1, TECHNOLOGIES: { DIPLOMATIC: { DIPLOMACY: true } } }
            },

            // Tier 2 - Advanced diplomatic technologies
            ALLIANCES: {
                name: "Alliances",
                description: "Enables forming alliances with other players for mutual benefits",
                cost: { FOOD: 250, ORE: 150 },
                researchTime: 90,
                tier: 2,
                effects: {
                    unlockAlliances: true,
                    allianceBonuses: true
                },
                requirements: { LIBRARY: 2, TECHNOLOGIES: { DIPLOMATIC: { EMISSARIES: true } } }
            },
            CULTURAL_EXCHANGE: {
                name: "Cultural Exchange",
                description: "Improves relations with all players and increases trade benefits",
                cost: { FOOD: 200, ORE: 200 },
                researchTime: 90,
                tier: 2,
                effects: {
                    globalRelationsBonus: 10,
                    tradeBonusWithAllies: 0.25
                },
                requirements: { LIBRARY: 2, MARKET: 1, TECHNOLOGIES: { DIPLOMATIC: { DIPLOMACY: true } } }
            },

            // Tier 3 - Elite diplomatic technologies
            FEDERATION: {
                name: "Federation",
                description: "Enables creating a federation with shared resources and defenses",
                cost: { FOOD: 400, ORE: 300 },
                researchTime: 180,
                tier: 3,
                effects: {
                    unlockFederation: true,
                    sharedResourcesBonus: 0.1,
                    sharedDefenseBonus: 0.2
                },
                requirements: { LIBRARY: 3, TECHNOLOGIES: { DIPLOMATIC: { ALLIANCES: true, CULTURAL_EXCHANGE: true } } }
            },
            ESPIONAGE: {
                name: "Espionage",
                description: "Enables spying on other players and conducting covert operations",
                cost: { FOOD: 300, ORE: 400 },
                researchTime: 210,
                tier: 3,
                effects: {
                    unlockEspionage: true,
                    spyEffectiveness: 0.3
                },
                requirements: { LIBRARY: 3, TECHNOLOGIES: { DIPLOMATIC: { EMISSARIES: true }, MILITARY: { ADVANCED_TACTICS: true } } }
            }
        },

        // Exploration technologies - New category
        EXPLORATION: {
            // Tier 1 - Basic exploration technologies
            SCOUTING: {
                name: "Scouting",
                description: "Increases map visibility and exploration speed",
                cost: { FOOD: 100, ORE: 50 },
                researchTime: 45,
                tier: 1,
                effects: {
                    explorationSpeedBonus: 0.3,
                    mapVisibilityBonus: 1
                },
                requirements: { LIBRARY: 1 }
            },
            CARTOGRAPHY: {
                name: "Cartography",
                description: "Improves map accuracy and reveals resource locations",
                cost: { FOOD: 75, ORE: 125 },
                researchTime: 60,
                tier: 1,
                effects: {
                    mapAccuracyBonus: true,
                    revealResourceNodes: true
                },
                requirements: { LIBRARY: 1 }
            },

            // Tier 2 - Advanced exploration technologies
            NAVIGATION: {
                name: "Navigation",
                description: "Enables crossing water tiles and improves movement speed",
                cost: { FOOD: 150, ORE: 200 },
                researchTime: 90,
                tier: 2,
                effects: {
                    waterCrossing: true,
                    movementSpeedBonus: 0.2
                },
                requirements: { LIBRARY: 2, TECHNOLOGIES: { EXPLORATION: { CARTOGRAPHY: true } } }
            },
            RESOURCE_DETECTION: {
                name: "Resource Detection",
                description: "Reveals all resource nodes on the map and their quality",
                cost: { FOOD: 200, ORE: 150 },
                researchTime: 75,
                tier: 2,
                effects: {
                    revealAllResources: true,
                    resourceQualityInfo: true
                },
                requirements: { LIBRARY: 2, TECHNOLOGIES: { EXPLORATION: { SCOUTING: true, CARTOGRAPHY: true } } }
            },

            // Tier 3 - Elite exploration technologies
            SPECIAL_RESOURCE_DETECTION: {
                name: "Special Resource Detection",
                description: "Reveals special resource nodes and their effects",
                cost: { FOOD: 250, ORE: 350 },
                researchTime: 120,
                tier: 3,
                effects: {
                    revealSpecialResources: true,
                    specialResourceBonuses: 0.2
                },
                requirements: { LIBRARY: 3, TECHNOLOGIES: { EXPLORATION: { RESOURCE_DETECTION: true } } }
            },
            ADVANCED_EXPLORATION: {
                name: "Advanced Exploration",
                description: "Reveals the entire map and all enemy positions",
                cost: { FOOD: 400, ORE: 300 },
                researchTime: 180,
                tier: 3,
                effects: {
                    revealEntireMap: true,
                    revealEnemyPositions: true
                },
                requirements: { LIBRARY: 3, WATCHTOWER: 2, TECHNOLOGIES: { EXPLORATION: { NAVIGATION: true, RESOURCE_DETECTION: true } } }
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

    // Hero system configuration
    HEROES: {
        // Maximum number of heroes the player can have
        MAX_HEROES: 5,

        // Time interval (in seconds) for refreshing available heroes
        REFRESH_INTERVAL: 300, // 5 minutes

        // Hero types
        TYPES: {
            WARRIOR: {
                name: "Warrior",
                description: "A powerful melee fighter with high attack and defense.",
                specialization: "combat",
                portrait: "⚔️",
                baseCost: { FOOD: 200, ORE: 300 },
                baseStats: {
                    attack: 15,
                    defense: 12,
                    hp: 100,
                    speed: 8,
                    leadership: 5
                },
                growthRates: {
                    attack: 3,
                    defense: 2,
                    hp: 15,
                    speed: 1,
                    leadership: 1
                },
                startingAbility: "cleave",
                abilities: [
                    { id: "cleave", unlockLevel: 1 },
                    { id: "rally", unlockLevel: 3 },
                    { id: "shieldWall", unlockLevel: 5 }
                ],
                namePrefixes: ["Brave", "Mighty", "Valiant", "Bold", "Strong"],
                nameSuffixes: ["Warrior", "Knight", "Defender", "Champion", "Protector"],
                possibleTraits: [
                    { id: "strong", name: "Strong", description: "+2 Attack", bonuses: { attack: 2 } },
                    { id: "tough", name: "Tough", description: "+2 Defense", bonuses: { defense: 2 } },
                    { id: "inspiring", name: "Inspiring", description: "+3 Leadership", bonuses: { leadership: 3 } },
                    { id: "swift", name: "Swift", description: "+2 Speed", bonuses: { speed: 2 } }
                ]
            },
            RANGER: {
                name: "Ranger",
                description: "A skilled archer with high speed and exploration abilities.",
                specialization: "exploration",
                portrait: "🏹",
                baseCost: { FOOD: 250, ORE: 200 },
                baseStats: {
                    attack: 12,
                    defense: 8,
                    hp: 80,
                    speed: 12,
                    leadership: 4
                },
                growthRates: {
                    attack: 2,
                    defense: 1,
                    hp: 10,
                    speed: 3,
                    leadership: 1
                },
                startingAbility: "preciseShot",
                abilities: [
                    { id: "preciseShot", unlockLevel: 1 },
                    { id: "trackingSkills", unlockLevel: 3 },
                    { id: "rapidFire", unlockLevel: 5 }
                ],
                namePrefixes: ["Swift", "Sharp", "Keen", "Silent", "Vigilant"],
                nameSuffixes: ["Ranger", "Hunter", "Tracker", "Scout", "Archer"],
                possibleTraits: [
                    { id: "eagle_eye", name: "Eagle Eye", description: "+2 Attack", bonuses: { attack: 2 } },
                    { id: "stealthy", name: "Stealthy", description: "+3 Speed", bonuses: { speed: 3 } },
                    { id: "survivor", name: "Survivor", description: "+15 HP", bonuses: { hp: 15 } },
                    { id: "pathfinder", name: "Pathfinder", description: "Improved exploration", bonuses: { exploration: 2 } }
                ]
            },
            MAGE: {
                name: "Mage",
                description: "A powerful spellcaster with magical abilities and knowledge.",
                specialization: "magic",
                portrait: "🧙",
                baseCost: { FOOD: 300, ORE: 200 },
                baseStats: {
                    attack: 15,
                    defense: 6,
                    hp: 70,
                    speed: 7,
                    leadership: 6,
                    magic: 15
                },
                growthRates: {
                    attack: 2,
                    defense: 1,
                    hp: 8,
                    speed: 1,
                    leadership: 1,
                    magic: 3
                },
                startingAbility: "fireball",
                abilities: [
                    { id: "fireball", unlockLevel: 1 },
                    { id: "frostNova", unlockLevel: 3 },
                    { id: "arcaneShield", unlockLevel: 5 }
                ],
                namePrefixes: ["Wise", "Arcane", "Mystic", "Learned", "Ancient"],
                nameSuffixes: ["Mage", "Wizard", "Sorcerer", "Sage", "Spellcaster"],
                possibleTraits: [
                    { id: "brilliant", name: "Brilliant", description: "+3 Magic", bonuses: { magic: 3 } },
                    { id: "focused", name: "Focused", description: "+2 Attack", bonuses: { attack: 2 } },
                    { id: "scholarly", name: "Scholarly", description: "Faster research", bonuses: { research: 2 } },
                    { id: "energetic", name: "Energetic", description: "+2 Speed", bonuses: { speed: 2 } }
                ]
            },
            DIPLOMAT: {
                name: "Diplomat",
                description: "A skilled negotiator with high leadership and diplomatic abilities.",
                specialization: "diplomacy",
                portrait: "🤝",
                baseCost: { FOOD: 200, ORE: 150 },
                baseStats: {
                    attack: 6,
                    defense: 8,
                    hp: 75,
                    speed: 9,
                    leadership: 15,
                    diplomacy: 15
                },
                growthRates: {
                    attack: 1,
                    defense: 1,
                    hp: 10,
                    speed: 1,
                    leadership: 3,
                    diplomacy: 3
                },
                startingAbility: "negotiate",
                abilities: [
                    { id: "negotiate", unlockLevel: 1 },
                    { id: "inspire", unlockLevel: 3 },
                    { id: "alliance", unlockLevel: 5 }
                ],
                namePrefixes: ["Noble", "Eloquent", "Charming", "Respected", "Honorable"],
                nameSuffixes: ["Diplomat", "Envoy", "Ambassador", "Emissary", "Negotiator"],
                possibleTraits: [
                    { id: "charismatic", name: "Charismatic", description: "+3 Leadership", bonuses: { leadership: 3 } },
                    { id: "persuasive", name: "Persuasive", description: "+3 Diplomacy", bonuses: { diplomacy: 3 } },
                    { id: "well_connected", name: "Well-Connected", description: "Better trade deals", bonuses: { trade: 2 } },
                    { id: "tactical", name: "Tactical", description: "+2 Defense", bonuses: { defense: 2 } }
                ]
            }
        },

        // Hero abilities
        ABILITIES: {
            // Warrior abilities
            "cleave": {
                name: "Cleave",
                description: "A powerful attack that hits multiple enemies",
                type: "combat",
                power: 1.5,
                cooldown: 3,
                areaOfEffect: true,
                icon: "⚔️"
            },
            "rally": {
                name: "Rally",
                description: "Boost the morale of nearby units, increasing their attack",
                type: "support",
                power: 1.3,
                cooldown: 5,
                targetStat: "attack",
                duration: 3,
                icon: "🚩"
            },
            "shieldWall": {
                name: "Shield Wall",
                description: "Create a defensive formation that increases defense",
                type: "support",
                power: 1.5,
                cooldown: 4,
                targetStat: "defense",
                duration: 3,
                icon: "🛡️"
            },

            // Ranger abilities
            "preciseShot": {
                name: "Precise Shot",
                description: "A carefully aimed shot that deals high damage",
                type: "combat",
                power: 2.0,
                cooldown: 3,
                areaOfEffect: false,
                icon: "🎯"
            },
            "trackingSkills": {
                name: "Tracking Skills",
                description: "Reveal hidden enemies and resources in the area",
                type: "exploration",
                power: 2,
                cooldown: 5,
                duration: 3,
                icon: "👁️"
            },
            "rapidFire": {
                name: "Rapid Fire",
                description: "Fire multiple arrows in quick succession",
                type: "combat",
                power: 1.2,
                cooldown: 4,
                hits: 3,
                icon: "🏹"
            },

            // Mage abilities
            "fireball": {
                name: "Fireball",
                description: "Launch a ball of fire that explodes on impact",
                type: "combat",
                power: 2.0,
                cooldown: 3,
                areaOfEffect: true,
                icon: "🔥"
            },
            "frostNova": {
                name: "Frost Nova",
                description: "Freeze enemies in place, reducing their speed",
                type: "combat",
                power: 1.0,
                cooldown: 4,
                targetStat: "speed",
                duration: 2,
                icon: "❄️"
            },
            "arcaneShield": {
                name: "Arcane Shield",
                description: "Create a magical barrier that absorbs damage",
                type: "support",
                power: 2.0,
                cooldown: 5,
                duration: 3,
                icon: "🔮"
            },

            // Diplomat abilities
            "negotiate": {
                name: "Negotiate",
                description: "Attempt to resolve a conflict peacefully",
                type: "diplomacy",
                power: 1.5,
                cooldown: 3,
                icon: "🤝"
            },
            "inspire": {
                name: "Inspire",
                description: "Inspire nearby units, increasing all their stats",
                type: "support",
                power: 1.2,
                cooldown: 4,
                targetStat: "all",
                duration: 3,
                icon: "✨"
            },
            "alliance": {
                name: "Alliance",
                description: "Form a temporary alliance with neutral or enemy forces",
                type: "diplomacy",
                power: 2.0,
                cooldown: 6,
                duration: 5,
                icon: "🤲"
            }
        },

        // Hero equipment
        EQUIPMENT: {
            // Weapons
            WEAPONS: {
                "iron_sword": {
                    name: "Iron Sword",
                    description: "A basic sword that increases attack",
                    type: "weapon",
                    rarity: "common",
                    bonuses: { attack: 3 },
                    icon: "🗡️"
                },
                "steel_axe": {
                    name: "Steel Axe",
                    description: "A heavy axe that deals significant damage",
                    type: "weapon",
                    rarity: "uncommon",
                    bonuses: { attack: 5 },
                    icon: "🪓"
                },
                "enchanted_bow": {
                    name: "Enchanted Bow",
                    description: "A magical bow that increases attack and speed",
                    type: "weapon",
                    rarity: "rare",
                    bonuses: { attack: 4, speed: 2 },
                    icon: "🏹"
                },
                "staff_of_power": {
                    name: "Staff of Power",
                    description: "A powerful staff that enhances magical abilities",
                    type: "weapon",
                    rarity: "rare",
                    bonuses: { attack: 3, magic: 5 },
                    icon: "🪄"
                },
                "legendary_blade": {
                    name: "Legendary Blade",
                    description: "An ancient blade of immense power",
                    type: "weapon",
                    rarity: "legendary",
                    bonuses: { attack: 8, leadership: 3 },
                    icon: "⚔️"
                }
            },

            // Armor
            ARMOR: {
                "leather_armor": {
                    name: "Leather Armor",
                    description: "Basic armor that provides some protection",
                    type: "armor",
                    rarity: "common",
                    bonuses: { defense: 3 },
                    icon: "🥋"
                },
                "chainmail": {
                    name: "Chainmail",
                    description: "Metal armor that offers good protection",
                    type: "armor",
                    rarity: "uncommon",
                    bonuses: { defense: 5 },
                    icon: "👕"
                },
                "plate_armor": {
                    name: "Plate Armor",
                    description: "Heavy armor that provides excellent protection",
                    type: "armor",
                    rarity: "rare",
                    bonuses: { defense: 7, speed: -1 },
                    icon: "🛡️"
                },
                "mage_robes": {
                    name: "Mage Robes",
                    description: "Enchanted robes that enhance magical abilities",
                    type: "armor",
                    rarity: "rare",
                    bonuses: { defense: 3, magic: 4 },
                    icon: "👘"
                },
                "dragon_scale_armor": {
                    name: "Dragon Scale Armor",
                    description: "Legendary armor made from dragon scales",
                    type: "armor",
                    rarity: "legendary",
                    bonuses: { defense: 10, hp: 20 },
                    icon: "🐉"
                }
            },

            // Accessories
            ACCESSORIES: {
                "lucky_charm": {
                    name: "Lucky Charm",
                    description: "A charm that brings good fortune",
                    type: "accessory",
                    rarity: "common",
                    bonuses: { leadership: 2 },
                    icon: "🍀"
                },
                "speed_amulet": {
                    name: "Speed Amulet",
                    description: "An amulet that increases movement speed",
                    type: "accessory",
                    rarity: "uncommon",
                    bonuses: { speed: 3 },
                    icon: "⏱️"
                },
                "healing_pendant": {
                    name: "Healing Pendant",
                    description: "A pendant that regenerates health over time",
                    type: "accessory",
                    rarity: "rare",
                    bonuses: { hp: 15 },
                    specialEffect: "regeneration",
                    icon: "❤️"
                },
                "crown_of_command": {
                    name: "Crown of Command",
                    description: "A crown that enhances leadership abilities",
                    type: "accessory",
                    rarity: "rare",
                    bonuses: { leadership: 5, diplomacy: 3 },
                    icon: "👑"
                },
                "ancient_relic": {
                    name: "Ancient Relic",
                    description: "A powerful relic from a forgotten age",
                    type: "accessory",
                    rarity: "legendary",
                    bonuses: { attack: 3, defense: 3, speed: 3, leadership: 3 },
                    icon: "🏺"
                }
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
            CAVALRY: 0,
            HARVESTER: 0,
            SCOUT: 0,
            DEFENDER: 0,
            DIPLOMAT: 0
        },
        technologies: {
            MILITARY: {},
            ECONOMIC: {},
            DEFENSIVE: {},
            DIPLOMATIC: {},
            EXPLORATION: {}
        },
        researchQueue: [],
        mapSize: { width: 10, height: 10 },
        activeEvents: [],
        activeMissions: [],
        completedMissions: [],
        eventHistory: []
    }
};
