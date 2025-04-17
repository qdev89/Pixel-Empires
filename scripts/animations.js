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
        if (amount <= 0) return;
        
        // Create animation element
        const animElement = document.createElement('div');
        animElement.className = 'resource-gain-animation';
        
        // Set resource type specific properties
        let resourceIcon;
        if (resourceType === 'FOOD') {
            animElement.classList.add('food');
            resourceIcon = this.sprites.resourceFood;
        } else if (resourceType === 'ORE') {
            animElement.classList.add('ore');
            resourceIcon = this.sprites.resourceOre;
        }
        
        // Set content
        animElement.innerHTML = `
            <img src="${resourceIcon.src}" alt="${resourceType}" class="resource-icon">
            <span>+${Math.floor(amount)}</span>
        `;
        
        // Get target position
        const targetRect = targetElement.getBoundingClientRect();
        
        // Set initial position (random position near the center of the screen)
        const startX = window.innerWidth / 2 + (Math.random() * 100 - 50);
        const startY = window.innerHeight / 2 + (Math.random() * 100 - 50);
        
        animElement.style.left = `${startX}px`;
        animElement.style.top = `${startY}px`;
        
        // Add to DOM
        document.body.appendChild(animElement);
        
        // Create animation
        const animId = `resource-${resourceType}-${Date.now()}`;
        const startTime = Date.now();
        
        // Store animation data
        this.activeAnimations.set(animId, {
            element: animElement,
            startTime,
            endTime: startTime + this.settings.resourceGain.duration,
            startPos: { x: startX, y: startY },
            targetPos: { x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 },
            type: 'resourceGain',
            onComplete: () => {
                // Remove element
                if (animElement.parentNode) {
                    animElement.parentNode.removeChild(animElement);
                }
                
                // Remove from active animations
                this.activeAnimations.delete(animId);
            }
        });
        
        // Start animation
        this.updateAnimation(animId);
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
        // Get positions
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        // Create particles
        for (let i = 0; i < this.settings.resourceProduction.particleCount; i++) {
            // Create particle element
            const particleElement = document.createElement('div');
            particleElement.className = 'resource-particle';
            
            // Set resource type specific properties
            if (resourceType === 'FOOD') {
                particleElement.classList.add('food');
            } else if (resourceType === 'ORE') {
                particleElement.classList.add('ore');
            }
            
            // Set initial position (random position within source element)
            const startX = sourceRect.left + Math.random() * sourceRect.width;
            const startY = sourceRect.top + Math.random() * sourceRect.height;
            
            particleElement.style.left = `${startX}px`;
            particleElement.style.top = `${startY}px`;
            
            // Add to DOM
            document.body.appendChild(particleElement);
            
            // Create animation with delay based on particle index
            const delay = i * 200; // stagger particles
            const animId = `particle-${resourceType}-${Date.now()}-${i}`;
            const startTime = Date.now() + delay;
            
            // Store animation data
            this.activeAnimations.set(animId, {
                element: particleElement,
                startTime,
                endTime: startTime + this.settings.resourceProduction.duration,
                startPos: { x: startX, y: startY },
                targetPos: { x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 },
                type: 'resourceParticle',
                delay,
                active: false,
                onComplete: () => {
                    // Remove element
                    if (particleElement.parentNode) {
                        particleElement.parentNode.removeChild(particleElement);
                    }
                    
                    // Remove from active animations
                    this.activeAnimations.delete(animId);
                }
            });
        }
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
        // Calculate position
        const x = anim.startPos.x + (anim.targetPos.x - anim.startPos.x) * progress;
        const y = anim.startPos.y + (anim.targetPos.y - anim.startPos.y) * progress;
        
        // Calculate opacity (fade out near the end)
        let opacity = 1;
        if (progress > this.settings.resourceGain.fadeStart) {
            opacity = 1 - ((progress - this.settings.resourceGain.fadeStart) / (1 - this.settings.resourceGain.fadeStart));
        }
        
        // Update element
        anim.element.style.left = `${x}px`;
        anim.element.style.top = `${y}px`;
        anim.element.style.opacity = opacity;
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
        // Use a curved path for more interesting movement
        const x = anim.startPos.x + (anim.targetPos.x - anim.startPos.x) * progress;
        
        // Add a slight arc to the y movement
        const arcHeight = 30;
        const arcProgress = Math.sin(progress * Math.PI);
        const y = anim.startPos.y + (anim.targetPos.y - anim.startPos.y) * progress - (arcHeight * arcProgress);
        
        // Calculate size (grow slightly then shrink)
        let scale = 1;
        if (progress < 0.5) {
            scale = 0.8 + (progress * 0.4);
        } else {
            scale = 1.0 - ((progress - 0.5) * 0.6);
        }
        
        // Calculate opacity (fade in, then fade out at the end)
        let opacity = 1;
        if (progress < 0.2) {
            opacity = progress / 0.2; // Fade in
        } else if (progress > 0.8) {
            opacity = 1 - ((progress - 0.8) / 0.2); // Fade out
        }
        
        // Update element
        anim.element.style.left = `${x}px`;
        anim.element.style.top = `${y}px`;
        anim.element.style.transform = `scale(${scale})`;
        anim.element.style.opacity = opacity;
    }
    
    /**
     * Start resource production animations for all producing buildings
     * @param {Object} gameState - Game state
     * @param {Object} uiElements - UI elements
     */
    startResourceProductionAnimations(gameState, uiElements) {
        // Get all buildings that produce resources
        const producingBuildings = [];
        
        for (const [buildingType, building] of Object.entries(gameState.buildings)) {
            if (building.level > 0) {
                const config = CONFIG.BUILDINGS[buildingType];
                const level = building.level - 1; // Adjust for 0-based array
                
                if (buildingType === 'FARM' && config.levels[level].production.FOOD > 0) {
                    producingBuildings.push({
                        type: buildingType,
                        resourceType: 'FOOD',
                        element: this.findBuildingElement(buildingType, uiElements.buildingsGrid)
                    });
                } else if (buildingType === 'MINE' && config.levels[level].production.ORE > 0) {
                    producingBuildings.push({
                        type: buildingType,
                        resourceType: 'ORE',
                        element: this.findBuildingElement(buildingType, uiElements.buildingsGrid)
                    });
                }
            }
        }
        
        // Start animations for each producing building
        producingBuildings.forEach(building => {
            if (building.element) {
                const targetElement = building.resourceType === 'FOOD' 
                    ? uiElements.resources.food.parentNode
                    : uiElements.resources.ore.parentNode;
                
                this.createResourceProductionAnimation(building.resourceType, building.element, targetElement);
            }
        });
        
        // Schedule next animation
        setTimeout(() => {
            this.startResourceProductionAnimations(gameState, uiElements);
        }, this.settings.resourceProduction.interval);
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
