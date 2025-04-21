/**
 * Main Game Script
 * Entry point for the game
 */

// Initialize animation manager first (needed by other components)
const animationManager = new AnimationManager();

// Initialize game state and managers
const gameState = new GameState();
const buildingManager = new BuildingManager(gameState);
const unitManager = new UnitManager(gameState);
const combatManager = new CombatManager(gameState);
const researchManager = new ResearchManager(gameState);

// Initialize UI manager
const uiManager = new UIManager(gameState, buildingManager, unitManager, combatManager, researchManager);

// Initialize combat UI
const combatUI = new CombatUI(gameState, combatManager);

// Initialize events UI
const eventsUI = new EventsUI(gameState, gameState.eventManager);

// Initialize chat system
const chatSystem = new ChatSystem(gameState);
const chatUI = new ChatUI(chatSystem);

// Initialize hero systems if hero manager is available
if (gameState.heroManager) {
    // Initialize hero combat systems
    gameState.heroCombatSystem = new HeroCombatSystem(gameState, gameState.heroManager);
    gameState.heroCombatReportSystem = new HeroCombatReportSystem(gameState);
    gameState.heroCombatAnimations = new HeroCombatAnimations(gameState);

    // Initialize hero specialization and trait systems
    gameState.heroSpecializationsSystem = new HeroSpecializationsSystem(gameState, gameState.heroManager);
    gameState.heroTraitsSystem = new HeroTraitsSystem(gameState, gameState.heroManager);

    // Initialize hero equipment system
    gameState.heroEquipmentSystem = new HeroEquipmentSystem(gameState, gameState.heroManager);
    gameState.heroEquipmentSetsSystem = new HeroEquipmentSetsSystem(gameState, gameState.heroManager, gameState.heroEquipmentSystem);

    // Initialize hero skill tree system
    gameState.heroSkillTreeSystem = new HeroSkillTreeSystem(gameState, gameState.heroManager);

    // Initialize hero quest system
    gameState.heroQuestSystem = new HeroQuestSystem(gameState, gameState.heroManager);

    // Initialize hero UI components
    gameState.heroSkillTreeUI = new HeroSkillTreeUI(gameState, gameState.heroManager, gameState.heroSkillTreeSystem);
    gameState.heroQuestUI = new HeroQuestUI(gameState, gameState.heroManager, gameState.heroQuestSystem);
}

// Initialize hero UI if hero manager is available
let heroUI = null;
if (gameState.heroManager) {
    heroUI = new HeroUI(gameState, gameState.heroManager);
}

// Game loop
let lastTimestamp = 0;
function gameLoop(timestamp) {
    // Calculate delta time in seconds
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    // Update game state
    gameState.update();

    // Update UI
    uiManager.updateUI();

    // Update events UI
    eventsUI.updateUI();

    // Update hero UI if available
    if (heroUI) {
        heroUI.updateHeroUI();
    }

    // Update hero combat system if available
    if (gameState.heroCombatSystem) {
        gameState.heroCombatSystem.update(deltaTime);
    }

    // Schedule next frame
    requestAnimationFrame(gameLoop);
}

// Set up cheat button for unlimited resources
const cheatButton = document.getElementById('cheat-button');
if (cheatButton) {
    cheatButton.addEventListener('click', () => {
        // Use our setUnlimitedResources method
        gameState.setUnlimitedResources();
    });
}

// Start game loop
gameLoop();

// Add some initial resources and buildings for testing
function setupTestEnvironment() {
    // Add some initial resources
    gameState.resources.FOOD = 500;
    gameState.resources.ORE = 500;

    // Build initial farm
    if (!gameState.buildings.FARM) {
        gameState.startBuilding('FARM', 0, 1);
        gameState.buildQueue[0].timeRemaining = 0; // Complete immediately
        gameState.completeBuildingConstruction(gameState.buildQueue[0]);
        gameState.buildQueue.shift();
    }

    // Build initial mine
    if (!gameState.buildings.MINE) {
        gameState.startBuilding('MINE', 0, 2);
        gameState.buildQueue[0].timeRemaining = 0; // Complete immediately
        gameState.completeBuildingConstruction(gameState.buildQueue[0]);
        gameState.buildQueue.shift();
    }

    // Upgrade Town Hall to level 2 to unlock Library
    if (gameState.buildings.TOWN_HALL && gameState.buildings.TOWN_HALL.level < 2) {
        gameState.startBuilding('TOWN_HALL', 1, 1);
        gameState.buildQueue[0].timeRemaining = 0; // Complete immediately
        gameState.completeBuildingConstruction(gameState.buildQueue[0]);
        gameState.buildQueue.shift();
    }

    // Build Library for research
    if (!gameState.buildings.LIBRARY) {
        gameState.startBuilding('LIBRARY', 2, 1);
        gameState.buildQueue[0].timeRemaining = 0; // Complete immediately
        gameState.completeBuildingConstruction(gameState.buildQueue[0]);
        gameState.buildQueue.shift();
    }

    // Build Barracks for training units
    if (!gameState.buildings.BARRACKS) {
        gameState.startBuilding('BARRACKS', 2, 2);
        gameState.buildQueue[0].timeRemaining = 0; // Complete immediately
        gameState.completeBuildingConstruction(gameState.buildQueue[0]);
        gameState.buildQueue.shift();
    }

    // Train some units for testing
    gameState.units.SPEARMAN = 10;
    gameState.units.ARCHER = 10;
    gameState.units.CAVALRY = 5;

    // Add some test equipment for heroes
    if (gameState.heroManager) {
        // Create a test hero with some equipment
        const testHero = gameState.heroManager.generateHero('WARRIOR', gameState.heroManager.heroTypes.WARRIOR);
        testHero.inventory.push({
            id: 'test_sword',
            name: 'Steel Sword',
            description: 'A sharp steel sword',
            type: 'weapon',
            rarity: 'uncommon',
            bonuses: { attack: 4 },
            icon: '🗡️'
        });
        testHero.inventory.push({
            id: 'test_armor',
            name: 'Leather Armor',
            description: 'Basic protective armor',
            type: 'armor',
            rarity: 'common',
            bonuses: { defense: 3 },
            icon: '🥋'
        });
        gameState.heroManager.heroes.push(testHero);
    }
}

// Call setup function
setupTestEnvironment();
