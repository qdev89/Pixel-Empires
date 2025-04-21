/**
 * Chat System for Pixel Empires
 * Handles chat messages, channels, and notifications
 */
class ChatSystem {
    /**
     * Initialize the chat system
     * @param {GameState} gameState - The game state
     */
    constructor(gameState) {
        this.gameState = gameState;

        // Initialize chat data
        this.messages = {
            global: [],
            faction: [],
            private: []
        };

        this.activeChannel = 'global';
        this.hasUnreadMessages = {
            global: false,
            faction: false,
            private: false
        };

        // Player info
        this.playerName = 'Player';
        this.playerId = 'player_1';

        // Simulated online players for demo
        this.onlinePlayers = [
            { id: 'player_2', name: 'Commander', faction: 'Northern Kingdom' },
            { id: 'player_3', name: 'Trader', faction: 'Merchant Guild' },
            { id: 'player_4', name: 'Scout', faction: 'Forest Alliance' }
        ];

        // Add some initial messages
        this.addSystemMessage('global', 'Welcome to the global chat channel!');
        this.addSystemMessage('faction', 'Welcome to your faction chat channel!');
        this.addSystemMessage('private', 'This is your private messages channel.');

        // Add some demo messages
        setTimeout(() => {
            this.addMessage('global', 'player_2', 'Commander', 'Hello everyone! How are your empires doing?');
        }, 2000);

        setTimeout(() => {
            this.addMessage('global', 'player_3', 'Trader', 'I have resources to trade if anyone is interested.');
        }, 5000);

        setTimeout(() => {
            this.addMessage('faction', 'player_2', 'Commander', 'Our faction is planning an attack on the eastern border.');
        }, 8000);

        setTimeout(() => {
            this.addMessage('private', 'player_3', 'Trader', 'I can offer you a special deal on rare resources.');
        }, 12000);
    }

    /**
     * Add a new message to a channel
     * @param {string} channel - The channel to add the message to
     * @param {string} senderId - The ID of the sender
     * @param {string} senderName - The name of the sender
     * @param {string} content - The message content
     */
    addMessage(channel, senderId, senderName, content) {
        if (!this.messages[channel]) return;

        const message = {
            id: Date.now(),
            senderId,
            senderName,
            content,
            timestamp: new Date(),
            isOwn: senderId === this.playerId
        };

        this.messages[channel].push(message);

        // Mark channel as having unread messages if it's not the active channel
        if (channel !== this.activeChannel) {
            this.hasUnreadMessages[channel] = true;
        }

        // Trigger notification if needed
        if (channel !== this.activeChannel) {
            this.triggerNotification(channel, senderName, content);
        }

        // Notify UI to update
        if (this.onMessageAdded) {
            this.onMessageAdded(channel, message);
        }
    }

    /**
     * Add a system message to a channel
     * @param {string} channel - The channel to add the message to
     * @param {string} content - The message content
     */
    addSystemMessage(channel, content) {
        if (!this.messages[channel]) return;

        const message = {
            id: Date.now(),
            isSystem: true,
            content,
            timestamp: new Date()
        };

        this.messages[channel].push(message);

        // Notify UI to update
        if (this.onMessageAdded) {
            this.onMessageAdded(channel, message);
        }
    }

    /**
     * Send a message from the player
     * @param {string} channel - The channel to send the message to
     * @param {string} content - The message content
     */
    sendMessage(channel, content) {
        if (!content.trim()) return;

        this.addMessage(channel, this.playerId, this.playerName, content);

        // Simulate responses in demo
        if (channel === 'global') {
            this.simulateResponse(channel);
        } else if (channel === 'faction') {
            this.simulateFactionResponse();
        } else if (channel === 'private') {
            this.simulatePrivateResponse();
        }
    }

    /**
     * Simulate a response in the global channel
     * @param {string} channel - The channel to respond in
     */
    simulateResponse(channel) {
        const responseDelay = 2000 + Math.random() * 5000;
        const responder = this.onlinePlayers[Math.floor(Math.random() * this.onlinePlayers.length)];

        const responses = [
            'Interesting strategy!',
            'How many resources have you gathered so far?',
            'Has anyone encountered the mountain clans yet?',
            'The eastern territories have some valuable resources.',
            'Watch out for goblin camps near the forest.',
            'I just upgraded my barracks to level 3!',
            'Anyone want to form an alliance?',
            'Trading ore for food, message me if interested.',
            'The weather system makes farming challenging sometimes.',
            'Just defeated a bandit camp, got some nice loot!'
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];

        setTimeout(() => {
            this.addMessage(channel, responder.id, responder.name, response);
        }, responseDelay);
    }

    /**
     * Simulate a response in the faction channel
     */
    simulateFactionResponse() {
        const responseDelay = 3000 + Math.random() * 4000;

        // Only faction members respond in faction chat
        const responder = this.onlinePlayers.find(p => p.faction === 'Northern Kingdom') || this.onlinePlayers[0];

        const responses = [
            'Our territory is expanding well.',
            'We need more defensive structures on the northern border.',
            'I can contribute 500 ore to our faction treasury.',
            'The diplomatic relations with the Eastern Empire are improving.',
            'We should focus on military research next.',
            'Our scouts report enemy movement near the mountains.',
            'The faction quest requires 1000 food, I can provide half.',
            'Let\'s coordinate our attacks on the bandit stronghold.',
            'I\'ve discovered a special resource node in sector 7.',
            'Our alliance with the Forest Alliance is proving beneficial.'
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];

        setTimeout(() => {
            this.addMessage('faction', responder.id, responder.name, response);
        }, responseDelay);
    }

    /**
     * Simulate a response in the private channel
     */
    simulatePrivateResponse() {
        const responseDelay = 2000 + Math.random() * 3000;

        // For private chat, always use the Trader character
        const responder = this.onlinePlayers.find(p => p.name === 'Trader') || this.onlinePlayers[0];

        const responses = [
            'I can offer you 300 ore for 500 food.',
            'Do you have any rare resources to trade?',
            'I\'ve heard rumors about ancient artifacts in the eastern ruins.',
            'My caravan will be passing by your territory tomorrow.',
            'The merchant guild is offering special prices this week.',
            'I can connect you with other traders if you need specific resources.',
            'Keep this between us, but there\'s a valuable deposit in the northern mountains.',
            'Would you be interested in joining our trading network?',
            'I can provide military intelligence for the right price.',
            'Let me know what resources you need, I might be able to help.'
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];

        setTimeout(() => {
            this.addMessage('private', responder.id, responder.name, response);
        }, responseDelay);
    }

    /**
     * Switch to a different chat channel
     * @param {string} channel - The channel to switch to
     */
    switchChannel(channel) {
        if (!this.messages[channel]) return;

        this.activeChannel = channel;
        this.hasUnreadMessages[channel] = false;

        // Notify UI to update
        if (this.onChannelSwitched) {
            this.onChannelSwitched(channel);
        }
    }

    /**
     * Get messages for a specific channel
     * @param {string} channel - The channel to get messages for
     * @returns {Array} - The messages for the channel
     */
    getMessages(channel) {
        return this.messages[channel] || [];
    }

    /**
     * Check if there are any unread messages
     * @returns {boolean} - True if there are unread messages
     */
    hasAnyUnreadMessages() {
        return Object.values(this.hasUnreadMessages).some(hasUnread => hasUnread);
    }

    /**
     * Trigger a notification for a new message
     * @param {string} channel - The channel the message was sent to
     * @param {string} sender - The name of the sender
     * @param {string} content - The message content
     */
    triggerNotification(channel, sender, content) {
        // Update chat button to show notification
        const chatButton = document.getElementById('chat-button');
        if (chatButton) {
            chatButton.classList.add('has-notifications');
        }

        // Show a system notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Pixel Empires', {
                body: `${sender}: ${content}`,
                icon: 'assets/icons/chat.png'
            });

            notification.onclick = () => {
                window.focus();
                this.openChat(channel);
            };
        }
    }

    /**
     * Open the chat modal and switch to a specific channel
     * @param {string} channel - The channel to switch to
     */
    openChat(channel) {
        const chatModal = document.getElementById('chat-modal');
        if (chatModal) {
            chatModal.style.display = 'flex';

            if (channel) {
                this.switchChannel(channel);
            }

            // Remove notification indicator
            const chatButton = document.getElementById('chat-button');
            if (chatButton) {
                chatButton.classList.remove('has-notifications');
            }

            // Focus the input field
            setTimeout(() => {
                const chatInput = document.getElementById('chat-input');
                if (chatInput) {
                    chatInput.focus();
                }
            }, 100);
        }
    }

    /**
     * Close the chat modal
     */
    closeChat() {
        const chatModal = document.getElementById('chat-modal');
        if (chatModal) {
            chatModal.style.display = 'none';
        }
    }

    /**
     * Format a timestamp for display
     * @param {Date} timestamp - The timestamp to format
     * @returns {string} - The formatted timestamp
     */
    formatTimestamp(timestamp) {
        if (!timestamp) return '';

        const hours = timestamp.getHours().toString().padStart(2, '0');
        const minutes = timestamp.getMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    }

    /**
     * Request notification permission
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
}

/**
 * Chat UI for Pixel Empires
 * Handles the chat interface and interactions
 */
class ChatUI {
    /**
     * Initialize the chat UI
     * @param {ChatSystem} chatSystem - The chat system
     */
    constructor(chatSystem) {
        this.chatSystem = chatSystem;

        // Set callbacks
        this.chatSystem.onMessageAdded = (channel, message) => this.onMessageAdded(channel, message);
        this.chatSystem.onChannelSwitched = (channel) => this.onChannelSwitched(channel);

        // Initialize UI elements
        this.initializeUI();

        // Bind event handlers
        this.bindEvents();

        // Request notification permission
        this.chatSystem.requestNotificationPermission();
    }

    /**
     * Initialize the chat UI elements
     */
    initializeUI() {
        // Get UI elements
        this.chatModal = document.getElementById('chat-modal');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.chatSendButton = document.getElementById('chat-send-button');
        this.chatChannelButtons = document.querySelectorAll('.chat-channel-button');

        // Render initial messages
        this.renderMessages(this.chatSystem.activeChannel);
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Chat button
        const chatButton = document.getElementById('chat-button');
        if (chatButton) {
            chatButton.addEventListener('click', () => {
                this.chatSystem.openChat();
            });
        }

        // Chat modal close button
        const chatModalClose = document.getElementById('chat-modal-close');
        if (chatModalClose) {
            chatModalClose.addEventListener('click', () => {
                this.chatSystem.closeChat();
            });
        }

        // Chat send button
        if (this.chatSendButton) {
            this.chatSendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Chat input enter key
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Channel buttons
        this.chatChannelButtons.forEach(button => {
            button.addEventListener('click', () => {
                const channel = button.dataset.channel;
                this.chatSystem.switchChannel(channel);
            });
        });
    }

    /**
     * Send a message
     */
    sendMessage() {
        if (!this.chatInput.value.trim()) return;

        this.chatSystem.sendMessage(this.chatSystem.activeChannel, this.chatInput.value);
        this.chatInput.value = '';
        this.chatInput.focus();
    }

    /**
     * Render messages for a channel
     * @param {string} channel - The channel to render messages for
     */
    renderMessages(channel) {
        if (!this.chatMessages) return;

        this.chatMessages.innerHTML = '';

        const messages = this.chatSystem.getMessages(channel);

        if (messages.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'system-message';
            emptyMessage.textContent = `No messages in the ${channel} channel yet.`;
            this.chatMessages.appendChild(emptyMessage);
            return;
        }

        messages.forEach(message => {
            this.renderMessage(message);
        });

        // Scroll to bottom
        this.scrollToBottom();
    }

    /**
     * Render a single message
     * @param {Object} message - The message to render
     */
    renderMessage(message) {
        if (!this.chatMessages) return;

        if (message.isSystem) {
            const systemMessage = document.createElement('div');
            systemMessage.className = 'system-message';
            systemMessage.textContent = message.content;
            this.chatMessages.appendChild(systemMessage);
            return;
        }

        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.isOwn ? 'own' : 'other'}`;

        if (this.chatSystem.activeChannel === 'faction') {
            messageElement.classList.add('faction');
        } else if (this.chatSystem.activeChannel === 'private') {
            messageElement.classList.add('private');
        }

        // Add sender name if not own message
        if (!message.isOwn) {
            const senderElement = document.createElement('div');
            senderElement.className = 'message-sender';
            senderElement.textContent = message.senderName;
            messageElement.appendChild(senderElement);
        }

        // Add message content
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = message.content;
        messageElement.appendChild(contentElement);

        // Add timestamp
        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = this.chatSystem.formatTimestamp(message.timestamp);
        messageElement.appendChild(timeElement);

        this.chatMessages.appendChild(messageElement);
    }

    /**
     * Handle a new message being added
     * @param {string} channel - The channel the message was added to
     * @param {Object} message - The message that was added
     */
    onMessageAdded(channel, message) {
        // If this is the active channel, render the new message
        if (channel === this.chatSystem.activeChannel) {
            this.renderMessage(message);
            this.scrollToBottom();
        }

        // Update channel buttons to show unread indicators
        this.updateChannelButtons();
    }

    /**
     * Handle switching to a different channel
     * @param {string} channel - The channel that was switched to
     */
    onChannelSwitched(channel) {
        // Update active button
        this.chatChannelButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.channel === channel);
        });

        // Render messages for the new channel
        this.renderMessages(channel);

        // Update channel buttons to show unread indicators
        this.updateChannelButtons();
    }

    /**
     * Update channel buttons to show unread indicators
     */
    updateChannelButtons() {
        this.chatChannelButtons.forEach(button => {
            const channel = button.dataset.channel;
            const hasUnread = this.chatSystem.hasUnreadMessages[channel];

            button.classList.toggle('has-unread', hasUnread);

            // Add notification dot if there are unread messages
            if (hasUnread) {
                if (!button.querySelector('.notification-dot')) {
                    const dot = document.createElement('span');
                    dot.className = 'notification-dot';
                    button.appendChild(dot);
                }
            } else {
                const dot = button.querySelector('.notification-dot');
                if (dot) {
                    dot.remove();
                }
            }
        });

        // Update chat button to show notification indicator
        const chatButton = document.getElementById('chat-button');
        if (chatButton) {
            chatButton.classList.toggle('has-notifications', this.chatSystem.hasAnyUnreadMessages());
        }
    }

    /**
     * Scroll the chat messages to the bottom
     */
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
}

// Export the classes
if (typeof module !== 'undefined') {
    module.exports = { ChatSystem, ChatUI };
}
