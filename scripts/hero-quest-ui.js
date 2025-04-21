/**
 * Hero Quest UI for Pixel Empires
 * Handles the UI for hero quests, missions, and rewards
 */
class HeroQuestUI {
    /**
     * Initialize the hero quest UI
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     * @param {HeroQuestSystem} questSystem - The hero quest system
     */
    constructor(gameState, heroManager, questSystem) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        this.questSystem = questSystem;
        this.selectedHero = null;
        this.selectedTab = 'active'; // active, completed
    }
    
    /**
     * Create the quest UI for a hero
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    createQuestUI(heroId, container) {
        this.selectedHero = heroId;
        
        // Clear container
        container.innerHTML = '';
        
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return;
        
        // Create quest container
        const questContainer = document.createElement('div');
        questContainer.className = 'hero-quest-container';
        
        // Add header with hero info
        const header = document.createElement('div');
        header.className = 'quest-header';
        header.innerHTML = `
            <div class="hero-info">
                <div class="hero-portrait">${hero.portrait}</div>
                <div class="hero-details">
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-type">${this.heroManager.heroTypes[hero.type].name} (Level ${hero.level})</div>
                </div>
            </div>
            <div class="quest-actions">
                <button class="get-quest-button">Get New Quest</button>
            </div>
        `;
        
        questContainer.appendChild(header);
        
        // Create tab navigation
        const tabNav = document.createElement('div');
        tabNav.className = 'quest-tab-nav';
        
        const activeTab = document.createElement('div');
        activeTab.className = `quest-tab ${this.selectedTab === 'active' ? 'active' : ''}`;
        activeTab.textContent = 'Active Quests';
        activeTab.addEventListener('click', () => {
            this.selectedTab = 'active';
            this.createQuestUI(heroId, container);
        });
        
        const completedTab = document.createElement('div');
        completedTab.className = `quest-tab ${this.selectedTab === 'completed' ? 'active' : ''}`;
        completedTab.textContent = 'Completed Quests';
        completedTab.addEventListener('click', () => {
            this.selectedTab = 'completed';
            this.createQuestUI(heroId, container);
        });
        
        tabNav.appendChild(activeTab);
        tabNav.appendChild(completedTab);
        
        questContainer.appendChild(tabNav);
        
        // Create quest list
        const questList = document.createElement('div');
        questList.className = 'quest-list';
        
        // Get quests based on selected tab
        const quests = this.selectedTab === 'active' 
            ? this.questSystem.getHeroQuests(heroId)
            : this.questSystem.getHeroCompletedQuests(heroId);
        
        if (quests.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-quests';
            emptyMessage.textContent = this.selectedTab === 'active' 
                ? 'No active quests. Get a new quest to start your adventure!'
                : 'No completed quests yet. Complete quests to see them here.';
            
            questList.appendChild(emptyMessage);
        } else {
            // Add each quest
            for (const quest of quests) {
                const questElement = document.createElement('div');
                questElement.className = `quest-item ${quest.status}`;
                questElement.dataset.questId = quest.id;
                
                // Format objective progress
                const progressText = this.formatQuestProgress(quest);
                
                // Format rewards
                const rewardsText = this.formatQuestRewards(quest);
                
                // Format time remaining
                const timeText = this.formatQuestTime(quest);
                
                questElement.innerHTML = `
                    <div class="quest-icon">${quest.icon}</div>
                    <div class="quest-info">
                        <div class="quest-name">${quest.name} (${quest.difficulty})</div>
                        <div class="quest-description">${quest.description}</div>
                        <div class="quest-progress">${progressText}</div>
                        <div class="quest-rewards">Rewards: ${rewardsText}</div>
                        <div class="quest-time">${timeText}</div>
                    </div>
                    ${this.selectedTab === 'active' ? `
                        <div class="quest-actions">
                            <button class="abandon-quest-button" data-quest-id="${quest.id}">Abandon</button>
                        </div>
                    ` : ''}
                `;
                
                questList.appendChild(questElement);
                
                // Add event listener for abandon button
                if (this.selectedTab === 'active') {
                    const abandonButton = questElement.querySelector('.abandon-quest-button');
                    abandonButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.abandonQuest(quest.id, container);
                    });
                }
            }
        }
        
        questContainer.appendChild(questList);
        
        // Add event listener for get quest button
        const getQuestButton = header.querySelector('.get-quest-button');
        getQuestButton.addEventListener('click', () => {
            this.getNewQuest(heroId, container);
        });
        
        container.appendChild(questContainer);
    }
    
    /**
     * Format quest progress for display
     * @param {Object} quest - The quest object
     * @returns {string} - Formatted progress text
     */
    formatQuestProgress(quest) {
        if (!quest.objective) return '';
        
        let progressText = '';
        
        switch (quest.objective.type) {
            case 'defeat_enemies':
                progressText = `Defeat enemies: ${quest.objective.current}/${quest.objective.target}`;
                break;
                
            case 'defeat_boss':
                progressText = `Defeat ${quest.objective.bossType} boss: ${quest.objective.current}/${quest.objective.target}`;
                break;
                
            case 'explore_regions':
                progressText = `Explore regions: ${quest.objective.current}/${quest.objective.target}`;
                break;
                
            case 'discover_locations':
                progressText = `Discover locations: ${quest.objective.current}/${quest.objective.target}`;
                break;
                
            case 'collect_resources':
                progressText = `Collect ${quest.objective.resourceType}: ${quest.objective.current}/${quest.objective.target}`;
                break;
                
            case 'improve_relations':
                progressText = `Improve relations with ${quest.objective.factionId}: ${quest.objective.current}/${quest.objective.target}`;
                break;
                
            case 'training':
                progressText = `Complete training exercises: ${quest.objective.current}/${quest.objective.target}`;
                break;
                
            case 'research':
                progressText = `Research magical knowledge: ${quest.objective.current}/${quest.objective.target}`;
                break;
                
            default:
                progressText = `Progress: ${quest.objective.current}/${quest.objective.target}`;
        }
        
        // Add progress bar
        const progressPercent = Math.min(100, Math.floor((quest.objective.current / quest.objective.target) * 100));
        progressText += `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
        `;
        
        return progressText;
    }
    
    /**
     * Format quest rewards for display
     * @param {Object} quest - The quest object
     * @returns {string} - Formatted rewards text
     */
    formatQuestRewards(quest) {
        if (!quest.reward) return '';
        
        const rewards = [];
        
        // Experience
        if (quest.reward.experience) {
            rewards.push(`${quest.reward.experience} XP`);
        }
        
        // Gold
        if (quest.reward.gold) {
            rewards.push(`${quest.reward.gold} Gold`);
        }
        
        // Skill points
        if (quest.reward.skillPoints) {
            rewards.push(`${quest.reward.skillPoints} Skill Points`);
        }
        
        // Item
        if (quest.reward.item) {
            rewards.push(this.formatItemReward(quest.reward.item));
        }
        
        // Other resources
        for (const [resource, amount] of Object.entries(quest.reward)) {
            if (["experience", "gold", "skillPoints", "item"].includes(resource)) {
                continue;
            }
            
            rewards.push(`${amount} ${resource}`);
        }
        
        return rewards.join(', ');
    }
    
    /**
     * Format item reward for display
     * @param {string} itemType - The item type
     * @returns {string} - Formatted item text
     */
    formatItemReward(itemType) {
        switch (itemType) {
            case 'random_equipment':
                return 'Random Equipment';
                
            case 'rare_equipment':
                return 'Rare Equipment';
                
            case 'epic_equipment':
                return 'Epic Equipment';
                
            case 'legendary_equipment':
                return 'Legendary Equipment';
                
            default:
                return itemType;
        }
    }
    
    /**
     * Format quest time for display
     * @param {Object} quest - The quest object
     * @returns {string} - Formatted time text
     */
    formatQuestTime(quest) {
        if (quest.status === 'completed') {
            // Format completion time
            const completionDate = new Date(quest.completionTime);
            return `Completed on ${completionDate.toLocaleDateString()}`;
        } else if (quest.status === 'active') {
            // Format expiry time
            const now = Date.now();
            const timeRemaining = quest.expiryTime - now;
            
            if (timeRemaining <= 0) {
                return 'Expired';
            }
            
            // Convert to days, hours, minutes
            const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
            const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
            
            if (days > 0) {
                return `Expires in ${days}d ${hours}h`;
            } else if (hours > 0) {
                return `Expires in ${hours}h ${minutes}m`;
            } else {
                return `Expires in ${minutes}m`;
            }
        }
        
        return '';
    }
    
    /**
     * Get a new quest for a hero
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    getNewQuest(heroId, container) {
        const result = this.questSystem.assignQuest(heroId);
        
        // Show result message
        this.showMessage(result.message, result.success ? 'success' : 'error');
        
        // Update UI
        this.createQuestUI(heroId, container);
    }
    
    /**
     * Abandon a quest
     * @param {string} questId - The quest ID
     * @param {HTMLElement} container - The container element
     */
    abandonQuest(questId, container) {
        // Confirm abandonment
        if (!confirm('Are you sure you want to abandon this quest? You will lose all progress.')) {
            return;
        }
        
        const result = this.questSystem.abandonQuest(questId);
        
        // Show result message
        this.showMessage(result.message, result.success ? 'success' : 'error');
        
        // Update UI
        this.createQuestUI(this.selectedHero, container);
    }
    
    /**
     * Show a message to the user
     * @param {string} message - The message to show
     * @param {string} type - The message type (success, error, info)
     */
    showMessage(message, type = 'info') {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // Add to document
        document.body.appendChild(messageElement);
        
        // Remove after a delay
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 500);
        }, 3000);
    }
}

// Export the HeroQuestUI class
if (typeof module !== 'undefined') {
    module.exports = { HeroQuestUI };
}
