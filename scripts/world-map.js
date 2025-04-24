/**
 * World Map for Pixel Empires
 * A simple, clean implementation of the World Map
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('World Map: Initializing');

    // Initialize the world map
    initWorldMap();
});

/**
 * Initialize the World Map
 */
function initWorldMap() {
    // Get map container
    const mapContainer = document.getElementById('game-map');

    if (!mapContainer) {
        console.error('World Map: Map container not found');
        return;
    }

    // Initialize map
    initMap(mapContainer);

    // Set up map controls
    setupMapControls();

    // Set up location info
    setupLocationInfo();

    console.log('World Map: Initialization complete');
}

/**
 * Initialize a map in the specified container
 * @param {HTMLElement} container - The container element
 */
function initMap(container) {
    console.log('World Map: Initializing map');

    // Clear the container
    container.innerHTML = '';

    // Create canvas for the map
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth || 800;
    canvas.height = container.clientHeight || 400;
    canvas.id = 'world-map-canvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    // Add the canvas to the container
    container.appendChild(canvas);

    // Get the canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('World Map: Failed to get canvas context');
        return;
    }

    // Draw the map
    drawMap(ctx, canvas.width, canvas.height);

    // Store the canvas in a global variable for later access
    window.worldMapCanvas = canvas;
    window.worldMapContext = ctx;

    // Add resize handler
    window.addEventListener('resize', () => {
        resizeMap(canvas, ctx);
    });

    // Add interaction handlers
    addMapInteraction(canvas);
}

/**
 * Draw the map on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - The canvas width
 * @param {number} height - The canvas height
 */
function drawMap(ctx, width, height) {
    // Clear the canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Define grid size
    const gridSize = 40;
    const rows = Math.ceil(height / gridSize);
    const cols = Math.ceil(width / gridSize);

    // Draw grid if enabled
    if (window.showGrid !== false) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Draw vertical lines
        for (let i = 0; i <= cols; i++) {
            const x = i * gridSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let i = 0; i <= rows; i++) {
            const y = i * gridSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // Define terrain types
    const terrainTypes = [
        { color: '#7EC850', name: 'Plains', resource: 'Food' },
        { color: '#2D7D46', name: 'Forest', resource: 'Wood' },
        { color: '#A98958', name: 'Mountains', resource: 'Stone' },
        { color: '#3A8EBA', name: 'Water', resource: 'Fish' },
        { color: '#E8D882', name: 'Desert', resource: 'Gold' }
    ];

    // Generate terrain using a simple algorithm
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Simple noise function
            const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1) +
                          Math.sin(x * 0.05 + y * 0.05) * Math.cos(y * 0.05 - x * 0.05);

            // Map noise to terrain type
            const terrainIndex = Math.floor((noise + 2) / 4 * terrainTypes.length);
            const terrain = terrainTypes[Math.min(terrainIndex, terrainTypes.length - 1)];

            // Draw terrain
            ctx.fillStyle = terrain.color;
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);

            // Add a border
            if (window.showGrid !== false) {
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }

            // Show resources if enabled
            if (window.showResources === true) {
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.fillText(terrain.resource, x * gridSize + gridSize / 2, y * gridSize + gridSize / 2);
            }
        }
    }

    // Add some special locations
    const specialLocations = [
        { x: 3, y: 3, color: '#FFD700', name: 'City', icon: '🏙️' },
        { x: 7, y: 5, color: '#9C27B0', name: 'Mine', icon: '⛏️' },
        { x: 10, y: 8, color: '#F44336', name: 'Enemy Camp', icon: '⚔️' },
        { x: 5, y: 10, color: '#00BCD4', name: 'Temple', icon: '🏯' },
        { x: 12, y: 3, color: '#4CAF50', name: 'Village', icon: '🏘️' },
        { x: 8, y: 12, color: '#FF9800', name: 'Trading Post', icon: '🏪' }
    ];

    specialLocations.forEach(location => {
        const x = location.x * gridSize + gridSize / 2;
        const y = location.y * gridSize + gridSize / 2;
        const radius = gridSize / 3;

        // Draw location
        ctx.fillStyle = location.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Add a border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add icon text
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(location.icon, x, y);
    });

    // Show territories if enabled
    if (window.showTerritories === true) {
        // Define territories
        const territories = [
            { x: 2, y: 2, width: 3, height: 3, color: 'rgba(255, 0, 0, 0.2)', name: 'Your Empire' },
            { x: 9, y: 7, width: 4, height: 3, color: 'rgba(255, 0, 0, 0.2)', name: 'Enemy Territory' },
            { x: 7, y: 11, width: 3, height: 3, color: 'rgba(0, 255, 0, 0.2)', name: 'Allied Territory' }
        ];

        territories.forEach(territory => {
            // Draw territory
            ctx.fillStyle = territory.color;
            ctx.fillRect(
                territory.x * gridSize,
                territory.y * gridSize,
                territory.width * gridSize,
                territory.height * gridSize
            );

            // Add territory name
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(
                territory.name,
                territory.x * gridSize + (territory.width * gridSize) / 2,
                territory.y * gridSize + (territory.height * gridSize) / 2
            );
        });
    }

    // Add a fog of war effect if enabled
    if (window.showFog !== false) {
        const gradient = ctx.createRadialGradient(
            width / 2, height / 2,
            Math.min(width, height) * 0.3,
            width / 2, height / 2,
            Math.max(width, height) * 0.7
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    // Add player position
    const playerX = 5 * gridSize + gridSize / 2;
    const playerY = 5 * gridSize + gridSize / 2;

    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(playerX, playerY, gridSize / 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add player icon
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText('🏰', playerX, playerY);

    // Highlight selected tile if any
    if (window.selectedTileX >= 0 && window.selectedTileY >= 0) {
        const x = window.selectedTileX * gridSize;
        const y = window.selectedTileY * gridSize;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, gridSize, gridSize);
    }
}

/**
 * Resize the map when the window is resized
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function resizeMap(canvas, ctx) {
    const container = canvas.parentElement;
    if (!container) return;

    // Resize canvas
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Redraw map
    drawMap(ctx, canvas.width, canvas.height);
}

/**
 * Add interaction handlers to the map
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function addMapInteraction(canvas) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let zoomLevel = 1.0;

    // Mouse down event
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
    });

    // Mouse move event
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        // Calculate movement
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;

        // Update last position
        lastX = e.clientX;
        lastY = e.clientY;

        // Implement panning logic here
        // For now, just log the movement
        console.log(`Map panned: ${deltaX}, ${deltaY}`);
    });

    // Mouse up event
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    // Mouse leave event
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    });

    // Mouse wheel event for zooming
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        // Calculate zoom change
        const zoomChange = e.deltaY > 0 ? 0.9 : 1.1;
        zoomLevel = Math.max(0.5, Math.min(2.0, zoomLevel * zoomChange));

        // Log zoom level
        console.log(`Zoom level: ${zoomLevel}`);

        // Implement zooming logic here
        // For now, just log the zoom level
    });

    // Click event for location selection
    canvas.addEventListener('click', (e) => {
        if (isDragging) return; // Don't select if we were dragging

        // Get click position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate the tile position
        const tileSize = 32; // Should match the tile size used in drawMap
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);

        // Log the selected tile
        console.log(`Tile selected: ${tileX}, ${tileY}`);

        // Update location info
        updateLocationInfo(tileX, tileY);
    });

    // Set initial cursor
    canvas.style.cursor = 'grab';
}

/**
 * Set up map controls
 */
function setupMapControls() {
    // Get control buttons
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const centerMapButton = document.getElementById('center-map');
    const toggleFogButton = document.getElementById('toggle-fog');
    const toggleGridButton = document.getElementById('toggle-grid');
    const toggleResourcesButton = document.getElementById('toggle-resources');
    const toggleTerritoriesButton = document.getElementById('toggle-territories');
    const claimTerritoryButton = document.getElementById('claim-territory');

    // Set up zoom in button
    if (zoomInButton) {
        zoomInButton.addEventListener('click', () => {
            console.log('Zoom in clicked');
            // Implement zoom in logic here
            if (window.worldMapCanvas) {
                // Trigger a zoom in event
                const event = new WheelEvent('wheel', { deltaY: -100 });
                window.worldMapCanvas.dispatchEvent(event);
            }
        });
    }

    // Set up zoom out button
    if (zoomOutButton) {
        zoomOutButton.addEventListener('click', () => {
            console.log('Zoom out clicked');
            // Implement zoom out logic here
            if (window.worldMapCanvas) {
                // Trigger a zoom out event
                const event = new WheelEvent('wheel', { deltaY: 100 });
                window.worldMapCanvas.dispatchEvent(event);
            }
        });
    }

    // Set up center map button
    if (centerMapButton) {
        centerMapButton.addEventListener('click', () => {
            console.log('Center map clicked');
            // Implement center map logic here
            if (window.worldMapContext) {
                // Redraw the map centered
                drawMap(window.worldMapContext, window.worldMapCanvas.width, window.worldMapCanvas.height);
            }
        });
    }

    // Set up toggle fog button
    if (toggleFogButton) {
        toggleFogButton.addEventListener('click', () => {
            console.log('Toggle fog clicked');
            // Implement toggle fog logic here
            window.showFog = !window.showFog;
            if (window.worldMapContext) {
                drawMap(window.worldMapContext, window.worldMapCanvas.width, window.worldMapCanvas.height);
            }
        });
    }

    // Set up toggle grid button
    if (toggleGridButton) {
        toggleGridButton.addEventListener('click', () => {
            console.log('Toggle grid clicked');
            // Implement toggle grid logic here
            window.showGrid = !window.showGrid;
            if (window.worldMapContext) {
                drawMap(window.worldMapContext, window.worldMapCanvas.width, window.worldMapCanvas.height);
            }
        });
    }

    // Set up toggle resources button
    if (toggleResourcesButton) {
        toggleResourcesButton.addEventListener('click', () => {
            console.log('Toggle resources clicked');
            // Implement toggle resources logic here
            window.showResources = !window.showResources;
            if (window.worldMapContext) {
                drawMap(window.worldMapContext, window.worldMapCanvas.width, window.worldMapCanvas.height);
            }
        });
    }

    // Set up toggle territories button
    if (toggleTerritoriesButton) {
        toggleTerritoriesButton.addEventListener('click', () => {
            console.log('Toggle territories clicked');
            // Implement toggle territories logic here
            window.showTerritories = !window.showTerritories;
            if (window.worldMapContext) {
                drawMap(window.worldMapContext, window.worldMapCanvas.width, window.worldMapCanvas.height);
            }
        });
    }

    // Set up claim territory button
    if (claimTerritoryButton) {
        claimTerritoryButton.addEventListener('click', () => {
            console.log('Claim territory clicked');
            // Implement claim territory logic here
            alert('Territory claimed!');
        });
    }
}

/**
 * Set up location information
 */
function setupLocationInfo() {
    // Initialize global variables for location info
    window.selectedTileX = -1;
    window.selectedTileY = -1;
    window.showFog = true;
    window.showGrid = true;
    window.showResources = false;
    window.showTerritories = false;

    // Get location info elements
    const selectedTerrainElement = document.getElementById('selected-terrain');
    const selectedLocationElement = document.getElementById('selected-location');
    const exploreButton = document.getElementById('explore-location');
    const interactButton = document.getElementById('interact-location');

    // Initialize location info
    if (selectedTerrainElement) {
        selectedTerrainElement.textContent = 'No terrain selected';
    }

    if (selectedLocationElement) {
        selectedLocationElement.textContent = 'No special location selected';
    }

    // Disable action buttons initially
    if (exploreButton) {
        exploreButton.disabled = true;
    }

    if (interactButton) {
        interactButton.disabled = true;
    }
}

/**
 * Update location information based on selected tile
 * @param {number} tileX - X coordinate of the selected tile
 * @param {number} tileY - Y coordinate of the selected tile
 */
function updateLocationInfo(tileX, tileY) {
    // Store selected tile
    window.selectedTileX = tileX;
    window.selectedTileY = tileY;

    // Get location info elements
    const selectedTerrainElement = document.getElementById('selected-terrain');
    const selectedLocationElement = document.getElementById('selected-location');
    const exploreButton = document.getElementById('explore-location');
    const interactButton = document.getElementById('interact-location');

    // Define terrain types
    const terrainTypes = [
        { color: '#7EC850', name: 'Plains', description: 'Fertile plains suitable for farming.' },
        { color: '#2D7D46', name: 'Forest', description: 'Dense forest with valuable timber.' },
        { color: '#A98958', name: 'Mountains', description: 'Rocky mountains with mineral deposits.' },
        { color: '#3A8EBA', name: 'Water', description: 'Clear water body with fish.' },
        { color: '#E8D882', name: 'Desert', description: 'Arid desert with scarce resources.' }
    ];

    // Define special locations
    const specialLocations = [
        { x: 3, y: 3, name: 'Capital City', description: 'Your empire\'s capital city.', icon: '🏙️' },
        { x: 7, y: 5, name: 'Gold Mine', description: 'A rich gold mine.', icon: '⛏️' },
        { x: 10, y: 8, name: 'Enemy Camp', description: 'A hostile enemy camp.', icon: '⚔️' },
        { x: 5, y: 10, name: 'Ancient Temple', description: 'A mysterious ancient temple.', icon: '🏯' },
        { x: 12, y: 3, name: 'Village', description: 'A small friendly village.', icon: '🏘️' },
        { x: 8, y: 12, name: 'Trading Post', description: 'A busy trading post.', icon: '🏪' }
    ];

    // Simple noise function to determine terrain type
    const noise = Math.sin(tileX * 0.1) * Math.cos(tileY * 0.1) +
                  Math.sin(tileX * 0.05 + tileY * 0.05) * Math.cos(tileY * 0.05 - tileX * 0.05);

    // Map noise to terrain type
    const terrainIndex = Math.floor((noise + 2) / 4 * terrainTypes.length);
    const terrain = terrainTypes[Math.min(terrainIndex, terrainTypes.length - 1)];

    // Check if there's a special location at the selected tile
    const specialLocation = specialLocations.find(location => location.x === tileX && location.y === tileY);

    // Update terrain info
    if (selectedTerrainElement) {
        selectedTerrainElement.innerHTML = `
            <strong>${terrain.name}</strong><br>
            ${terrain.description}
        `;
    }

    // Update special location info
    if (selectedLocationElement) {
        if (specialLocation) {
            selectedLocationElement.innerHTML = `
                <strong>${specialLocation.icon} ${specialLocation.name}</strong><br>
                ${specialLocation.description}
            `;
        } else {
            selectedLocationElement.textContent = 'No special location here';
        }
    }

    // Enable/disable action buttons
    if (exploreButton) {
        exploreButton.disabled = false;
    }

    if (interactButton) {
        interactButton.disabled = specialLocation ? false : true;
    }
}

// Export functions for external use
window.initWorldMap = initWorldMap;
window.drawMap = drawMap;
window.updateLocationInfo = updateLocationInfo;
