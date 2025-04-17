/**
 * Combat UI
 * Handles the UI for combat operations
 */

class CombatUI {
    constructor(gameState, combatManager) {
        this.gameState = gameState;
        this.combatManager = combatManager;
        this.targetCamp = null;

        // Initialize DOM elements
        this.elements = {
            combatModal: document.getElementById('combat-modal'),
            modalContent: document.getElementById('combat-modal-content'),
            closeButton: document.getElementById('combat-modal-close'),
            unitSelectionForm: document.getElementById('unit-selection-form'),
            attackButton: document.getElementById('modal-attack-button'),
            targetInfo: document.getElementById('target-info'),
            unitInputs: {
                spearman: document.getElementById('spearman-input'),
                archer: document.getElementById('archer-input'),
                cavalry: document.getElementById('cavalry-input')
            },
            unitMaxButtons: {
                spearman: document.getElementById('spearman-max'),
                archer: document.getElementById('archer-max'),
                cavalry: document.getElementById('cavalry-max')
            },
            totalAttackPower: document.getElementById('total-attack-power'),
            targetDefense: document.getElementById('target-defense'),
            battleOutcome: document.getElementById('battle-outcome'),
            advantageInfo: document.getElementById('advantage-info')
        };

        // Initialize event listeners
        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Close modal when clicking the close button
        this.elements.closeButton.addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal when clicking outside the modal content
        this.elements.combatModal.addEventListener('click', (event) => {
            if (event.target === this.elements.combatModal) {
                this.hideModal();
            }
        });

        // Handle unit input changes
        for (const [unitType, input] of Object.entries(this.elements.unitInputs)) {
            input.addEventListener('input', () => {
                this.updateAttackPowerCalculation();
            });
        }

        // Handle max buttons
        for (const [unitType, button] of Object.entries(this.elements.unitMaxButtons)) {
            button.addEventListener('click', () => {
                const unitTypeUpper = unitType.toUpperCase();
                this.elements.unitInputs[unitType].value = this.gameState.units[unitTypeUpper];
                this.updateAttackPowerCalculation();
            });
        }

        // Handle attack button
        this.elements.attackButton.addEventListener('click', () => {
            this.launchAttack();
        });
    }

    /**
     * Show the combat modal for a specific target
     */
    showModal(targetX, targetY) {
        // Get target information
        const target = this.gameState.map[targetY][targetX];
        if (!target || target.type !== 'NPC') {
            console.error('Invalid target for combat');
            return;
        }

        this.targetCamp = {
            x: targetX,
            y: targetY,
            campType: target.campType,
            config: CONFIG.NPC_CAMPS[target.campType]
        };

        // Update target info
        this.elements.targetInfo.innerHTML = `
            <h3>${this.targetCamp.config.name}</h3>
            <div>Difficulty: ${this.targetCamp.config.difficulty}</div>
            <div>Defense: ${this.targetCamp.config.difficulty * 10}</div>
            <div>Potential Loot: Food ${this.targetCamp.config.loot.FOOD}, Ore ${this.targetCamp.config.loot.ORE}</div>
        `;

        // Reset unit inputs
        for (const input of Object.values(this.elements.unitInputs)) {
            input.value = 0;
        }

        // Update max values
        for (const [unitType, button] of Object.entries(this.elements.unitMaxButtons)) {
            const unitTypeUpper = unitType.toUpperCase();
            const maxUnits = this.gameState.units[unitTypeUpper];
            button.textContent = `Max (${maxUnits})`;
            button.disabled = maxUnits <= 0;

            // Set max attribute on inputs
            this.elements.unitInputs[unitType].max = maxUnits;
        }

        // Reset attack power calculation
        this.updateAttackPowerCalculation();

        // Show the modal
        this.elements.combatModal.style.display = 'flex';
    }

    /**
     * Hide the combat modal
     */
    hideModal() {
        this.elements.combatModal.style.display = 'none';
        this.targetCamp = null;
    }

    /**
     * Update the attack power calculation
     */
    updateAttackPowerCalculation() {
        if (!this.targetCamp) return;

        let totalAttackPower = 0;
        let advantageText = '';

        // Calculate attack power for each unit type
        const spearmenCount = parseInt(this.elements.unitInputs.spearman.value) || 0;
        const archerCount = parseInt(this.elements.unitInputs.archer.value) || 0;
        const cavalryCount = parseInt(this.elements.unitInputs.cavalry.value) || 0;

        // Calculate Spearmen attack power
        if (spearmenCount > 0) {
            let unitBaseAttack = CONFIG.UNITS.SPEARMAN.stats.attack;
            if (this.gameState.bonuses.unitAttack > 0) {
                unitBaseAttack *= (1 + this.gameState.bonuses.unitAttack);
            }

            let unitAttack = spearmenCount * unitBaseAttack;

            // Apply unit type advantages
            if (this.targetCamp.campType === 'GOBLIN_CAMP') {
                let advantageMultiplier = 1.2; // 20% base bonus against goblins
                if (this.gameState.bonuses.advantageMultiplier > 0) {
                    advantageMultiplier += this.gameState.bonuses.advantageMultiplier;
                }
                unitAttack *= advantageMultiplier;
                advantageText += `<div class="advantage">Spearmen +${Math.round((advantageMultiplier - 1) * 100)}% vs Goblins</div>`;
            }

            totalAttackPower += unitAttack;
        }

        // Calculate Archers attack power
        if (archerCount > 0) {
            let unitBaseAttack = CONFIG.UNITS.ARCHER.stats.attack;
            if (this.gameState.bonuses.unitAttack > 0) {
                unitBaseAttack *= (1 + this.gameState.bonuses.unitAttack);
            }

            let unitAttack = archerCount * unitBaseAttack;

            // Apply unit type advantages
            if (this.targetCamp.campType === 'BANDIT_HIDEOUT') {
                let advantageMultiplier = 1.2; // 20% base bonus against bandits
                if (this.gameState.bonuses.advantageMultiplier > 0) {
                    advantageMultiplier += this.gameState.bonuses.advantageMultiplier;
                }
                unitAttack *= advantageMultiplier;
                advantageText += `<div class="advantage">Archers +${Math.round((advantageMultiplier - 1) * 100)}% vs Bandits</div>`;
            }

            totalAttackPower += unitAttack;
        }

        // Calculate Cavalry attack power
        if (cavalryCount > 0) {
            let unitBaseAttack = CONFIG.UNITS.CAVALRY.stats.attack;
            if (this.gameState.bonuses.unitAttack > 0) {
                unitBaseAttack *= (1 + this.gameState.bonuses.unitAttack);
            }

            let unitAttack = cavalryCount * unitBaseAttack;
            totalAttackPower += unitAttack;
        }

        // Update UI
        this.elements.totalAttackPower.textContent = totalAttackPower.toFixed(1);
        this.elements.targetDefense.textContent = (this.targetCamp.config.difficulty * 10).toString();
        this.elements.advantageInfo.innerHTML = advantageText;

        // Predict battle outcome
        const targetDefense = this.targetCamp.config.difficulty * 10;
        if (totalAttackPower > targetDefense) {
            this.elements.battleOutcome.textContent = 'Victory Likely';
            this.elements.battleOutcome.className = 'victory';
        } else {
            this.elements.battleOutcome.textContent = 'Defeat Likely';
            this.elements.battleOutcome.className = 'defeat';
        }

        // Enable/disable attack button
        this.elements.attackButton.disabled = (spearmenCount + archerCount + cavalryCount <= 0);
    }

    /**
     * Launch the attack with selected units
     */
    launchAttack() {
        if (!this.targetCamp) return;

        // Get selected units
        const units = {
            SPEARMAN: parseInt(this.elements.unitInputs.spearman.value) || 0,
            ARCHER: parseInt(this.elements.unitInputs.archer.value) || 0,
            CAVALRY: parseInt(this.elements.unitInputs.cavalry.value) || 0
        };

        // Check if we have any units to send
        if (units.SPEARMAN <= 0 && units.ARCHER <= 0 && units.CAVALRY <= 0) {
            alert('You need to select at least one unit to attack!');
            return;
        }

        // Launch the attack
        this.combatManager.attackNPCWithUnits(this.targetCamp.x, this.targetCamp.y, units);

        // Hide the modal
        this.hideModal();
    }
}

// CombatUI class is now ready to be instantiated in main.js
