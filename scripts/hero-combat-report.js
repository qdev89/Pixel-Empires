/**
 * Hero Combat Report System
 * Handles detailed combat reports for heroes
 */
class HeroCombatReportSystem {
    /**
     * Initialize the hero combat report system
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.reports = [];
        this.maxReports = 10; // Maximum number of reports to keep
        
        // Create UI elements
        this.createReportUI();
    }
    
    /**
     * Create the report UI
     */
    createReportUI() {
        // Create report modal
        const reportModal = document.createElement('div');
        reportModal.id = 'hero-combat-report-modal';
        reportModal.className = 'modal';
        
        // Create modal content
        reportModal.innerHTML = `
            <div id="hero-combat-report-content" class="modal-content">
                <span id="hero-combat-report-close" class="close-button">&times;</span>
                <h3>Hero Combat Report</h3>
                <div id="hero-combat-report-container">
                    <!-- Report content will be dynamically generated -->
                </div>
                <div class="report-navigation">
                    <button id="prev-report" class="nav-button">&lt; Previous</button>
                    <span id="report-counter">Report 0 of 0</span>
                    <button id="next-report" class="nav-button">Next &gt;</button>
                </div>
                <button id="hero-combat-report-close-button" class="continue-button">Close</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(reportModal);
        
        // Add event listeners
        const closeButton = document.getElementById('hero-combat-report-close');
        const closeButtonBottom = document.getElementById('hero-combat-report-close-button');
        const prevButton = document.getElementById('prev-report');
        const nextButton = document.getElementById('next-report');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hideReportModal());
        }
        
        if (closeButtonBottom) {
            closeButtonBottom.addEventListener('click', () => this.hideReportModal());
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.showPreviousReport());
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.showNextReport());
        }
        
        // Store elements
        this.elements = {
            modal: reportModal,
            container: document.getElementById('hero-combat-report-container'),
            counter: document.getElementById('report-counter'),
            prevButton: prevButton,
            nextButton: nextButton
        };
        
        // Current report index
        this.currentReportIndex = 0;
    }
    
    /**
     * Add a new combat report
     * @param {Object} report - The combat report
     */
    addReport(report) {
        // Add timestamp if not present
        if (!report.timestamp) {
            report.timestamp = new Date().toLocaleString();
        }
        
        // Add to reports array
        this.reports.unshift(report);
        
        // Limit the number of reports
        if (this.reports.length > this.maxReports) {
            this.reports.pop();
        }
    }
    
    /**
     * Show the report modal with the latest report
     */
    showReportModal() {
        if (this.reports.length === 0) {
            // No reports to show
            return;
        }
        
        // Reset to the latest report
        this.currentReportIndex = 0;
        
        // Show the modal
        if (this.elements.modal) {
            this.elements.modal.style.display = 'flex';
            this.renderCurrentReport();
        }
    }
    
    /**
     * Hide the report modal
     */
    hideReportModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
        }
    }
    
    /**
     * Show the previous report
     */
    showPreviousReport() {
        if (this.currentReportIndex < this.reports.length - 1) {
            this.currentReportIndex++;
            this.renderCurrentReport();
        }
    }
    
    /**
     * Show the next report
     */
    showNextReport() {
        if (this.currentReportIndex > 0) {
            this.currentReportIndex--;
            this.renderCurrentReport();
        }
    }
    
    /**
     * Render the current report
     */
    renderCurrentReport() {
        if (!this.elements.container || this.reports.length === 0) {
            return;
        }
        
        const report = this.reports[this.currentReportIndex];
        
        // Update report counter
        if (this.elements.counter) {
            this.elements.counter.textContent = `Report ${this.currentReportIndex + 1} of ${this.reports.length}`;
        }
        
        // Update navigation buttons
        if (this.elements.prevButton) {
            this.elements.prevButton.disabled = this.currentReportIndex >= this.reports.length - 1;
        }
        
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = this.currentReportIndex <= 0;
        }
        
        // Generate report HTML
        let reportHTML = `
            <div class="report-header">
                <div class="report-title">${report.result === 'victory' ? 'Victory' : 'Defeat'} against ${report.target}</div>
                <div class="report-timestamp">${report.timestamp}</div>
            </div>
            <div class="report-summary">
                <div class="report-section">
                    <h4>Battle Summary</h4>
                    <div class="battle-details">
                        <div class="battle-detail">
                            <span class="detail-label">Target:</span>
                            <span class="detail-value">${report.target} (Difficulty: ${report.targetDifficulty})</span>
                        </div>
                        <div class="battle-detail">
                            <span class="detail-label">Formation:</span>
                            <span class="detail-value">${report.formation || 'Balanced'}</span>
                        </div>
                        <div class="battle-detail">
                            <span class="detail-label">Result:</span>
                            <span class="detail-value ${report.result}">${report.result === 'victory' ? 'Victory' : 'Defeat'}</span>
                        </div>
                    </div>
                </div>
        `;
        
        // Add units section
        reportHTML += `
            <div class="report-section">
                <h4>Units</h4>
                <div class="units-table">
                    <div class="unit-row header">
                        <div class="unit-cell">Unit Type</div>
                        <div class="unit-cell">Sent</div>
                        <div class="unit-cell">Lost</div>
                        <div class="unit-cell">Survived</div>
                    </div>
        `;
        
        // Add unit rows
        for (const unitType in report.unitsSent) {
            const sent = report.unitsSent[unitType] || 0;
            const lost = report.unitsLost[unitType] || 0;
            const survived = sent - lost;
            
            reportHTML += `
                <div class="unit-row">
                    <div class="unit-cell">${unitType}</div>
                    <div class="unit-cell">${sent}</div>
                    <div class="unit-cell">${lost}</div>
                    <div class="unit-cell">${survived}</div>
                </div>
            `;
        }
        
        reportHTML += `
                </div>
            </div>
        `;
        
        // Add heroes section if heroes participated
        if (report.heroes && report.heroes.length > 0) {
            reportHTML += `
                <div class="report-section">
                    <h4>Heroes</h4>
                    <div class="heroes-container">
            `;
            
            // Add hero cards
            for (const hero of report.heroes) {
                reportHTML += `
                    <div class="hero-report-card">
                        <div class="hero-report-header">
                            <div class="hero-portrait">${hero.portrait || '👤'}</div>
                            <div class="hero-info">
                                <div class="hero-name">${hero.name}</div>
                                <div class="hero-type">${hero.type} (Lvl ${hero.level})</div>
                            </div>
                        </div>
                        <div class="hero-report-details">
                            <div class="hero-detail">
                                <span class="detail-label">Experience Gained:</span>
                                <span class="detail-value">${report.heroExperience || 0}</span>
                            </div>
                            <div class="hero-detail">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value">${hero.status || 'Active'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            reportHTML += `
                    </div>
                </div>
            `;
            
            // Add hero abilities used if any
            if (report.heroAbilitiesUsed && report.heroAbilitiesUsed.length > 0) {
                reportHTML += `
                    <div class="report-section">
                        <h4>Hero Abilities Used</h4>
                        <div class="abilities-table">
                            <div class="ability-row header">
                                <div class="ability-cell">Hero</div>
                                <div class="ability-cell">Ability</div>
                                <div class="ability-cell">Effect</div>
                            </div>
                `;
                
                // Add ability rows
                for (const ability of report.heroAbilitiesUsed) {
                    reportHTML += `
                        <div class="ability-row">
                            <div class="ability-cell">${ability.heroName}</div>
                            <div class="ability-cell">${ability.abilityName}</div>
                            <div class="ability-cell">${ability.effect || 'Combat bonus'}</div>
                        </div>
                    `;
                }
                
                reportHTML += `
                        </div>
                    </div>
                `;
            }
        }
        
        // Add loot section
        reportHTML += `
            <div class="report-section">
                <h4>Loot</h4>
                <div class="loot-container">
        `;
        
        // Add loot items
        for (const resourceType in report.loot) {
            const amount = report.loot[resourceType] || 0;
            
            reportHTML += `
                <div class="loot-item">
                    <div class="loot-icon">${this.getResourceIcon(resourceType)}</div>
                    <div class="loot-details">
                        <div class="loot-type">${resourceType}</div>
                        <div class="loot-amount">${amount}</div>
                    </div>
                </div>
            `;
        }
        
        reportHTML += `
                </div>
            </div>
        `;
        
        // Set the report HTML
        this.elements.container.innerHTML = reportHTML;
    }
    
    /**
     * Get an icon for a resource type
     * @param {string} resourceType - The resource type
     * @returns {string} - The icon HTML
     */
    getResourceIcon(resourceType) {
        switch (resourceType.toUpperCase()) {
            case 'FOOD':
                return '🍖';
            case 'ORE':
                return '⛏️';
            case 'GOLD':
                return '💰';
            case 'GEMS':
                return '💎';
            default:
                return '📦';
        }
    }
    
    /**
     * Create a combat report from a combat result
     * @param {Object} combat - The combat object
     * @param {Object} result - The combat result
     * @returns {Object} - The formatted combat report
     */
    createCombatReport(combat, result) {
        if (!combat || !result) return null;
        
        // Create basic report
        const report = {
            timestamp: new Date().toLocaleString(),
            target: result.target,
            targetType: result.targetType,
            targetDifficulty: result.targetDifficulty,
            formation: combat.formation,
            unitsSent: result.unitsSent,
            unitsLost: result.unitsLost,
            result: result.result,
            loot: result.loot,
            heroExperience: result.heroExperience || 0
        };
        
        // Add heroes if present
        if (combat.heroes && combat.heroes.length > 0) {
            report.heroes = combat.heroes.map(hero => ({
                id: hero.id,
                name: hero.name,
                type: hero.type,
                level: hero.level,
                portrait: hero.portrait,
                status: this.getHeroStatusAfterCombat(hero.id, result.result === 'victory')
            }));
        }
        
        // Add hero abilities used if any
        if (combat.heroAbilitiesUsed && combat.heroAbilitiesUsed.length > 0) {
            report.heroAbilitiesUsed = combat.heroAbilitiesUsed;
        }
        
        // Add the report
        this.addReport(report);
        
        return report;
    }
    
    /**
     * Get a hero's status after combat
     * @param {string} heroId - The hero ID
     * @param {boolean} victory - Whether the combat was a victory
     * @returns {string} - The hero's status
     */
    getHeroStatusAfterCombat(heroId, victory) {
        if (!this.gameState.heroManager) return 'Unknown';
        
        const hero = this.gameState.heroManager.getHeroById(heroId);
        if (!hero) return 'Unknown';
        
        return hero.status || 'Active';
    }
}

// HeroCombatReportSystem class is now ready to be instantiated in main.js
