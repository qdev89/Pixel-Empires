/**
 * UI Layout functionality for Pixel Empires
 * Handles the main navigation menu and tab system
 */

class UILayout {
    constructor() {
        // Main menu elements
        this.mainMenuButton = document.getElementById('main-menu-button');
        this.mainNav = document.getElementById('main-nav');
        this.menuOverlay = document.querySelector('.menu-overlay');
        this.gameMain = document.getElementById('game-main');
        
        // Tab navigation elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.menuItems = document.querySelectorAll('.menu-item');
        this.subTabButtons = document.querySelectorAll('.sub-tab-button');
        
        // Footer links
        this.creditsLink = document.getElementById('show-credits');
        this.helpLink = document.getElementById('show-help');
        this.settingsLink = document.getElementById('show-settings');
        
        // Initialize the UI
        this.init();
    }
    
    /**
     * Initialize the UI layout
     */
    init() {
        // Add event listeners for main menu
        this.addMainMenuListeners();
        
        // Add event listeners for tab navigation
        this.addTabNavigationListeners();
        
        // Add event listeners for footer links
        this.addFooterLinkListeners();
        
        // Add keyboard navigation
        this.addKeyboardNavigation();
    }
    
    /**
     * Add event listeners for main menu
     */
    addMainMenuListeners() {
        // Toggle main menu when button is clicked
        this.mainMenuButton.addEventListener('click', () => {
            this.toggleMainMenu();
        });
        
        // Close menu when overlay is clicked
        if (this.menuOverlay) {
            this.menuOverlay.addEventListener('click', () => {
                this.closeMainMenu();
            });
        }
        
        // Handle menu item clicks
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                if (tabId) {
                    this.activateTab(tabId);
                    this.closeMainMenu();
                }
                
                // Handle special menu items
                if (item.id === 'menu-save') {
                    // Trigger save game functionality
                    const saveButton = document.getElementById('save-button');
                    if (saveButton) saveButton.click();
                    this.closeMainMenu();
                } else if (item.id === 'menu-load') {
                    // Trigger load game functionality
                    const loadButton = document.getElementById('load-button');
                    if (loadButton) loadButton.click();
                    this.closeMainMenu();
                } else if (item.id === 'menu-settings') {
                    // Show settings modal
                    // TODO: Implement settings modal
                    this.closeMainMenu();
                }
            });
        });
    }
    
    /**
     * Add event listeners for tab navigation
     */
    addTabNavigationListeners() {
        // Handle tab button clicks
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.activateTab(tabId);
            });
        });
        
        // Handle sub-tab button clicks
        this.subTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                this.activateSubTab(button, category);
            });
        });
    }
    
    /**
     * Add event listeners for footer links
     */
    addFooterLinkListeners() {
        // Show credits modal
        if (this.creditsLink) {
            this.creditsLink.addEventListener('click', (e) => {
                e.preventDefault();
                // TODO: Implement credits modal
                alert('Credits will be shown here');
            });
        }
        
        // Show help modal
        if (this.helpLink) {
            this.helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                // TODO: Implement help modal
                alert('Help will be shown here');
            });
        }
        
        // Show settings modal
        if (this.settingsLink) {
            this.settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                // TODO: Implement settings modal
                alert('Settings will be shown here');
            });
        }
    }
    
    /**
     * Add keyboard navigation
     */
    addKeyboardNavigation() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC key closes the main menu
            if (e.key === 'Escape') {
                this.closeMainMenu();
            }
            
            // M key toggles the main menu
            if (e.key === 'm' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                this.toggleMainMenu();
            }
        });
    }
    
    /**
     * Toggle main menu
     */
    toggleMainMenu() {
        this.mainNav.classList.toggle('active');
        if (this.menuOverlay) {
            this.menuOverlay.classList.toggle('active');
        }
        if (this.gameMain) {
            this.gameMain.classList.toggle('menu-open');
        }
    }
    
    /**
     * Close main menu
     */
    closeMainMenu() {
        this.mainNav.classList.remove('active');
        if (this.menuOverlay) {
            this.menuOverlay.classList.remove('active');
        }
        if (this.gameMain) {
            this.gameMain.classList.remove('menu-open');
        }
    }
    
    /**
     * Activate tab
     * @param {string} tabId - The ID of the tab to activate
     */
    activateTab(tabId) {
        // Update tab buttons
        this.tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update menu items
        this.menuItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    /**
     * Activate sub-tab
     * @param {HTMLElement} button - The button element
     * @param {string} category - The category to activate
     */
    activateSubTab(button, category) {
        // Update sub-tab buttons
        const subTabButtons = button.parentElement.querySelectorAll('.sub-tab-button');
        subTabButtons.forEach(btn => {
            if (btn === button) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update research options based on category
        if (category && document.getElementById('research-options')) {
            // This is handled by the research.js file
            // We just need to dispatch a custom event
            const event = new CustomEvent('researchCategoryChanged', {
                detail: { category: category }
            });
            document.dispatchEvent(event);
        }
    }
}

// Initialize UI Layout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiLayout = new UILayout();
});
