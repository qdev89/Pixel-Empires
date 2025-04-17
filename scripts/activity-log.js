/**
 * Activity Log System
 * Manages the real-time activity log for the game
 */
class ActivityLogManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.logEntries = [];
        this.maxEntries = 100; // Maximum number of log entries to keep
        
        // Initialize UI elements
        this.modal = document.getElementById('activity-log-modal');
        this.container = document.getElementById('activity-log-container');
        this.closeButton = document.getElementById('activity-log-close');
        this.closeButtonBottom = document.getElementById('activity-log-close-button');
        
        // Bind event listeners
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hideModal());
        }
        
        if (this.closeButtonBottom) {
            this.closeButtonBottom.addEventListener('click', () => this.hideModal());
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hideModal();
            }
        });

        // Add log button to header
        this.addLogButton();
    }

    /**
     * Add a log button to the header
     */
    addLogButton() {
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            const logButton = document.createElement('button');
            logButton.id = 'activity-log-button';
            logButton.className = 'control-button';
            logButton.textContent = 'Activity Log';
            logButton.addEventListener('click', () => this.showModal());
            
            // Insert before the game controls
            const gameControls = document.getElementById('game-controls');
            if (gameControls) {
                headerRight.insertBefore(logButton, gameControls);
            } else {
                headerRight.appendChild(logButton);
            }
        }
    }
    
    /**
     * Add a new log entry
     * @param {string} category - The category of the log entry (e.g., 'Building', 'Combat', 'Research')
     * @param {string} message - The message to log
     * @param {Object} data - Additional data to store with the log entry
     */
    addLogEntry(category, message, data = {}) {
        const entry = {
            timestamp: new Date(),
            category,
            message,
            data
        };
        
        // Add to beginning of array for newest-first order
        this.logEntries.unshift(entry);
        
        // Trim log if it exceeds max entries
        if (this.logEntries.length > this.maxEntries) {
            this.logEntries = this.logEntries.slice(0, this.maxEntries);
        }
        
        // Update the log display if it's open
        if (this.modal && this.modal.style.display === 'flex') {
            this.updateLogDisplay();
        }
    }
    
    /**
     * Update the log display with current entries
     */
    updateLogDisplay() {
        if (!this.container) return;
        
        // Clear previous content
        this.container.innerHTML = '';
        
        if (this.logEntries.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'log-empty-message';
            emptyMessage.textContent = 'No activity recorded yet.';
            this.container.appendChild(emptyMessage);
            return;
        }
        
        // Add each log entry to the display
        this.logEntries.forEach(entry => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            const header = document.createElement('div');
            header.className = 'log-entry-header';
            
            const category = document.createElement('div');
            category.className = 'log-category';
            category.textContent = entry.category;
            
            const timestamp = document.createElement('div');
            timestamp.className = 'log-timestamp';
            timestamp.textContent = this.formatTimestamp(entry.timestamp);
            
            header.appendChild(category);
            header.appendChild(timestamp);
            
            const content = document.createElement('div');
            content.className = 'log-content';
            content.textContent = entry.message;
            
            logEntry.appendChild(header);
            logEntry.appendChild(content);
            
            this.container.appendChild(logEntry);
        });
    }
    
    /**
     * Format a timestamp for display
     * @param {Date} date - The date to format
     * @returns {string} - The formatted timestamp
     */
    formatTimestamp(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    
    /**
     * Show the activity log modal
     */
    showModal() {
        if (!this.modal) return;
        
        this.updateLogDisplay();
        this.modal.style.display = 'flex';
    }
    
    /**
     * Hide the activity log modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}
