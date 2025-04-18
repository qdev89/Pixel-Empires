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

// Game loop
function gameLoop() {
    // Update game state
    gameState.update();

    // Update UI
    uiManager.updateUI();

    // Update events UI
    eventsUI.updateUI();

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
}

// Call setup function
setupTestEnvironment();
