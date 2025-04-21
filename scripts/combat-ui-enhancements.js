/**
 * Combat UI Enhancements for Pixel Empires
 * Enhances the combat UI with formation selection, weather effects, and unit experience display
 */
class CombatUIEnhancements {
    /**
     * Initialize the combat UI enhancements
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.combatSystem = gameState.combatSystem;
        this.weatherSystem = gameState.weatherSystem;
        this.unitExperienceSystem = gameState.unitExperienceSystem;

        // Initialize UI elements
        this.initializeUI();

        // Add event listeners
        this.addEventListeners();
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Create formation selector
        this.createFormationSelector();

        // Create weather display
        this.createWeatherDisplay();

        // Create unit experience display
        this.createUnitExperienceDisplay();

        // Create terrain effects display
        this.createTerrainEffectsDisplay();
    }

    /**
     * Create formation selector UI
     */
    createFormationSelector() {
        // Get military tab section
        const militaryTab = document.getElementById('military-tab');
        if (!militaryTab) return;

        // Create a new tab section for combat formations
        const combatFormationsSection = document.createElement('div');
        combatFormationsSection.className = 'tab-section';
        combatFormationsSection.id = 'combat-section'; // Add this ID for other methods to use

        // Create header
        const header = document.createElement('h4');
        header.textContent = 'Combat Formations';
        combatFormationsSection.appendChild(header);

        // Create formation selector container
        const formationContainer = document.createElement('div');
        formationContainer.id = 'formation-selector';
        formationContainer.className = 'formation-selector';

        // Create formation options
        const formationOptions = document.createElement('div');
        formationOptions.className = 'formation-options';

        // Add formation buttons
        for (const [formationId, formation] of Object.entries(this.combatSystem.formations)) {
            const formationButton = document.createElement('div');
            formationButton.className = `formation-option ${formationId === this.combatSystem.currentFormation ? 'active' : ''}`;
            formationButton.dataset.formation = formationId;

            // Add formation icon
            const formationIcon = document.createElement('span');
            formationIcon.className = 'formation-icon';
            formationIcon.textContent = formation.icon || '⚔️';
            formationButton.appendChild(formationIcon);

            // Add formation info
            const formationInfo = document.createElement('div');
            formationInfo.className = 'formation-info';

            const formationName = document.createElement('div');
            formationName.className = 'formation-name';
            formationName.textContent = formation.name;
            formationInfo.appendChild(formationName);

            const formationDesc = document.createElement('div');
            formationDesc.className = 'formation-description';
            formationDesc.textContent = formation.description;
            formationInfo.appendChild(formationDesc);

            formationButton.appendChild(formationInfo);

            // Add formation visualization
            const formationVisual = document.createElement('div');
            formationVisual.className = `formation-visual ${formation.visualEffect || ''}`;

            // Add unit representations
            for (let i = 0; i < 9; i++) {
                const unitElement = document.createElement('div');
                unitElement.className = 'formation-unit';
                formationVisual.appendChild(unitElement);
            }

            formationButton.appendChild(formationVisual);

            // Add to options
            formationOptions.appendChild(formationButton);
        }

        formationContainer.appendChild(formationOptions);
        combatFormationsSection.appendChild(formationContainer);

        // Add the combat formations section to the military tab
        // Insert it after the existing combat section
        const existingCombatSection = militaryTab.querySelector('.tab-section:nth-child(2)');
        if (existingCombatSection) {
            militaryTab.insertBefore(combatFormationsSection, existingCombatSection.nextSibling);
        } else {
            militaryTab.appendChild(combatFormationsSection);
        }
    }

    /**
     * Create weather display UI
     */
    createWeatherDisplay() {
        // Get combat section
        const combatSection = document.getElementById('combat-section');
        if (!combatSection) return;

        // Create weather display container
        const weatherContainer = document.createElement('div');
        weatherContainer.id = 'weather-display';
        weatherContainer.className = 'weather-display';

        // Create header
        const header = document.createElement('h4');
        header.textContent = 'Current Weather';
        weatherContainer.appendChild(header);

        // Create weather info
        const weatherInfo = document.createElement('div');
        weatherInfo.className = 'weather-info';

        // Get current weather
        const currentWeather = this.weatherSystem ? this.weatherSystem.getCurrentWeather() : 'clear';
        const weatherEffect = this.weatherSystem ? this.weatherSystem.getCurrentWeatherEffect() : { name: 'Clear', description: 'Clear weather with no special effects' };

        // Add weather icon
        const weatherIcon = document.createElement('div');
        weatherIcon.className = 'weather-icon';

        // Set weather icon based on type
        switch (currentWeather) {
            case 'rain':
                weatherIcon.textContent = '🌧️';
                break;
            case 'fog':
                weatherIcon.textContent = '🌫️';
                break;
            case 'snow':
                weatherIcon.textContent = '❄️';
                break;
            case 'sandstorm':
                weatherIcon.textContent = '🌪️';
                break;
            default:
                weatherIcon.textContent = '☀️';
        }

        weatherInfo.appendChild(weatherIcon);

        // Add weather details
        const weatherDetails = document.createElement('div');
        weatherDetails.className = 'weather-details';

        const weatherName = document.createElement('div');
        weatherName.className = 'weather-name';
        weatherName.textContent = weatherEffect.name;
        weatherDetails.appendChild(weatherName);

        const weatherDesc = document.createElement('div');
        weatherDesc.className = 'weather-description';
        weatherDesc.textContent = weatherEffect.description;
        weatherDetails.appendChild(weatherDesc);

        // Add weather effects
        const weatherEffects = document.createElement('div');
        weatherEffects.className = 'weather-effects';

        // Add attack effect
        const attackEffect = document.createElement('div');
        attackEffect.className = 'weather-effect-item';
        attackEffect.textContent = `Attack: ${Math.round(weatherEffect.attack * 100)}%`;
        weatherEffects.appendChild(attackEffect);

        // Add defense effect
        const defenseEffect = document.createElement('div');
        defenseEffect.className = 'weather-effect-item';
        defenseEffect.textContent = `Defense: ${Math.round(weatherEffect.defense * 100)}%`;
        weatherEffects.appendChild(defenseEffect);

        // Add movement effect
        const movementEffect = document.createElement('div');
        movementEffect.className = 'weather-effect-item';
        movementEffect.textContent = `Movement: ${Math.round(weatherEffect.movementSpeed * 100)}%`;
        weatherEffects.appendChild(movementEffect);

        weatherDetails.appendChild(weatherEffects);
        weatherInfo.appendChild(weatherDetails);

        // Add visualization container
        const visualizationContainer = document.createElement('div');
        visualizationContainer.className = 'weather-visualization-container';

        // Add weather visualization
        if (this.weatherSystem) {
            this.weatherSystem.createWeatherVisualization(visualizationContainer);
        }

        weatherInfo.appendChild(visualizationContainer);
        weatherContainer.appendChild(weatherInfo);

        // Add to combat section
        combatSection.appendChild(weatherContainer);
    }

    /**
     * Create unit experience display UI
     */
    createUnitExperienceDisplay() {
        // Get combat section
        const combatSection = document.getElementById('combat-section');
        if (!combatSection) return;

        // Create unit experience display container
        const experienceContainer = document.createElement('div');
        experienceContainer.id = 'unit-experience-display';
        experienceContainer.className = 'unit-experience-display';

        // Create header
        const header = document.createElement('h4');
        header.textContent = 'Unit Experience';
        experienceContainer.appendChild(header);

        // Create unit experience table
        const experienceTable = document.createElement('table');
        experienceTable.className = 'unit-experience-table';

        // Create table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const unitHeader = document.createElement('th');
        unitHeader.textContent = 'Unit';
        headerRow.appendChild(unitHeader);

        const rankHeader = document.createElement('th');
        rankHeader.textContent = 'Rank';
        headerRow.appendChild(rankHeader);

        const moraleHeader = document.createElement('th');
        moraleHeader.textContent = 'Morale';
        headerRow.appendChild(moraleHeader);

        const bonusHeader = document.createElement('th');
        bonusHeader.textContent = 'Combat Bonus';
        headerRow.appendChild(bonusHeader);

        tableHeader.appendChild(headerRow);
        experienceTable.appendChild(tableHeader);

        // Create table body
        const tableBody = document.createElement('tbody');

        // Add rows for each unit type
        const unitTypes = ['SPEARMAN', 'ARCHER', 'CAVALRY', 'DEFENDER', 'SCOUT'];

        for (const unitType of unitTypes) {
            const row = document.createElement('tr');

            // Unit name
            const unitCell = document.createElement('td');
            unitCell.textContent = unitType;
            row.appendChild(unitCell);

            // Unit rank
            const rankCell = document.createElement('td');
            if (this.unitExperienceSystem) {
                rankCell.textContent = this.unitExperienceSystem.getUnitRank(unitType);
            } else {
                rankCell.textContent = 'Recruit';
            }
            row.appendChild(rankCell);

            // Unit morale
            const moraleCell = document.createElement('td');
            if (this.unitExperienceSystem) {
                const moraleStatus = this.unitExperienceSystem.getMoraleStatus(unitType);
                moraleCell.textContent = moraleStatus.charAt(0).toUpperCase() + moraleStatus.slice(1);
                moraleCell.className = `morale-${moraleStatus}`;
            } else {
                moraleCell.textContent = 'Normal';
            }
            row.appendChild(moraleCell);

            // Combat bonus
            const bonusCell = document.createElement('td');
            if (this.unitExperienceSystem) {
                const modifiers = this.unitExperienceSystem.getCombatModifiers(unitType);
                bonusCell.textContent = `+${Math.round((modifiers.attack - 1) * 100)}% ATK, +${Math.round((modifiers.defense - 1) * 100)}% DEF`;
            } else {
                bonusCell.textContent = '+0% ATK, +0% DEF';
            }
            row.appendChild(bonusCell);

            tableBody.appendChild(row);
        }

        experienceTable.appendChild(tableBody);
        experienceContainer.appendChild(experienceTable);

        // Add to combat section
        combatSection.appendChild(experienceContainer);
    }

    /**
     * Create terrain effects display UI
     */
    createTerrainEffectsDisplay() {
        // Get combat section
        const combatSection = document.getElementById('combat-section');
        if (!combatSection) return;

        // Create terrain effects display container
        const terrainContainer = document.createElement('div');
        terrainContainer.id = 'terrain-effects-display';
        terrainContainer.className = 'terrain-effects-display';

        // Create header
        const header = document.createElement('h4');
        header.textContent = 'Terrain Effects';
        terrainContainer.appendChild(header);

        // Create terrain effects table
        const terrainTable = document.createElement('table');
        terrainTable.className = 'terrain-effects-table';

        // Create table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const terrainHeader = document.createElement('th');
        terrainHeader.textContent = 'Terrain';
        headerRow.appendChild(terrainHeader);

        const attackHeader = document.createElement('th');
        attackHeader.textContent = 'Attack';
        headerRow.appendChild(attackHeader);

        const defenseHeader = document.createElement('th');
        defenseHeader.textContent = 'Defense';
        headerRow.appendChild(defenseHeader);

        const movementHeader = document.createElement('th');
        movementHeader.textContent = 'Movement';
        headerRow.appendChild(movementHeader);

        tableHeader.appendChild(headerRow);
        terrainTable.appendChild(tableHeader);

        // Create table body
        const tableBody = document.createElement('tbody');

        // Add rows for each terrain type
        for (const [terrainId, terrain] of Object.entries(this.combatSystem.terrainEffects)) {
            const row = document.createElement('tr');

            // Terrain name
            const terrainCell = document.createElement('td');
            terrainCell.textContent = terrain.name;
            row.appendChild(terrainCell);

            // Attack effect
            const attackCell = document.createElement('td');
            attackCell.textContent = `${Math.round(terrain.attack * 100)}%`;
            if (terrain.attack < 1) {
                attackCell.className = 'negative-effect';
            } else if (terrain.attack > 1) {
                attackCell.className = 'positive-effect';
            }
            row.appendChild(attackCell);

            // Defense effect
            const defenseCell = document.createElement('td');
            defenseCell.textContent = `${Math.round(terrain.defense * 100)}%`;
            if (terrain.defense < 1) {
                defenseCell.className = 'negative-effect';
            } else if (terrain.defense > 1) {
                defenseCell.className = 'positive-effect';
            }
            row.appendChild(defenseCell);

            // Movement effect
            const movementCell = document.createElement('td');
            movementCell.textContent = `${Math.round(terrain.movementSpeed * 100)}%`;
            if (terrain.movementSpeed < 1) {
                movementCell.className = 'negative-effect';
            } else if (terrain.movementSpeed > 1) {
                movementCell.className = 'positive-effect';
            }
            row.appendChild(movementCell);

            tableBody.appendChild(row);
        }

        terrainTable.appendChild(tableBody);
        terrainContainer.appendChild(terrainTable);

        // Add to combat section
        combatSection.appendChild(terrainContainer);
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        // Add formation selection event listeners
        const formationOptions = document.querySelectorAll('.formation-option');
        formationOptions.forEach(option => {
            option.addEventListener('click', () => {
                const formationId = option.dataset.formation;
                this.selectFormation(formationId);
            });
        });

        // Add weather update event listener
        document.addEventListener('weatherChanged', () => {
            this.updateWeatherDisplay();
        });

        // Add unit experience update event listener
        document.addEventListener('unitExperienceChanged', () => {
            this.updateUnitExperienceDisplay();
        });
    }

    /**
     * Select a formation
     * @param {string} formationId - The formation ID to select
     */
    selectFormation(formationId) {
        if (!this.combatSystem.formations[formationId]) return;

        // Update combat system
        this.combatSystem.currentFormation = formationId;

        // Update UI
        const formationOptions = document.querySelectorAll('.formation-option');
        formationOptions.forEach(option => {
            if (option.dataset.formation === formationId) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Log formation change
        this.gameState.activityLogManager.addLogEntry(
            'Combat',
            `Formation changed to ${this.combatSystem.formations[formationId].name}.`
        );
    }

    /**
     * Update weather display
     */
    updateWeatherDisplay() {
        // Get weather display
        const weatherDisplay = document.getElementById('weather-display');
        if (!weatherDisplay) return;

        // Get current weather
        const currentWeather = this.weatherSystem ? this.weatherSystem.getCurrentWeather() : 'clear';
        const weatherEffect = this.weatherSystem ? this.weatherSystem.getCurrentWeatherEffect() : { name: 'Clear', description: 'Clear weather with no special effects' };

        // Update weather icon
        const weatherIcon = weatherDisplay.querySelector('.weather-icon');
        if (weatherIcon) {
            // Set weather icon based on type
            switch (currentWeather) {
                case 'rain':
                    weatherIcon.textContent = '🌧️';
                    break;
                case 'fog':
                    weatherIcon.textContent = '🌫️';
                    break;
                case 'snow':
                    weatherIcon.textContent = '❄️';
                    break;
                case 'sandstorm':
                    weatherIcon.textContent = '🌪️';
                    break;
                default:
                    weatherIcon.textContent = '☀️';
            }
        }

        // Update weather name
        const weatherName = weatherDisplay.querySelector('.weather-name');
        if (weatherName) {
            weatherName.textContent = weatherEffect.name;
        }

        // Update weather description
        const weatherDesc = weatherDisplay.querySelector('.weather-description');
        if (weatherDesc) {
            weatherDesc.textContent = weatherEffect.description;
        }

        // Update weather effects
        const attackEffect = weatherDisplay.querySelector('.weather-effect-item:nth-child(1)');
        if (attackEffect) {
            attackEffect.textContent = `Attack: ${Math.round(weatherEffect.attack * 100)}%`;
        }

        const defenseEffect = weatherDisplay.querySelector('.weather-effect-item:nth-child(2)');
        if (defenseEffect) {
            defenseEffect.textContent = `Defense: ${Math.round(weatherEffect.defense * 100)}%`;
        }

        const movementEffect = weatherDisplay.querySelector('.weather-effect-item:nth-child(3)');
        if (movementEffect) {
            movementEffect.textContent = `Movement: ${Math.round(weatherEffect.movementSpeed * 100)}%`;
        }

        // Update weather visualization
        const visualizationContainer = weatherDisplay.querySelector('.weather-visualization-container');
        if (visualizationContainer && this.weatherSystem) {
            // Clear existing visualization
            visualizationContainer.innerHTML = '';

            // Create new visualization
            this.weatherSystem.createWeatherVisualization(visualizationContainer);
        }
    }

    /**
     * Update unit experience display
     */
    updateUnitExperienceDisplay() {
        // Get unit experience display
        const experienceDisplay = document.getElementById('unit-experience-display');
        if (!experienceDisplay) return;

        // Get table body
        const tableBody = experienceDisplay.querySelector('tbody');
        if (!tableBody) return;

        // Get all rows
        const rows = tableBody.querySelectorAll('tr');

        // Update each row
        rows.forEach((row, index) => {
            const unitType = ['SPEARMAN', 'ARCHER', 'CAVALRY', 'DEFENDER', 'SCOUT'][index];
            if (!unitType) return;

            // Update rank
            const rankCell = row.querySelector('td:nth-child(2)');
            if (rankCell && this.unitExperienceSystem) {
                rankCell.textContent = this.unitExperienceSystem.getUnitRank(unitType);
            }

            // Update morale
            const moraleCell = row.querySelector('td:nth-child(3)');
            if (moraleCell && this.unitExperienceSystem) {
                const moraleStatus = this.unitExperienceSystem.getMoraleStatus(unitType);
                moraleCell.textContent = moraleStatus.charAt(0).toUpperCase() + moraleStatus.slice(1);

                // Remove all morale classes
                moraleCell.classList.remove('morale-veryLow', 'morale-low', 'morale-normal', 'morale-high', 'morale-veryHigh');

                // Add current morale class
                moraleCell.classList.add(`morale-${moraleStatus}`);
            }

            // Update combat bonus
            const bonusCell = row.querySelector('td:nth-child(4)');
            if (bonusCell && this.unitExperienceSystem) {
                const modifiers = this.unitExperienceSystem.getCombatModifiers(unitType);
                bonusCell.textContent = `+${Math.round((modifiers.attack - 1) * 100)}% ATK, +${Math.round((modifiers.defense - 1) * 100)}% DEF`;
            }
        });
    }
}

// Initialize combat UI enhancements when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for game state to be initialized
    const checkGameState = setInterval(() => {
        if (window.gameState &&
            gameState.combatSystem &&
            document.getElementById('combat-section')) {

            // Initialize combat UI enhancements
            window.combatUIEnhancements = new CombatUIEnhancements(gameState);

            // Clear interval
            clearInterval(checkGameState);
        }
    }, 100);
});
