/**
 * Turn Summary System
 * Manages the turn summary display and tracking
 */
class TurnSummaryManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.summaryData = {
            resources: {
                FOOD: { previous: 0, current: 0, change: 0 },
                ORE: { previous: 0, current: 0, change: 0 }
            },
            buildings: [],
            research: null,
            combatResults: [],
            events: null,
            unitChanges: {
                SPEARMAN: { previous: 0, current: 0, change: 0 },
                ARCHER: { previous: 0, current: 0, change: 0 },
                CAVALRY: { previous: 0, current: 0, change: 0 }
            }
        };
        
        // Initialize UI elements
        this.modal = document.getElementById('turn-summary-modal');
        this.container = document.getElementById('turn-summary-container');
        this.closeButton = document.getElementById('turn-summary-close');
        this.continueButton = document.getElementById('turn-summary-continue');
        
        // Bind event listeners
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hideModal());
        }
        
        if (this.continueButton) {
            this.continueButton.addEventListener('click', () => this.hideModal());
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hideModal();
            }
        });
    }
    
    /**
     * Prepare summary data before a turn
     */
    prepareSummary() {
        // Store current resource values
        this.summaryData.resources.FOOD.previous = Math.floor(this.gameState.resources.FOOD);
        this.summaryData.resources.ORE.previous = Math.floor(this.gameState.resources.ORE);
        
        // Store current unit counts
        this.summaryData.unitChanges.SPEARMAN.previous = this.gameState.units.SPEARMAN;
        this.summaryData.unitChanges.ARCHER.previous = this.gameState.units.ARCHER;
        this.summaryData.unitChanges.CAVALRY.previous = this.gameState.units.CAVALRY;
        
        // Reset other tracking data
        this.summaryData.buildings = [];
        this.summaryData.research = null;
        this.summaryData.combatResults = [];
        this.summaryData.events = null;
    }
    
    /**
     * Finalize summary data after a turn
     */
    finalizeSummary() {
        // Calculate resource changes
        this.summaryData.resources.FOOD.current = Math.floor(this.gameState.resources.FOOD);
        this.summaryData.resources.ORE.current = Math.floor(this.gameState.resources.ORE);
        this.summaryData.resources.FOOD.change = this.summaryData.resources.FOOD.current - this.summaryData.resources.FOOD.previous;
        this.summaryData.resources.ORE.change = this.summaryData.resources.ORE.current - this.summaryData.resources.ORE.previous;
        
        // Calculate unit changes
        this.summaryData.unitChanges.SPEARMAN.current = this.gameState.units.SPEARMAN;
        this.summaryData.unitChanges.ARCHER.current = this.gameState.units.ARCHER;
        this.summaryData.unitChanges.CAVALRY.current = this.gameState.units.CAVALRY;
        this.summaryData.unitChanges.SPEARMAN.change = this.summaryData.unitChanges.SPEARMAN.current - this.summaryData.unitChanges.SPEARMAN.previous;
        this.summaryData.unitChanges.ARCHER.change = this.summaryData.unitChanges.ARCHER.current - this.summaryData.unitChanges.ARCHER.previous;
        this.summaryData.unitChanges.CAVALRY.change = this.summaryData.unitChanges.CAVALRY.current - this.summaryData.unitChanges.CAVALRY.previous;
        
        // Check for completed buildings
        if (this.gameState.buildQueue.length > 0) {
            this.summaryData.buildings = this.gameState.buildQueue.map(item => ({
                type: item.buildingType,
                name: CONFIG.BUILDINGS[item.buildingType].name,
                level: item.level,
                progress: Math.max(0, 100 - (item.timeRemaining / 10) * 100) // Assuming 10 seconds build time
            }));
        }
        
        // Check for research progress
        if (this.gameState.researchManager && this.gameState.researchManager.currentResearch) {
            const research = this.gameState.researchManager.currentResearch;
            this.summaryData.research = {
                id: research.id,
                name: research.name,
                progress: research.progress
            };
        }
        
        // Get recent combat results (only from this turn)
        if (this.gameState.combatReports.length > 0) {
            // Assuming the most recent reports are from this turn
            // In a more sophisticated system, we'd tag reports with the turn number
            this.summaryData.combatResults = this.gameState.combatReports.slice(0, 1);
        }
        
        // Get event from this turn
        if (this.gameState.eventManager && this.gameState.eventManager.activeEvent) {
            this.summaryData.events = this.gameState.eventManager.activeEvent;
        } else if (this.gameState.eventManager && this.gameState.eventManager.eventHistory.length > 0) {
            // Check if the most recent event was from this turn
            const latestEvent = this.gameState.eventManager.eventHistory[this.gameState.eventManager.eventHistory.length - 1];
            if (latestEvent.turn === this.gameState.turn - 1 && latestEvent.resolved) {
                this.summaryData.events = latestEvent;
            }
        }
    }
    
    /**
     * Show the turn summary modal
     */
    showSummary() {
        if (!this.modal || !this.container) return;
        
        // Clear previous content
        this.container.innerHTML = '';
        
        // Create resource summary section
        const resourceSection = document.createElement('div');
        resourceSection.className = 'summary-section';
        resourceSection.innerHTML = '<h4>Resources</h4>';
        
        // Add food change
        const foodItem = document.createElement('div');
        foodItem.className = 'summary-item';
        const foodChange = this.summaryData.resources.FOOD.change;
        const foodChangeClass = foodChange > 0 ? 'positive-change' : (foodChange < 0 ? 'negative-change' : 'neutral-change');
        const foodChangeSign = foodChange > 0 ? '+' : '';
        
        foodItem.innerHTML = `
            <div class="summary-icon food-icon">F</div>
            <div>Food: ${this.summaryData.resources.FOOD.current} 
                <span class="resource-change ${foodChangeClass}">(${foodChangeSign}${foodChange})</span>
            </div>
        `;
        resourceSection.appendChild(foodItem);
        
        // Add ore change
        const oreItem = document.createElement('div');
        oreItem.className = 'summary-item';
        const oreChange = this.summaryData.resources.ORE.change;
        const oreChangeClass = oreChange > 0 ? 'positive-change' : (oreChange < 0 ? 'negative-change' : 'neutral-change');
        const oreChangeSign = oreChange > 0 ? '+' : '';
        
        oreItem.innerHTML = `
            <div class="summary-icon ore-icon">O</div>
            <div>Ore: ${this.summaryData.resources.ORE.current} 
                <span class="resource-change ${oreChangeClass}">(${oreChangeSign}${oreChange})</span>
            </div>
        `;
        resourceSection.appendChild(oreItem);
        
        this.container.appendChild(resourceSection);
        
        // Create units summary section if there are changes
        if (this.summaryData.unitChanges.SPEARMAN.change !== 0 || 
            this.summaryData.unitChanges.ARCHER.change !== 0 || 
            this.summaryData.unitChanges.CAVALRY.change !== 0) {
            
            const unitsSection = document.createElement('div');
            unitsSection.className = 'summary-section';
            unitsSection.innerHTML = '<h4>Units</h4>';
            
            // Add unit changes
            const unitTypes = ['SPEARMAN', 'ARCHER', 'CAVALRY'];
            const unitIcons = ['S', 'A', 'C'];
            const unitNames = ['Spearmen', 'Archers', 'Cavalry'];
            
            for (let i = 0; i < unitTypes.length; i++) {
                const unitType = unitTypes[i];
                if (this.summaryData.unitChanges[unitType].change !== 0) {
                    const unitItem = document.createElement('div');
                    unitItem.className = 'summary-item';
                    const unitChange = this.summaryData.unitChanges[unitType].change;
                    const unitChangeClass = unitChange > 0 ? 'positive-change' : 'negative-change';
                    const unitChangeSign = unitChange > 0 ? '+' : '';
                    
                    unitItem.innerHTML = `
                        <div class="summary-icon unit-icon ${unitType.toLowerCase()}">${unitIcons[i]}</div>
                        <div>${unitNames[i]}: ${this.summaryData.unitChanges[unitType].current} 
                            <span class="resource-change ${unitChangeClass}">(${unitChangeSign}${unitChange})</span>
                        </div>
                    `;
                    unitsSection.appendChild(unitItem);
                }
            }
            
            this.container.appendChild(unitsSection);
        }
        
        // Create buildings summary section if there are buildings in progress
        if (this.summaryData.buildings.length > 0) {
            const buildingsSection = document.createElement('div');
            buildingsSection.className = 'summary-section';
            buildingsSection.innerHTML = '<h4>Buildings</h4>';
            
            this.summaryData.buildings.forEach(building => {
                const buildingItem = document.createElement('div');
                buildingItem.className = 'summary-item';
                
                buildingItem.innerHTML = `
                    <div class="summary-icon building-icon">${building.type.charAt(0)}</div>
                    <div>${building.name} (Level ${building.level}) - Construction: ${Math.floor(building.progress)}%</div>
                `;
                buildingsSection.appendChild(buildingItem);
            });
            
            this.container.appendChild(buildingsSection);
        }
        
        // Create research summary section if there is research in progress
        if (this.summaryData.research) {
            const researchSection = document.createElement('div');
            researchSection.className = 'summary-section';
            researchSection.innerHTML = '<h4>Research</h4>';
            
            const researchItem = document.createElement('div');
            researchItem.className = 'summary-item';
            
            researchItem.innerHTML = `
                <div class="summary-icon research-icon">R</div>
                <div>${this.summaryData.research.name} - Progress: ${Math.floor(this.summaryData.research.progress)}%</div>
            `;
            researchSection.appendChild(researchItem);
            
            this.container.appendChild(researchSection);
        }
        
        // Create combat summary section if there are combat results
        if (this.summaryData.combatResults.length > 0) {
            const combatSection = document.createElement('div');
            combatSection.className = 'summary-section';
            combatSection.innerHTML = '<h4>Combat</h4>';
            
            this.summaryData.combatResults.forEach(report => {
                const combatItem = document.createElement('div');
                combatItem.className = 'summary-item';
                
                const resultText = report.result === 'victory' ? 
                    '<span class="positive-change">Victory!</span>' : 
                    '<span class="negative-change">Defeat!</span>';
                
                combatItem.innerHTML = `
                    <div class="summary-icon combat-icon">C</div>
                    <div>Attack on ${report.target}: ${resultText}</div>
                `;
                combatSection.appendChild(combatItem);
            });
            
            this.container.appendChild(combatSection);
        }
        
        // Create events summary section if there was an event
        if (this.summaryData.events) {
            const eventsSection = document.createElement('div');
            eventsSection.className = 'summary-section';
            eventsSection.innerHTML = '<h4>Events</h4>';
            
            const eventItem = document.createElement('div');
            eventItem.className = 'summary-item';
            
            eventItem.innerHTML = `
                <div class="summary-icon event-icon">E</div>
                <div>${this.summaryData.events.name}: ${this.summaryData.events.outcome || this.summaryData.events.description}</div>
            `;
            eventsSection.appendChild(eventItem);
            
            this.container.appendChild(eventsSection);
        }
        
        // Show the modal
        this.modal.style.display = 'flex';
    }
    
    /**
     * Hide the turn summary modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
    
    /**
     * Process a turn and show the summary
     */
    processTurn() {
        this.finalizeSummary();
        this.showSummary();
        this.prepareSummary(); // Prepare for the next turn
    }
}
