/**
 * Cheat System for Pixel Empires
 * Provides testing functionality for developers
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cheat: Initializing cheat system');
    
    // Set up cheat button
    setupCheatButton();
});

/**
 * Set up the cheat button
 */
function setupCheatButton() {
    const cheatButton = document.getElementById('cheat-button');
    
    if (!cheatButton) {
        console.error('Cheat: Cheat button not found');
        return;
    }
    
    // Add click event
    cheatButton.addEventListener('click', () => {
        // Set unlimited resources
        setUnlimitedResources();
    });
}

/**
 * Set unlimited resources for testing
 */
function setUnlimitedResources() {
    console.log('Cheat: Setting unlimited resources');
    
    // Check if game state is available
    if (!window.gameState) {
        console.error('Cheat: Game state not found');
        return;
    }
    
    // Set all resources to 999999
    for (const resource in window.gameState.resources) {
        window.gameState.resources[resource] = 999999;
    }
    
    // Update UI
    if (window.uiManager) {
        window.uiManager.updateResourceDisplay();
        window.uiManager.showMessage('Unlimited resources activated!');
    }
    
    console.log('Cheat: Unlimited resources set');
}
