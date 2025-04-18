/**
 * Trade System for Pixel Empires
 * Handles trading resources between players and with NPCs
 */
class TradeSystem {
    /**
     * Initialize the trade system
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.tradeOffers = []; // Active trade offers
        this.tradeHistory = []; // History of completed trades
        this.npcTraders = []; // NPC traders that can offer trades
        this.tradeRoutes = []; // Established trade routes
        
        // Trade rates for resources (base values)
        this.baseTradeRates = {
            FOOD: 1.0,
            ORE: 1.5,
            CRYSTAL: 3.0,
            ANCIENT_ARTIFACT: 5.0,
            RARE_METAL: 4.0,
            ANCIENT_KNOWLEDGE: 6.0
        };
        
        // Initialize NPC traders
        this.initializeNPCTraders();
    }
    
    /**
     * Initialize NPC traders
     */
    initializeNPCTraders() {
        this.npcTraders = [
            {
                id: 'merchant_guild',
                name: 'Merchant Guild',
                description: 'A well-established trading organization with fair prices.',
                specialties: ['FOOD', 'ORE'],
                tradeBonus: 0.1, // 10% better rates
                relationshipLevel: 50, // Neutral starting relationship (0-100)
                availableTrades: []
            },
            {
                id: 'exotic_caravan',
                name: 'Exotic Caravan',
                description: 'Travelers from distant lands offering rare goods at premium prices.',
                specialties: ['CRYSTAL', 'ANCIENT_ARTIFACT'],
                tradeBonus: -0.1, // 10% worse rates but access to rare resources
                relationshipLevel: 40,
                availableTrades: []
            },
            {
                id: 'dwarven_traders',
                name: 'Dwarven Traders',
                description: 'Expert miners offering excellent rates for ore and metals.',
                specialties: ['ORE', 'RARE_METAL'],
                tradeBonus: 0.2, // 20% better rates for their specialties
                relationshipLevel: 45,
                availableTrades: []
            }
        ];
        
        // Generate initial trade offers for each NPC
        this.generateNPCTradeOffers();
    }
    
    /**
     * Generate trade offers for NPC traders
     */
    generateNPCTradeOffers() {
        for (const trader of this.npcTraders) {
            trader.availableTrades = [];
            
            // Generate 2-4 trade offers per trader
            const numOffers = 2 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < numOffers; i++) {
                // Determine if this is a buy or sell offer from the NPC
                const isBuyOffer = Math.random() > 0.5;
                
                // Select resources for the trade
                let offerResource, requestResource;
                
                if (isBuyOffer) {
                    // NPC wants to buy (player sells)
                    offerResource = this.selectRandomResource(trader.specialties, false);
                    requestResource = this.selectRandomResource(trader.specialties, true);
                } else {
                    // NPC wants to sell (player buys)
                    offerResource = this.selectRandomResource(trader.specialties, true);
                    requestResource = this.selectRandomResource(trader.specialties, false);
                }
                
                // Determine quantities and apply trader's bonus
                const baseRate = this.baseTradeRates[offerResource] / this.baseTradeRates[requestResource];
                const adjustedRate = baseRate * (1 + trader.tradeBonus);
                
                let offerAmount, requestAmount;
                
                if (offerResource === 'FOOD' || requestResource === 'FOOD') {
                    // Food is traded in larger quantities
                    if (offerResource === 'FOOD') {
                        offerAmount = 50 + Math.floor(Math.random() * 150); // 50-200 food
                        requestAmount = Math.ceil(offerAmount / adjustedRate);
                    } else {
                        requestAmount = 50 + Math.floor(Math.random() * 150); // 50-200 food
                        offerAmount = Math.ceil(requestAmount * adjustedRate);
                    }
                } else {
                    // Other resources in smaller quantities
                    if (isBuyOffer) {
                        requestAmount = 10 + Math.floor(Math.random() * 40); // 10-50 units
                        offerAmount = Math.ceil(requestAmount * adjustedRate);
                    } else {
                        offerAmount = 10 + Math.floor(Math.random() * 40); // 10-50 units
                        requestAmount = Math.ceil(offerAmount / adjustedRate);
                    }
                }
                
                // Create the trade offer
                const tradeOffer = {
                    id: `${trader.id}_${Date.now()}_${i}`,
                    traderId: trader.id,
                    traderName: trader.name,
                    offerResource: offerResource,
                    offerAmount: offerAmount,
                    requestResource: requestResource,
                    requestAmount: requestAmount,
                    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                    isBuyOffer: isBuyOffer
                };
                
                trader.availableTrades.push(tradeOffer);
            }
        }
    }
    
    /**
     * Select a random resource, either from specialties or other resources
     * @param {Array} specialties - The trader's specialty resources
     * @param {boolean} useSpecialty - Whether to use a specialty resource
     * @returns {string} - The selected resource type
     */
    selectRandomResource(specialties, useSpecialty) {
        const allResources = Object.keys(this.baseTradeRates);
        
        if (useSpecialty && specialties.length > 0) {
            // Select from specialties
            return specialties[Math.floor(Math.random() * specialties.length)];
        } else {
            // Select from non-specialties
            const nonSpecialties = allResources.filter(r => !specialties.includes(r));
            return nonSpecialties[Math.floor(Math.random() * nonSpecialties.length)];
        }
    }
    
    /**
     * Create a trade offer to other players
     * @param {string} offerResource - The resource being offered
     * @param {number} offerAmount - The amount of resource being offered
     * @param {string} requestResource - The resource being requested
     * @param {number} requestAmount - The amount of resource being requested
     * @param {string} targetPlayerId - The ID of the target player (null for open offer)
     * @returns {Object} - The created trade offer
     */
    createTradeOffer(offerResource, offerAmount, requestResource, requestAmount, targetPlayerId = null) {
        // Check if player has enough resources
        if (this.gameState.resources[offerResource] < offerAmount) {
            console.log(`Not enough ${offerResource} to create trade offer`);
            return null;
        }
        
        // Create the trade offer
        const tradeOffer = {
            id: `player_${Date.now()}`,
            playerId: this.gameState.playerId,
            playerName: "Player", // In a real game, this would be the player's name
            offerResource: offerResource,
            offerAmount: offerAmount,
            requestResource: requestResource,
            requestAmount: requestAmount,
            targetPlayerId: targetPlayerId,
            createdAt: Date.now(),
            expiresAt: Date.now() + (48 * 60 * 60 * 1000), // 48 hours
            status: 'active'
        };
        
        // Reserve the resources (remove from player's stockpile)
        this.gameState.resources[offerResource] -= offerAmount;
        
        // Add to active trade offers
        this.tradeOffers.push(tradeOffer);
        
        // Log the action
        this.gameState.activityLogManager.addLogEntry(
            'Trade',
            `Created trade offer: ${offerAmount} ${offerResource} for ${requestAmount} ${requestResource}`
        );
        
        return tradeOffer;
    }
    
    /**
     * Accept a trade offer
     * @param {string} offerId - The ID of the trade offer
     * @returns {boolean} - Whether the trade was successful
     */
    acceptTradeOffer(offerId) {
        // Find the trade offer
        const offerIndex = this.tradeOffers.findIndex(offer => offer.id === offerId);
        
        if (offerIndex === -1) {
            console.log('Trade offer not found');
            return false;
        }
        
        const offer = this.tradeOffers[offerIndex];
        
        // Check if the offer is still active
        if (offer.status !== 'active' || Date.now() > offer.expiresAt) {
            console.log('Trade offer is no longer active');
            return false;
        }
        
        // Check if the player has enough resources
        if (this.gameState.resources[offer.requestResource] < offer.requestAmount) {
            console.log(`Not enough ${offer.requestResource} to accept trade offer`);
            return false;
        }
        
        // Process the trade
        this.gameState.resources[offer.requestResource] -= offer.requestAmount;
        this.gameState.resources[offer.offerResource] += offer.offerAmount;
        
        // Update the offer status
        offer.status = 'completed';
        offer.completedAt = Date.now();
        
        // Move to trade history
        this.tradeHistory.push(offer);
        this.tradeOffers.splice(offerIndex, 1);
        
        // Log the action
        this.gameState.activityLogManager.addLogEntry(
            'Trade',
            `Accepted trade offer: Received ${offer.offerAmount} ${offer.offerResource} for ${offer.requestAmount} ${offer.requestResource}`
        );
        
        return true;
    }
    
    /**
     * Accept an NPC trade offer
     * @param {string} traderId - The ID of the NPC trader
     * @param {string} offerId - The ID of the trade offer
     * @returns {boolean} - Whether the trade was successful
     */
    acceptNPCTradeOffer(traderId, offerId) {
        // Find the NPC trader
        const trader = this.npcTraders.find(t => t.id === traderId);
        
        if (!trader) {
            console.log('Trader not found');
            return false;
        }
        
        // Find the trade offer
        const offerIndex = trader.availableTrades.findIndex(offer => offer.id === offerId);
        
        if (offerIndex === -1) {
            console.log('Trade offer not found');
            return false;
        }
        
        const offer = trader.availableTrades[offerIndex];
        
        // Check if the offer is still active
        if (Date.now() > offer.expiresAt) {
            console.log('Trade offer has expired');
            return false;
        }
        
        // Check if the player has enough resources
        if (this.gameState.resources[offer.requestResource] < offer.requestAmount) {
            console.log(`Not enough ${offer.requestResource} to accept trade offer`);
            return false;
        }
        
        // Process the trade
        this.gameState.resources[offer.requestResource] -= offer.requestAmount;
        this.gameState.resources[offer.offerResource] += offer.offerAmount;
        
        // Improve relationship with the trader
        trader.relationshipLevel = Math.min(100, trader.relationshipLevel + 2);
        
        // Remove the offer and generate a new one
        trader.availableTrades.splice(offerIndex, 1);
        
        // Add to trade history
        this.tradeHistory.push({
            id: offer.id,
            traderId: trader.id,
            traderName: trader.name,
            offerResource: offer.offerResource,
            offerAmount: offer.offerAmount,
            requestResource: offer.requestResource,
            requestAmount: offer.requestAmount,
            completedAt: Date.now(),
            type: 'npc'
        });
        
        // Log the action
        this.gameState.activityLogManager.addLogEntry(
            'Trade',
            `Completed trade with ${trader.name}: Received ${offer.offerAmount} ${offer.offerResource} for ${offer.requestAmount} ${offer.requestResource}`
        );
        
        // Generate a new offer to replace the accepted one
        this.generateSingleNPCTradeOffer(trader);
        
        return true;
    }
    
    /**
     * Generate a single trade offer for an NPC trader
     * @param {Object} trader - The NPC trader
     */
    generateSingleNPCTradeOffer(trader) {
        // Determine if this is a buy or sell offer from the NPC
        const isBuyOffer = Math.random() > 0.5;
        
        // Select resources for the trade
        let offerResource, requestResource;
        
        if (isBuyOffer) {
            // NPC wants to buy (player sells)
            offerResource = this.selectRandomResource(trader.specialties, false);
            requestResource = this.selectRandomResource(trader.specialties, true);
        } else {
            // NPC wants to sell (player buys)
            offerResource = this.selectRandomResource(trader.specialties, true);
            requestResource = this.selectRandomResource(trader.specialties, false);
        }
        
        // Determine quantities and apply trader's bonus
        const baseRate = this.baseTradeRates[offerResource] / this.baseTradeRates[requestResource];
        const adjustedRate = baseRate * (1 + trader.tradeBonus);
        
        let offerAmount, requestAmount;
        
        if (offerResource === 'FOOD' || requestResource === 'FOOD') {
            // Food is traded in larger quantities
            if (offerResource === 'FOOD') {
                offerAmount = 50 + Math.floor(Math.random() * 150); // 50-200 food
                requestAmount = Math.ceil(offerAmount / adjustedRate);
            } else {
                requestAmount = 50 + Math.floor(Math.random() * 150); // 50-200 food
                offerAmount = Math.ceil(requestAmount * adjustedRate);
            }
        } else {
            // Other resources in smaller quantities
            if (isBuyOffer) {
                requestAmount = 10 + Math.floor(Math.random() * 40); // 10-50 units
                offerAmount = Math.ceil(requestAmount * adjustedRate);
            } else {
                offerAmount = 10 + Math.floor(Math.random() * 40); // 10-50 units
                requestAmount = Math.ceil(offerAmount / adjustedRate);
            }
        }
        
        // Create the trade offer
        const tradeOffer = {
            id: `${trader.id}_${Date.now()}`,
            traderId: trader.id,
            traderName: trader.name,
            offerResource: offerResource,
            offerAmount: offerAmount,
            requestResource: requestResource,
            requestAmount: requestAmount,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
            isBuyOffer: isBuyOffer
        };
        
        trader.availableTrades.push(tradeOffer);
    }
    
    /**
     * Cancel a trade offer
     * @param {string} offerId - The ID of the trade offer
     * @returns {boolean} - Whether the cancellation was successful
     */
    cancelTradeOffer(offerId) {
        // Find the trade offer
        const offerIndex = this.tradeOffers.findIndex(offer => offer.id === offerId);
        
        if (offerIndex === -1) {
            console.log('Trade offer not found');
            return false;
        }
        
        const offer = this.tradeOffers[offerIndex];
        
        // Check if the offer belongs to the player
        if (offer.playerId !== this.gameState.playerId) {
            console.log('Cannot cancel trade offer that does not belong to you');
            return false;
        }
        
        // Return the resources to the player
        this.gameState.resources[offer.offerResource] += offer.offerAmount;
        
        // Update the offer status
        offer.status = 'cancelled';
        offer.cancelledAt = Date.now();
        
        // Move to trade history
        this.tradeHistory.push(offer);
        this.tradeOffers.splice(offerIndex, 1);
        
        // Log the action
        this.gameState.activityLogManager.addLogEntry(
            'Trade',
            `Cancelled trade offer: ${offer.offerAmount} ${offer.offerResource} for ${offer.requestAmount} ${offer.requestResource}`
        );
        
        return true;
    }
    
    /**
     * Establish a trade route with an NPC trader
     * @param {string} traderId - The ID of the NPC trader
     * @param {string} resourceType - The type of resource to trade
     * @param {boolean} isExport - Whether the player is exporting (true) or importing (false)
     * @param {number} amount - The amount of resource to trade per cycle
     * @returns {boolean} - Whether the trade route was established successfully
     */
    establishTradeRoute(traderId, resourceType, isExport, amount) {
        // Check if trade routes are unlocked
        const hasTradeTech = this.gameState.technologies.ECONOMIC.TRADE_ROUTES;
        if (!hasTradeTech) {
            console.log('Trade routes are not unlocked yet');
            return false;
        }
        
        // Find the NPC trader
        const trader = this.npcTraders.find(t => t.id === traderId);
        
        if (!trader) {
            console.log('Trader not found');
            return false;
        }
        
        // Check relationship level (minimum 60 to establish trade route)
        if (trader.relationshipLevel < 60) {
            console.log('Relationship with trader is not good enough to establish a trade route');
            return false;
        }
        
        // Calculate the cost to establish the trade route
        const establishmentCost = {
            FOOD: 200,
            ORE: 150
        };
        
        // Check if player has enough resources
        if (this.gameState.resources.FOOD < establishmentCost.FOOD || 
            this.gameState.resources.ORE < establishmentCost.ORE) {
            console.log('Not enough resources to establish trade route');
            return false;
        }
        
        // Deduct establishment cost
        this.gameState.resources.FOOD -= establishmentCost.FOOD;
        this.gameState.resources.ORE -= establishmentCost.ORE;
        
        // Calculate trade rate based on trader's specialties and relationship
        let tradeRate = this.baseTradeRates[resourceType];
        
        // Apply specialty bonus
        if (trader.specialties.includes(resourceType)) {
            tradeRate *= (1 + trader.tradeBonus);
        }
        
        // Apply relationship bonus (up to 20% at max relationship)
        const relationshipBonus = (trader.relationshipLevel - 60) / 200; // 0-20%
        tradeRate *= (1 + relationshipBonus);
        
        // Apply technology bonus if available
        if (this.gameState.technologies.ECONOMIC.TRADE_ROUTES) {
            const techBonus = this.gameState.technologies.ECONOMIC.TRADE_ROUTES.effects.tradeRateBonus || 0;
            tradeRate *= (1 + techBonus);
        }
        
        // Create the trade route
        const tradeRoute = {
            id: `route_${Date.now()}`,
            traderId: trader.id,
            traderName: trader.name,
            resourceType: resourceType,
            isExport: isExport,
            amount: amount,
            tradeRate: tradeRate,
            establishedAt: Date.now(),
            lastTradeAt: null,
            tradeCycle: 60 * 60 * 1000, // 1 hour in milliseconds
            status: 'active'
        };
        
        // Add to trade routes
        this.tradeRoutes.push(tradeRoute);
        
        // Log the action
        this.gameState.activityLogManager.addLogEntry(
            'Trade',
            `Established trade route with ${trader.name}: ${isExport ? 'Exporting' : 'Importing'} ${amount} ${resourceType} per hour`
        );
        
        return true;
    }
    
    /**
     * Process trade routes
     */
    processTradeRoutes() {
        const now = Date.now();
        
        for (const route of this.tradeRoutes) {
            if (route.status !== 'active') continue;
            
            // Check if it's time for a trade
            if (!route.lastTradeAt || (now - route.lastTradeAt >= route.tradeCycle)) {
                if (route.isExport) {
                    // Player is exporting resources
                    if (this.gameState.resources[route.resourceType] >= route.amount) {
                        // Deduct resources from player
                        this.gameState.resources[route.resourceType] -= route.amount;
                        
                        // Calculate the amount of FOOD or ORE to receive
                        const receiveResource = route.resourceType === 'FOOD' ? 'ORE' : 'FOOD';
                        const receiveAmount = Math.floor(route.amount * route.tradeRate);
                        
                        // Add resources to player
                        this.gameState.resources[receiveResource] += receiveAmount;
                        
                        // Update last trade time
                        route.lastTradeAt = now;
                        
                        // Log the trade
                        this.gameState.activityLogManager.addLogEntry(
                            'Trade Route',
                            `Exported ${route.amount} ${route.resourceType} to ${route.traderName} and received ${receiveAmount} ${receiveResource}`
                        );
                    }
                } else {
                    // Player is importing resources
                    // Calculate the cost in FOOD or ORE
                    const payResource = route.resourceType === 'FOOD' ? 'ORE' : 'FOOD';
                    const payAmount = Math.floor(route.amount / route.tradeRate);
                    
                    if (this.gameState.resources[payResource] >= payAmount) {
                        // Deduct payment from player
                        this.gameState.resources[payResource] -= payAmount;
                        
                        // Add imported resources to player
                        this.gameState.resources[route.resourceType] += route.amount;
                        
                        // Update last trade time
                        route.lastTradeAt = now;
                        
                        // Log the trade
                        this.gameState.activityLogManager.addLogEntry(
                            'Trade Route',
                            `Imported ${route.amount} ${route.resourceType} from ${route.traderName} for ${payAmount} ${payResource}`
                        );
                    }
                }
            }
        }
    }
    
    /**
     * Cancel a trade route
     * @param {string} routeId - The ID of the trade route
     * @returns {boolean} - Whether the cancellation was successful
     */
    cancelTradeRoute(routeId) {
        // Find the trade route
        const routeIndex = this.tradeRoutes.findIndex(route => route.id === routeId);
        
        if (routeIndex === -1) {
            console.log('Trade route not found');
            return false;
        }
        
        const route = this.tradeRoutes[routeIndex];
        
        // Update the route status
        route.status = 'cancelled';
        route.cancelledAt = Date.now();
        
        // Remove from active routes
        this.tradeRoutes.splice(routeIndex, 1);
        
        // Log the action
        this.gameState.activityLogManager.addLogEntry(
            'Trade',
            `Cancelled trade route with ${route.traderName} for ${route.resourceType}`
        );
        
        return true;
    }
    
    /**
     * Refresh NPC trade offers
     */
    refreshTradeOffers() {
        // Refresh every 24 hours
        const now = Date.now();
        
        // Check for expired offers and remove them
        for (const trader of this.npcTraders) {
            trader.availableTrades = trader.availableTrades.filter(offer => now < offer.expiresAt);
            
            // Generate new offers if needed
            while (trader.availableTrades.length < 3) {
                this.generateSingleNPCTradeOffer(trader);
            }
        }
    }
    
    /**
     * Update trade system (called on each game tick)
     */
    update() {
        // Process trade routes
        this.processTradeRoutes();
        
        // Refresh trade offers periodically
        const now = Date.now();
        if (!this.lastRefreshTime || (now - this.lastRefreshTime >= 24 * 60 * 60 * 1000)) {
            this.refreshTradeOffers();
            this.lastRefreshTime = now;
        }
        
        // Check for expired player trade offers
        const expiredOffers = this.tradeOffers.filter(offer => 
            offer.status === 'active' && now > offer.expiresAt
        );
        
        for (const offer of expiredOffers) {
            // Return resources to the player
            if (offer.playerId === this.gameState.playerId) {
                this.gameState.resources[offer.offerResource] += offer.offerAmount;
                
                // Log the expiration
                this.gameState.activityLogManager.addLogEntry(
                    'Trade',
                    `Trade offer expired: ${offer.offerAmount} ${offer.offerResource} for ${offer.requestAmount} ${offer.requestResource}`
                );
            }
            
            // Update the offer status
            offer.status = 'expired';
            offer.expiredAt = now;
            
            // Move to trade history
            this.tradeHistory.push(offer);
            const offerIndex = this.tradeOffers.findIndex(o => o.id === offer.id);
            if (offerIndex !== -1) {
                this.tradeOffers.splice(offerIndex, 1);
            }
        }
    }
}

// Export the TradeSystem class
if (typeof module !== 'undefined') {
    module.exports = { TradeSystem };
}
