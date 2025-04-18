/**
 * Weather System for Pixel Empires
 * Handles weather conditions, seasons, and their effects on gameplay
 */
class WeatherSystem {
    /**
     * Initialize the weather system
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.currentWeather = 'clear'; // Current weather condition
        this.currentSeason = 'spring'; // Current season
        this.weatherDuration = 0; // Duration of current weather in seconds
        this.weatherChangeTime = 0; // Time when weather will change
        this.seasonDuration = 15 * 60; // Season duration in seconds (15 minutes per season)
        this.seasonChangeTime = Date.now() + this.seasonDuration * 1000; // Time when season will change
        this.weatherEffects = this.initializeWeatherEffects();
        this.seasonEffects = this.initializeSeasonEffects();
        
        // Initialize weather
        this.changeWeather();
    }
    
    /**
     * Initialize weather effects
     * @returns {Object} - Weather effects
     */
    initializeWeatherEffects() {
        return {
            clear: {
                name: 'Clear',
                description: 'Clear skies with good visibility.',
                resourceProduction: { FOOD: 1.0, ORE: 1.0 },
                movementSpeed: 1.0,
                combatModifiers: { attack: 1.0, defense: 1.0 },
                visibilityRange: 1.0,
                probability: { spring: 0.4, summer: 0.6, fall: 0.3, winter: 0.2 }
            },
            cloudy: {
                name: 'Cloudy',
                description: 'Overcast skies with reduced visibility.',
                resourceProduction: { FOOD: 0.9, ORE: 1.0 },
                movementSpeed: 0.9,
                combatModifiers: { attack: 0.9, defense: 1.0 },
                visibilityRange: 0.8,
                probability: { spring: 0.3, summer: 0.2, fall: 0.3, winter: 0.3 }
            },
            rain: {
                name: 'Rain',
                description: 'Rainfall that slows movement and reduces visibility.',
                resourceProduction: { FOOD: 1.2, ORE: 0.8 },
                movementSpeed: 0.7,
                combatModifiers: { attack: 0.8, defense: 0.9 },
                visibilityRange: 0.6,
                probability: { spring: 0.2, summer: 0.1, fall: 0.3, winter: 0.1 }
            },
            storm: {
                name: 'Storm',
                description: 'Heavy storms with thunder and lightning. Significantly reduces visibility and movement.',
                resourceProduction: { FOOD: 0.5, ORE: 0.5 },
                movementSpeed: 0.5,
                combatModifiers: { attack: 0.7, defense: 0.7 },
                visibilityRange: 0.4,
                probability: { spring: 0.1, summer: 0.1, fall: 0.1, winter: 0.1 }
            },
            fog: {
                name: 'Fog',
                description: 'Dense fog that severely limits visibility but provides defensive advantages.',
                resourceProduction: { FOOD: 0.8, ORE: 0.9 },
                movementSpeed: 0.6,
                combatModifiers: { attack: 0.6, defense: 1.2 },
                visibilityRange: 0.3,
                probability: { spring: 0.0, summer: 0.0, fall: 0.0, winter: 0.3 }
            },
            snow: {
                name: 'Snow',
                description: 'Snowfall that significantly slows movement and reduces resource production.',
                resourceProduction: { FOOD: 0.5, ORE: 0.7 },
                movementSpeed: 0.4,
                combatModifiers: { attack: 0.8, defense: 0.8 },
                visibilityRange: 0.7,
                probability: { spring: 0.0, summer: 0.0, fall: 0.0, winter: 0.2 }
            }
        };
    }
    
    /**
     * Initialize season effects
     * @returns {Object} - Season effects
     */
    initializeSeasonEffects() {
        return {
            spring: {
                name: 'Spring',
                description: 'A season of growth and renewal.',
                resourceProduction: { FOOD: 1.2, ORE: 1.0 },
                resourceRegenerationRate: 1.2,
                movementSpeed: 1.0,
                buildSpeed: 1.1,
                researchSpeed: 1.0
            },
            summer: {
                name: 'Summer',
                description: 'A season of abundance and activity.',
                resourceProduction: { FOOD: 1.5, ORE: 1.2 },
                resourceRegenerationRate: 1.0,
                movementSpeed: 1.2,
                buildSpeed: 1.2,
                researchSpeed: 1.1
            },
            fall: {
                name: 'Fall',
                description: 'A season of harvest and preparation.',
                resourceProduction: { FOOD: 1.3, ORE: 1.1 },
                resourceRegenerationRate: 0.8,
                movementSpeed: 1.0,
                buildSpeed: 1.0,
                researchSpeed: 1.2
            },
            winter: {
                name: 'Winter',
                description: 'A season of scarcity and endurance.',
                resourceProduction: { FOOD: 0.7, ORE: 0.9 },
                resourceRegenerationRate: 0.5,
                movementSpeed: 0.8,
                buildSpeed: 0.9,
                researchSpeed: 1.3
            }
        };
    }
    
    /**
     * Change weather based on season and probabilities
     */
    changeWeather() {
        const weatherTypes = Object.keys(this.weatherEffects);
        const seasonProbabilities = {};
        
        // Calculate cumulative probabilities for current season
        let cumulativeProbability = 0;
        for (const weather of weatherTypes) {
            const probability = this.weatherEffects[weather].probability[this.currentSeason];
            cumulativeProbability += probability;
            seasonProbabilities[weather] = cumulativeProbability;
        }
        
        // Normalize probabilities
        for (const weather of weatherTypes) {
            seasonProbabilities[weather] /= cumulativeProbability;
        }
        
        // Select random weather based on probabilities
        const random = Math.random();
        let selectedWeather = 'clear'; // Default
        
        for (const weather of weatherTypes) {
            if (random <= seasonProbabilities[weather]) {
                selectedWeather = weather;
                break;
            }
        }
        
        // Set new weather
        this.currentWeather = selectedWeather;
        
        // Determine weather duration (5-15 minutes)
        this.weatherDuration = 5 * 60 + Math.floor(Math.random() * 10 * 60);
        this.weatherChangeTime = Date.now() + this.weatherDuration * 1000;
        
        // Log weather change
        this.gameState.activityLogManager.addLogEntry(
            'Weather',
            `Weather changed to ${this.weatherEffects[this.currentWeather].name}`
        );
    }
    
    /**
     * Change season
     */
    changeSeason() {
        const seasons = ['spring', 'summer', 'fall', 'winter'];
        const currentIndex = seasons.indexOf(this.currentSeason);
        const nextIndex = (currentIndex + 1) % seasons.length;
        
        this.currentSeason = seasons[nextIndex];
        this.seasonChangeTime = Date.now() + this.seasonDuration * 1000;
        
        // Log season change
        this.gameState.activityLogManager.addLogEntry(
            'Season',
            `Season changed to ${this.seasonEffects[this.currentSeason].name}`
        );
        
        // Change weather with new season
        this.changeWeather();
    }
    
    /**
     * Get current weather effect
     * @returns {Object} - Current weather effect
     */
    getCurrentWeatherEffect() {
        return this.weatherEffects[this.currentWeather];
    }
    
    /**
     * Get current season effect
     * @returns {Object} - Current season effect
     */
    getCurrentSeasonEffect() {
        return this.seasonEffects[this.currentSeason];
    }
    
    /**
     * Get combined resource production modifier
     * @param {string} resourceType - The resource type
     * @returns {number} - Combined modifier
     */
    getResourceProductionModifier(resourceType) {
        const weatherModifier = this.weatherEffects[this.currentWeather].resourceProduction[resourceType] || 1.0;
        const seasonModifier = this.seasonEffects[this.currentSeason].resourceProduction[resourceType] || 1.0;
        
        return weatherModifier * seasonModifier;
    }
    
    /**
     * Get resource regeneration rate modifier
     * @returns {number} - Regeneration rate modifier
     */
    getResourceRegenerationModifier() {
        return this.seasonEffects[this.currentSeason].resourceRegenerationRate;
    }
    
    /**
     * Get movement speed modifier
     * @returns {number} - Movement speed modifier
     */
    getMovementSpeedModifier() {
        const weatherModifier = this.weatherEffects[this.currentWeather].movementSpeed;
        const seasonModifier = this.seasonEffects[this.currentSeason].movementSpeed;
        
        return weatherModifier * seasonModifier;
    }
    
    /**
     * Get combat modifiers
     * @returns {Object} - Combat modifiers
     */
    getCombatModifiers() {
        return this.weatherEffects[this.currentWeather].combatModifiers;
    }
    
    /**
     * Get visibility range modifier
     * @returns {number} - Visibility range modifier
     */
    getVisibilityRangeModifier() {
        return this.weatherEffects[this.currentWeather].visibilityRange;
    }
    
    /**
     * Get build speed modifier
     * @returns {number} - Build speed modifier
     */
    getBuildSpeedModifier() {
        return this.seasonEffects[this.currentSeason].buildSpeed;
    }
    
    /**
     * Get research speed modifier
     * @returns {number} - Research speed modifier
     */
    getResearchSpeedModifier() {
        return this.seasonEffects[this.currentSeason].researchSpeed;
    }
    
    /**
     * Get time until weather change
     * @returns {number} - Time in seconds
     */
    getTimeUntilWeatherChange() {
        return Math.max(0, Math.floor((this.weatherChangeTime - Date.now()) / 1000));
    }
    
    /**
     * Get time until season change
     * @returns {number} - Time in seconds
     */
    getTimeUntilSeasonChange() {
        return Math.max(0, Math.floor((this.seasonChangeTime - Date.now()) / 1000));
    }
    
    /**
     * Update weather system (called on each game tick)
     */
    update() {
        const now = Date.now();
        
        // Check for weather change
        if (now >= this.weatherChangeTime) {
            this.changeWeather();
        }
        
        // Check for season change
        if (now >= this.seasonChangeTime) {
            this.changeSeason();
        }
    }
}

// Export the WeatherSystem class
if (typeof module !== 'undefined') {
    module.exports = { WeatherSystem };
}
