/**
 * Unit Animations System
 * Handles unit-specific animations for combat and movement
 */

class UnitAnimationManager {
    constructor() {
        // Store active unit animations
        this.activeAnimations = new Map();
        
        // Animation settings
        this.settings = {
            unitMovement: {
                duration: 2000, // ms
                frames: 4, // number of animation frames
                frameInterval: 250 // ms between frames
            },
            unitAttack: {
                duration: 1000, // ms
                frames: 4, // number of animation frames
                frameInterval: 200 // ms between frames
            },
            unitIdle: {
                frames: 2, // number of animation frames
                frameInterval: 800 // ms between frames
            },
            battleScene: {
                duration: 5000, // ms for the entire battle scene
                unitSpacing: 40, // px between units
                rowSpacing: 30, // px between rows
                maxUnitsPerRow: 5 // maximum units to show per row
            }
        };
        
        // Preload unit sprites
        this.sprites = {
            spearman: {
                idle: [],
                walk: [],
                attack: []
            },
            archer: {
                idle: [],
                walk: [],
                attack: []
            },
            cavalry: {
                idle: [],
                walk: [],
                attack: []
            },
            goblin: {
                idle: [],
                attack: []
            },
            bandit: {
                idle: [],
                attack: []
            }
        };
        
        this.preloadSprites();
        
        // Start the idle animation loop
        this.startIdleAnimationLoop();
    }
    
    /**
     * Preload unit sprites
     */
    preloadSprites() {
        // Define unit types and animation states
        const unitTypes = ['spearman', 'archer', 'cavalry', 'goblin', 'bandit'];
        const animationStates = ['idle', 'walk', 'attack'];
        
        // For each unit type and animation state, load the sprites
        unitTypes.forEach(unitType => {
            animationStates.forEach(state => {
                // Skip animations that don't exist for certain unit types
                if ((unitType === 'goblin' || unitType === 'bandit') && state === 'walk') {
                    return;
                }
                
                // Determine number of frames based on animation state
                let frameCount = 2; // Default for idle
                if (state === 'walk') frameCount = 4;
                if (state === 'attack') frameCount = 4;
                
                // Load each frame
                for (let i = 1; i <= frameCount; i++) {
                    const img = new Image();
                    img.src = `assets/units/${unitType}_${state}${i}.png`;
                    
                    // Add to sprites collection
                    if (this.sprites[unitType] && this.sprites[unitType][state]) {
                        this.sprites[unitType][state].push(img);
                    }
                }
            });
        });
    }
    
    /**
     * Start the idle animation loop for all unit displays
     */
    startIdleAnimationLoop() {
        // Find all unit displays in the document
        const updateIdleAnimations = () => {
            const unitDisplays = document.querySelectorAll('.unit-display');
            
            unitDisplays.forEach(display => {
                const unitType = display.dataset.unitType?.toLowerCase();
                if (!unitType || !this.sprites[unitType]) return;
                
                // Get or create animation data for this display
                const animId = display.dataset.animId || `idle-${unitType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                display.dataset.animId = animId;
                
                if (!this.activeAnimations.has(animId)) {
                    // Create new idle animation
                    this.activeAnimations.set(animId, {
                        element: display,
                        unitType,
                        state: 'idle',
                        currentFrame: 0,
                        lastFrameTime: Date.now(),
                        frameInterval: this.settings.unitIdle.frameInterval
                    });
                }
                
                // Update the animation frame
                const anim = this.activeAnimations.get(animId);
                const now = Date.now();
                
                if (now - anim.lastFrameTime >= anim.frameInterval) {
                    anim.currentFrame = (anim.currentFrame + 1) % this.sprites[unitType].idle.length;
                    anim.lastFrameTime = now;
                    
                    // Update the display
                    const sprite = this.sprites[unitType].idle[anim.currentFrame];
                    if (sprite && sprite.complete) {
                        display.style.backgroundImage = `url('${sprite.src}')`;
                    }
                }
            });
            
            // Continue the loop
            requestAnimationFrame(updateIdleAnimations);
        };
        
        // Start the loop
        updateIdleAnimations();
    }
    
    /**
     * Create a unit movement animation
     * @param {string} unitType - Type of unit (spearman, archer, cavalry)
     * @param {HTMLElement} container - Container element for the animation
     * @param {Object} startPos - Starting position {x, y}
     * @param {Object} endPos - Ending position {x, y}
     * @param {Function} onComplete - Callback when animation completes
     */
    createUnitMovementAnimation(unitType, container, startPos, endPos, onComplete) {
        // Create unit element
        const unitElement = document.createElement('div');
        unitElement.className = 'unit-animation';
        unitElement.dataset.unitType = unitType;
        
        // Set initial position
        unitElement.style.left = `${startPos.x}px`;
        unitElement.style.top = `${startPos.y}px`;
        
        // Add to container
        container.appendChild(unitElement);
        
        // Create animation
        const animId = `movement-${unitType}-${Date.now()}`;
        const startTime = Date.now();
        
        // Store animation data
        this.activeAnimations.set(animId, {
            element: unitElement,
            unitType,
            state: 'walk',
            startTime,
            endTime: startTime + this.settings.unitMovement.duration,
            startPos,
            endPos,
            currentFrame: 0,
            lastFrameTime: startTime,
            frameInterval: this.settings.unitMovement.frameInterval,
            onComplete: () => {
                // Remove element
                if (unitElement.parentNode) {
                    unitElement.parentNode.removeChild(unitElement);
                }
                
                // Remove from active animations
                this.activeAnimations.delete(animId);
                
                // Call completion callback
                if (onComplete) onComplete();
            }
        });
        
        // Start animation
        this.updateUnitAnimation(animId);
    }
    
    /**
     * Create a unit attack animation
     * @param {string} unitType - Type of unit (spearman, archer, cavalry)
     * @param {HTMLElement} container - Container element for the animation
     * @param {Object} position - Position {x, y}
     * @param {Function} onComplete - Callback when animation completes
     */
    createUnitAttackAnimation(unitType, container, position, onComplete) {
        // Create unit element
        const unitElement = document.createElement('div');
        unitElement.className = 'unit-animation';
        unitElement.dataset.unitType = unitType;
        
        // Set position
        unitElement.style.left = `${position.x}px`;
        unitElement.style.top = `${position.y}px`;
        
        // Add to container
        container.appendChild(unitElement);
        
        // Create animation
        const animId = `attack-${unitType}-${Date.now()}`;
        const startTime = Date.now();
        
        // Store animation data
        this.activeAnimations.set(animId, {
            element: unitElement,
            unitType,
            state: 'attack',
            startTime,
            endTime: startTime + this.settings.unitAttack.duration,
            position,
            currentFrame: 0,
            lastFrameTime: startTime,
            frameInterval: this.settings.unitAttack.frameInterval,
            onComplete: () => {
                // Remove element
                if (unitElement.parentNode) {
                    unitElement.parentNode.removeChild(unitElement);
                }
                
                // Remove from active animations
                this.activeAnimations.delete(animId);
                
                // Call completion callback
                if (onComplete) onComplete();
            }
        });
        
        // Start animation
        this.updateUnitAnimation(animId);
    }
    
    /**
     * Create a battle scene animation
     * @param {Object} playerUnits - Object with unit counts {SPEARMAN: 5, ARCHER: 3, CAVALRY: 2}
     * @param {string} enemyType - Type of enemy (goblin, bandit)
     * @param {number} enemyCount - Number of enemy units
     * @param {HTMLElement} container - Container element for the animation
     * @param {Function} onComplete - Callback when animation completes
     * @param {boolean} playerWins - Whether the player wins the battle
     */
    createBattleSceneAnimation(playerUnits, enemyType, enemyCount, container, onComplete, playerWins = true) {
        // Create battle scene container
        const battleContainer = document.createElement('div');
        battleContainer.className = 'battle-scene-container';
        
        // Create player units side
        const playerSide = document.createElement('div');
        playerSide.className = 'battle-side player-side';
        
        // Create enemy units side
        const enemySide = document.createElement('div');
        enemySide.className = 'battle-side enemy-side';
        
        // Add to container
        battleContainer.appendChild(playerSide);
        battleContainer.appendChild(enemySide);
        container.appendChild(battleContainer);
        
        // Create animation
        const animId = `battle-scene-${Date.now()}`;
        const startTime = Date.now();
        
        // Add player units
        let playerUnitElements = [];
        let rowIndex = 0;
        let colIndex = 0;
        
        // Add spearmen
        for (let i = 0; i < (playerUnits.SPEARMAN || 0); i++) {
            if (colIndex >= this.settings.battleScene.maxUnitsPerRow) {
                colIndex = 0;
                rowIndex++;
            }
            
            const unitElement = document.createElement('div');
            unitElement.className = 'unit-animation';
            unitElement.dataset.unitType = 'spearman';
            
            // Position in grid
            unitElement.style.left = `${colIndex * this.settings.battleScene.unitSpacing}px`;
            unitElement.style.top = `${rowIndex * this.settings.battleScene.rowSpacing}px`;
            
            playerSide.appendChild(unitElement);
            playerUnitElements.push(unitElement);
            colIndex++;
        }
        
        // Add archers (in a new row)
        rowIndex++;
        colIndex = 0;
        for (let i = 0; i < (playerUnits.ARCHER || 0); i++) {
            if (colIndex >= this.settings.battleScene.maxUnitsPerRow) {
                colIndex = 0;
                rowIndex++;
            }
            
            const unitElement = document.createElement('div');
            unitElement.className = 'unit-animation';
            unitElement.dataset.unitType = 'archer';
            
            // Position in grid
            unitElement.style.left = `${colIndex * this.settings.battleScene.unitSpacing}px`;
            unitElement.style.top = `${rowIndex * this.settings.battleScene.rowSpacing}px`;
            
            playerSide.appendChild(unitElement);
            playerUnitElements.push(unitElement);
            colIndex++;
        }
        
        // Add cavalry (in a new row)
        rowIndex++;
        colIndex = 0;
        for (let i = 0; i < (playerUnits.CAVALRY || 0); i++) {
            if (colIndex >= this.settings.battleScene.maxUnitsPerRow) {
                colIndex = 0;
                rowIndex++;
            }
            
            const unitElement = document.createElement('div');
            unitElement.className = 'unit-animation';
            unitElement.dataset.unitType = 'cavalry';
            
            // Position in grid
            unitElement.style.left = `${colIndex * this.settings.battleScene.unitSpacing}px`;
            unitElement.style.top = `${rowIndex * this.settings.battleScene.rowSpacing}px`;
            
            playerSide.appendChild(unitElement);
            playerUnitElements.push(unitElement);
            colIndex++;
        }
        
        // Add enemy units
        let enemyUnitElements = [];
        rowIndex = 0;
        colIndex = 0;
        
        for (let i = 0; i < enemyCount; i++) {
            if (colIndex >= this.settings.battleScene.maxUnitsPerRow) {
                colIndex = 0;
                rowIndex++;
            }
            
            const unitElement = document.createElement('div');
            unitElement.className = 'unit-animation';
            unitElement.dataset.unitType = enemyType;
            
            // Position in grid
            unitElement.style.left = `${colIndex * this.settings.battleScene.unitSpacing}px`;
            unitElement.style.top = `${rowIndex * this.settings.battleScene.rowSpacing}px`;
            
            enemySide.appendChild(unitElement);
            enemyUnitElements.push(unitElement);
            colIndex++;
        }
        
        // Store animation data
        this.activeAnimations.set(animId, {
            element: battleContainer,
            startTime,
            endTime: startTime + this.settings.battleScene.duration,
            playerUnits: playerUnitElements,
            enemyUnits: enemyUnitElements,
            playerWins,
            phase: 'approach', // approach, battle, retreat
            phaseStartTime: startTime,
            onComplete: () => {
                // Remove element with fade out
                battleContainer.style.opacity = '0';
                setTimeout(() => {
                    if (battleContainer.parentNode) {
                        battleContainer.parentNode.removeChild(battleContainer);
                    }
                    
                    // Remove from active animations
                    this.activeAnimations.delete(animId);
                    
                    // Call completion callback
                    if (onComplete) onComplete();
                }, 500);
            }
        });
        
        // Start animation
        this.updateBattleSceneAnimation(animId);
    }
    
    /**
     * Update a unit animation
     * @param {string} animId - Animation ID
     */
    updateUnitAnimation(animId) {
        const anim = this.activeAnimations.get(animId);
        if (!anim) return;
        
        const now = Date.now();
        
        // Check if animation is complete
        if (anim.endTime && now >= anim.endTime) {
            if (anim.onComplete) anim.onComplete();
            return;
        }
        
        // Update frame if needed
        if (now - anim.lastFrameTime >= anim.frameInterval) {
            anim.currentFrame = (anim.currentFrame + 1) % this.sprites[anim.unitType][anim.state].length;
            anim.lastFrameTime = now;
            
            // Update sprite
            const sprite = this.sprites[anim.unitType][anim.state][anim.currentFrame];
            if (sprite && sprite.complete) {
                anim.element.style.backgroundImage = `url('${sprite.src}')`;
            }
        }
        
        // Update position for movement animations
        if (anim.state === 'walk' && anim.startPos && anim.endPos) {
            const progress = (now - anim.startTime) / (anim.endTime - anim.startTime);
            const x = anim.startPos.x + (anim.endPos.x - anim.startPos.x) * progress;
            const y = anim.startPos.y + (anim.endPos.y - anim.startPos.y) * progress;
            
            anim.element.style.left = `${x}px`;
            anim.element.style.top = `${y}px`;
            
            // Flip sprite based on movement direction
            if (anim.endPos.x < anim.startPos.x) {
                anim.element.style.transform = 'scaleX(-1)';
            } else {
                anim.element.style.transform = 'scaleX(1)';
            }
        }
        
        // Continue animation
        requestAnimationFrame(() => this.updateUnitAnimation(animId));
    }
    
    /**
     * Update a battle scene animation
     * @param {string} animId - Animation ID
     */
    updateBattleSceneAnimation(animId) {
        const anim = this.activeAnimations.get(animId);
        if (!anim) return;
        
        const now = Date.now();
        
        // Check if animation is complete
        if (now >= anim.endTime) {
            if (anim.onComplete) anim.onComplete();
            return;
        }
        
        // Calculate overall progress
        const totalProgress = (now - anim.startTime) / (anim.endTime - anim.startTime);
        
        // Update animation based on phase
        if (anim.phase === 'approach' && totalProgress < 0.3) {
            // Approach phase: Units move toward center
            this.updateBattleApproachPhase(anim, totalProgress / 0.3);
        } else if (anim.phase === 'approach' && totalProgress >= 0.3) {
            // Transition to battle phase
            anim.phase = 'battle';
            anim.phaseStartTime = now;
            
            // Start attack animations for all units
            this.startBattlePhaseAnimations(anim);
        } else if (anim.phase === 'battle' && totalProgress < 0.7) {
            // Battle phase: Units attack each other
            this.updateBattlePhase(anim, (totalProgress - 0.3) / 0.4);
        } else if (anim.phase === 'battle' && totalProgress >= 0.7) {
            // Transition to retreat phase
            anim.phase = 'retreat';
            anim.phaseStartTime = now;
        } else if (anim.phase === 'retreat') {
            // Retreat phase: Losing side retreats
            this.updateBattleRetreatPhase(anim, (totalProgress - 0.7) / 0.3);
        }
        
        // Continue animation
        requestAnimationFrame(() => this.updateBattleSceneAnimation(animId));
    }
    
    /**
     * Update the approach phase of a battle scene
     * @param {Object} anim - Animation data
     * @param {number} progress - Phase progress (0-1)
     */
    updateBattleApproachPhase(anim, progress) {
        // Move player units forward
        anim.playerUnits.forEach(unit => {
            const startX = 0;
            const endX = 50; // Move 50px forward
            const x = startX + (endX - startX) * progress;
            unit.style.transform = `translateX(${x}px)`;
            
            // Update sprite to walking animation
            const unitType = unit.dataset.unitType;
            const frameIndex = Math.floor(Date.now() / 250) % this.sprites[unitType].walk.length;
            const sprite = this.sprites[unitType].walk[frameIndex];
            if (sprite && sprite.complete) {
                unit.style.backgroundImage = `url('${sprite.src}')`;
            }
        });
        
        // Move enemy units forward
        anim.enemyUnits.forEach(unit => {
            const startX = 0;
            const endX = -50; // Move 50px forward (left)
            const x = startX + (endX - startX) * progress;
            unit.style.transform = `translateX(${x}px) scaleX(-1)`; // Flip horizontally
            
            // Update sprite to idle animation (enemies don't have walk animation)
            const unitType = unit.dataset.unitType;
            const frameIndex = Math.floor(Date.now() / 800) % this.sprites[unitType].idle.length;
            const sprite = this.sprites[unitType].idle[frameIndex];
            if (sprite && sprite.complete) {
                unit.style.backgroundImage = `url('${sprite.src}')`;
            }
        });
    }
    
    /**
     * Start attack animations for the battle phase
     * @param {Object} anim - Animation data
     */
    startBattlePhaseAnimations(anim) {
        // Set all units to attack animation
        const updateAttackAnimations = () => {
            if (anim.phase !== 'battle') return;
            
            // Update player units
            anim.playerUnits.forEach(unit => {
                const unitType = unit.dataset.unitType;
                const frameIndex = Math.floor(Date.now() / 200) % this.sprites[unitType].attack.length;
                const sprite = this.sprites[unitType].attack[frameIndex];
                if (sprite && sprite.complete) {
                    unit.style.backgroundImage = `url('${sprite.src}')`;
                }
            });
            
            // Update enemy units
            anim.enemyUnits.forEach(unit => {
                const unitType = unit.dataset.unitType;
                const frameIndex = Math.floor(Date.now() / 200) % this.sprites[unitType].attack.length;
                const sprite = this.sprites[unitType].attack[frameIndex];
                if (sprite && sprite.complete) {
                    unit.style.backgroundImage = `url('${sprite.src}')`;
                    unit.style.transform = `translateX(-50px) scaleX(-1)`; // Keep position from approach phase
                }
            });
            
            // Continue the loop if still in battle phase
            if (anim.phase === 'battle') {
                requestAnimationFrame(updateAttackAnimations);
            }
        };
        
        // Start the attack animation loop
        updateAttackAnimations();
    }
    
    /**
     * Update the battle phase of a battle scene
     * @param {Object} anim - Animation data
     * @param {number} progress - Phase progress (0-1)
     */
    updateBattlePhase(anim, progress) {
        // Battle effects (flashes, shakes, etc.)
        if (progress > 0.3 && progress < 0.7) {
            // Add some random shaking
            const shake = Math.sin(progress * 50) * 2;
            anim.element.style.transform = `translateX(${shake}px)`;
        }
        
        // Start removing units based on outcome
        if (progress > 0.5) {
            if (anim.playerWins) {
                // Remove enemy units gradually
                const enemiesToRemove = Math.floor(anim.enemyUnits.length * ((progress - 0.5) / 0.5));
                for (let i = 0; i < enemiesToRemove && i < anim.enemyUnits.length; i++) {
                    if (anim.enemyUnits[i].style.opacity !== '0') {
                        anim.enemyUnits[i].style.opacity = '0';
                    }
                }
            } else {
                // Remove player units gradually
                const unitsToRemove = Math.floor(anim.playerUnits.length * ((progress - 0.5) / 0.5));
                for (let i = 0; i < unitsToRemove && i < anim.playerUnits.length; i++) {
                    if (anim.playerUnits[i].style.opacity !== '0') {
                        anim.playerUnits[i].style.opacity = '0';
                    }
                }
            }
        }
    }
    
    /**
     * Update the retreat phase of a battle scene
     * @param {Object} anim - Animation data
     * @param {number} progress - Phase progress (0-1)
     */
    updateBattleRetreatPhase(anim, progress) {
        if (anim.playerWins) {
            // Player wins: remaining enemy units retreat
            anim.enemyUnits.forEach(unit => {
                if (unit.style.opacity !== '0') {
                    const startX = -50; // Current position
                    const endX = -150; // Retreat position
                    const x = startX + (endX - startX) * progress;
                    unit.style.transform = `translateX(${x}px) scaleX(-1)`;
                    
                    // Switch to idle animation
                    const unitType = unit.dataset.unitType;
                    const frameIndex = Math.floor(Date.now() / 800) % this.sprites[unitType].idle.length;
                    const sprite = this.sprites[unitType].idle[frameIndex];
                    if (sprite && sprite.complete) {
                        unit.style.backgroundImage = `url('${sprite.src}')`;
                    }
                }
            });
            
            // Player units return to idle
            anim.playerUnits.forEach(unit => {
                const unitType = unit.dataset.unitType;
                const frameIndex = Math.floor(Date.now() / 800) % this.sprites[unitType].idle.length;
                const sprite = this.sprites[unitType].idle[frameIndex];
                if (sprite && sprite.complete) {
                    unit.style.backgroundImage = `url('${sprite.src}')`;
                }
            });
        } else {
            // Player loses: player units retreat
            anim.playerUnits.forEach(unit => {
                if (unit.style.opacity !== '0') {
                    const startX = 50; // Current position
                    const endX = 150; // Retreat position
                    const x = startX + (endX - startX) * progress;
                    unit.style.transform = `translateX(${x}px)`;
                    
                    // Switch to walk animation
                    const unitType = unit.dataset.unitType;
                    const frameIndex = Math.floor(Date.now() / 250) % this.sprites[unitType].walk.length;
                    const sprite = this.sprites[unitType].walk[frameIndex];
                    if (sprite && sprite.complete) {
                        unit.style.backgroundImage = `url('${sprite.src}')`;
                    }
                }
            });
            
            // Enemy units return to idle
            anim.enemyUnits.forEach(unit => {
                const unitType = unit.dataset.unitType;
                const frameIndex = Math.floor(Date.now() / 800) % this.sprites[unitType].idle.length;
                const sprite = this.sprites[unitType].idle[frameIndex];
                if (sprite && sprite.complete) {
                    unit.style.backgroundImage = `url('${sprite.src}')`;
                }
            });
        }
    }
}

// Create global unit animation manager
const unitAnimationManager = new UnitAnimationManager();
