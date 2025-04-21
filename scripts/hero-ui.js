/**
 * Hero UI Components for Pixel Empires
 * Handles the UI for hero management, recruitment, and details
 */
class HeroUI {
    /**
     * Initialize the hero UI
     * @param {GameState} gameState - The game state
     * @param {HeroManager} heroManager - The hero manager
     */
    constructor(gameState, heroManager) {
        this.gameState = gameState;
        this.heroManager = heroManager;
        this.selectedHero = null;
        this.selectedTab = 'active'; // active, available, details

        // Create UI elements
        this.createHeroUI();
    }

    /**
     * Create the hero UI elements
     */
    createHeroUI() {
        // Create hero section
        const gameContainer = document.getElementById('game-container');

        // Check if hero section already exists
        let heroSection = document.getElementById('hero-section');

        if (!heroSection) {
            // Create hero section
            heroSection = document.createElement('div');
            heroSection.id = 'hero-section';
            heroSection.className = 'game-section';

            // Add header
            const header = document.createElement('div');
            header.className = 'section-header';
            header.innerHTML = '<h3>Heroes</h3>';
            heroSection.appendChild(header);

            // Add tabs
            const tabs = document.createElement('div');
            tabs.className = 'hero-tabs';
            tabs.innerHTML = `
                <button id="active-heroes-tab" class="hero-tab active">Active Heroes</button>
                <button id="available-heroes-tab" class="hero-tab">Recruit Heroes</button>
            `;
            heroSection.appendChild(tabs);

            // Add content container
            const content = document.createElement('div');
            content.id = 'hero-content';
            content.className = 'hero-content';
            heroSection.appendChild(content);

            // Add to game container
            const empireSection = document.getElementById('empire-section');
            if (empireSection) {
                gameContainer.insertBefore(heroSection, empireSection);
            } else {
                gameContainer.appendChild(heroSection);
            }

            // Add event listeners for tabs
            document.getElementById('active-heroes-tab').addEventListener('click', () => this.switchTab('active'));
            document.getElementById('available-heroes-tab').addEventListener('click', () => this.switchTab('available'));
        }

        // Initial update
        this.updateHeroUI();
    }

    /**
     * Switch between hero tabs
     * @param {string} tab - Tab to switch to (active, available, details)
     */
    switchTab(tab) {
        this.selectedTab = tab;

        // Update tab buttons
        const tabs = document.querySelectorAll('.hero-tab');
        tabs.forEach(tabEl => tabEl.classList.remove('active'));

        if (tab === 'active') {
            document.getElementById('active-heroes-tab').classList.add('active');
        } else if (tab === 'available') {
            document.getElementById('available-heroes-tab').classList.add('active');
        }

        // Update content
        this.updateHeroUI();
    }

    /**
     * Update the hero UI based on the selected tab
     */
    updateHeroUI() {
        const contentContainer = document.getElementById('hero-content');

        if (!contentContainer) return;

        // Clear content
        contentContainer.innerHTML = '';

        // Render based on selected tab
        switch (this.selectedTab) {
            case 'active':
                this.renderActiveHeroes(contentContainer);
                break;

            case 'available':
                this.renderAvailableHeroes(contentContainer);
                break;

            case 'details':
                this.renderHeroDetails(contentContainer);
                break;
        }
    }

    /**
     * Render active heroes
     * @param {HTMLElement} container - Container element
     */
    renderActiveHeroes(container) {
        const heroes = this.heroManager.getActiveHeroes();

        if (heroes.length === 0) {
            container.innerHTML = `
                <div class="hero-empty-state">
                    <p>You don't have any heroes yet.</p>
                    <p>Go to the Recruit Heroes tab to recruit your first hero!</p>
                </div>
            `;
            return;
        }

        // Create hero list
        const heroList = document.createElement('div');
        heroList.className = 'hero-list';

        // Add each hero
        heroes.forEach(hero => {
            const heroType = this.heroManager.heroTypes[hero.type];
            const heroCard = document.createElement('div');
            heroCard.className = `hero-card ${hero.status}`;
            heroCard.dataset.heroId = hero.id;

            // Calculate total stats
            const totalStats = this.heroManager.calculateHeroTotalStats(hero.id);

            // Create hero card content
            heroCard.innerHTML = `
                <div class="hero-portrait">${hero.portrait || heroType.portrait}</div>
                <div class="hero-info">
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-type">${heroType.name} (Lvl ${hero.level})</div>
                    <div class="hero-status ${hero.status}">${this.capitalizeFirstLetter(hero.status)}</div>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat"><span class="stat-icon">⚔️</span> ${totalStats.attack}</div>
                    <div class="hero-stat"><span class="stat-icon">🛡️</span> ${totalStats.defense}</div>
                    <div class="hero-stat"><span class="stat-icon">❤️</span> ${totalStats.hp}</div>
                </div>
                <div class="hero-actions">
                    <button class="hero-action-btn view-hero" data-hero-id="${hero.id}">View</button>
                    <button class="hero-action-btn assign-hero" data-hero-id="${hero.id}" ${hero.status !== 'active' ? 'disabled' : ''}>Assign</button>
                </div>
            `;

            heroList.appendChild(heroCard);
        });

        container.appendChild(heroList);

        // Add event listeners
        const viewButtons = container.querySelectorAll('.view-hero');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                this.selectedHero = this.heroManager.getHeroById(heroId);
                this.switchTab('details');
            });
        });

        const assignButtons = container.querySelectorAll('.assign-hero');
        assignButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                this.openAssignHeroDialog(heroId);
            });
        });
    }

    /**
     * Render available heroes for recruitment
     * @param {HTMLElement} container - Container element
     */
    renderAvailableHeroes(container) {
        const heroes = this.heroManager.getAvailableHeroes();

        if (heroes.length === 0) {
            container.innerHTML = `
                <div class="hero-empty-state">
                    <p>No heroes available for recruitment at the moment.</p>
                    <p>Check back later!</p>
                </div>
            `;
            return;
        }

        // Create hero list
        const heroList = document.createElement('div');
        heroList.className = 'hero-list available-heroes';

        // Add each hero
        heroes.forEach(hero => {
            const heroType = this.heroManager.heroTypes[hero.type];
            const heroCard = document.createElement('div');
            heroCard.className = 'hero-card available';
            heroCard.dataset.heroId = hero.id;

            // Check if we have enough resources
            const canRecruit = this.gameState.resources.FOOD >= hero.recruitCost.FOOD &&
                              this.gameState.resources.ORE >= hero.recruitCost.ORE;

            // Create hero card content
            heroCard.innerHTML = `
                <div class="hero-portrait">${hero.portrait || heroType.portrait}</div>
                <div class="hero-info">
                    <div class="hero-name">${hero.name}</div>
                    <div class="hero-type">${heroType.name} (Lvl ${hero.level})</div>
                    <div class="hero-traits">${hero.traits.map(t => t.name).join(', ')}</div>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat"><span class="stat-icon">⚔️</span> ${hero.stats.attack}</div>
                    <div class="hero-stat"><span class="stat-icon">🛡️</span> ${hero.stats.defense}</div>
                    <div class="hero-stat"><span class="stat-icon">❤️</span> ${hero.stats.hp}</div>
                </div>
                <div class="hero-cost">
                    <div class="cost-item ${this.gameState.resources.FOOD < hero.recruitCost.FOOD ? 'insufficient' : ''}">
                        <span class="resource-icon">🌾</span> ${hero.recruitCost.FOOD}
                    </div>
                    <div class="cost-item ${this.gameState.resources.ORE < hero.recruitCost.ORE ? 'insufficient' : ''}">
                        <span class="resource-icon">⛏️</span> ${hero.recruitCost.ORE}
                    </div>
                </div>
                <div class="hero-actions">
                    <button class="hero-action-btn recruit-hero" data-hero-id="${hero.id}" ${!canRecruit ? 'disabled' : ''}>
                        ${canRecruit ? 'Recruit' : 'Not Enough Resources'}
                    </button>
                </div>
            `;

            heroList.appendChild(heroCard);
        });

        container.appendChild(heroList);

        // Add event listeners
        const recruitButtons = container.querySelectorAll('.recruit-hero');
        recruitButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const heroId = e.target.dataset.heroId;
                this.recruitHero(heroId);
            });
        });
    }

    /**
     * Render hero details
     * @param {HTMLElement} container - Container element
     */
    renderHeroDetails(container) {
        if (!this.selectedHero) {
            this.switchTab('active');
            return;
        }

        const hero = this.selectedHero;
        const heroType = this.heroManager.heroTypes[hero.type];

        // Calculate total stats
        const totalStats = this.heroManager.calculateHeroTotalStats(hero.id);

        // Create back button
        const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.innerHTML = '← Back to Heroes';
        backButton.addEventListener('click', () => this.switchTab('active'));
        container.appendChild(backButton);

        // Create hero details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'hero-details-container';

        // Hero header
        const heroHeader = document.createElement('div');
        heroHeader.className = 'hero-details-header';
        heroHeader.innerHTML = `
            <div class="hero-portrait large">${hero.portrait || heroType.portrait}</div>
            <div class="hero-header-info">
                <h3 class="hero-name">${hero.name}</h3>
                <div class="hero-type">${heroType.name} (Level ${hero.level})</div>
                <div class="hero-status ${hero.status}">${this.capitalizeFirstLetter(hero.status)}</div>
                <div class="hero-exp-bar">
                    <div class="exp-fill" style="width: ${(hero.experience / hero.experienceToNextLevel) * 100}%"></div>
                    <div class="exp-text">XP: ${hero.experience} / ${hero.experienceToNextLevel}</div>
                </div>
            </div>
        `;
        detailsContainer.appendChild(heroHeader);

        // Create hero detail tabs
        const detailTabs = document.createElement('div');
        detailTabs.className = 'hero-detail-tabs';

        // Define tabs
        const tabs = [
            { id: 'stats', name: 'Stats & Abilities', active: true },
            { id: 'equipment', name: 'Equipment' },
            { id: 'skills', name: 'Skill Tree' },
            { id: 'quests', name: 'Quests' }
        ];

        // Create tab buttons
        tabs.forEach(tab => {
            const tabButton = document.createElement('button');
            tabButton.className = `detail-tab-button ${tab.active ? 'active' : ''}`;
            tabButton.dataset.tab = tab.id;
            tabButton.textContent = tab.name;
            tabButton.addEventListener('click', () => this.switchDetailTab(hero.id, tab.id, detailsContainer));
            detailTabs.appendChild(tabButton);
        });

        detailsContainer.appendChild(detailTabs);

        // Create tab content container
        const tabContent = document.createElement('div');
        tabContent.className = 'detail-tab-content';
        tabContent.id = 'detail-tab-content';
        detailsContainer.appendChild(tabContent);

        // Hero stats
        const statsContainer = document.createElement('div');
        statsContainer.className = 'hero-stats-container';

        // Create stat items
        const statItems = [
            { name: 'Attack', icon: '⚔️', value: totalStats.attack, base: hero.stats.attack },
            { name: 'Defense', icon: '🛡️', value: totalStats.defense, base: hero.stats.defense },
            { name: 'HP', icon: '❤️', value: totalStats.hp, base: hero.stats.hp },
            { name: 'Speed', icon: '⚡', value: totalStats.speed, base: hero.stats.speed },
            { name: 'Leadership', icon: '👑', value: totalStats.leadership, base: hero.stats.leadership }
        ];

        // Add magic stat if hero has it
        if (hero.stats.magic !== undefined) {
            statItems.push({ name: 'Magic', icon: '✨', value: totalStats.magic, base: hero.stats.magic });
        }

        // Add diplomacy stat if hero has it
        if (hero.stats.diplomacy !== undefined) {
            statItems.push({ name: 'Diplomacy', icon: '🤝', value: totalStats.diplomacy, base: hero.stats.diplomacy });
        }

        // Create stat elements
        statItems.forEach(stat => {
            const statEl = document.createElement('div');
            statEl.className = 'hero-detail-stat';

            // Calculate bonus
            const bonus = stat.value - stat.base;
            const bonusText = bonus !== 0 ? `(${bonus > 0 ? '+' : ''}${bonus})` : '';

            statEl.innerHTML = `
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-name">${stat.name}</div>
                <div class="stat-value">${stat.value} <span class="stat-bonus">${bonusText}</span></div>
            `;

            statsContainer.appendChild(statEl);
        });

        detailsContainer.appendChild(statsContainer);

        // Hero traits
        if (hero.traits && hero.traits.length > 0) {
            const traitsContainer = document.createElement('div');
            traitsContainer.className = 'hero-traits-container';
            traitsContainer.innerHTML = '<h4>Traits</h4>';

            const traitsList = document.createElement('div');
            traitsList.className = 'traits-list';

            hero.traits.forEach(trait => {
                const traitEl = document.createElement('div');
                traitEl.className = 'hero-trait';
                traitEl.innerHTML = `
                    <div class="trait-name">${trait.name}</div>
                    <div class="trait-description">${trait.description}</div>
                `;
                traitsList.appendChild(traitEl);
            });

            traitsContainer.appendChild(traitsList);
            detailsContainer.appendChild(traitsContainer);
        }

        // Hero abilities
        if (hero.abilities && hero.abilities.length > 0) {
            const abilitiesContainer = document.createElement('div');
            abilitiesContainer.className = 'hero-abilities-container';
            abilitiesContainer.innerHTML = '<h4>Abilities</h4>';

            const abilitiesList = document.createElement('div');
            abilitiesList.className = 'abilities-list';

            hero.abilities.forEach(abilityId => {
                const ability = this.heroManager.heroAbilities[abilityId];
                if (!ability) return;

                const abilityEl = document.createElement('div');
                abilityEl.className = 'hero-ability';
                abilityEl.innerHTML = `
                    <div class="ability-icon">${ability.icon || '✨'}</div>
                    <div class="ability-info">
                        <div class="ability-name">${ability.name}</div>
                        <div class="ability-description">${ability.description}</div>
                        <div class="ability-stats">
                            <span class="ability-type">${this.capitalizeFirstLetter(ability.type)}</span>
                            <span class="ability-cooldown">Cooldown: ${ability.cooldown}s</span>
                        </div>
                    </div>
                `;
                abilitiesList.appendChild(abilityEl);
            });

            abilitiesContainer.appendChild(abilitiesList);
            detailsContainer.appendChild(abilitiesContainer);
        }

        // Hero equipment
        const equipmentContainer = document.createElement('div');
        equipmentContainer.className = 'hero-equipment-container';
        equipmentContainer.innerHTML = '<h4>Equipment</h4>';

        const equipmentSlots = document.createElement('div');
        equipmentSlots.className = 'equipment-slots';

        // Equipment slots
        const slots = [
            { id: 'weapon', name: 'Weapon', icon: '⚔️' },
            { id: 'armor', name: 'Armor', icon: '🛡️' },
            { id: 'accessory', name: 'Accessory', icon: '💍' }
        ];

        slots.forEach(slot => {
            const slotEl = document.createElement('div');
            slotEl.className = 'equipment-slot';

            const equippedItem = hero.equipment[slot.id];

            if (equippedItem) {
                slotEl.innerHTML = `
                    <div class="slot-icon">${equippedItem.icon || slot.icon}</div>
                    <div class="slot-info">
                        <div class="slot-name">${equippedItem.name}</div>
                        <div class="slot-description">${equippedItem.description}</div>
                    </div>
                    <button class="unequip-btn" data-slot="${slot.id}">Unequip</button>
                `;
            } else {
                slotEl.innerHTML = `
                    <div class="slot-icon empty">${slot.icon}</div>
                    <div class="slot-info">
                        <div class="slot-name">${slot.name}</div>
                        <div class="slot-description">No item equipped</div>
                    </div>
                    <button class="equip-btn" data-slot="${slot.id}" ${hero.inventory.length === 0 ? 'disabled' : ''}>Equip</button>
                `;
            }

            equipmentSlots.appendChild(slotEl);
        });

        equipmentContainer.appendChild(equipmentSlots);
        detailsContainer.appendChild(equipmentContainer);

        // Hero inventory
        const inventoryContainer = document.createElement('div');
        inventoryContainer.className = 'hero-inventory-container';
        inventoryContainer.innerHTML = '<h4>Inventory</h4>';

        if (hero.inventory.length === 0) {
            inventoryContainer.innerHTML += '<div class="empty-inventory">No items in inventory</div>';
        } else {
            const inventoryList = document.createElement('div');
            inventoryList.className = 'inventory-list';

            hero.inventory.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = `inventory-item ${item.rarity}`;
                itemEl.innerHTML = `
                    <div class="item-icon">${item.icon || '📦'}</div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-description">${item.description}</div>
                    </div>
                    <button class="equip-item-btn" data-item-id="${item.id}">Equip</button>
                `;
                inventoryList.appendChild(itemEl);
            });

            inventoryContainer.appendChild(inventoryList);
        }

        detailsContainer.appendChild(inventoryContainer);

        // Hero actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'hero-actions-container';

        // Dismiss hero button
        const dismissButton = document.createElement('button');
        dismissButton.className = 'dismiss-hero-btn';
        dismissButton.innerHTML = 'Dismiss Hero';
        dismissButton.addEventListener('click', () => this.confirmDismissHero(hero.id));

        actionsContainer.appendChild(dismissButton);
        detailsContainer.appendChild(actionsContainer);

        container.appendChild(detailsContainer);

        // Show default tab (stats)
        this.switchDetailTab(hero.id, 'stats', detailsContainer);
    }

    /**
     * Switch between hero detail tabs
     * @param {string} heroId - The hero ID
     * @param {string} tabId - The tab ID to switch to
     * @param {HTMLElement} container - The container element
     */
    switchDetailTab(heroId, tabId, container) {
        // Update tab buttons
        const tabButtons = container.querySelectorAll('.detail-tab-button');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });

        // Get tab content container
        const tabContent = container.querySelector('#detail-tab-content');
        if (!tabContent) return;

        // Clear tab content
        tabContent.innerHTML = '';

        // Render tab content based on selected tab
        switch (tabId) {
            case 'stats':
                this.renderHeroStats(heroId, tabContent);
                break;

            case 'equipment':
                this.renderHeroEquipment(heroId, tabContent);
                break;

            case 'skills':
                this.renderHeroSkills(heroId, tabContent);
                break;

            case 'quests':
                this.renderHeroQuests(heroId, tabContent);
                break;
        }
    }

    /**
     * Render hero stats and abilities
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    renderHeroStats(heroId, container) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return;

        const heroType = this.heroManager.heroTypes[hero.type];

        // Calculate total stats
        const totalStats = this.heroManager.calculateHeroTotalStats(heroId);

        // Hero stats
        const statsContainer = document.createElement('div');
        statsContainer.className = 'hero-stats-container';
        statsContainer.innerHTML = '<h4>Hero Stats</h4>';

        // Create stat items
        const statItems = [
            { name: 'Attack', icon: '⚔️', value: totalStats.attack, base: hero.stats.attack },
            { name: 'Defense', icon: '🛡️', value: totalStats.defense, base: hero.stats.defense },
            { name: 'Health', icon: '❤️', value: totalStats.hp, base: hero.stats.hp },
            { name: 'Speed', icon: '⚡', value: totalStats.speed, base: hero.stats.speed },
            { name: 'Leadership', icon: '👑', value: totalStats.leadership, base: hero.stats.leadership }
        ];

        // Add magic stat if hero has it
        if (hero.stats.magic !== undefined) {
            statItems.push({ name: 'Magic', icon: '✨', value: totalStats.magic, base: hero.stats.magic });
        }

        // Add diplomacy stat if hero has it
        if (hero.stats.diplomacy !== undefined) {
            statItems.push({ name: 'Diplomacy', icon: '🤝', value: totalStats.diplomacy, base: hero.stats.diplomacy });
        }

        // Create stat elements
        statItems.forEach(stat => {
            const statEl = document.createElement('div');
            statEl.className = 'hero-detail-stat';

            // Calculate bonus
            const bonus = stat.value - stat.base;
            const bonusText = bonus !== 0 ? `(${bonus > 0 ? '+' : ''}${bonus})` : '';

            statEl.innerHTML = `
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-name">${stat.name}</div>
                <div class="stat-value">${stat.value} <span class="stat-bonus">${bonusText}</span></div>
            `;

            statsContainer.appendChild(statEl);
        });

        container.appendChild(statsContainer);

        // Hero traits
        if (hero.traits && hero.traits.length > 0) {
            const traitsContainer = document.createElement('div');
            traitsContainer.className = 'hero-traits-container';
            traitsContainer.innerHTML = '<h4>Traits</h4>';

            const traitsList = document.createElement('div');
            traitsList.className = 'traits-list';

            hero.traits.forEach(trait => {
                const traitEl = document.createElement('div');
                traitEl.className = `hero-trait ${trait.type || ''}`;
                traitEl.innerHTML = `
                    <div class="trait-icon">${trait.icon || '🔮'}</div>
                    <div class="trait-info">
                        <div class="trait-name">${trait.name}</div>
                        <div class="trait-description">${trait.description}</div>
                    </div>
                `;
                traitsList.appendChild(traitEl);
            });

            traitsContainer.appendChild(traitsList);
            container.appendChild(traitsContainer);
        }

        // Hero abilities
        if (hero.abilities && hero.abilities.length > 0) {
            const abilitiesContainer = document.createElement('div');
            abilitiesContainer.className = 'hero-abilities-container';
            abilitiesContainer.innerHTML = '<h4>Abilities</h4>';

            const abilitiesList = document.createElement('div');
            abilitiesList.className = 'abilities-list';

            hero.abilities.forEach(abilityId => {
                const ability = this.heroManager.heroAbilities[abilityId];
                if (!ability) return;

                const abilityEl = document.createElement('div');
                abilityEl.className = 'hero-ability';
                abilityEl.innerHTML = `
                    <div class="ability-icon">${ability.icon || '✨'}</div>
                    <div class="ability-info">
                        <div class="ability-name">${ability.name}</div>
                        <div class="ability-description">${ability.description}</div>
                        <div class="ability-stats">
                            <span class="ability-type">${this.capitalizeFirstLetter(ability.type)}</span>
                            <span class="ability-cooldown">Cooldown: ${ability.cooldown}s</span>
                        </div>
                    </div>
                `;
                abilitiesList.appendChild(abilityEl);
            });

            abilitiesContainer.appendChild(abilitiesList);
            container.appendChild(abilitiesContainer);
        }

        // Hero actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'hero-actions-container';

        // Dismiss hero button
        const dismissButton = document.createElement('button');
        dismissButton.className = 'dismiss-hero-btn';
        dismissButton.innerHTML = 'Dismiss Hero';
        dismissButton.addEventListener('click', () => this.confirmDismissHero(hero.id));

        actionsContainer.appendChild(dismissButton);
        container.appendChild(actionsContainer);
    }

    /**
     * Render hero equipment
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    renderHeroEquipment(heroId, container) {
        const hero = this.heroManager.getHeroById(heroId);
        if (!hero) return;

        // Hero equipment
        const equipmentContainer = document.createElement('div');
        equipmentContainer.className = 'hero-equipment-container';
        equipmentContainer.innerHTML = '<h4>Equipment</h4>';

        const equipmentSlots = document.createElement('div');
        equipmentSlots.className = 'equipment-slots';

        // Equipment slots
        const slots = [
            { id: 'weapon', name: 'Weapon', icon: '⚔️' },
            { id: 'armor', name: 'Armor', icon: '🛡️' },
            { id: 'accessory', name: 'Accessory', icon: '💍' }
        ];

        slots.forEach(slot => {
            const slotEl = document.createElement('div');
            slotEl.className = 'equipment-slot';

            const equippedItem = hero.equipment[slot.id];

            if (equippedItem) {
                slotEl.innerHTML = `
                    <div class="slot-icon">${equippedItem.icon || slot.icon}</div>
                    <div class="slot-info">
                        <div class="slot-name">${equippedItem.name}</div>
                        <div class="slot-description">${equippedItem.description}</div>
                    </div>
                    <button class="unequip-btn" data-slot="${slot.id}">Unequip</button>
                `;
            } else {
                slotEl.innerHTML = `
                    <div class="slot-icon empty">${slot.icon}</div>
                    <div class="slot-info">
                        <div class="slot-name">${slot.name}</div>
                        <div class="slot-description">No item equipped</div>
                    </div>
                    <button class="equip-btn" data-slot="${slot.id}" ${hero.inventory.length === 0 ? 'disabled' : ''}>Equip</button>
                `;
            }

            equipmentSlots.appendChild(slotEl);
        });

        equipmentContainer.appendChild(equipmentSlots);
        container.appendChild(equipmentContainer);

        // Hero inventory
        const inventoryContainer = document.createElement('div');
        inventoryContainer.className = 'hero-inventory-container';
        inventoryContainer.innerHTML = '<h4>Inventory</h4>';

        if (hero.inventory.length === 0) {
            inventoryContainer.innerHTML += '<div class="empty-inventory">No items in inventory</div>';
        } else {
            const inventoryList = document.createElement('div');
            inventoryList.className = 'inventory-list';

            hero.inventory.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = `inventory-item ${item.rarity}`;
                itemEl.innerHTML = `
                    <div class="item-icon">${item.icon || '📦'}</div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-description">${item.description}</div>
                    </div>
                    <button class="equip-item-btn" data-item-id="${item.id}">Equip</button>
                `;
                inventoryList.appendChild(itemEl);
            });

            inventoryContainer.appendChild(inventoryList);
        }

        container.appendChild(inventoryContainer);

        // Add event listeners for equipment
        const unequipButtons = container.querySelectorAll('.unequip-btn');
        unequipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const slot = e.target.dataset.slot;
                this.heroManager.unequipItem(heroId, slot);
                this.renderHeroEquipment(heroId, container);
            });
        });

        const equipButtons = container.querySelectorAll('.equip-btn');
        equipButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const slot = e.target.dataset.slot;
                this.openEquipItemDialog(heroId, slot);
                this.renderHeroEquipment(heroId, container);
            });
        });

        const equipItemButtons = container.querySelectorAll('.equip-item-btn');
        equipItemButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.target.dataset.itemId;
                const item = hero.inventory.find(i => i.id === itemId);
                if (item) {
                    this.heroManager.equipItem(heroId, itemId, item.type);
                    this.renderHeroEquipment(heroId, container);
                }
            });
        });

        // If equipment sets system is available, add sets UI
        if (this.gameState.heroEquipmentSetsSystem) {
            const setsContainer = document.createElement('div');
            setsContainer.className = 'equipment-sets-container';
            container.appendChild(setsContainer);

            this.gameState.heroEquipmentSetsSystem.createEquipmentSetsUI(heroId, setsContainer);
        }
    }

    /**
     * Render hero skills
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    renderHeroSkills(heroId, container) {
        // Check if skill tree system is available
        if (!this.gameState.heroSkillTreeSystem) {
            container.innerHTML = '<div class="no-skill-tree-system">Skill tree system not available</div>';
            return;
        }

        // Create skill tree UI
        if (this.gameState.heroSkillTreeUI) {
            this.gameState.heroSkillTreeUI.createSkillTreeUI(heroId, container);
        } else {
            // Create a temporary skill tree UI
            const skillTreeUI = new HeroSkillTreeUI(
                this.gameState,
                this.heroManager,
                this.gameState.heroSkillTreeSystem
            );

            skillTreeUI.createSkillTreeUI(heroId, container);
        }
    }

    /**
     * Render hero quests
     * @param {string} heroId - The hero ID
     * @param {HTMLElement} container - The container element
     */
    renderHeroQuests(heroId, container) {
        // Check if quest system is available
        if (!this.gameState.heroQuestSystem) {
            container.innerHTML = '<div class="no-quest-system">Quest system not available</div>';
            return;
        }

        // Create quest UI
        if (this.gameState.heroQuestUI) {
            this.gameState.heroQuestUI.createQuestUI(heroId, container);
        } else {
            // Create a temporary quest UI
            const questUI = new HeroQuestUI(
                this.gameState,
                this.heroManager,
                this.gameState.heroQuestSystem
            );

            questUI.createQuestUI(heroId, container);
        }
    }

    /**
     * Open dialog to assign hero to a location
     * @param {string} heroId - ID of the hero to assign
     */
    openAssignHeroDialog(heroId) {
        // Implementation will depend on map integration
        console.log(`Assign hero ${heroId} to location`);

        // For now, just show an alert
        alert('Hero assignment will be implemented with map integration');
    }

    /**
     * Open dialog to equip an item
     * @param {string} heroId - ID of the hero
     * @param {string} slot - Equipment slot
     */
    openEquipItemDialog(heroId, slot) {
        const hero = this.heroManager.getHeroById(heroId);

        if (!hero) return;

        // Filter inventory for items that can be equipped in this slot
        const compatibleItems = hero.inventory.filter(item => item.type === slot);

        if (compatibleItems.length === 0) {
            alert(`No items available for the ${slot} slot`);
            return;
        }

        // For now, just equip the first compatible item
        this.heroManager.equipItem(heroId, compatibleItems[0].id, slot);
        this.updateHeroUI();
    }

    /**
     * Confirm dismissing a hero
     * @param {string} heroId - ID of the hero to dismiss
     */
    confirmDismissHero(heroId) {
        const hero = this.heroManager.getHeroById(heroId);

        if (!hero) return;

        if (confirm(`Are you sure you want to dismiss ${hero.name}? This action cannot be undone.`)) {
            this.heroManager.dismissHero(heroId);
            this.selectedHero = null;
            this.switchTab('active');
        }
    }

    /**
     * Recruit a hero
     * @param {string} heroId - ID of the hero to recruit
     */
    recruitHero(heroId) {
        const success = this.heroManager.recruitHero(heroId);

        if (success) {
            this.updateHeroUI();
        }
    }

    /**
     * Capitalize the first letter of a string
     * @param {string} string - String to capitalize
     * @returns {string} - Capitalized string
     */
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Export the HeroUI class
if (typeof module !== 'undefined') {
    module.exports = { HeroUI };
}
