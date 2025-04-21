/**
 * Hero Skill Tree UI for Pixel Empires
 * Handles the UI for hero skill trees, skill points, and skill learning
 */
class HeroSkillTreeUI {
    /**
     * Initialize the hero skill tree UI
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     * @param {HeroSkillTreeSystem} skillTreeSystem - The hero skill tree system
     */
    constructor(gameState, heroManager, skillTreeSystem) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        this.skillTreeSystem = skillTreeSystem;
        this.selectedHero = null;
        this.selectedBranch = null;
    }
    
    /**
     * Create the skill tree UI for a hero
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    createSkillTreeUI(heroId, container) {
        this.selectedHero = heroId;
        
        // Clear container
        container.innerHTML = '';
        
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return;
        
        // Get hero's skill tree
        const skillTree = this.skillTreeSystem.getSkillTree(hero.type);
        if (!skillTree) {
            container.innerHTML = '<div class="no-skill-tree">No skill tree available for this hero type</div>';
            return;
        }
        
        // Create skill tree container
        const skillTreeContainer = document.createElement('div');
        skillTreeContainer.className = 'hero-skill-tree-container';
        
        // Add header with hero info and skill points
        const skillPoints = this.skillTreeSystem.getHeroSkillPoints(heroId);
        const header = document.createElement('div');
        header.className = 'skill-tree-header';
        header.innerHTML = `
            <div class="hero-info">
                <div class="hero-portrait">${hero.portrait}</div>
                <div class="hero-details">
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-type">${skillTree.name} (Level ${hero.level})</div>
                </div>
            </div>
            <div class="skill-points">
                <div class="skill-points-label">Skill Points:</div>
                <div class="skill-points-value">${skillPoints}</div>
            </div>
        `;
        
        skillTreeContainer.appendChild(header);
        
        // Create branch tabs
        const branchTabs = document.createElement('div');
        branchTabs.className = 'skill-tree-branch-tabs';
        
        // Set default selected branch
        if (!this.selectedBranch || !skillTree.branches[this.selectedBranch]) {
            this.selectedBranch = Object.keys(skillTree.branches)[0];
        }
        
        // Add tabs for each branch
        for (const branchKey in skillTree.branches) {
            const branch = skillTree.branches[branchKey];
            const tab = document.createElement('div');
            tab.className = 'branch-tab';
            tab.dataset.branch = branchKey;
            
            if (branchKey === this.selectedBranch) {
                tab.classList.add('active');
            }
            
            tab.innerHTML = `
                <div class="branch-name">${branch.name}</div>
            `;
            
            tab.addEventListener('click', () => {
                // Update selected branch
                this.selectedBranch = branchKey;
                
                // Update UI
                this.createSkillTreeUI(heroId, container);
            });
            
            branchTabs.appendChild(tab);
        }
        
        skillTreeContainer.appendChild(branchTabs);
        
        // Create skills container
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'skills-container';
        
        // Get selected branch
        const selectedBranch = skillTree.branches[this.selectedBranch];
        
        // Add branch description
        const branchDescription = document.createElement('div');
        branchDescription.className = 'branch-description';
        branchDescription.textContent = selectedBranch.description;
        skillsContainer.appendChild(branchDescription);
        
        // Get hero's learned skills
        const learnedSkills = this.skillTreeSystem.getHeroSkills(heroId);
        
        // Create skill tree
        const skillTreeElement = document.createElement('div');
        skillTreeElement.className = 'skill-tree';
        
        // Add skills
        for (const skill of selectedBranch.skills) {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill';
            skillElement.dataset.skillId = skill.id;
            
            // Get current skill level
            const currentLevel = learnedSkills[skill.id] || 0;
            
            // Check if skill can be learned
            const canLearn = this.skillTreeSystem.canLearnSkill(heroId, skill.id);
            
            // Set skill status classes
            if (currentLevel > 0) {
                skillElement.classList.add('learned');
                skillElement.classList.add(`level-${currentLevel}`);
            }
            
            if (canLearn.success) {
                skillElement.classList.add('can-learn');
            }
            
            // Create skill content
            skillElement.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-info">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-level">${currentLevel > 0 ? `Level ${currentLevel}/${skill.maxLevel}` : 'Not Learned'}</div>
                    <div class="skill-type">${skill.type === 'active' ? 'Active' : 'Passive'}</div>
                    <div class="skill-description">${skill.description}</div>
                    ${currentLevel > 0 ? `<div class="skill-effect">Current: ${skill.effects.find(e => e.level === currentLevel).description}</div>` : ''}
                    ${canLearn.success ? `<div class="skill-next-effect">Next: ${skill.effects.find(e => e.level === currentLevel + 1).description}</div>` : ''}
                </div>
                <div class="skill-actions">
                    ${canLearn.success ? `<button class="learn-skill-button" data-skill-id="${skill.id}">Learn</button>` : ''}
                    ${!canLearn.success && currentLevel === 0 ? `<div class="skill-requirements">${canLearn.message}</div>` : ''}
                    ${currentLevel > 0 && currentLevel < skill.maxLevel && !canLearn.success ? `<div class="skill-requirements">${canLearn.message}</div>` : ''}
                    ${currentLevel === skill.maxLevel ? '<div class="skill-max-level">Max Level</div>' : ''}
                </div>
            `;
            
            // Add skill to tree
            skillTreeElement.appendChild(skillElement);
            
            // Add event listener for learn button
            if (canLearn.success) {
                const learnButton = skillElement.querySelector('.learn-skill-button');
                learnButton.addEventListener('click', () => {
                    this.learnSkill(heroId, skill.id, container);
                });
            }
        }
        
        skillsContainer.appendChild(skillTreeElement);
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.className = 'reset-skills-button';
        resetButton.textContent = 'Reset Skills';
        resetButton.addEventListener('click', () => {
            this.resetSkills(heroId, container);
        });
        
        skillsContainer.appendChild(resetButton);
        
        skillTreeContainer.appendChild(skillsContainer);
        container.appendChild(skillTreeContainer);
    }
    
    /**
     * Learn a skill for a hero
     * @param {string} heroId - The hero ID
     * @param {string} skillId - The skill ID
     * @param {HTMLElement} container - The container element
     */
    learnSkill(heroId, skillId, container) {
        const result = this.skillTreeSystem.learnSkill(heroId, skillId);
        
        // Show result message
        this.showMessage(result.message, result.success ? 'success' : 'error');
        
        // Update UI
        this.createSkillTreeUI(heroId, container);
    }
    
    /**
     * Reset skills for a hero
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    resetSkills(heroId, container) {
        // Confirm reset
        if (!confirm('Are you sure you want to reset all skills? This cannot be undone.')) {
            return;
        }
        
        const result = this.skillTreeSystem.resetSkills(heroId);
        
        // Show result message
        this.showMessage(result.message, result.success ? 'success' : 'error');
        
        // Update UI
        this.createSkillTreeUI(heroId, container);
    }
    
    /**
     * Show a message to the user
     * @param {string} message - The message to show
     * @param {string} type - The message type (success, error, info)
     */
    showMessage(message, type = 'info') {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // Add to document
        document.body.appendChild(messageElement);
        
        // Remove after a delay
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 500);
        }, 3000);
    }
}

// Export the HeroSkillTreeUI class
if (typeof module !== 'undefined') {
    module.exports = { HeroSkillTreeUI };
}
