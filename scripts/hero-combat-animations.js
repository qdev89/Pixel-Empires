/**
 * Hero Combat Animations
 * Handles hero-specific animations during combat
 */
class HeroCombatAnimations {
    /**
     * Initialize the hero combat animations
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        
        // Define animation types
        this.animationTypes = {
            ATTACK: {
                name: "Attack",
                duration: 1000,
                cssClass: "hero-attack-animation"
            },
            SPECIAL_ATTACK: {
                name: "Special Attack",
                duration: 1500,
                cssClass: "hero-special-attack-animation"
            },
            SUPPORT: {
                name: "Support",
                duration: 1200,
                cssClass: "hero-support-animation"
            },
            HEAL: {
                name: "Heal",
                duration: 1000,
                cssClass: "hero-heal-animation"
            },
            DEFEND: {
                name: "Defend",
                duration: 800,
                cssClass: "hero-defend-animation"
            }
        };
        
        // Define hero type specific animations
        this.heroTypeAnimations = {
            WARRIOR: {
                attack: "ATTACK",
                special: "SPECIAL_ATTACK",
                support: "DEFEND"
            },
            ARCHER: {
                attack: "ATTACK",
                special: "SPECIAL_ATTACK",
                support: "SUPPORT"
            },
            MAGE: {
                attack: "SPECIAL_ATTACK",
                special: "SPECIAL_ATTACK",
                support: "SUPPORT"
            },
            HEALER: {
                attack: "ATTACK",
                special: "HEAL",
                support: "HEAL"
            },
            ROGUE: {
                attack: "ATTACK",
                special: "SPECIAL_ATTACK",
                support: "SUPPORT"
            },
            PALADIN: {
                attack: "ATTACK",
                special: "DEFEND",
                support: "HEAL"
            }
        };
    }
    
    /**
     * Create a hero animation element
     * @param {Object} hero - The hero
     * @param {string} animationType - The animation type
     * @param {HTMLElement} container - The container element
     * @returns {HTMLElement} - The animation element
     */
    createAnimationElement(hero, animationType, container) {
        const animation = this.animationTypes[animationType];
        if (!animation) return null;
        
        // Create animation element
        const animationElement = document.createElement('div');
        animationElement.className = `hero-animation ${animation.cssClass}`;
        
        // Add hero portrait
        const portraitElement = document.createElement('div');
        portraitElement.className = 'hero-animation-portrait';
        portraitElement.innerHTML = hero.portrait || '👤';
        animationElement.appendChild(portraitElement);
        
        // Add animation effect based on type
        const effectElement = document.createElement('div');
        effectElement.className = 'hero-animation-effect';
        
        switch (animationType) {
            case 'ATTACK':
                effectElement.innerHTML = '⚔️';
                break;
            case 'SPECIAL_ATTACK':
                effectElement.innerHTML = '💥';
                break;
            case 'SUPPORT':
                effectElement.innerHTML = '🔆';
                break;
            case 'HEAL':
                effectElement.innerHTML = '💚';
                break;
            case 'DEFEND':
                effectElement.innerHTML = '🛡️';
                break;
            default:
                effectElement.innerHTML = '✨';
        }
        
        animationElement.appendChild(effectElement);
        
        // Add hero name
        const nameElement = document.createElement('div');
        nameElement.className = 'hero-animation-name';
        nameElement.textContent = hero.name;
        animationElement.appendChild(nameElement);
        
        // Add to container
        container.appendChild(animationElement);
        
        // Set animation duration
        setTimeout(() => {
            if (animationElement.parentNode) {
                // Add exit animation class
                animationElement.classList.add('exit');
                
                // Remove after exit animation
                setTimeout(() => {
                    if (animationElement.parentNode) {
                        animationElement.parentNode.removeChild(animationElement);
                    }
                }, 500);
            }
        }, animation.duration);
        
        return animationElement;
    }
    
    /**
     * Play a hero ability animation
     * @param {Object} hero - The hero
     * @param {Object} ability - The ability
     * @param {HTMLElement} container - The container element
     */
    playAbilityAnimation(hero, ability, container) {
        if (!hero || !ability || !container) return;
        
        let animationType = 'ATTACK';
        
        // Determine animation type based on ability type
        switch (ability.type) {
            case 'combat':
                animationType = 'SPECIAL_ATTACK';
                break;
            case 'support':
                animationType = 'SUPPORT';
                break;
            case 'heal':
                animationType = 'HEAL';
                break;
            case 'defense':
                animationType = 'DEFEND';
                break;
        }
        
        // Create and play the animation
        this.createAnimationElement(hero, animationType, container);
        
        // Add ability name display
        const abilityNameElement = document.createElement('div');
        abilityNameElement.className = 'ability-name-display';
        abilityNameElement.textContent = ability.name;
        container.appendChild(abilityNameElement);
        
        // Remove ability name after animation
        setTimeout(() => {
            if (abilityNameElement.parentNode) {
                abilityNameElement.parentNode.removeChild(abilityNameElement);
            }
        }, 2000);
    }
    
    /**
     * Play a hero attack animation
     * @param {Object} hero - The hero
     * @param {HTMLElement} container - The container element
     */
    playAttackAnimation(hero, container) {
        if (!hero || !container) return;
        
        // Get hero type
        const heroType = hero.type || 'WARRIOR';
        
        // Get animation type for this hero type
        let animationType = 'ATTACK';
        if (this.heroTypeAnimations[heroType] && this.heroTypeAnimations[heroType].attack) {
            animationType = this.heroTypeAnimations[heroType].attack;
        }
        
        // Create and play the animation
        this.createAnimationElement(hero, animationType, container);
    }
    
    /**
     * Play a hero special animation
     * @param {Object} hero - The hero
     * @param {HTMLElement} container - The container element
     */
    playSpecialAnimation(hero, container) {
        if (!hero || !container) return;
        
        // Get hero type
        const heroType = hero.type || 'WARRIOR';
        
        // Get animation type for this hero type
        let animationType = 'SPECIAL_ATTACK';
        if (this.heroTypeAnimations[heroType] && this.heroTypeAnimations[heroType].special) {
            animationType = this.heroTypeAnimations[heroType].special;
        }
        
        // Create and play the animation
        this.createAnimationElement(hero, animationType, container);
    }
    
    /**
     * Play a hero support animation
     * @param {Object} hero - The hero
     * @param {HTMLElement} container - The container element
     */
    playSupportAnimation(hero, container) {
        if (!hero || !container) return;
        
        // Get hero type
        const heroType = hero.type || 'WARRIOR';
        
        // Get animation type for this hero type
        let animationType = 'SUPPORT';
        if (this.heroTypeAnimations[heroType] && this.heroTypeAnimations[heroType].support) {
            animationType = this.heroTypeAnimations[heroType].support;
        }
        
        // Create and play the animation
        this.createAnimationElement(hero, animationType, container);
    }
    
    /**
     * Play a hero level up animation
     * @param {Object} hero - The hero
     * @param {HTMLElement} container - The container element
     */
    playLevelUpAnimation(hero, container) {
        if (!hero || !container) return;
        
        // Create level up animation element
        const animationElement = document.createElement('div');
        animationElement.className = 'hero-level-up-animation';
        
        // Add hero portrait
        const portraitElement = document.createElement('div');
        portraitElement.className = 'hero-animation-portrait';
        portraitElement.innerHTML = hero.portrait || '👤';
        animationElement.appendChild(portraitElement);
        
        // Add level up effect
        const effectElement = document.createElement('div');
        effectElement.className = 'level-up-effect';
        effectElement.innerHTML = '⭐';
        animationElement.appendChild(effectElement);
        
        // Add level up text
        const textElement = document.createElement('div');
        textElement.className = 'level-up-text';
        textElement.innerHTML = `${hero.name} Level Up!`;
        animationElement.appendChild(textElement);
        
        // Add to container
        container.appendChild(animationElement);
        
        // Remove after animation
        setTimeout(() => {
            if (animationElement.parentNode) {
                // Add exit animation class
                animationElement.classList.add('exit');
                
                // Remove after exit animation
                setTimeout(() => {
                    if (animationElement.parentNode) {
                        animationElement.parentNode.removeChild(animationElement);
                    }
                }, 500);
            }
        }, 2000);
    }
}

// HeroCombatAnimations class is now ready to be instantiated in main.js
