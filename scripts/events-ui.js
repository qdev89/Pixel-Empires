/**
 * Events UI
 * Handles the UI for the special events system and challenges
 */
class EventsUI {
    constructor(gameState, eventManager) {
        this.gameState = gameState;
        this.eventManager = eventManager;
        this.challengeManager = gameState.challengeManager;

        // Initialize UI elements
        this.eventModal = document.getElementById('event-modal');
        this.eventModalContent = document.getElementById('event-modal-content');
        this.eventModalClose = document.getElementById('event-modal-close');

        // Initialize events section
        this.initializeEventsSection();

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
            if (event.target === this.challengeSelectionModal) {
                this.hideChallengeSelectionModal();
            }
        });
    }

    /**
     * Initialize the events section UI
     */
    initializeEventsSection() {
        // Get events section
        this.eventsSection = document.getElementById('events-section');
        this.eventHistory = document.getElementById('event-history');

        if (!this.eventsSection || !this.eventHistory) return;

        // Create events container
        this.activeEventsContainer = document.createElement('div');
        this.activeEventsContainer.id = 'active-events';
        this.activeEventsContainer.className = 'active-events';

        // Create challenges container
        this.activeChallengesContainer = document.createElement('div');
        this.activeChallengesContainer.id = 'active-challenges';
        this.activeChallengesContainer.className = 'active-challenges';

        // Add containers to events section
        this.eventsSection.insertBefore(this.activeEventsContainer, this.eventHistory);
        this.eventsSection.insertBefore(this.activeChallengesContainer, this.eventHistory);

        // Create section headers
        const activeEventsHeader = document.createElement('div');
        activeEventsHeader.className = 'subsection-header';
        activeEventsHeader.innerHTML = '<h4>Active Events</h4>';
        this.activeEventsContainer.appendChild(activeEventsHeader);

        const activeChallengesHeader = document.createElement('div');
        activeChallengesHeader.className = 'subsection-header';
        activeChallengesHeader.innerHTML = '<h4>Active Challenges</h4>';
        this.activeChallengesContainer.appendChild(activeChallengesHeader);

        // Create content containers
        this.activeEventsContent = document.createElement('div');
        this.activeEventsContent.className = 'events-content';
        this.activeEventsContainer.appendChild(this.activeEventsContent);

        this.activeChallengesContent = document.createElement('div');
        this.activeChallengesContent.className = 'challenges-content';
        this.activeChallengesContainer.appendChild(this.activeChallengesContent);

        // Create event history header
        const eventHistoryHeader = document.createElement('div');
        eventHistoryHeader.className = 'subsection-header';
        eventHistoryHeader.innerHTML = '<h4>Recent Events</h4>';
        this.eventHistory.parentNode.insertBefore(eventHistoryHeader, this.eventHistory);

        // Create challenge selection modal
        this.createChallengeSelectionModal();
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
     * Update all event and challenge UI elements
     */
    updateUI() {
        this.updateActiveEvents();
        this.updateActiveChallenges();
        this.updateEventHistory();
    }

    /**
     * Update active events display
     */
    updateActiveEvents() {
        if (!this.activeEventsContent) return;

        // Clear current content
        this.activeEventsContent.innerHTML = '';

        // Get active events
        const activeEvents = this.challengeManager.getActiveEvents();

        if (activeEvents.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No active events';
            this.activeEventsContent.appendChild(emptyMessage);
            return;
        }

        // Create event cards for each active event
        activeEvents.forEach(event => {
            const eventCard = this.createEventCard(event);
            this.activeEventsContent.appendChild(eventCard);
        });
    }

    /**
     * Create an event card element
     */
    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.dataset.eventId = event.id;

        // Add difficulty badge
        const difficultyClass = event.difficulty.toLowerCase();
        card.classList.add(`difficulty-${difficultyClass}`);

        // Create header with title and time remaining
        const header = document.createElement('div');
        header.className = 'event-header';

        const title = document.createElement('h5');
        title.className = 'event-title';
        title.textContent = event.title;

        const timeRemaining = document.createElement('div');
        timeRemaining.className = 'time-remaining';
        const remainingSeconds = Math.max(0, event.endTime - this.gameState.getGameTime());
        timeRemaining.textContent = this.formatTime(remainingSeconds);

        header.appendChild(title);
        header.appendChild(timeRemaining);
        card.appendChild(header);

        // Create description
        const description = document.createElement('div');
        description.className = 'event-description';
        description.textContent = event.description;
        card.appendChild(description);

        // Create progress bar if there's an objective
        if (event.objectiveType !== 'none') {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';

            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.style.width = `${event.progress}%`;

            const progressText = document.createElement('div');
            progressText.className = 'progress-text';
            progressText.textContent = `${Math.floor(event.progress)}%`;

            progressContainer.appendChild(progressBar);
            progressContainer.appendChild(progressText);
            card.appendChild(progressContainer);

            // Add objective text
            const objective = document.createElement('div');
            objective.className = 'event-objective';
            objective.textContent = this.getObjectiveText(event);
            card.appendChild(objective);
        }

        // Add reward info
        if (event.reward && event.reward !== 'none') {
            const reward = document.createElement('div');
            reward.className = 'event-reward';
            reward.textContent = `Reward: ${this.getRewardText(event.reward)}`;
            card.appendChild(reward);
        }

        // Add claim button if event is completed but not claimed
        if (event.completed && !event.claimed) {
            const claimButton = document.createElement('button');
            claimButton.className = 'claim-button';
            claimButton.textContent = 'Claim Reward';
            claimButton.addEventListener('click', () => {
                this.challengeManager.claimEventReward(event.id);
            });
            card.appendChild(claimButton);
        }

        return card;
    }

    /**
     * Update active challenges display
     */
    updateActiveChallenges() {
        if (!this.activeChallengesContent) return;

        // Clear current content
        this.activeChallengesContent.innerHTML = '';

        // Get active challenges
        const activeChallenges = this.challengeManager.getActiveChallenges();

        if (activeChallenges.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No active challenges';
            this.activeChallengesContent.appendChild(emptyMessage);

            // Add button to start a challenge
            const startButton = document.createElement('button');
            startButton.className = 'start-challenge-button';
            startButton.textContent = 'Start a Challenge';
            startButton.addEventListener('click', () => {
                this.showChallengeSelectionModal();
            });
            this.activeChallengesContent.appendChild(startButton);
            return;
        }

        // Create challenge cards for each active challenge
        activeChallenges.forEach(challenge => {
            const challengeCard = this.createChallengeCard(challenge);
            this.activeChallengesContent.appendChild(challengeCard);
        });
    }

    /**
     * Create a challenge card element
     */
    createChallengeCard(challenge) {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        card.dataset.challengeId = challenge.id;

        // Add difficulty badge
        const difficultyClass = challenge.difficulty.toLowerCase();
        card.classList.add(`difficulty-${difficultyClass}`);

        // Create header with title and time remaining
        const header = document.createElement('div');
        header.className = 'challenge-header';

        const title = document.createElement('h5');
        title.className = 'challenge-title';
        title.textContent = challenge.title;

        const timeRemaining = document.createElement('div');
        timeRemaining.className = 'time-remaining';
        const remainingSeconds = Math.max(0, challenge.endTime - this.gameState.getGameTime());
        timeRemaining.textContent = this.formatTime(remainingSeconds);

        header.appendChild(title);
        header.appendChild(timeRemaining);
        card.appendChild(header);

        // Create description
        const description = document.createElement('div');
        description.className = 'challenge-description';
        description.textContent = challenge.description;
        card.appendChild(description);

        // Create overall progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.width = `${challenge.progress}%`;

        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = `${Math.floor(challenge.progress)}%`;

        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        card.appendChild(progressContainer);

        // Create objectives list
        const objectivesList = document.createElement('div');
        objectivesList.className = 'objectives-list';

        challenge.objectives.forEach(objective => {
            const objectiveItem = document.createElement('div');
            objectiveItem.className = 'objective-item';
            if (objective.completed) {
                objectiveItem.classList.add('completed');
            }

            const objectiveText = document.createElement('div');
            objectiveText.className = 'objective-text';
            objectiveText.textContent = this.getChallengeObjectiveText(objective);

            const objectiveProgress = document.createElement('div');
            objectiveProgress.className = 'objective-progress';
            objectiveProgress.textContent = `${Math.floor(objective.progress)}%`;

            objectiveItem.appendChild(objectiveText);
            objectiveItem.appendChild(objectiveProgress);
            objectivesList.appendChild(objectiveItem);
        });

        card.appendChild(objectivesList);

        // Add reward info
        if (challenge.reward) {
            const reward = document.createElement('div');
            reward.className = 'challenge-reward';
            reward.textContent = `Reward: ${this.getRewardText(challenge.reward)}`;
            card.appendChild(reward);
        }

        // Add claim button if challenge is completed but not claimed
        if (challenge.completed && !challenge.claimed) {
            const claimButton = document.createElement('button');
            claimButton.className = 'claim-button';
            claimButton.textContent = 'Claim Reward';
            claimButton.addEventListener('click', () => {
                this.challengeManager.claimChallengeReward(challenge.id);
            });
            card.appendChild(claimButton);
        }

        return card;
    }

    /**
     * Update the event history display
     */
    updateEventHistory() {
        const historyContainer = document.getElementById('event-history');
        if (!historyContainer) return;

        // Clear current content
        historyContainer.innerHTML = '';

        // Get recent completed events and challenges
        const recentEvents = this.challengeManager.getRecentCompletedEvents(3);
        const recentChallenges = this.challengeManager.getRecentCompletedChallenges(2);

        // Also get legacy events from the event manager
        const legacyEvents = this.eventManager.getEventHistory();
        const recentLegacyEvents = legacyEvents.slice(-3).reverse();

        if (recentEvents.length === 0 && recentChallenges.length === 0 && recentLegacyEvents.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No recent events';
            historyContainer.appendChild(emptyMessage);
            return;
        }

        // Create history items for completed events
        recentEvents.forEach(event => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.classList.add(event.failed ? 'failed' : 'completed');

            const title = document.createElement('div');
            title.className = 'history-title';
            title.textContent = event.title;

            const status = document.createElement('div');
            status.className = 'history-status';
            status.textContent = event.failed ? 'Failed' : 'Completed';

            historyItem.appendChild(title);
            historyItem.appendChild(status);
            historyContainer.appendChild(historyItem);
        });

        // Create history items for completed challenges
        recentChallenges.forEach(challenge => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item challenge-history';
            historyItem.classList.add(challenge.failed ? 'failed' : 'completed');

            const title = document.createElement('div');
            title.className = 'history-title';
            title.textContent = challenge.title;

            const status = document.createElement('div');
            status.className = 'history-status';
            status.textContent = challenge.failed ? 'Failed' : 'Completed';

            historyItem.appendChild(title);
            historyItem.appendChild(status);
            historyContainer.appendChild(historyItem);
        });

        // Create history items for legacy events
        recentLegacyEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-history-item';

            eventItem.innerHTML = `
                <div class="event-history-header">
                    <span class="event-name">${event.name}</span>
                    <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                ${event.outcome ? `<p class="event-outcome">${event.outcome}</p>` : ''}
            `;

            historyContainer.appendChild(eventItem);
        });
    }

    /**
     * Show challenge selection modal
     */
    showChallengeSelectionModal() {
        // Create modal if it doesn't exist
        if (!this.challengeSelectionModal) {
            this.createChallengeSelectionModal();
        }

        // Update available challenges
        this.updateAvailableChallenges();

        // Show modal
        this.challengeSelectionModal.style.display = 'flex';
    }

    /**
     * Hide challenge selection modal
     */
    hideChallengeSelectionModal() {
        if (this.challengeSelectionModal) {
            this.challengeSelectionModal.style.display = 'none';
        }
    }

    /**
     * Create challenge selection modal
     */
    createChallengeSelectionModal() {
        // Create modal container
        this.challengeSelectionModal = document.createElement('div');
        this.challengeSelectionModal.id = 'challenge-selection-modal';
        this.challengeSelectionModal.className = 'modal';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Create close button
        const closeButton = document.createElement('span');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            this.hideChallengeSelectionModal();
        });

        // Create header
        const header = document.createElement('h3');
        header.textContent = 'Select a Challenge';

        // Create challenges container
        this.availableChallengesContainer = document.createElement('div');
        this.availableChallengesContainer.id = 'available-challenges';
        this.availableChallengesContainer.className = 'available-challenges';

        // Add elements to modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(header);
        modalContent.appendChild(this.availableChallengesContainer);
        this.challengeSelectionModal.appendChild(modalContent);

        // Add modal to document
        document.body.appendChild(this.challengeSelectionModal);
    }

    /**
     * Update available challenges in the selection modal
     */
    updateAvailableChallenges() {
        // Clear current content
        this.availableChallengesContainer.innerHTML = '';

        // Get all challenges from config
        const allChallenges = EVENTS_CONFIG.CHALLENGES;

        // Get active challenge IDs
        const activeChallengeIds = this.challengeManager.getActiveChallenges().map(c => c.id);

        // Filter out active challenges
        const availableChallenges = allChallenges.filter(c => !activeChallengeIds.includes(c.id));

        if (availableChallenges.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No available challenges';
            this.availableChallengesContainer.appendChild(emptyMessage);
            return;
        }

        // Create challenge cards for each available challenge
        availableChallenges.forEach(challenge => {
            const challengeCard = this.createAvailableChallengeCard(challenge);
            this.availableChallengesContainer.appendChild(challengeCard);
        });
    }

    /**
     * Create an available challenge card element
     */
    createAvailableChallengeCard(challenge) {
        const card = document.createElement('div');
        card.className = 'available-challenge-card';
        card.dataset.challengeId = challenge.id;

        // Add difficulty badge
        const difficultyClass = challenge.difficulty.toLowerCase();
        card.classList.add(`difficulty-${difficultyClass}`);

        // Create title
        const title = document.createElement('h5');
        title.className = 'challenge-title';
        title.textContent = challenge.title;
        card.appendChild(title);

        // Create description
        const description = document.createElement('div');
        description.className = 'challenge-description';
        description.textContent = challenge.description;
        card.appendChild(description);

        // Create objectives list
        const objectivesList = document.createElement('div');
        objectivesList.className = 'objectives-list';

        challenge.objectives.forEach(objective => {
            const objectiveItem = document.createElement('div');
            objectiveItem.className = 'objective-item';

            const objectiveText = document.createElement('div');
            objectiveText.className = 'objective-text';
            objectiveText.textContent = this.getChallengeObjectiveText(objective);

            objectiveItem.appendChild(objectiveText);
            objectivesList.appendChild(objectiveItem);
        });

        card.appendChild(objectivesList);

        // Add reward info
        if (challenge.reward) {
            const reward = document.createElement('div');
            reward.className = 'challenge-reward';
            reward.textContent = `Reward: ${this.getRewardText(challenge.reward)}`;
            card.appendChild(reward);
        }

        // Add duration info
        const duration = document.createElement('div');
        duration.className = 'challenge-duration';
        duration.textContent = `Duration: ${this.formatTime(challenge.duration)}`;
        card.appendChild(duration);

        // Add start button
        const startButton = document.createElement('button');
        startButton.className = 'start-button';
        startButton.textContent = 'Start Challenge';
        startButton.addEventListener('click', () => {
            this.challengeManager.startChallenge(challenge.id);
            this.hideChallengeSelectionModal();
        });
        card.appendChild(startButton);

        return card;
    }

    /**
     * Get objective text for an event
     */
    getObjectiveText(event) {
        switch (event.objectiveType) {
            case 'produce_resource':
                return `Produce ${event.objective.amount} ${event.objective.resource.toLowerCase()}`;

            case 'defeat_enemies':
                return `Defeat ${event.objective.count} ${CONFIG.NPC_CAMPS[event.objective.enemyType].name}`;

            case 'build_or_upgrade':
                return `Build or upgrade ${event.objective.count} buildings`;

            case 'build_specific':
                return `Build ${CONFIG.BUILDINGS[event.objective.buildingType].name} to level ${event.objective.level}`;

            case 'complete_research':
                return `Complete ${event.objective.count} research projects`;

            case 'complete_specific_research':
                return `Research ${CONFIG.TECHNOLOGIES[event.objective.category][event.objective.techId].name}`;

            case 'claim':
                return `Claim the special reward`;

            case 'train_units':
                return `Train ${event.objective.count} units`;

            default:
                return '';
        }
    }

    /**
     * Get objective text for a challenge objective
     */
    getChallengeObjectiveText(objective) {
        switch (objective.type) {
            case 'upgrade_building':
                return `Upgrade ${CONFIG.BUILDINGS[objective.buildingType].name} to level ${objective.level}`;

            case 'build_building':
                return `Build ${objective.count} ${CONFIG.BUILDINGS[objective.buildingType].name}`;

            case 'train_unit':
                return `Train ${objective.count} ${CONFIG.UNITS[objective.unitType].name}`;

            case 'complete_research':
                return `Complete ${objective.count} ${objective.category.toLowerCase()} research`;

            default:
                return '';
        }
    }

    /**
     * Get reward text for an event or challenge
     */
    getRewardText(reward) {
        switch (reward.type) {
            case 'resource':
                return `${reward.amount} ${reward.resource.toLowerCase()}`;

            case 'multi_resource':
                const resources = [];
                for (const [resource, amount] of Object.entries(reward.resources)) {
                    resources.push(`${amount} ${resource.toLowerCase()}`);
                }
                return resources.join(', ');

            case 'unit':
                return `${reward.amount} ${CONFIG.UNITS[reward.unitType].name}`;

            case 'unit_bonus':
                if (reward.stat === 'attack') {
                    return `+${Math.round((reward.multiplier - 1) * 100)}% unit attack for ${Math.floor(reward.duration / 60)} minutes`;
                } else if (reward.stat === 'defense') {
                    return `+${Math.round((reward.multiplier - 1) * 100)}% unit defense for ${Math.floor(reward.duration / 60)} minutes`;
                } else if (reward.stat === 'all') {
                    return `+${Math.round((reward.multiplier - 1) * 100)}% to all unit stats for ${Math.floor(reward.duration / 60)} minutes`;
                }
                break;

            case 'research_progress':
                return `${reward.amount}% progress on current research`;

            case 'research_speed':
                return `+${Math.round((reward.multiplier - 1) * 100)}% research speed for ${Math.floor(reward.duration / 60)} minutes`;

            default:
                return 'Unknown reward';
        }
    }

    /**
     * Format time in seconds to MM:SS or HH:MM:SS
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }
}
