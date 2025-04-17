/**
 * Events UI
 * Handles the UI for the special events system
 */
class EventsUI {
    constructor(gameState, eventManager) {
        this.gameState = gameState;
        this.eventManager = eventManager;
        
        // Initialize UI elements
        this.eventModal = document.getElementById('event-modal');
        this.eventModalContent = document.getElementById('event-modal-content');
        this.eventModalClose = document.getElementById('event-modal-close');
        
        // Bind event listeners
        if (this.eventModalClose) {
            this.eventModalClose.addEventListener('click', () => {
                this.hideEventModal();
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.eventModal) {
                this.hideEventModal();
            }
        });
    }
    
    /**
     * Show the event modal with the given event
     * @param {Object} event - The event to display
     */
    showEventModal(event) {
        if (!this.eventModal || !this.eventModalContent) return;
        
        // Clear previous content
        this.eventModalContent.innerHTML = '';
        
        // Create event header
        const header = document.createElement('div');
        header.className = 'event-header';
        header.innerHTML = `
            <h3>${event.name}</h3>
            <p>${event.description}</p>
        `;
        this.eventModalContent.appendChild(header);
        
        // Create event options
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'event-options';
        
        event.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'event-option';
            
            // Check if option has a condition and if it's met
            const isDisabled = option.condition && !option.condition();
            
            optionElement.innerHTML = `
                <h4>${option.label}</h4>
                <p>${option.description}</p>
            `;
            
            if (isDisabled) {
                optionElement.classList.add('disabled');
                const disabledMessage = document.createElement('p');
                disabledMessage.className = 'disabled-message';
                disabledMessage.textContent = 'Requirements not met';
                optionElement.appendChild(disabledMessage);
            } else {
                optionElement.addEventListener('click', () => {
                    option.effect();
                    this.hideEventModal();
                });
            }
            
            optionsContainer.appendChild(optionElement);
        });
        
        this.eventModalContent.appendChild(optionsContainer);
        
        // Show the modal
        this.eventModal.style.display = 'flex';
    }
    
    /**
     * Hide the event modal
     */
    hideEventModal() {
        if (!this.eventModal) return;
        this.eventModal.style.display = 'none';
    }
    
    /**
     * Update the event history display
     */
    updateEventHistory() {
        const historyContainer = document.getElementById('event-history');
        if (!historyContainer) return;
        
        // Clear previous content
        historyContainer.innerHTML = '';
        
        // Get event history
        const events = this.eventManager.getEventHistory();
        
        // Display the most recent 5 events
        const recentEvents = events.slice(-5).reverse();
        
        if (recentEvents.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No events yet';
            historyContainer.appendChild(emptyMessage);
            return;
        }
        
        // Create event history items
        recentEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-history-item';
            
            eventItem.innerHTML = `
                <div class="event-history-header">
                    <span class="event-name">${event.name}</span>
                    <span class="event-turn">Turn ${event.turn}</span>
                </div>
                ${event.outcome ? `<p class="event-outcome">${event.outcome}</p>` : ''}
            `;
            
            historyContainer.appendChild(eventItem);
        });
    }
}
