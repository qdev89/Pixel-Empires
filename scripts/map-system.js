/**
 * Enhanced Map System for Pixel Empires
 * Handles map generation, terrain types, and special locations
 */
class MapSystem {
    /**
     * Initialize the map system
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        // Default configuration
        this.config = {
            width: 50,
            height: 50,
            seed: Math.floor(Math.random() * 1000000),
            ...config
        };

        // Initialize map data
        this.mapData = {
            terrain: [],
            explored: [],
            specialLocations: []
        };

        // Define terrain types
        this.terrainTypes = {
            PLAINS: {
                id: 'PLAINS',
                name: 'Plains',
                color: '#7EC850',
                movementCost: 1.0,
                resourceModifiers: { FOOD: 1.2, ORE: 0.8 },
                description: 'Flat grasslands ideal for farming and movement.',
                icon: '🌾',
                combatModifiers: { attack: 1.0, defense: 1.0 }
            },
            FOREST: {
                id: 'FOREST',
                name: 'Forest',
                color: '#2D7D46',
                movementCost: 1.5,
                resourceModifiers: { FOOD: 0.9, ORE: 0.9, WOOD: 1.5 },
                description: 'Dense forests with abundant wood but slower movement.',
                icon: '🌲',
                combatModifiers: { attack: 0.8, defense: 1.2 }
            },
            MOUNTAINS: {
                id: 'MOUNTAINS',
                name: 'Mountains',
                color: '#8B8B8B',
                movementCost: 2.0,
                resourceModifiers: { FOOD: 0.5, ORE: 1.5 },
                description: 'Rugged terrain rich in ore but difficult to traverse.',
                icon: '⛰️',
                combatModifiers: { attack: 0.7, defense: 1.5 }
            },
            HILLS: {
                id: 'HILLS',
                name: 'Hills',
                color: '#A9A15F',
                movementCost: 1.3,
                resourceModifiers: { FOOD: 0.8, ORE: 1.2 },
                description: 'Rolling hills with moderate resources and visibility advantages.',
                icon: '⛰️',
                combatModifiers: { attack: 1.1, defense: 1.2 }
            },
            DESERT: {
                id: 'DESERT',
                name: 'Desert',
                color: '#E8D882',
                movementCost: 1.2,
                resourceModifiers: { FOOD: 0.4, ORE: 0.7, CRYSTAL: 1.3 },
                description: 'Arid wasteland with few resources but potential for rare minerals.',
                icon: '🏜️',
                combatModifiers: { attack: 1.1, defense: 0.8 }
            },
            TUNDRA: {
                id: 'TUNDRA',
                name: 'Tundra',
                color: '#E8F4F8',
                movementCost: 1.4,
                resourceModifiers: { FOOD: 0.6, ORE: 1.0, FURS: 1.4 },
                description: 'Cold northern plains with sparse vegetation and unique resources.',
                icon: '❄️',
                combatModifiers: { attack: 0.9, defense: 0.9 }
            },
            JUNGLE: {
                id: 'JUNGLE',
                name: 'Jungle',
                color: '#1E8449',
                movementCost: 1.8,
                resourceModifiers: { FOOD: 1.1, ORE: 0.6, EXOTIC_HERBS: 1.5 },
                description: 'Dense tropical forest with exotic resources but difficult movement.',
                icon: '🌴',
                combatModifiers: { attack: 0.7, defense: 1.3 }
            },
            SWAMP: {
                id: 'SWAMP',
                name: 'Swamp',
                color: '#5D6D7E',
                movementCost: 2.0,
                resourceModifiers: { FOOD: 0.7, ORE: 0.5, EXOTIC_HERBS: 1.2 },
                description: 'Marshy wetlands with unique resources but very difficult movement.',
                icon: '🍄',
                combatModifiers: { attack: 0.6, defense: 1.0 }
            },
            COASTAL: {
                id: 'COASTAL',
                name: 'Coastal',
                color: '#85C1E9',
                movementCost: 1.1,
                resourceModifiers: { FOOD: 1.3, ORE: 0.7, FISH: 1.5 },
                description: 'Shoreline areas with abundant fishing and good visibility.',
                icon: '🏖️',
                combatModifiers: { attack: 1.0, defense: 0.9 }
            },
            WATER: {
                id: 'WATER',
                name: 'Water',
                color: '#3498DB',
                movementCost: 3.0,
                resourceModifiers: { FOOD: 0.8, ORE: 0.0, FISH: 2.0 },
                description: 'Open water that is difficult to traverse without ships.',
                icon: '🌊',
                combatModifiers: { attack: 0.5, defense: 0.5 }
            },
            VOLCANIC: {
                id: 'VOLCANIC',
                name: 'Volcanic',
                color: '#922B21',
                movementCost: 2.2,
                resourceModifiers: { FOOD: 0.3, ORE: 1.8, OBSIDIAN: 2.0 },
                description: 'Dangerous volcanic terrain with rare resources.',
                icon: '🌋',
                combatModifiers: { attack: 0.8, defense: 0.7 }
            },
            SNOW: {
                id: 'SNOW',
                name: 'Snow',
                color: '#FFFFFF',
                movementCost: 1.3,
                resourceModifiers: { FOOD: 0.8, ORE: 1.2 },
                description: 'Rolling hills with balanced resources.',
                icon: '🏞️'
            },
            DESERT: {
                id: 'DESERT',
                name: 'Desert',
                color: '#E8D882',
                movementCost: 1.2,
                resourceModifiers: { FOOD: 0.4, ORE: 1.0, GEMS: 1.3 },
                description: 'Arid lands with scarce food resources but rich in gems.',
                icon: '🏜️'
            },
            WATER: {
                id: 'WATER',
                name: 'Water',
                color: '#3498DB',
                movementCost: 3.0,
                resourceModifiers: { FOOD: 0.8, ORE: 0.0, FISH: 2.0 },
                description: 'Open water that is difficult to traverse without ships.',
                icon: '🌊',
                combatModifiers: { attack: 0.5, defense: 0.5 }
            },
            SWAMP: {
                id: 'SWAMP',
                name: 'Swamp',
                color: '#5D6D7E',
                movementCost: 2.0,
                resourceModifiers: { FOOD: 0.7, ORE: 0.5, EXOTIC_HERBS: 1.2 },
                description: 'Marshy wetlands with unique resources but very difficult movement.',
                icon: '🍄',
                combatModifiers: { attack: 0.6, defense: 1.0 }
            },
            // Special terrain types
            RUINS: {
                id: 'RUINS',
                name: 'Ancient Ruins',
                color: '#D0D3D4',
                movementCost: 1.4,
                resourceModifiers: { FOOD: 0.5, ORE: 1.0, ARTIFACTS: 2.0 },
                description: 'Remnants of ancient civilizations with hidden treasures.',
                icon: '🏛️',
                combatModifiers: { attack: 0.9, defense: 1.1 }
            },
            CRYSTAL_FIELD: {
                id: 'CRYSTAL_FIELD',
                name: 'Crystal Field',
                color: '#BB8FCE',
                movementCost: 1.3,
                resourceModifiers: { FOOD: 0.3, ORE: 0.7, CRYSTAL: 2.5 },
                description: 'Rare fields of crystal formations with magical properties.',
                icon: '💎',
                combatModifiers: { attack: 1.2, defense: 0.9 }
            },
            ANCIENT_BATTLEFIELD: {
                id: 'ANCIENT_BATTLEFIELD',
                name: 'Ancient Battlefield',
                color: '#CD6155',
                movementCost: 1.2,
                resourceModifiers: { FOOD: 0.6, ORE: 1.1, ARTIFACTS: 1.8 },
                description: 'Historic battlefields with remnants of ancient wars.',
                icon: '⚔️',
                combatModifiers: { attack: 1.3, defense: 0.8 }
            },
            SAVANNA: {
                id: 'SAVANNA',
                name: 'Savanna',
                color: '#D2B48C',
                movementCost: 1.1,
                resourceModifiers: { FOOD: 1.0, ORE: 0.7, LEATHER: 1.5 },
                description: 'Grassy plains with scattered trees and abundant wildlife.',
                icon: '🦒',
                combatModifiers: { attack: 1.2, defense: 0.9 }
            }
        };

        // Define special location types
        this.specialLocationTypes = {
            // Ancient structures
            RUINS: {
                id: 'RUINS',
                name: 'Ancient Ruins',
                icon: '🏛️',
                description: 'Remnants of an ancient civilization. May contain valuable artifacts.',
                interactionType: 'EXPLORE',
                rewards: ['RESOURCES', 'TECHNOLOGY', 'ARTIFACTS'],
                terrainPreference: ['PLAINS', 'HILLS', 'DESERT'],
                rarity: 0.7,
                visualEffect: 'pulsing',
                discoveryBonus: { RESEARCH: 50, GOLD: 100 }
            },
            ANCIENT_TEMPLE: {
                id: 'ANCIENT_TEMPLE',
                name: 'Ancient Temple',
                icon: '🏯',
                description: 'A mysterious temple from a forgotten civilization. Contains ancient knowledge and artifacts.',
                interactionType: 'EXPLORE',
                rewards: ['TECHNOLOGY', 'ARTIFACTS', 'SPECIAL_UNITS'],
                terrainPreference: ['JUNGLE', 'FOREST', 'MOUNTAINS'],
                rarity: 0.5
            },
            ABANDONED_CITY: {
                id: 'ABANDONED_CITY',
                name: 'Abandoned City',
                icon: '🏙️',
                description: 'A once-thriving city now abandoned. Rich in resources and historical knowledge.',
                interactionType: 'EXPLORE',
                rewards: ['RESOURCES', 'POPULATION', 'TECHNOLOGY'],
                terrainPreference: ['PLAINS', 'DESERT', 'HILLS'],
                rarity: 0.4,
                visualEffect: 'shimmer',
                discoveryBonus: { POPULATION: 5, GOLD: 150 }
            },
            LOST_LIBRARY: {
                id: 'LOST_LIBRARY',
                name: 'Lost Library',
                icon: '📚',
                description: 'An ancient repository of knowledge that survived the ages.',
                interactionType: 'EXPLORE',
                rewards: ['TECHNOLOGY', 'RESEARCH_BOOST', 'ANCIENT_TEXTS'],
                terrainPreference: ['PLAINS', 'HILLS', 'RUINS'],
                rarity: 0.4,
                visualEffect: 'sparkle',
                discoveryBonus: { RESEARCH: 150, TECHNOLOGY_POINTS: 1 }
            },

            // Resource locations
            RESOURCE_NODE: {
                id: 'RESOURCE_NODE',
                name: 'Rich Resource Node',
                icon: '💎',
                description: 'A concentrated deposit of valuable resources.',
                interactionType: 'HARVEST',
                rewards: ['RESOURCES'],
                terrainPreference: ['MOUNTAINS', 'HILLS', 'FOREST'],
                rarity: 0.8
            },
            CRYSTAL_CAVE: {
                id: 'CRYSTAL_CAVE',
                name: 'Crystal Cave',
                icon: '💠',
                description: 'A cave filled with magical crystals that can enhance magical abilities.',
                interactionType: 'HARVEST',
                rewards: ['CRYSTAL', 'MAGIC_POWER'],
                terrainPreference: ['MOUNTAINS', 'SNOW', 'VOLCANIC'],
                rarity: 0.4
            },
            ANCIENT_MINE: {
                id: 'ANCIENT_MINE',
                name: 'Ancient Mine',
                icon: '⛏️',
                description: 'An abandoned mine with rare metals and gems still waiting to be extracted.',
                interactionType: 'HARVEST',
                rewards: ['ORE', 'GEMS', 'RARE_METALS'],
                terrainPreference: ['MOUNTAINS', 'HILLS', 'VOLCANIC'],
                rarity: 0.6
            },

            // Creature lairs
            MONSTER_LAIR: {
                id: 'MONSTER_LAIR',
                name: 'Monster Lair',
                icon: '👹',
                description: 'Home to dangerous creatures guarding valuable treasures.',
                interactionType: 'COMBAT',
                rewards: ['RESOURCES', 'ITEMS'],
                terrainPreference: ['FOREST', 'MOUNTAINS', 'SWAMP'],
                rarity: 0.7
            },
            DRAGON_NEST: {
                id: 'DRAGON_NEST',
                name: 'Dragon Nest',
                icon: '🐉',
                description: 'A fearsome dragon resides here, guarding an immense treasure hoard.',
                interactionType: 'COMBAT',
                rewards: ['GOLD', 'ARTIFACTS', 'DRAGON_SCALES'],
                terrainPreference: ['MOUNTAINS', 'VOLCANIC', 'HILLS'],
                rarity: 0.3
            },
            KRAKEN_LAIR: {
                id: 'KRAKEN_LAIR',
                name: 'Kraken Lair',
                icon: '🦑',
                description: 'A massive sea monster lurks in these waters, sinking ships and collecting their treasures.',
                interactionType: 'COMBAT',
                rewards: ['PEARLS', 'SUNKEN_TREASURES', 'RESOURCES'],
                terrainPreference: ['WATER', 'COASTAL'],
                rarity: 0.3
            },

            // Settlements and trading posts
            SETTLEMENT: {
                id: 'SETTLEMENT',
                name: 'Neutral Settlement',
                icon: '🏠',
                description: 'A small settlement of neutral people. Can be traded with or conquered.',
                interactionType: 'DIPLOMACY',
                rewards: ['ALLIANCE', 'TRADE'],
                terrainPreference: ['PLAINS', 'HILLS', 'COASTAL'],
                rarity: 0.8
            },
            TRADING_POST: {
                id: 'TRADING_POST',
                name: 'Trading Post',
                icon: '🏪',
                description: 'A bustling trading post where merchants gather to exchange goods.',
                interactionType: 'TRADE',
                rewards: ['RESOURCES', 'RARE_GOODS', 'INFORMATION'],
                terrainPreference: ['PLAINS', 'COASTAL', 'SAVANNA'],
                rarity: 0.7
            },
            NOMAD_CAMP: {
                id: 'NOMAD_CAMP',
                name: 'Nomad Camp',
                icon: '⛺',
                description: 'A temporary settlement of nomadic people with unique goods and knowledge.',
                interactionType: 'DIPLOMACY',
                rewards: ['RARE_GOODS', 'MERCENARIES', 'KNOWLEDGE'],
                terrainPreference: ['DESERT', 'SAVANNA', 'PLAINS'],
                rarity: 0.6
            },

            // Magical locations
            MAGIC_SPRING: {
                id: 'MAGIC_SPRING',
                name: 'Magic Spring',
                icon: '✨',
                description: 'A spring with magical properties that can grant bonuses.',
                interactionType: 'USE',
                rewards: ['TEMPORARY_BONUS'],
                terrainPreference: ['FOREST', 'MOUNTAINS', 'JUNGLE'],
                rarity: 0.5
            },
            WIZARD_TOWER: {
                id: 'WIZARD_TOWER',
                name: 'Wizard Tower',
                icon: '🧙',
                description: 'A tower inhabited by a powerful wizard who might share magical knowledge.',
                interactionType: 'QUEST',
                rewards: ['MAGIC_ITEMS', 'SPELLS', 'KNOWLEDGE'],
                terrainPreference: ['HILLS', 'MOUNTAINS', 'PLAINS'],
                rarity: 0.4
            },
            PORTAL: {
                id: 'PORTAL',
                name: 'Mysterious Portal',
                icon: '🌀',
                description: 'A swirling portal to unknown destinations. Highly dangerous but potentially rewarding.',
                interactionType: 'EXPLORE',
                rewards: ['TELEPORTATION', 'DIMENSIONAL_ITEMS', 'KNOWLEDGE'],
                terrainPreference: ['ANY'],
                rarity: 0.2
            }
        };

        // Generate initial map
        this.generateMap();
    }

    /**
     * Generate a new map
     */
    generateMap() {
        const { width, height, seed } = this.config;

        // Initialize terrain array
        this.mapData.terrain = Array(height).fill().map(() => Array(width).fill(null));

        // Initialize exploration array (0 = unexplored, 1 = partially explored, 2 = fully explored)
        this.mapData.explored = Array(height).fill().map(() => Array(width).fill(0));

        // Initialize visibility memory (for fog of war)
        this.mapData.lastSeen = Array(height).fill().map(() => Array(width).fill(null));

        // Initialize last seen time for fog of war decay
        this.mapData.lastSeenTime = Array(height).fill().map(() => Array(width).fill(0));

        // Generate terrain using simplex noise
        this.generateTerrain();

        // Place special locations
        this.generateSpecialLocations();

        // Initialize game time
        this.gameTime = 0;

        console.log(`Generated map with dimensions ${width}x${height} using seed ${seed}`);
    }

    /**
     * Generate terrain using Perlin noise for more natural landscapes
     * Enhanced with additional terrain types
     */
    generateTerrain() {
        const { width, height, seed } = this.config;

        // Create Perlin noise generator with the seed
        const perlin = new PerlinNoise(seed);

        // Create different noise layers for various terrain features
        const elevationNoise = (x, y) => perlin.fbm(x / 15, y / 15, 6, 0.5, 2.0);
        const moistureNoise = (x, y) => perlin.fbm(x / 20 + 500, y / 20 + 500, 4, 0.5, 2.0);
        const temperatureNoise = (x, y) => perlin.fbm(x / 25 + 1000, y / 25 + 1000, 3, 0.5, 2.0);
        const volcanicNoise = (x, y) => perlin.fbm(x / 10 + 2000, y / 10 + 2000, 2, 0.7, 2.0);

        // Generate terrain based on noise values
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Get noise values for this coordinate
                const elevation = elevationNoise(x, y);
                const moisture = moistureNoise(x, y);
                const temperature = temperatureNoise(x, y);
                const volcanic = volcanicNoise(x, y);

                // Determine terrain type based on noise values
                if (elevation < 0.25) {
                    // Deep water
                    this.mapData.terrain[y][x] = this.terrainTypes.WATER.id;
                } else if (elevation < 0.3) {
                    // Coastal areas
                    this.mapData.terrain[y][x] = this.terrainTypes.COASTAL.id;
                } else if (elevation < 0.4) {
                    // Low elevation
                    if (moisture > 0.7) {
                        if (temperature < 0.3) {
                            this.mapData.terrain[y][x] = this.terrainTypes.SNOW.id;
                        } else {
                            this.mapData.terrain[y][x] = this.terrainTypes.SWAMP.id;
                        }
                    } else if (moisture > 0.4) {
                        if (temperature > 0.6) {
                            this.mapData.terrain[y][x] = this.terrainTypes.JUNGLE.id;
                        } else {
                            this.mapData.terrain[y][x] = this.terrainTypes.PLAINS.id;
                        }
                    } else {
                        if (temperature > 0.7) {
                            this.mapData.terrain[y][x] = this.terrainTypes.SAVANNA.id;
                        } else if (temperature < 0.3) {
                            this.mapData.terrain[y][x] = this.terrainTypes.SNOW.id;
                        } else {
                            this.mapData.terrain[y][x] = this.terrainTypes.PLAINS.id;
                        }
                    }
                } else if (elevation < 0.7) {
                    // Mid elevation
                    if (moisture < 0.3) {
                        if (temperature > 0.7) {
                            this.mapData.terrain[y][x] = this.terrainTypes.DESERT.id;
                        } else if (temperature < 0.3) {
                            this.mapData.terrain[y][x] = this.terrainTypes.SNOW.id;
                        } else {
                            this.mapData.terrain[y][x] = this.terrainTypes.PLAINS.id;
                        }
                    } else if (moisture < 0.6) {
                        this.mapData.terrain[y][x] = this.terrainTypes.HILLS.id;
                    } else {
                        if (temperature > 0.7) {
                            this.mapData.terrain[y][x] = this.terrainTypes.JUNGLE.id;
                        } else {
                            this.mapData.terrain[y][x] = this.terrainTypes.FOREST.id;
                        }
                    }
                } else {
                    // High elevation
                    if (volcanic > 0.8) {
                        this.mapData.terrain[y][x] = this.terrainTypes.VOLCANIC.id;
                    } else if (temperature < 0.3) {
                        this.mapData.terrain[y][x] = this.terrainTypes.SNOW.id;
                    } else {
                        this.mapData.terrain[y][x] = this.terrainTypes.MOUNTAINS.id;
                    }
                }
            }
        }

        // Add rivers
        this.generateRivers();

        // Post-process to create more realistic terrain transitions
        this.smoothTerrain();
    }

    /**
     * Smooth terrain to create more realistic transitions between different terrain types
     */
    smoothTerrain() {
        const { width, height } = this.config;
        const tempTerrain = JSON.parse(JSON.stringify(this.mapData.terrain));

        // Number of smoothing passes
        const smoothingPasses = 2;

        for (let pass = 0; pass < smoothingPasses; pass++) {
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    // Skip water and coastal tiles
                    if (this.mapData.terrain[y][x] === this.terrainTypes.WATER.id ||
                        this.mapData.terrain[y][x] === this.terrainTypes.COASTAL.id) {
                        continue;
                    }

                    // Count neighboring terrain types
                    const neighborCounts = {};
                    let totalNeighbors = 0;

                    // Check all 8 neighbors
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;

                            const nx = x + dx;
                            const ny = y + dy;

                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const neighborTerrain = this.mapData.terrain[ny][nx];
                                neighborCounts[neighborTerrain] = (neighborCounts[neighborTerrain] || 0) + 1;
                                totalNeighbors++;
                            }
                        }
                    }

                    // Find the most common neighbor terrain type
                    let mostCommonTerrain = this.mapData.terrain[y][x];
                    let maxCount = 0;

                    for (const terrain in neighborCounts) {
                        if (neighborCounts[terrain] > maxCount) {
                            maxCount = neighborCounts[terrain];
                            mostCommonTerrain = terrain;
                        }
                    }

                    // If most neighbors are of a different type, consider changing this tile
                    if (mostCommonTerrain !== this.mapData.terrain[y][x] && maxCount >= 5) {
                        tempTerrain[y][x] = mostCommonTerrain;
                    }
                }
            }

            // Apply changes after each pass
            this.mapData.terrain = JSON.parse(JSON.stringify(tempTerrain));
        }
    }

    /**
     * Generate rivers using Perlin noise for natural flow
     */
    generateRivers() {
        const { width, height, seed } = this.config;

        // Create Perlin noise generator for river paths
        const perlin = new PerlinNoise(seed + 1000);

        // Number of rivers based on map size
        const numRivers = Math.floor(Math.sqrt(width * height) / 10) + 1;

        for (let i = 0; i < numRivers; i++) {
            // Find a mountain or hill tile to start the river from
            let startX, startY;
            let attempts = 0;
            let found = false;

            while (!found && attempts < 100) {
                startX = Math.floor(Math.random() * width);
                startY = Math.floor(Math.random() * height);

                const terrainType = this.mapData.terrain[startY][startX];
                if (terrainType === this.terrainTypes.MOUNTAINS.id || terrainType === this.terrainTypes.HILLS.id) {
                    found = true;
                }

                attempts++;
            }

            if (!found) continue;

            // Generate a river path following the terrain gradient
            let currentX = startX;
            let currentY = startY;
            const riverLength = Math.floor(Math.random() * 30) + 20;

            // Create a flow field based on elevation
            const flowField = Array(height).fill().map(() => Array(width).fill(null));

            // Calculate flow direction for each tile (pointing to lowest neighbor)
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    // Skip water tiles
                    if (this.mapData.terrain[y][x] === this.terrainTypes.WATER.id) {
                        continue;
                    }

                    // Get elevation from noise
                    const elevation = perlin.fbm(x / 15, y / 15, 6, 0.5, 2.0);

                    // Check all neighbors to find lowest elevation
                    let lowestX = x;
                    let lowestY = y;
                    let lowestElevation = elevation;

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;

                            const nx = x + dx;
                            const ny = y + dy;

                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const neighborElevation = perlin.fbm(nx / 15, ny / 15, 6, 0.5, 2.0);

                                if (neighborElevation < lowestElevation) {
                                    lowestElevation = neighborElevation;
                                    lowestX = nx;
                                    lowestY = ny;
                                }
                            }
                        }
                    }

                    // Store flow direction
                    flowField[y][x] = { dx: lowestX - x, dy: lowestY - y };
                }
            }

            // Follow the flow field to create the river
            const riverPath = new Set();

            for (let j = 0; j < riverLength; j++) {
                // Add current position to river path
                const posKey = `${currentX},${currentY}`;
                riverPath.add(posKey);

                // Get flow direction
                const flow = flowField[currentY][currentX];

                // If no flow direction or we've reached water, stop
                if (!flow || this.mapData.terrain[currentY][currentX] === this.terrainTypes.WATER.id) {
                    break;
                }

                // Add some randomness to the flow
                const randomFactor = 0.3;
                const dx = flow.dx + (Math.random() * 2 - 1) * randomFactor;
                const dy = flow.dy + (Math.random() * 2 - 1) * randomFactor;

                // Normalize to get direction
                const length = Math.sqrt(dx * dx + dy * dy) || 1;
                const ndx = dx / length;
                const ndy = dy / length;

                // Move to next position
                currentX = Math.floor(currentX + ndx);
                currentY = Math.floor(currentY + ndy);

                // Keep within bounds
                currentX = Math.max(0, Math.min(width - 1, currentX));
                currentY = Math.max(0, Math.min(height - 1, currentY));
            }

            // Convert river path to water tiles
            for (const posKey of riverPath) {
                const [x, y] = posKey.split(',').map(Number);
                this.mapData.terrain[y][x] = this.terrainTypes.WATER.id;

                // Add some width to the river based on distance from start
                const distFromStart = Math.sqrt(
                    Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
                );

                const riverWidth = Math.floor(distFromStart / 10) + 1;

                for (let w = 1; w <= riverWidth; w++) {
                    // Add width in random directions
                    const widthX = x + (Math.random() < 0.5 ? 1 : -1);
                    const widthY = y + (Math.random() < 0.5 ? 1 : -1);

                    if (widthX >= 0 && widthX < width && widthY >= 0 && widthY < height) {
                        // Don't overwrite mountains with water
                        if (this.mapData.terrain[widthY][widthX] !== this.terrainTypes.MOUNTAINS.id) {
                            this.mapData.terrain[widthY][widthX] = this.terrainTypes.WATER.id;
                        }
                    }
                }
            }
        }
    }

    /**
     * Generate special locations on the map
     * Enhanced with terrain preferences and rarity factors
     */
    generateSpecialLocations() {
        const { width, height } = this.config;
        this.mapData.specialLocations = [];

        // Number of special locations based on map size
        const baseLocations = Math.floor((width * height) / 100) + 10;

        // Keep track of placed locations to avoid overlap
        const placedLocations = new Set();

        // Get all location types as an array
        const locationTypes = Object.values(this.specialLocationTypes);

        // First pass: Place terrain-specific locations
        for (const locationType of locationTypes) {
            // Skip if this location type has no terrain preference
            if (!locationType.terrainPreference) continue;

            // Calculate how many of this type to place based on rarity
            // Rarer locations (lower rarity value) will have fewer instances
            const countToPlace = Math.max(1, Math.floor(baseLocations * locationType.rarity / locationTypes.length));

            for (let i = 0; i < countToPlace; i++) {
                // Try to find a suitable location
                let attempts = 0;
                let placed = false;

                while (!placed && attempts < 100) {
                    // Pick a random position
                    const x = Math.floor(Math.random() * width);
                    const y = Math.floor(Math.random() * height);
                    const locationKey = `${x},${y}`;

                    // Skip if already occupied
                    if (placedLocations.has(locationKey)) {
                        attempts++;
                        continue;
                    }

                    // Get terrain at this position
                    const terrainId = this.mapData.terrain[y][x];

                    // Check if this terrain is preferred for this location type
                    const isPreferredTerrain =
                        locationType.terrainPreference.includes('ANY') ||
                        locationType.terrainPreference.includes(terrainId);

                    // Place with higher probability on preferred terrain
                    const placementChance = isPreferredTerrain ? 0.8 : 0.2;

                    if (Math.random() < placementChance) {
                        // Create the special location
                        const specialLocation = {
                            id: `loc_${locationType.id}_${i}`,
                            type: locationType.id,
                            x,
                            y,
                            discovered: false,
                            fullyDiscovered: false,
                            interacted: false,
                            // Add some randomized properties for more variety
                            difficulty: Math.floor(Math.random() * 5) + 1, // 1-5 difficulty
                            size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
                            // Add custom properties based on location type
                            ...this.getCustomLocationProperties(locationType.id)
                        };

                        this.mapData.specialLocations.push(specialLocation);
                        placedLocations.add(locationKey);
                        placed = true;
                    }

                    attempts++;
                }
            }
        }

        // Second pass: Add some completely random locations to fill out the map
        const remainingLocations = Math.max(5, baseLocations - this.mapData.specialLocations.length);

        for (let i = 0; i < remainingLocations; i++) {
            // Try to find a suitable location
            let attempts = 0;
            let x, y, locationKey;

            do {
                x = Math.floor(Math.random() * width);
                y = Math.floor(Math.random() * height);
                locationKey = `${x},${y}`;
                attempts++;

                // Skip if already occupied
                if (placedLocations.has(locationKey)) {
                    continue;
                }

                // Avoid water tiles for most locations (except those that prefer water)
                const terrainId = this.mapData.terrain[y][x];
                if (terrainId === this.terrainTypes.WATER.id) {
                    // Only 20% chance to place on water
                    if (Math.random() > 0.2) {
                        continue;
                    }
                }

                // Break if we've tried too many times
                if (attempts > 100) break;

            } while (placedLocations.has(locationKey));

            // If we found a suitable location
            if (!placedLocations.has(locationKey)) {
                placedLocations.add(locationKey);

                // Choose a random special location type, weighted by rarity
                const locationType = this.getWeightedRandomLocationType();

                // Create the special location
                const specialLocation = {
                    id: `loc_random_${i}`,
                    type: locationType.id,
                    x,
                    y,
                    discovered: false,
                    fullyDiscovered: false,
                    interacted: false,
                    // Add some randomized properties for more variety
                    difficulty: Math.floor(Math.random() * 5) + 1, // 1-5 difficulty
                    size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
                    // Add custom properties based on location type
                    ...this.getCustomLocationProperties(locationType.id)
                };

                this.mapData.specialLocations.push(specialLocation);
            }
        }

        console.log(`Generated ${this.mapData.specialLocations.length} special locations`);
    }

    /**
     * Get a weighted random location type based on rarity
     * @returns {Object} - A randomly selected location type
     */
    getWeightedRandomLocationType() {
        const locationTypes = Object.values(this.specialLocationTypes);

        // Calculate total weight (higher rarity = higher chance)
        let totalWeight = 0;
        for (const locationType of locationTypes) {
            totalWeight += locationType.rarity || 0.5; // Default rarity if not specified
        }

        // Pick a random value between 0 and total weight
        let random = Math.random() * totalWeight;

        // Find the location type that corresponds to this random value
        for (const locationType of locationTypes) {
            random -= locationType.rarity || 0.5;
            if (random <= 0) {
                return locationType;
            }
        }

        // Fallback to a random location type
        return locationTypes[Math.floor(Math.random() * locationTypes.length)];
    }

    /**
     * Get custom properties for specific location types
     * @param {string} locationType - The type of location
     * @returns {Object} - Custom properties for this location type
     */
    getCustomLocationProperties(locationType) {
        switch (locationType) {
            case 'RUINS':
            case 'ANCIENT_TEMPLE':
            case 'ABANDONED_CITY':
                return {
                    age: Math.floor(Math.random() * 1000) + 500, // Age in years
                    traps: Math.random() > 0.5, // 50% chance of having traps
                    treasureQuality: ['poor', 'average', 'good', 'excellent'][Math.floor(Math.random() * 4)]
                };

            case 'RESOURCE_NODE':
            case 'CRYSTAL_CAVE':
            case 'ANCIENT_MINE':
                return {
                    richness: Math.floor(Math.random() * 5) + 1, // 1-5 richness
                    depletion: Math.random() * 0.5, // 0-50% depleted
                    guardians: Math.random() > 0.7 // 30% chance of having guardians
                };

            case 'MONSTER_LAIR':
            case 'DRAGON_NEST':
            case 'KRAKEN_LAIR':
                return {
                    monsterLevel: Math.floor(Math.random() * 10) + 1, // 1-10 level
                    monsterCount: Math.floor(Math.random() * 5) + 1, // 1-5 monsters
                    treasureAmount: Math.floor(Math.random() * 1000) + 100 // 100-1100 treasure
                };

            case 'SETTLEMENT':
            case 'TRADING_POST':
            case 'NOMAD_CAMP':
                return {
                    population: Math.floor(Math.random() * 100) + 20, // 20-120 population
                    attitude: ['hostile', 'wary', 'neutral', 'friendly'][Math.floor(Math.random() * 4)],
                    specialGoods: Math.random() > 0.5 // 50% chance of having special goods
                };

            case 'MAGIC_SPRING':
            case 'WIZARD_TOWER':
            case 'PORTAL':
                return {
                    magicPower: Math.floor(Math.random() * 10) + 1, // 1-10 magic power
                    stability: Math.random(), // 0-1 stability (lower = more dangerous)
                    specialEffect: ['healing', 'strength', 'wisdom', 'teleportation'][Math.floor(Math.random() * 4)]
                };

            default:
                return {};
        }
    }

    /**
     * Get terrain type at a specific location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} - Terrain type object
     */
    getTerrainAt(x, y) {
        const { width, height } = this.config;

        // Check if coordinates are within bounds
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return null;
        }

        const terrainId = this.mapData.terrain[y][x];
        return this.terrainTypes[terrainId];
    }

    /**
     * Get special location at a specific position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object|null} - Special location object or null if none exists
     */
    getSpecialLocationAt(x, y) {
        return this.mapData.specialLocations.find(loc => loc.x === x && loc.y === y) || null;
    }

    /**
     * Check if a location has been explored
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} - Exploration level (0 = unexplored, 1 = partially explored, 2 = fully explored)
     */
    getExplorationLevel(x, y) {
        const { width, height } = this.config;

        // Check if coordinates are within bounds
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return 0;
        }

        return this.mapData.explored[y][x];
    }

    /**
     * Check if a location has been explored (any level)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if the location has been explored at any level
     */
    isExplored(x, y) {
        return this.getExplorationLevel(x, y) > 0;
    }

    /**
     * Check if a location has been fully explored
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if the location has been fully explored
     */
    isFullyExplored(x, y) {
        return this.getExplorationLevel(x, y) === 2;
    }

    /**
     * Get the last seen terrain at a location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {string|null} - Terrain ID or null if never seen
     */
    getLastSeenTerrain(x, y) {
        const { width, height } = this.config;

        // Check if coordinates are within bounds
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return null;
        }

        return this.mapData.lastSeen[y][x];
    }

    /**
     * Get the time when a location was last seen
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {number} - Game time when the location was last seen, or 0 if never seen
     */
    getLastSeenTime(x, y) {
        const { width, height } = this.config;

        // Check if coordinates are within bounds
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return 0;
        }

        return this.mapData.lastSeenTime[y][x];
    }

    /**
     * Explore a location and its surrounding area
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} radius - Exploration radius
     * @param {number} gameTime - Current game time for memory decay
     */
    exploreArea(x, y, radius = 3, gameTime = 0) {
        const { width, height } = this.config;

        // Update game time
        this.gameTime = gameTime || this.gameTime || 0;

        // Explore the area within the given radius
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= radius) {
                    const exploreX = x + dx;
                    const exploreY = y + dy;

                    // Check if coordinates are within bounds
                    if (exploreX >= 0 && exploreX < width && exploreY >= 0 && exploreY < height) {
                        // Different exploration levels based on distance
                        if (distance <= radius / 2) {
                            // Fully explored (close to the center)
                            this.mapData.explored[exploreY][exploreX] = 2;
                        } else {
                            // Partially explored (outer area)
                            // Only upgrade from unexplored to partially explored
                            if (this.mapData.explored[exploreY][exploreX] === 0) {
                                this.mapData.explored[exploreY][exploreX] = 1;
                            }
                        }

                        // Update last seen terrain
                        this.mapData.lastSeen[exploreY][exploreX] = this.mapData.terrain[exploreY][exploreX];

                        // Update last seen time
                        this.mapData.lastSeenTime[exploreY][exploreX] = this.gameTime;

                        // Check if there's a special location here and mark it as discovered
                        const specialLocation = this.getSpecialLocationAt(exploreX, exploreY);
                        if (specialLocation) {
                            specialLocation.discovered = true;

                            // Only fully discover special locations if they're close enough
                            if (distance <= radius / 1.5) {
                                specialLocation.fullyDiscovered = true;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Update exploration memory with decay over time
     * @param {number} gameTime - Current game time
     * @param {number} decayRate - Rate at which exploration memory decays
     * @param {number} decayThreshold - Time threshold in game ticks before decay starts
     */
    updateExplorationMemory(gameTime, decayRate = 0.1, decayThreshold = 500) {
        const { width, height } = this.config;

        // Skip if no game time provided
        if (!gameTime) return;

        // Update game time
        this.gameTime = gameTime;

        // Process memory decay for partially explored areas
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Only decay partially explored areas
                if (this.mapData.explored[y][x] === 1) {
                    // Calculate time since last seen
                    const timeSinceLastSeen = gameTime - this.mapData.lastSeenTime[y][x];

                    // Only start decay after the threshold
                    if (timeSinceLastSeen > decayThreshold) {
                        // Decay chance increases with time
                        const timeBasedDecayRate = decayRate * (1 + (timeSinceLastSeen - decayThreshold) / 1000);

                        // Cap the decay rate at a reasonable value
                        const cappedDecayRate = Math.min(0.5, timeBasedDecayRate);

                        // Random chance to decay based on time and decay rate
                        if (Math.random() < cappedDecayRate) {
                            // Revert to unexplored
                            this.mapData.explored[y][x] = 0;
                            // Clear last seen memory
                            this.mapData.lastSeen[y][x] = null;
                        }
                    }
                }
            }
        }
    }

    /**
     * Interact with a special location
     * @param {string} locationId - ID of the special location
     * @returns {Object} - Result of the interaction
     */
    interactWithLocation(locationId) {
        const location = this.mapData.specialLocations.find(loc => loc.id === locationId);

        if (!location) {
            return { success: false, message: 'Location not found' };
        }

        if (location.interacted) {
            return { success: false, message: 'This location has already been interacted with' };
        }

        // Mark as interacted
        location.interacted = true;

        // Get location type details
        const locationType = this.specialLocationTypes[location.type];

        // Generate rewards based on location type
        const rewards = this.generateRewards(locationType);

        // Apply discovery bonus if available
        if (locationType.discoveryBonus && !location.bonusApplied) {
            // Add discovery bonus to rewards
            rewards.discoveryBonus = {};
            for (const [resource, amount] of Object.entries(locationType.discoveryBonus)) {
                rewards.discoveryBonus[resource] = amount;
            }

            // Mark bonus as applied
            location.bonusApplied = true;
        }

        return {
            success: true,
            message: `You have successfully interacted with ${locationType.name}`,
            locationType,
            rewards
        };
    }

    /**
     * Generate rewards for interacting with a special location
     * @param {Object} locationType - Special location type
     * @returns {Object} - Rewards
     */
    generateRewards(locationType) {
        const rewards = {};

        // Different rewards based on location type
        switch (locationType.id) {
            case 'RUINS':
                // Ruins can give resources, technology points, or artifacts
                if (Math.random() < 0.4) {
                    rewards.resources = {
                        FOOD: Math.floor(Math.random() * 200) + 100,
                        ORE: Math.floor(Math.random() * 200) + 100
                    };
                } else if (Math.random() < 0.7) {
                    rewards.technologyPoints = Math.floor(Math.random() * 50) + 25;
                } else {
                    rewards.artifact = {
                        id: `artifact_${Math.floor(Math.random() * 1000)}`,
                        name: 'Ancient Artifact',
                        description: 'A mysterious artifact from an ancient civilization.',
                        bonus: {
                            type: Math.random() < 0.5 ? 'PRODUCTION' : 'COMBAT',
                            value: Math.floor(Math.random() * 10) + 5
                        }
                    };
                }
                break;

            case 'RESOURCE_NODE':
                // Resource nodes always give resources
                rewards.resources = {
                    FOOD: Math.floor(Math.random() * 300) + 200,
                    ORE: Math.floor(Math.random() * 300) + 200,
                    WOOD: Math.floor(Math.random() * 200) + 100
                };
                break;

            case 'MONSTER_LAIR':
                // Monster lairs give resources and sometimes items
                rewards.resources = {
                    FOOD: Math.floor(Math.random() * 150) + 50,
                    ORE: Math.floor(Math.random() * 150) + 50
                };

                if (Math.random() < 0.3) {
                    rewards.item = {
                        id: `item_${Math.floor(Math.random() * 1000)}`,
                        name: 'Monster Trophy',
                        description: 'A trophy from a defeated monster.',
                        bonus: {
                            type: 'COMBAT',
                            value: Math.floor(Math.random() * 5) + 3
                        }
                    };
                }
                break;

            case 'SETTLEMENT':
                // Settlements offer alliance or trade opportunities
                if (Math.random() < 0.5) {
                    rewards.alliance = {
                        faction: 'Neutral Settlement',
                        bonus: {
                            type: 'DIPLOMATIC',
                            value: Math.floor(Math.random() * 10) + 5
                        }
                    };
                } else {
                    rewards.trade = {
                        resourceType: Math.random() < 0.5 ? 'FOOD' : 'ORE',
                        amount: Math.floor(Math.random() * 100) + 50,
                        cost: Math.floor(Math.random() * 50) + 25
                    };
                }
                break;

            case 'MAGIC_SPRING':
                // Magic springs give temporary bonuses
                rewards.temporaryBonus = {
                    type: ['PRODUCTION', 'COMBAT', 'MOVEMENT', 'RESEARCH'][Math.floor(Math.random() * 4)],
                    value: Math.floor(Math.random() * 20) + 10,
                    duration: Math.floor(Math.random() * 10) + 5 // turns
                };
                break;
        }

        return rewards;
    }

    /**
     * Get movement cost for a path between two points
     * @param {number} startX - Starting X coordinate
     * @param {number} startY - Starting Y coordinate
     * @param {number} endX - Ending X coordinate
     * @param {number} endY - Ending Y coordinate
     * @returns {number} - Movement cost for the path
     */
    getMovementCost(startX, startY, endX, endY) {
        // Simple implementation - just calculate straight line distance and terrain costs
        // A real implementation would use pathfinding (A* algorithm)

        // Calculate Manhattan distance
        const distance = Math.abs(endX - startX) + Math.abs(endY - startY);

        // Get average terrain cost
        let totalTerrainCost = 0;
        let terrainCount = 0;

        // Sample points along the path
        for (let i = 0; i <= distance; i++) {
            const ratio = distance === 0 ? 0 : i / distance;
            const x = Math.floor(startX + (endX - startX) * ratio);
            const y = Math.floor(startY + (endY - startY) * ratio);

            const terrain = this.getTerrainAt(x, y);
            if (terrain) {
                totalTerrainCost += terrain.movementCost;
                terrainCount++;
            }
        }

        const averageTerrainCost = terrainCount > 0 ? totalTerrainCost / terrainCount : 1;

        return distance * averageTerrainCost;
    }

    /**
     * Get resource production modifier for a location
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} resourceType - Type of resource
     * @returns {number} - Production modifier (1.0 is baseline)
     */
    getResourceModifier(x, y, resourceType) {
        const terrain = this.getTerrainAt(x, y);

        if (!terrain || !terrain.resourceModifiers[resourceType]) {
            return 1.0; // Default modifier
        }

        return terrain.resourceModifiers[resourceType];
    }

    /**
     * Get a serializable representation of the map data
     * @returns {Object} - Serializable map data
     */
    serialize() {
        return {
            config: this.config,
            mapData: this.mapData
        };
    }

    /**
     * Load map data from a serialized object
     * @param {Object} data - Serialized map data
     */
    deserialize(data) {
        this.config = data.config;
        this.mapData = data.mapData;
    }
}

// Export the MapSystem class
if (typeof module !== 'undefined') {
    module.exports = { MapSystem };
}
