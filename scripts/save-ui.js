/**
 * Save UI
 * Handles the user interface for saving and loading games
 */
class SaveUI {
    constructor(gameState, saveSystem) {
        this.gameState = gameState;
        this.saveSystem = saveSystem;
        
        // Initialize UI elements
        this.saveButton = document.getElementById('save-button');
        this.loadButton = document.getElementById('load-button');
        this.saveModal = document.getElementById('save-modal');
        this.saveModalContent = document.getElementById('save-modal-content');
        this.saveModalClose = document.getElementById('save-modal-close');
        this.saveSlotContainer = document.getElementById('save-slot-container');
        
        // Bind event listeners
        if (this.saveButton) {
            this.saveButton.addEventListener('click', () => this.showSaveModal('save'));
        }
        
        if (this.loadButton) {
            this.loadButton.addEventListener('click', () => this.showSaveModal('load'));
        }
        
        if (this.saveModalClose) {
            this.saveModalClose.addEventListener('click', () => this.hideSaveModal());
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.saveModal) {
                this.hideSaveModal();
            }
        });
    }
    
    /**
     * Show the save/load modal
     * @param {string} mode - 'save' or 'load'
     */
    showSaveModal(mode = 'save') {
        if (!this.saveModal || !this.saveModalContent || !this.saveSlotContainer) return;
        
        // Set the modal title based on mode
        const modalTitle = this.saveModalContent.querySelector('h3');
        if (modalTitle) {
            modalTitle.textContent = mode === 'save' ? 'Save Game' : 'Load Game';
        }
        
        // Clear previous content
        this.saveSlotContainer.innerHTML = '';
        
        // Get save metadata
        const saveMetadata = this.saveSystem.getSaveMetadata();
        
        // Create save slots
        saveMetadata.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'save-slot';
            
            if (slot.exists) {
                // Format the timestamp
                const formattedDate = this.saveSystem.formatTimestamp(slot.metadata.timestamp);
                
                slotElement.innerHTML = `
                    <div class="save-slot-info">
                        <h4>Slot ${slot.slot}</h4>
                        <div class="save-details">
                            <div>Turn: ${slot.metadata.turn}</div>
                            <div>Date: ${formattedDate}</div>
                            <div>Resources: Food ${slot.metadata.resources.food}, Ore ${slot.metadata.resources.ore}</div>
                        </div>
                    </div>
                    <div class="save-slot-actions">
                        <button class="slot-action-button ${mode}-button" data-slot="${slot.slot}">${mode === 'save' ? 'Save' : 'Load'}</button>
                        <button class="slot-action-button delete-button" data-slot="${slot.slot}">Delete</button>
                    </div>
                `;
            } else {
                slotElement.innerHTML = `
                    <div class="save-slot-info">
                        <h4>Slot ${slot.slot}</h4>
                        <div class="save-details empty-slot">Empty Slot</div>
                    </div>
                    <div class="save-slot-actions">
                        ${mode === 'save' ? `<button class="slot-action-button save-button" data-slot="${slot.slot}">Save</button>` : ''}
                    </div>
                `;
            }
            
            this.saveSlotContainer.appendChild(slotElement);
        });
        
        // Add event listeners to buttons
        const saveButtons = this.saveSlotContainer.querySelectorAll('.save-button');
        const loadButtons = this.saveSlotContainer.querySelectorAll('.load-button');
        const deleteButtons = this.saveSlotContainer.querySelectorAll('.delete-button');
        
        saveButtons.forEach(button => {
            button.addEventListener('click', () => {
                const slot = parseInt(button.dataset.slot);
                this.saveGame(slot);
            });
        });
        
        loadButtons.forEach(button => {
            button.addEventListener('click', () => {
                const slot = parseInt(button.dataset.slot);
                this.loadGame(slot);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const slot = parseInt(button.dataset.slot);
                this.deleteSave(slot);
            });
        });
        
        // Show the modal
        this.saveModal.style.display = 'flex';
    }
    
    /**
     * Hide the save/load modal
     */
    hideSaveModal() {
        if (this.saveModal) {
            this.saveModal.style.display = 'none';
        }
    }
    
    /**
     * Save the game to a slot
     * @param {number} slot - Save slot number
     */
    saveGame(slot) {
        const success = this.saveSystem.saveGame(slot);
        
        if (success) {
            // Show success message
            const message = document.createElement('div');
            message.className = 'save-message success';
            message.textContent = `Game saved to slot ${slot}!`;
            this.saveModalContent.appendChild(message);
            
            // Remove message after a delay
            setTimeout(() => {
                message.remove();
                this.hideSaveModal();
            }, 1500);
            
            // Refresh the save slots
            setTimeout(() => {
                this.showSaveModal('save');
            }, 1600);
        } else {
            // Show error message
            const message = document.createElement('div');
            message.className = 'save-message error';
            message.textContent = 'Error saving game!';
            this.saveModalContent.appendChild(message);
            
            // Remove message after a delay
            setTimeout(() => {
                message.remove();
            }, 3000);
        }
    }
    
    /**
     * Load a game from a slot
     * @param {number} slot - Save slot number
     */
    loadGame(slot) {
        const success = this.saveSystem.loadGame(slot);
        
        if (success) {
            // Show success message
            const message = document.createElement('div');
            message.className = 'save-message success';
            message.textContent = `Game loaded from slot ${slot}!`;
            this.saveModalContent.appendChild(message);
            
            // Remove message after a delay
            setTimeout(() => {
                message.remove();
                this.hideSaveModal();
            }, 1500);
        } else {
            // Show error message
            const message = document.createElement('div');
            message.className = 'save-message error';
            message.textContent = 'Error loading game!';
            this.saveModalContent.appendChild(message);
            
            // Remove message after a delay
            setTimeout(() => {
                message.remove();
            }, 3000);
        }
    }
    
    /**
     * Delete a save from a slot
     * @param {number} slot - Save slot number
     */
    deleteSave(slot) {
        // Ask for confirmation
        const confirmed = confirm(`Are you sure you want to delete the save in slot ${slot}?`);
        
        if (!confirmed) {
            return;
        }
        
        const success = this.saveSystem.deleteSave(slot);
        
        if (success) {
            // Show success message
            const message = document.createElement('div');
            message.className = 'save-message success';
            message.textContent = `Save in slot ${slot} deleted!`;
            this.saveModalContent.appendChild(message);
            
            // Remove message after a delay
            setTimeout(() => {
                message.remove();
            }, 1500);
            
            // Refresh the save slots
            setTimeout(() => {
                this.showSaveModal(this.saveModalContent.querySelector('h3').textContent === 'Save Game' ? 'save' : 'load');
            }, 1600);
        } else {
            // Show error message
            const message = document.createElement('div');
            message.className = 'save-message error';
            message.textContent = 'Error deleting save!';
            this.saveModalContent.appendChild(message);
            
            // Remove message after a delay
            setTimeout(() => {
                message.remove();
            }, 3000);
        }
    }
}
