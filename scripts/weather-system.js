/**
 * Weather System for Pixel Empires
 * Handles weather changes and effects on gameplay
 */
class WeatherSystem {
    /**
     * Initialize the weather system
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;

        // Use config if available, otherwise use default weather effects
        this.weatherEffects = (gameState.config && gameState.config.COMBAT && gameState.config.COMBAT.WEATHER_EFFECTS) ?
            gameState.config.COMBAT.WEATHER_EFFECTS : this.getDefaultWeatherEffects();

        this.currentWeather = 'clear'; // Default weather
        this.weatherDuration = 0; // Duration of current weather in seconds
        this.weatherChangeInterval = 600; // Weather changes every 10 minutes by default
        this.seasonalWeatherBias = {}; // Seasonal bias for weather types
        this.lastWeatherChangeTime = Date.now();

        // Initialize seasonal weather bias
        this.initializeSeasonalWeatherBias();

        // Set initial weather
        this.changeWeather();
    }

    /**
     * Get default weather effects if config is not available
     * @returns {Object} Default weather effects
     */
    getDefaultWeatherEffects() {
        return {
            clear: {
                name: "Clear",
                description: "Clear weather with no special effects",
                attack: 1.0,
                defense: 1.0,
                movementSpeed: 1.0,
                unitEffects: {},
                visualEffect: "clear_sky",
                probability: 0.5 // 50% chance of clear weather
            },
            rain: {
                name: "Rain",
                description: "Rainy weather that reduces archer effectiveness",
                attack: 0.9,
                defense: 1.0,
                movementSpeed: 0.8,
                unitEffects: {
                    ARCHER: { attack: 0.7, range: 0.8 }, // Archers get -30% attack and -20% range
                    CAVALRY: { speed: 0.8 }             // Cavalry gets -20% speed
                },
                terrainEffects: {
                    grass: { movementSpeed: 0.7 },  // Grass becomes muddy
                    plains: { movementSpeed: 0.7 }, // Plains become muddy
                    forest: { defense: 1.1 }         // Forest provides more cover in rain
                },
                visualEffect: "rain_drops",
                probability: 0.2 // 20% chance of rain
            },
            fog: {
                name: "Fog",
                description: "Foggy weather that reduces visibility and attack range",
                attack: 0.8,
                defense: 1.1,
                movementSpeed: 0.9,
                unitEffects: {
                    ARCHER: { attack: 0.6, range: 0.5 }, // Archers get -40% attack and -50% range
                    SCOUT: { vision: 0.5 }              // Scouts get -50% vision
                },
                terrainEffects: {
                    forest: { defense: 1.3 }, // Forest provides even more cover in fog
                    hills: { defense: 1.2 }   // Hills provide more cover in fog
                },
                visualEffect: "fog_overlay",
                probability: 0.15 // 15% chance of fog
            }
        };
    }

    /**
     * Initialize seasonal weather bias
     */
    initializeSeasonalWeatherBias() {
        // Default seasonal bias (can be expanded with more seasons)
        this.seasonalWeatherBias = {
            spring: {
                clear: 0.4,
                rain: 0.4,
                fog: 0.15,
                snow: 0.05,
                sandstorm: 0.0
            },
            summer: {
                clear: 0.6,
                rain: 0.2,
                fog: 0.1,
                snow: 0.0,
                sandstorm: 0.1
            },
            fall: {
                clear: 0.3,
                rain: 0.4,
                fog: 0.25,
                snow: 0.05,
                sandstorm: 0.0
            },
            winter: {
                clear: 0.3,
                rain: 0.1,
                fog: 0.2,
                snow: 0.4,
                sandstorm: 0.0
            }
        };
    }

    /**
     * Get current season based on game time
     * @returns {string} - Current season
     */
    getCurrentSeason() {
        // If game has a time system, use it
        if (this.gameState.timeSystem) {
            return this.gameState.timeSystem.getCurrentSeason();
        }

        // Default to seasons based on real-world month
        const month = new Date().getMonth();

        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    /**
     * Change weather based on probabilities and season
     */
    changeWeather() {
        const season = this.getCurrentSeason();
        const seasonalBias = this.seasonalWeatherBias[season] || {};

        // Get weather types
        const weatherTypes = Object.keys(this.weatherEffects);

        // Calculate weighted probabilities
        const weightedProbabilities = [];

        for (const weather of weatherTypes) {
            // Base probability from config
            let probability = this.weatherEffects[weather].probability || 0;

            // Apply seasonal bias if available
            if (seasonalBias[weather] !== undefined) {
                probability = seasonalBias[weather];
            }

            // Add to weighted probabilities
            if (probability > 0) {
                weightedProbabilities.push({
                    weather,
                    probability
                });
            }
        }

        // Normalize probabilities
        const totalProbability = weightedProbabilities.reduce(
            (sum, item) => sum + item.probability, 0
        );

        for (const item of weightedProbabilities) {
            item.probability /= totalProbability;
        }

        // Select weather based on probabilities
        const random = Math.random();
        let cumulativeProbability = 0;

        for (const item of weightedProbabilities) {
            cumulativeProbability += item.probability;

            if (random <= cumulativeProbability) {
                // Set new weather
                const oldWeather = this.currentWeather;
                this.currentWeather = item.weather;

                // Set weather duration (5-15 minutes)
                this.weatherDuration = 300 + Math.floor(Math.random() * 600);

                // Log weather change if it's different
                if (oldWeather !== this.currentWeather) {
                    this.gameState.activityLogManager.addLogEntry(
                        'Environment',
                        `Weather changed from ${this.weatherEffects[oldWeather].name} to ${this.weatherEffects[this.currentWeather].name}.`
                    );
                }

                // Record last weather change time
                this.lastWeatherChangeTime = Date.now();

                // Trigger UI update
                this.gameState.onStateChange();

                return;
            }
        }

        // Fallback to clear weather
        this.currentWeather = 'clear';
        this.weatherDuration = 600; // 10 minutes
        this.lastWeatherChangeTime = Date.now();

        // Trigger UI update
        this.gameState.onStateChange();
    }

    /**
     * Get current weather
     * @returns {string} - Current weather type
     */
    getCurrentWeather() {
        return this.currentWeather;
    }

    /**
     * Get current weather effect
     * @returns {Object} - Current weather effect
     */
    getCurrentWeatherEffect() {
        return this.weatherEffects[this.currentWeather] || this.weatherEffects.clear;
    }

    /**
     * Get weather effect for a specific terrain
     * @param {string} terrain - Terrain type
     * @returns {Object} - Weather effect for the terrain
     */
    getWeatherEffectForTerrain(terrain) {
        const weatherEffect = this.getCurrentWeatherEffect();

        if (weatherEffect.terrainEffects && weatherEffect.terrainEffects[terrain]) {
            return weatherEffect.terrainEffects[terrain];
        }

        return null;
    }

    /**
     * Get weather effect for a specific unit type
     * @param {string} unitType - Unit type
     * @returns {Object} - Weather effect for the unit type
     */
    getWeatherEffectForUnit(unitType) {
        const weatherEffect = this.getCurrentWeatherEffect();

        if (weatherEffect.unitEffects && weatherEffect.unitEffects[unitType]) {
            return weatherEffect.unitEffects[unitType];
        }

        return null;
    }

    /**
     * Get time until next weather change
     * @returns {number} - Time in seconds until next weather change
     */
    getTimeUntilWeatherChange() {
        const elapsedTime = (Date.now() - this.lastWeatherChangeTime) / 1000;
        return Math.max(0, this.weatherDuration - elapsedTime);
    }

    /**
     * Force weather change (for testing or events)
     * @param {string} weather - Weather type to change to
     */
    forceWeatherChange(weather) {
        if (this.weatherEffects[weather]) {
            const oldWeather = this.currentWeather;
            this.currentWeather = weather;

            // Set weather duration (5-15 minutes)
            this.weatherDuration = 300 + Math.floor(Math.random() * 600);

            // Log weather change
            this.gameState.activityLogManager.addLogEntry(
                'Environment',
                `Weather suddenly changed from ${this.weatherEffects[oldWeather].name} to ${this.weatherEffects[this.currentWeather].name}!`
            );

            // Record last weather change time
            this.lastWeatherChangeTime = Date.now();

            // Trigger UI update
            this.gameState.onStateChange();
        }
    }

    /**
     * Update weather system (called on each game tick)
     */
    update() {
        // Check if it's time to change weather
        const elapsedTime = (Date.now() - this.lastWeatherChangeTime) / 1000;

        if (elapsedTime >= this.weatherDuration) {
            this.changeWeather();
        }
    }

    /**
     * Get resource production modifier for a resource type
     * @param {string} resourceType - Resource type (FOOD, ORE, etc.)
     * @returns {number} - Production modifier
     */
    getResourceProductionModifier(resourceType) {
        const weatherEffect = this.getCurrentWeatherEffect();

        // Default modifier is 1.0 (no change)
        let modifier = 1.0;

        // Apply general weather effect on production
        if (weatherEffect) {
            // Use attack as a general modifier for production
            modifier *= weatherEffect.attack;
        }

        // Apply resource-specific modifiers if available
        if (weatherEffect && weatherEffect.resourceEffects && weatherEffect.resourceEffects[resourceType]) {
            modifier *= weatherEffect.resourceEffects[resourceType];
        }

        return modifier;
    }

    /**
     * Get resource regeneration modifier
     * @returns {number} - Regeneration modifier
     */
    getResourceRegenerationModifier() {
        const weatherEffect = this.getCurrentWeatherEffect();

        // Default modifier is 1.0 (no change)
        let modifier = 1.0;

        // Apply general weather effect on regeneration
        if (weatherEffect) {
            // Use defense as a general modifier for regeneration
            modifier *= weatherEffect.defense;
        }

        return modifier;
    }

    /**
     * Get build speed modifier
     * @returns {number} - Build speed modifier
     */
    getBuildSpeedModifier() {
        const weatherEffect = this.getCurrentWeatherEffect();

        // Default modifier is 1.0 (no change)
        let modifier = 1.0;

        // Apply general weather effect on build speed
        if (weatherEffect) {
            // Use movementSpeed as a general modifier for build speed
            modifier *= weatherEffect.movementSpeed;
        }

        return modifier;
    }

    /**
     * Create weather visualization
     * @param {HTMLElement} container - Container element for weather visualization
     */
    createWeatherVisualization(container) {
        // Clear existing weather effects
        const existingEffects = container.querySelectorAll('.weather-effect');
        existingEffects.forEach(effect => effect.remove());

        // Get current weather
        const weather = this.getCurrentWeather();
        const weatherEffect = this.getCurrentWeatherEffect();

        if (!weatherEffect || !weatherEffect.visualEffect || weather === 'clear') {
            return; // No visual effect for clear weather
        }

        // Create weather effect element
        const effectElement = document.createElement('div');
        effectElement.className = `weather-effect ${weatherEffect.visualEffect}`;

        // Add specific elements based on weather type
        switch (weather) {
            case 'rain':
                // Create raindrops
                for (let i = 0; i < 100; i++) {
                    const raindrop = document.createElement('div');
                    raindrop.className = 'raindrop';
                    raindrop.style.left = `${Math.random() * 100}%`;
                    raindrop.style.animationDuration = `${0.5 + Math.random()}s`;
                    raindrop.style.animationDelay = `${Math.random()}s`;
                    effectElement.appendChild(raindrop);
                }
                break;

            case 'fog':
                // Create fog layers
                for (let i = 0; i < 5; i++) {
                    const fogLayer = document.createElement('div');
                    fogLayer.className = 'fog-layer';
                    fogLayer.style.opacity = `${0.1 + (i * 0.05)}`;
                    fogLayer.style.animationDuration = `${20 + (i * 5)}s`;
                    fogLayer.style.animationDelay = `${i * 2}s`;
                    effectElement.appendChild(fogLayer);
                }
                break;

            case 'snow':
                // Create snowflakes
                for (let i = 0; i < 50; i++) {
                    const snowflake = document.createElement('div');
                    snowflake.className = 'snowflake';
                    snowflake.style.left = `${Math.random() * 100}%`;
                    snowflake.style.animationDuration = `${3 + Math.random() * 5}s`;
                    snowflake.style.animationDelay = `${Math.random() * 5}s`;
                    snowflake.style.opacity = `${0.5 + Math.random() * 0.5}`;
                    snowflake.style.fontSize = `${5 + Math.random() * 10}px`;
                    snowflake.innerHTML = '❄';
                    effectElement.appendChild(snowflake);
                }
                break;

            case 'sandstorm':
                // Create sand particles
                for (let i = 0; i < 100; i++) {
                    const sandParticle = document.createElement('div');
                    sandParticle.className = 'sand-particle';
                    sandParticle.style.left = `${Math.random() * 100}%`;
                    sandParticle.style.top = `${Math.random() * 100}%`;
                    sandParticle.style.animationDuration = `${1 + Math.random() * 2}s`;
                    sandParticle.style.animationDelay = `${Math.random()}s`;
                    effectElement.appendChild(sandParticle);
                }

                // Add overlay
                const overlay = document.createElement('div');
                overlay.className = 'sandstorm-overlay';
                effectElement.appendChild(overlay);
                break;
        }

        // Add to container
        container.appendChild(effectElement);
    }
}

// Export the WeatherSystem class
if (typeof module !== 'undefined') {
    module.exports = { WeatherSystem };
}
