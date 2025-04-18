/**
 * Diplomacy UI Module for Pixel Empires
 * Handles the diplomacy interface and interactions
 */
class DiplomacyUI {
    /**
     * Initialize the diplomacy UI
     * @param {GameState} gameState - The game state
     * @param {UIManager} uiManager - The UI manager
     */
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        
        // Initialize UI elements
        this.initializeUI();
        
        // Bind event handlers
        this.bindEvents();
    }
    
    /**
     * Initialize the diplomacy UI elements
     */
    initializeUI() {
        // Get UI elements
        this.diplomaticRelationsElement = document.getElementById('diplomatic-relations');
        this.availableFactionsElement = document.getElementById('available-factions');
        this.establishRelationsButton = document.getElementById('establish-relations-button');
        this.proposeAllianceButton = document.getElementById('propose-alliance-button');
        this.declareWarButton = document.getElementById('declare-war-button');
        this.sendEmissaryButton = document.getElementById('send-emissary-button');
        
        // Initialize available factions
        this.initializeAvailableFactions();
        
        // Update diplomatic relations display
        this.updateDiplomaticRelations();
    }
    
    /**
     * Initialize available factions
     */
    initializeAvailableFactions() {
        // Clear existing factions
        this.availableFactionsElement.innerHTML = '';
        
        // Get available factions from game state
        const availableFactions = this.getAvailableFactions();
        
        if (availableFactions.length === 0) {
            // No available factions
            const noFactionsMessage = document.createElement('div');
            noFactionsMessage.className = 'no-relations-message';
            noFactionsMessage.textContent = 'No available factions to establish relations with.';
            this.availableFactionsElement.appendChild(noFactionsMessage);
            return;
        }
        
        // Create faction items
        for (const faction of availableFactions) {
            const factionItem = this.createFactionItem(faction);
            this.availableFactionsElement.appendChild(factionItem);
        }
    }
    
    /**
     * Create a faction item element
     * @param {Object} faction - The faction data
     * @returns {HTMLElement} - The faction item element
     */
    createFactionItem(faction) {
        const factionItem = document.createElement('div');
        factionItem.className = 'faction-item';
        factionItem.dataset.factionId = faction.id;
        
        // Create faction info
        const factionInfo = document.createElement('div');
        factionInfo.className = 'faction-info';
        
        // Create faction icon
        const factionIcon = document.createElement('div');
        factionIcon.className = 'faction-icon';
        factionIcon.textContent = faction.name.charAt(0);
        factionInfo.appendChild(factionIcon);
        
        // Create faction details
        const factionDetails = document.createElement('div');
        factionDetails.className = 'faction-details';
        
        const factionName = document.createElement('div');
        factionName.className = 'faction-name';
        factionName.textContent = faction.name;
        factionDetails.appendChild(factionName);
        
        const factionType = document.createElement('div');
        factionType.className = 'faction-type';
        factionType.textContent = faction.type;
        factionDetails.appendChild(factionType);
        
        factionInfo.appendChild(factionDetails);
        factionItem.appendChild(factionInfo);
        
        // Create relation status
        const relationStatus = document.createElement('div');
        relationStatus.className = 'relation-status';
        
        // Get relation status
        const relation = this.gameState.diplomaticRelations.find(r => r.playerId === faction.id);
        if (relation) {
            relationStatus.textContent = this.getRelationStatusText(relation.status);
            relationStatus.classList.add(`relation-${relation.status.toLowerCase()}`);
        } else {
            relationStatus.textContent = 'None';
            relationStatus.classList.add('relation-none');
        }
        
        factionItem.appendChild(relationStatus);
        
        // Add click event to select faction
        factionItem.addEventListener('click', () => {
            this.selectFaction(faction);
        });
        
        return factionItem;
    }
    
    /**
     * Get relation status text
     * @param {string} status - The relation status
     * @returns {string} - The relation status text
     */
    getRelationStatusText(status) {
        switch (status) {
            case 'NEUTRAL':
                return 'Neutral';
            case 'FRIENDLY':
                return 'Friendly';
            case 'ALLIANCE':
                return 'Alliance';
            case 'HOSTILE':
                return 'Hostile';
            case 'WAR':
                return 'War';
            default:
                return 'Unknown';
        }
    }
    
    /**
     * Update diplomatic relations display
     */
    updateDiplomaticRelations() {
        // Clear existing relations
        this.diplomaticRelationsElement.innerHTML = '';
        
        // Get diplomatic relations from game state
        const diplomaticRelations = this.gameState.diplomaticRelations;
        
        if (diplomaticRelations.length === 0) {
            // No diplomatic relations
            const noRelationsMessage = document.createElement('div');
            noRelationsMessage.className = 'no-relations-message';
            noRelationsMessage.textContent = 'No diplomatic relations established yet.';
            this.diplomaticRelationsElement.appendChild(noRelationsMessage);
            return;
        }
        
        // Create relation items
        for (const relation of diplomaticRelations) {
            const relationItem = this.createRelationItem(relation);
            this.diplomaticRelationsElement.appendChild(relationItem);
        }
    }
    
    /**
     * Create a relation item element
     * @param {Object} relation - The relation data
     * @returns {HTMLElement} - The relation item element
     */
    createRelationItem(relation) {
        // Find faction data
        const faction = this.getFactionById(relation.playerId);
        if (!faction) return null;
        
        // Create faction item
        return this.createFactionItem({
            ...faction,
            relation: relation
        });
    }
    
    /**
     * Get available factions
     * @returns {Array} - Available factions
     */
    getAvailableFactions() {
        // In a real game, this would come from the game state
        // For now, we'll create some dummy factions
        return [
            {
                id: 'merchant_guild',
                name: 'Merchant Guild',
                type: 'Trading Faction',
                description: 'A well-established trading organization with fair prices.'
            },
            {
                id: 'northern_kingdom',
                name: 'Northern Kingdom',
                type: 'Military Faction',
                description: 'A powerful kingdom with a strong military presence.'
            },
            {
                id: 'eastern_empire',
                name: 'Eastern Empire',
                type: 'Imperial Faction',
                description: 'An ancient empire with vast territories and resources.'
            },
            {
                id: 'forest_alliance',
                name: 'Forest Alliance',
                type: 'Nature Faction',
                description: 'A coalition of forest dwellers who protect the natural world.'
            },
            {
                id: 'mountain_clans',
                name: 'Mountain Clans',
                type: 'Mining Faction',
                description: 'Hardy clans who control the mountain passes and mines.'
            }
        ];
    }
    
    /**
     * Get faction by ID
     * @param {string} factionId - The faction ID
     * @returns {Object} - The faction data
     */
    getFactionById(factionId) {
        return this.getAvailableFactions().find(f => f.id === factionId);
    }
    
    /**
     * Select a faction
     * @param {Object} faction - The selected faction
     */
    selectFaction(faction) {
        // Deselect all faction items
        const factionItems = this.availableFactionsElement.querySelectorAll('.faction-item');
        factionItems.forEach(item => item.classList.remove('selected'));
        
        // Select the clicked faction item
        const factionItem = this.availableFactionsElement.querySelector(`[data-faction-id="${faction.id}"]`);
        if (factionItem) {
            factionItem.classList.add('selected');
        }
        
        // Update diplomatic action buttons
        this.updateDiplomaticActionButtons(faction);
    }
    
    /**
     * Update diplomatic action buttons based on selected faction
     * @param {Object} faction - The selected faction
     */
    updateDiplomaticActionButtons(faction) {
        // Get relation with the faction
        const relation = this.gameState.diplomaticRelations.find(r => r.playerId === faction.id);
        
        // Enable/disable buttons based on relation status
        if (!relation) {
            // No relation established yet
            this.establishRelationsButton.disabled = false;
            this.proposeAllianceButton.disabled = true;
            this.declareWarButton.disabled = true;
            this.sendEmissaryButton.disabled = true;
        } else {
            // Relation already established
            this.establishRelationsButton.disabled = true;
            
            switch (relation.status) {
                case 'NEUTRAL':
                    this.proposeAllianceButton.disabled = false;
                    this.declareWarButton.disabled = false;
                    this.sendEmissaryButton.disabled = false;
                    break;
                case 'FRIENDLY':
                    this.proposeAllianceButton.disabled = false;
                    this.declareWarButton.disabled = false;
                    this.sendEmissaryButton.disabled = false;
                    break;
                case 'ALLIANCE':
                    this.proposeAllianceButton.disabled = true;
                    this.declareWarButton.disabled = false;
                    this.sendEmissaryButton.disabled = false;
                    break;
                case 'HOSTILE':
                    this.proposeAllianceButton.disabled = true;
                    this.declareWarButton.disabled = false;
                    this.sendEmissaryButton.disabled = false;
                    break;
                case 'WAR':
                    this.proposeAllianceButton.disabled = true;
                    this.declareWarButton.disabled = true;
                    this.sendEmissaryButton.disabled = false;
                    break;
                default:
                    this.proposeAllianceButton.disabled = true;
                    this.declareWarButton.disabled = true;
                    this.sendEmissaryButton.disabled = true;
            }
        }
        
        // Store selected faction ID
        this.selectedFactionId = faction.id;
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Establish relations button
        this.establishRelationsButton.addEventListener('click', () => {
            this.establishRelations();
        });
        
        // Propose alliance button
        this.proposeAllianceButton.addEventListener('click', () => {
            this.proposeAlliance();
        });
        
        // Declare war button
        this.declareWarButton.addEventListener('click', () => {
            this.declareWar();
        });
        
        // Send emissary button
        this.sendEmissaryButton.addEventListener('click', () => {
            this.sendEmissary();
        });
    }
    
    /**
     * Establish diplomatic relations with selected faction
     */
    establishRelations() {
        if (!this.selectedFactionId) return;
        
        // Check if diplomacy technology is researched
        const hasDiplomacyTech = this.gameState.technologies.DIPLOMATIC && 
                                this.gameState.technologies.DIPLOMATIC.DIPLOMACY;
        
        if (!hasDiplomacyTech) {
            this.uiManager.showMessage('You need to research Diplomacy technology first.');
            return;
        }
        
        // Establish diplomatic relation
        const success = this.gameState.establishDiplomaticRelation(this.selectedFactionId, 'NEUTRAL');
        
        if (success) {
            this.uiManager.showMessage(`Established diplomatic relations with ${this.getFactionById(this.selectedFactionId).name}.`);
            
            // Update UI
            this.updateDiplomaticRelations();
            this.initializeAvailableFactions();
        }
    }
    
    /**
     * Propose alliance with selected faction
     */
    proposeAlliance() {
        if (!this.selectedFactionId) return;
        
        // Check if alliances technology is researched
        const hasAlliancesTech = this.gameState.technologies.DIPLOMATIC && 
                                this.gameState.technologies.DIPLOMATIC.ALLIANCES;
        
        if (!hasAlliancesTech) {
            this.uiManager.showMessage('You need to research Alliances technology first.');
            return;
        }
        
        // Propose alliance
        const success = this.gameState.establishDiplomaticRelation(this.selectedFactionId, 'ALLIANCE');
        
        if (success) {
            this.uiManager.showMessage(`Formed alliance with ${this.getFactionById(this.selectedFactionId).name}.`);
            
            // Update UI
            this.updateDiplomaticRelations();
            this.initializeAvailableFactions();
        }
    }
    
    /**
     * Declare war on selected faction
     */
    declareWar() {
        if (!this.selectedFactionId) return;
        
        // Confirm war declaration
        if (!confirm(`Are you sure you want to declare war on ${this.getFactionById(this.selectedFactionId).name}?`)) {
            return;
        }
        
        // Declare war
        const success = this.gameState.establishDiplomaticRelation(this.selectedFactionId, 'WAR');
        
        if (success) {
            this.uiManager.showMessage(`Declared war on ${this.getFactionById(this.selectedFactionId).name}!`);
            
            // Update UI
            this.updateDiplomaticRelations();
            this.initializeAvailableFactions();
        }
    }
    
    /**
     * Send emissary to selected faction
     */
    sendEmissary() {
        if (!this.selectedFactionId) return;
        
        // Check if emissaries technology is researched
        const hasEmissariesTech = this.gameState.technologies.DIPLOMATIC && 
                                 this.gameState.technologies.DIPLOMATIC.EMISSARIES;
        
        if (!hasEmissariesTech) {
            this.uiManager.showMessage('You need to research Emissaries technology first.');
            return;
        }
        
        // Check if player has a diplomat unit
        if (!this.gameState.units.DIPLOMAT || this.gameState.units.DIPLOMAT < 1) {
            this.uiManager.showMessage('You need at least one Diplomat unit to send an emissary.');
            return;
        }
        
        // Send emissary (improve relations)
        const relation = this.gameState.diplomaticRelations.find(r => r.playerId === this.selectedFactionId);
        
        if (relation) {
            // Improve favor level
            relation.favorLevel = Math.min(100, relation.favorLevel + 10);
            
            // Update relation status based on favor level
            if (relation.favorLevel >= 80 && relation.status !== 'ALLIANCE') {
                relation.status = 'FRIENDLY';
            } else if (relation.favorLevel <= 20 && relation.status !== 'WAR') {
                relation.status = 'HOSTILE';
            }
            
            // Use up one diplomat unit
            this.gameState.units.DIPLOMAT -= 1;
            
            this.uiManager.showMessage(`Sent emissary to ${this.getFactionById(this.selectedFactionId).name}. Relations improved.`);
            
            // Update UI
            this.updateDiplomaticRelations();
            this.initializeAvailableFactions();
            this.uiManager.updateResourceDisplay();
        }
    }
    
    /**
     * Update the diplomacy UI
     */
    update() {
        this.updateDiplomaticRelations();
        this.initializeAvailableFactions();
    }
}

// Export the DiplomacyUI class
if (typeof module !== 'undefined') {
    module.exports = { DiplomacyUI };
}
