/**
 * Animations System
 * Handles all animations for the game
 */

class AnimationManager {
    constructor() {
        // Store active animations
        this.activeAnimations = new Map();

        // Animation settings
        this.settings = {
            resourceGain: {
                duration: 1000, // ms
                distance: 30, // px
                fadeStart: 0.7 // when to start fading (0-1)
            },
            buildingConstruction: {
                duration: 2000, // ms
                frames: 5, // number of animation frames
                interval: 400 // ms between frames
            },
            resourceProduction: {
                duration: 1500, // ms
                interval: 3000, // ms between animations
                particleCount: 3
            }
        };

        // Preload animation sprites
        this.sprites = {
            construction: [],
            resourceFood: null,
            resourceOre: null
        };

        this.preloadSprites();
    }

    /**
     * Preload animation sprites
     */
    preloadSprites() {
        // Preload construction animation frames
        for (let i = 1; i <= this.settings.buildingConstruction.frames; i++) {
            const img = new Image();
            img.src = `assets/animations/construction${i}.png`;
            this.sprites.construction.push(img);
        }

        // Preload resource sprites
        this.sprites.resourceFood = new Image();
        this.sprites.resourceFood.src = 'assets/icons/food.png';

        this.sprites.resourceOre = new Image();
        this.sprites.resourceOre.src = 'assets/icons/ore.png';
    }

    /**
     * Create a resource gain animation
     * @param {string} resourceType - Type of resource (FOOD, ORE)
     * @param {number} amount - Amount of resource gained
     * @param {HTMLElement} targetElement - Element to animate towards
     */
    createResourceGainAnimation(resourceType, amount, targetElement) {
        // Animation disabled as per user request
        return;
    }

    /**
     * Create a building construction animation
     * @param {string} buildingType - Type of building
     * @param {HTMLElement} buildingElement - Building element to animate
     * @param {Function} onComplete - Callback when animation completes
     */
    createBuildingConstructionAnimation(buildingType, buildingElement, onComplete) {
        // Create animation overlay
        const animOverlay = document.createElement('div');
        animOverlay.className = 'construction-animation';

        // Add to building element
        buildingElement.appendChild(animOverlay);

        // Create animation
        const animId = `construction-${buildingType}-${Date.now()}`;
        const startTime = Date.now();
        let currentFrame = 0;

        // Store animation data
        this.activeAnimations.set(animId, {
            element: animOverlay,
            startTime,
            endTime: startTime + this.settings.buildingConstruction.duration,
            type: 'buildingConstruction',
            buildingType,
            currentFrame,
            lastFrameTime: startTime,
            onComplete: () => {
                // Remove animation overlay
                if (animOverlay.parentNode) {
                    animOverlay.parentNode.removeChild(animOverlay);
                }

                // Remove from active animations
                this.activeAnimations.delete(animId);

                // Call completion callback
                if (onComplete) onComplete();
            }
        });

        // Set initial frame
        this.updateConstructionFrame(animId);

        // Start animation
        this.updateAnimation(animId);
    }

    /**
     * Create a resource production animation
     * @param {string} resourceType - Type of resource (FOOD, ORE)
     * @param {HTMLElement} sourceElement - Element where production originates
     * @param {HTMLElement} targetElement - Element where resources go
     */
    createResourceProductionAnimation(resourceType, sourceElement, targetElement) {
        // Animation disabled as per user request
        return;
    }

    /**
     * Update a specific animation
     * @param {string} animId - Animation ID
     */
    updateAnimation(animId) {
        const anim = this.activeAnimations.get(animId);
        if (!anim) return;

        const now = Date.now();

        // Check if animation should start yet (for delayed animations)
        if (anim.delay && now < anim.startTime) {
            requestAnimationFrame(() => this.updateAnimation(animId));
            return;
        }

        // Mark as active once delay is over
        if (anim.delay && !anim.active && now >= anim.startTime) {
            anim.active = true;
        }

        // Check if animation is complete
        if (now >= anim.endTime) {
            if (anim.onComplete) anim.onComplete();
            return;
        }

        // Calculate progress (0 to 1)
        const progress = (now - anim.startTime) / (anim.endTime - anim.startTime);

        // Update based on animation type
        if (anim.type === 'resourceGain') {
            this.updateResourceGainAnimation(anim, progress);
        } else if (anim.type === 'buildingConstruction') {
            this.updateBuildingConstructionAnimation(anim, progress, now);
        } else if (anim.type === 'resourceParticle') {
            this.updateResourceParticleAnimation(anim, progress);
        }

        // Continue animation
        requestAnimationFrame(() => this.updateAnimation(animId));
    }

    /**
     * Update resource gain animation
     * @param {Object} anim - Animation data
     * @param {number} progress - Animation progress (0-1)
     */
    updateResourceGainAnimation(anim, progress) {
        // Animation disabled as per user request
        return;
    }

    /**
     * Update building construction animation
     * @param {Object} anim - Animation data
     * @param {number} progress - Animation progress (0-1)
     * @param {number} now - Current timestamp
     */
    updateBuildingConstructionAnimation(anim, progress, now) {
        // Update frame if needed
        const frameInterval = this.settings.buildingConstruction.interval;
        if (now - anim.lastFrameTime >= frameInterval) {
            anim.currentFrame = (anim.currentFrame + 1) % this.settings.buildingConstruction.frames;
            anim.lastFrameTime = now;
            this.updateConstructionFrame(anim);
        }
    }

    /**
     * Update construction animation frame
     * @param {Object|string} anim - Animation data or animation ID
     */
    updateConstructionFrame(anim) {
        // If anim is a string (animId), get the animation data
        if (typeof anim === 'string') {
            anim = this.activeAnimations.get(anim);
            if (!anim) return;
        }

        // Get the current frame sprite
        const frameSprite = this.sprites.construction[anim.currentFrame];

        // Update element background
        anim.element.style.backgroundImage = `url('${frameSprite.src}')`;
    }

    /**
     * Update resource particle animation
     * @param {Object} anim - Animation data
     * @param {number} progress - Animation progress (0-1)
     */
    updateResourceParticleAnimation(anim, progress) {
        // Animation disabled as per user request
        return;
    }

    /**
     * Start resource production animations for all producing buildings
     * @param {Object} gameState - Game state
     * @param {Object} uiElements - UI elements
     */
    startResourceProductionAnimations(gameState, uiElements) {
        // Animation disabled as per user request
        return;
    }

    /**
     * Find a building element in the buildings grid
     * @param {string} buildingType - Type of building to find
     * @param {HTMLElement} buildingsGrid - Buildings grid element
     * @returns {HTMLElement|null} - Building element or null if not found
     */
    findBuildingElement(buildingType, buildingsGrid) {
        const buildingTiles = buildingsGrid.querySelectorAll('.building-tile');

        for (const tile of buildingTiles) {
            const nameElement = tile.querySelector('.building-name');
            if (nameElement && nameElement.textContent === CONFIG.BUILDINGS[buildingType].name) {
                return tile;
            }
        }

        return null;
    }
}

// Create global animation manager
const animationManager = new AnimationManager();
