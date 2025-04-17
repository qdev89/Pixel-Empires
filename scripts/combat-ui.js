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
            formationRadios: {
                balanced: document.getElementById('formation-balanced'),
                aggressive: document.getElementById('formation-aggressive'),
                defensive: document.getElementById('formation-defensive'),
                flanking: document.getElementById('formation-flanking')
            },
            terrainInfo: {
                type: document.getElementById('terrain-type'),
                effect: document.getElementById('terrain-effect')
            },
            enemyAbility: document.getElementById('enemy-ability'),
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

        // Handle formation radio changes
        for (const [formationType, radio] of Object.entries(this.elements.formationRadios)) {
            radio.addEventListener('change', () => {
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

        // Determine terrain type at target location
        const terrainSeed = (targetX * 3 + targetY * 7) % 10;
        let terrainType = 'grass';
        if (terrainSeed < 5) {
            terrainType = 'grass';
        } else if (terrainSeed < 7) {
            terrainType = 'forest';
        } else if (terrainSeed < 9) {
            terrainType = 'mountain';
        } else {
            terrainType = 'water';
        }

        // Get terrain effects
        const terrainEffect = CONFIG.COMBAT.TERRAIN_EFFECTS[terrainType];

        // Update terrain info
        this.elements.terrainInfo.type.textContent = terrainType.charAt(0).toUpperCase() + terrainType.slice(1);
        this.elements.terrainInfo.effect.textContent = terrainEffect.description;

        // Update enemy ability info
        if (this.targetCamp.config.specialAbility) {
            const ability = this.targetCamp.config.specialAbility;
            this.elements.enemyAbility.innerHTML = `
                <div class="ability-name">${ability.name}</div>
                <div class="ability-description">${ability.description}</div>
            `;
        } else {
            this.elements.enemyAbility.textContent = 'None';
        }

        // Update target info
        this.elements.targetInfo.innerHTML = `
            <h3>${this.targetCamp.config.name}</h3>
            <div>Difficulty: ${this.targetCamp.config.difficulty}</div>
            <div>Defense: ${this.targetCamp.config.difficulty * 10}</div>
            <div>Potential Loot: Food ${this.targetCamp.config.loot.FOOD}, Ore ${this.targetCamp.config.loot.ORE}</div>
            <div>Weak Against: ${CONFIG.UNITS[this.targetCamp.config.weakAgainst].name}</div>
            <div>Strong Against: ${CONFIG.UNITS[this.targetCamp.config.strongAgainst].name}</div>
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

        // Get selected formation
        let selectedFormation = 'balanced';
        for (const [formationType, radio] of Object.entries(this.elements.formationRadios)) {
            if (radio.checked) {
                selectedFormation = formationType;
                break;
            }
        }

        // Get formation effects
        const formationEffect = CONFIG.COMBAT.FORMATIONS[selectedFormation];

        // Calculate Spearmen attack power
        if (spearmenCount > 0) {
            let unitBaseAttack = CONFIG.UNITS.SPEARMAN.stats.attack;
            if (this.gameState.bonuses.unitAttack > 0) {
                unitBaseAttack *= (1 + this.gameState.bonuses.unitAttack);
            }

            let unitAttack = spearmenCount * unitBaseAttack;

            // Apply unit type advantages based on camp weaknesses
            if (this.targetCamp.config.weakAgainst === 'SPEARMAN') {
                let advantageMultiplier = CONFIG.COMBAT.ADVANTAGE_MULTIPLIER;
                if (this.gameState.bonuses.advantageMultiplier > 0) {
                    advantageMultiplier += this.gameState.bonuses.advantageMultiplier;
                }
                unitAttack *= advantageMultiplier;
                advantageText += `<div class="advantage">Spearmen +${Math.round((advantageMultiplier - 1) * 100)}% vs ${this.targetCamp.config.name}</div>`;
            } else if (this.targetCamp.config.strongAgainst === 'SPEARMAN') {
                let disadvantageMultiplier = CONFIG.COMBAT.DISADVANTAGE_MULTIPLIER;
                unitAttack *= disadvantageMultiplier;
                advantageText += `<div class="disadvantage">Spearmen ${Math.round((disadvantageMultiplier - 1) * 100)}% vs ${this.targetCamp.config.name}</div>`;
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

            // Apply unit type advantages based on camp weaknesses
            if (this.targetCamp.config.weakAgainst === 'ARCHER') {
                let advantageMultiplier = CONFIG.COMBAT.ADVANTAGE_MULTIPLIER;
                if (this.gameState.bonuses.advantageMultiplier > 0) {
                    advantageMultiplier += this.gameState.bonuses.advantageMultiplier;
                }
                unitAttack *= advantageMultiplier;
                advantageText += `<div class="advantage">Archers +${Math.round((advantageMultiplier - 1) * 100)}% vs ${this.targetCamp.config.name}</div>`;
            } else if (this.targetCamp.config.strongAgainst === 'ARCHER') {
                let disadvantageMultiplier = CONFIG.COMBAT.DISADVANTAGE_MULTIPLIER;
                unitAttack *= disadvantageMultiplier;
                advantageText += `<div class="disadvantage">Archers ${Math.round((disadvantageMultiplier - 1) * 100)}% vs ${this.targetCamp.config.name}</div>`;
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

            // Apply unit type advantages based on camp weaknesses
            if (this.targetCamp.config.weakAgainst === 'CAVALRY') {
                let advantageMultiplier = CONFIG.COMBAT.ADVANTAGE_MULTIPLIER;
                if (this.gameState.bonuses.advantageMultiplier > 0) {
                    advantageMultiplier += this.gameState.bonuses.advantageMultiplier;
                }
                unitAttack *= advantageMultiplier;
                advantageText += `<div class="advantage">Cavalry +${Math.round((advantageMultiplier - 1) * 100)}% vs ${this.targetCamp.config.name}</div>`;
            } else if (this.targetCamp.config.strongAgainst === 'CAVALRY') {
                let disadvantageMultiplier = CONFIG.COMBAT.DISADVANTAGE_MULTIPLIER;
                unitAttack *= disadvantageMultiplier;
                advantageText += `<div class="disadvantage">Cavalry ${Math.round((disadvantageMultiplier - 1) * 100)}% vs ${this.targetCamp.config.name}</div>`;
            }

            totalAttackPower += unitAttack;
        }

        // Determine terrain type at target location
        const terrainSeed = (this.targetCamp.x * 3 + this.targetCamp.y * 7) % 10;
        let terrainType = 'grass';
        if (terrainSeed < 5) {
            terrainType = 'grass';
        } else if (terrainSeed < 7) {
            terrainType = 'forest';
        } else if (terrainSeed < 9) {
            terrainType = 'mountain';
        } else {
            terrainType = 'water';
        }

        // Get terrain effects
        const terrainEffect = CONFIG.COMBAT.TERRAIN_EFFECTS[terrainType];

        // Apply terrain effects
        totalAttackPower *= terrainEffect.attack;

        // Apply formation effects
        totalAttackPower *= formationEffect.attack;

        // Apply enemy special ability if it affects attack
        if (this.targetCamp.config.specialAbility && this.targetCamp.config.specialAbility.effect.attackReduction) {
            totalAttackPower *= (1 - this.targetCamp.config.specialAbility.effect.attackReduction);
        }

        // Calculate target defense with modifiers
        let targetDefense = this.targetCamp.config.difficulty * 10;

        // Apply terrain effects to defense
        targetDefense *= terrainEffect.defense;

        // Apply formation effects to defense
        targetDefense /= formationEffect.defense; // Divide by defense modifier since it affects enemy defense from our perspective

        // Apply enemy special ability if it affects defense
        if (this.targetCamp.config.specialAbility && this.targetCamp.config.specialAbility.effect.defenseReduction) {
            targetDefense *= (1 - this.targetCamp.config.specialAbility.effect.defenseReduction);
        }

        // Update UI
        this.elements.totalAttackPower.textContent = totalAttackPower.toFixed(1);
        this.elements.targetDefense.textContent = targetDefense.toFixed(1);
        this.elements.advantageInfo.innerHTML = advantageText;

        // Predict battle outcome
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

        // Get selected formation
        let selectedFormation = 'balanced';
        for (const [formationType, radio] of Object.entries(this.elements.formationRadios)) {
            if (radio.checked) {
                selectedFormation = formationType;
                break;
            }
        }

        // Launch the attack with formation
        this.combatManager.attackNPCWithUnits(this.targetCamp.x, this.targetCamp.y, units, selectedFormation);

        // Hide the modal
        this.hideModal();
    }
}

// CombatUI class is now ready to be instantiated in main.js
