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
            advantageInfo: document.getElementById('advantage-info'),
            heroSelection: document.getElementById('hero-selection'),
            heroContainer: document.getElementById('hero-container')
        };

        // Track selected heroes
        this.selectedHeroes = [];

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
     * Create hero selection UI
     */
    createHeroSelectionUI() {
        // Clear existing content
        if (this.elements.heroContainer) {
            this.elements.heroContainer.innerHTML = '';
        } else {
            // Create hero selection container if it doesn't exist
            const heroSection = document.createElement('div');
            heroSection.id = 'hero-selection';
            heroSection.className = 'hero-selection';
            heroSection.innerHTML = '<h4>Select Heroes</h4>';

            const heroContainer = document.createElement('div');
            heroContainer.id = 'hero-container';
            heroContainer.className = 'hero-container';

            heroSection.appendChild(heroContainer);

            // Insert after formation selection
            const formationSection = document.querySelector('.formation-selection');
            if (formationSection && formationSection.parentNode) {
                formationSection.parentNode.insertBefore(heroSection, formationSection.nextSibling);
            } else {
                // Fallback: append to form
                this.elements.unitSelectionForm.appendChild(heroSection);
            }

            this.elements.heroSelection = heroSection;
            this.elements.heroContainer = heroContainer;
        }

        // Get available heroes
        const heroManager = this.gameState.heroManager;
        if (!heroManager) return;

        const activeHeroes = heroManager.getActiveHeroes().filter(hero => hero.status === 'active');

        if (activeHeroes.length === 0) {
            this.elements.heroContainer.innerHTML = '<div class="no-heroes">No heroes available for combat</div>';
            return;
        }

        // Create hero selection cards
        for (const hero of activeHeroes) {
            const heroCard = document.createElement('div');
            heroCard.className = `hero-combat-card ${this.selectedHeroes.includes(hero.id) ? 'selected' : ''}`;
            heroCard.dataset.heroId = hero.id;

            // Calculate total stats
            const totalStats = heroManager.calculateHeroTotalStats(hero.id);

            // Get hero equipment
            const equipment = this.getHeroEquipmentIcons(hero);

            // Create hero card content
            heroCard.innerHTML = `
                <div class="hero-portrait">${hero.portrait}</div>
                <div class="hero-info">
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-type">${heroManager.heroTypes[hero.type].name} (Lvl ${hero.level})</div>
                </div>
                <div class="hero-combat-stats">
                    <div class="hero-stat"><span class="stat-icon">⚔️</span> ${totalStats.attack}</div>
                    <div class="hero-stat"><span class="stat-icon">🛡️</span> ${totalStats.defense}</div>
                    <div class="hero-stat"><span class="stat-icon">👑</span> ${totalStats.leadership || 0}</div>
                </div>
                ${equipment ? `<div class="hero-equipment">${equipment}</div>` : ''}
                ${hero.abilities && hero.abilities.length > 0 ? this.createHeroAbilitiesPreview(hero) : ''}
            `;

            // Add click event to select/deselect hero
            heroCard.addEventListener('click', () => {
                const heroId = heroCard.dataset.heroId;
                const index = this.selectedHeroes.indexOf(heroId);

                if (index === -1) {
                    // Select hero (max 3 heroes)
                    if (this.selectedHeroes.length < 3) {
                        this.selectedHeroes.push(heroId);
                        heroCard.classList.add('selected');
                    }
                } else {
                    // Deselect hero
                    this.selectedHeroes.splice(index, 1);
                    heroCard.classList.remove('selected');
                }

                // Update attack power calculation
                this.updateAttackPowerCalculation();
            });

            this.elements.heroContainer.appendChild(heroCard);
        }
    }

    /**
     * Get hero equipment icons as HTML
     * @param {Object} hero - The hero object
     * @returns {string} - HTML string of equipment icons
     */
    getHeroEquipmentIcons(hero) {
        if (!hero.equipment) return '';

        const equipmentIcons = [];
        const equipmentSlots = ['weapon', 'armor', 'accessory', 'artifact'];

        for (const slot of equipmentSlots) {
            const item = hero.equipment[slot];
            if (item) {
                const rarityClass = item.rarity || 'common';
                equipmentIcons.push(`
                    <div class="equipment-icon ${rarityClass}" title="${item.name}: ${item.description || ''}">
                        ${item.icon || '?'}
                    </div>
                `);
            }
        }

        if (equipmentIcons.length === 0) return '';

        return `<div class="equipment-icons">${equipmentIcons.join('')}</div>`;
    }

    /**
     * Create hero abilities preview
     * @param {Object} hero - The hero object
     * @returns {string} - HTML string of hero abilities
     */
    createHeroAbilitiesPreview(hero) {
        if (!hero.abilities || hero.abilities.length === 0) return '';

        const heroManager = this.gameState.heroManager;
        if (!heroManager || !heroManager.heroAbilities) return '';

        const abilityIcons = [];

        for (const abilityId of hero.abilities) {
            const ability = heroManager.heroAbilities[abilityId];
            if (!ability) continue;

            const abilityTypeClass = ability.type || 'unknown';
            abilityIcons.push(`
                <div class="ability-preview-icon ${abilityTypeClass}"
                     title="${ability.name}: ${ability.description || ''}">
                    ${ability.icon || '✨'}
                </div>
            `);
        }

        if (abilityIcons.length === 0) return '';

        return `<div class="ability-preview-icons">${abilityIcons.join('')}</div>`;
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

        // Reset selected heroes
        this.selectedHeroes = [];

        // Create hero selection UI
        this.createHeroSelectionUI();

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
        let heroBonus = 0;

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

        // Calculate hero bonus
        if (this.selectedHeroes.length > 0 && this.gameState.heroManager) {
            const heroManager = this.gameState.heroManager;

            for (const heroId of this.selectedHeroes) {
                const hero = heroManager.getHeroById(heroId);
                if (!hero) continue;

                // Calculate hero's total stats
                const heroStats = heroManager.calculateHeroTotalStats(heroId);

                // Base bonus from hero level
                const levelBonus = hero.level * 0.02; // 2% per level

                // Bonus from hero stats
                const statBonus = (heroStats.attack / 100) + (heroStats.leadership / 200);

                // Bonus from hero specialization
                let specializationBonus = 0;
                const heroType = heroManager.heroTypes[hero.type];

                if (heroType && heroType.specialization === 'combat') {
                    specializationBonus = 0.1; // 10% bonus for combat heroes
                }

                // Add to total hero bonus
                const totalHeroBonus = levelBonus + statBonus + specializationBonus;
                heroBonus += totalHeroBonus;

                // Add to advantage text
                advantageText += `<div class="advantage">${hero.name} +${Math.round(totalHeroBonus * 100)}% combat bonus</div>`;
            }

            // Apply hero bonus to attack power
            totalAttackPower *= (1 + Math.min(0.5, heroBonus)); // Cap at 50% bonus
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

        // Launch the attack with formation and heroes
        this.combatManager.attackNPCWithUnits(this.targetCamp.x, this.targetCamp.y, units, selectedFormation, this.selectedHeroes);

        // Hide the modal
        this.hideModal();
    }
}

// CombatUI class is now ready to be instantiated in main.js
