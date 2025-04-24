/**
 * Simple Minimap for Pixel Empires
 * A lightweight minimap implementation
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Minimap: Initializing');

    // Initialize minimap with a delay to ensure main map is loaded
    setTimeout(initMinimap, 500);
});

/**
 * Initialize minimap
 */
function initMinimap() {
    // Get minimap container
    const minimapContainer = document.querySelector('#minimap');

    if (!minimapContainer) {
        console.error('Minimap: Minimap container not found');
        return;
    }

    // Initialize minimap
    setupMinimap(minimapContainer);

    console.log('Minimap: Initialization complete');
}

/**
 * Set up a minimap in the specified container
 * @param {HTMLElement} container - The container element
 */
function setupMinimap(container) {
    console.log('Minimap: Setting up minimap');

    // Clear the container
    container.innerHTML = '';

    // Create canvas for the minimap
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth || 150;
    canvas.height = container.clientHeight || 100;
    canvas.id = 'minimap-canvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    // Add the canvas to the container
    container.appendChild(canvas);

    // Get the canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Minimap: Failed to get canvas context');
        return;
    }

    // Draw the minimap
    drawMinimap(ctx, canvas.width, canvas.height);

    // Store the canvas in a global variable for later access
    window.minimapCanvas = canvas;
    window.minimapContext = ctx;

    // Add resize handler
    window.addEventListener('resize', () => {
        resizeMinimap(canvas, ctx);
    });

    // Add viewport indicator
    addViewportIndicator(container);

    // Add interaction handlers
    addMinimapInteraction(canvas);
}

/**
 * Draw the minimap on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - The canvas width
 * @param {number} height - The canvas height
 */
function drawMinimap(ctx, width, height) {
    // Clear the canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Define terrain colors
    const terrainColors = [
        '#7EC850', // Plains
        '#2D7D46', // Forest
        '#A98958', // Mountains
        '#3A8EBA', // Water
        '#E8D882'  // Desert
    ];

    // Draw a simplified version of the map
    const cellSize = 5;
    const rows = Math.ceil(height / cellSize);
    const cols = Math.ceil(width / cellSize);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Simple noise function
            const noise = Math.sin(x * 0.3) * Math.cos(y * 0.3) +
                          Math.sin(x * 0.15 + y * 0.15) * Math.cos(y * 0.15 - x * 0.15);

            // Map noise to terrain color
            const colorIndex = Math.floor((noise + 2) / 4 * terrainColors.length);
            const color = terrainColors[Math.min(colorIndex, terrainColors.length - 1)];

            // Draw terrain cell
            ctx.fillStyle = color;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    // Add player position
    const playerX = width / 2;
    const playerY = height / 2;

    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
}

/**
 * Resize the minimap when the window is resized
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 */
function resizeMinimap(canvas, ctx) {
    const container = canvas.parentElement;
    if (!container) return;

    // Resize canvas
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Redraw minimap
    drawMinimap(ctx, canvas.width, canvas.height);

    // Update viewport indicator
    updateViewportIndicator(container);
}

/**
 * Add viewport indicator to the minimap
 * @param {HTMLElement} container - The minimap container
 */
function addViewportIndicator(container) {
    // Get or create viewport indicator
    let viewport = container.nextElementSibling;
    if (!viewport || !viewport.classList.contains('minimap-viewport')) {
        viewport = document.createElement('div');
        viewport.className = 'minimap-viewport';
        viewport.id = 'minimap-viewport';
        container.parentElement.appendChild(viewport);
    }

    // Position the viewport indicator
    updateViewportIndicator(container);
}

/**
 * Update the viewport indicator position and size
 * @param {HTMLElement} container - The minimap container
 */
function updateViewportIndicator(container) {
    const viewport = container.nextElementSibling;
    if (!viewport || !viewport.classList.contains('minimap-viewport')) return;

    // Calculate viewport size and position
    // For now, just show a fixed viewport in the center
    const width = container.clientWidth * 0.3;
    const height = container.clientHeight * 0.3;
    const left = (container.clientWidth - width) / 2;
    const top = (container.clientHeight - height) / 2;

    // Update viewport style
    viewport.style.width = `${width}px`;
    viewport.style.height = `${height}px`;
    viewport.style.left = `${left}px`;
    viewport.style.top = `${top}px`;
}

/**
 * Add interaction handlers to the minimap
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function addMinimapInteraction(canvas) {
    // Click event
    canvas.addEventListener('click', (e) => {
        // Get click position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate the position on the map
        const mapX = x / canvas.width;
        const mapY = y / canvas.height;

        // Log the click position
        console.log(`Minimap clicked: ${mapX.toFixed(2)}, ${mapY.toFixed(2)}`);

        // Create a custom event for the map to handle
        const event = new CustomEvent('minimapClick', {
            detail: { x: mapX, y: mapY }
        });

        // Dispatch the event
        canvas.dispatchEvent(event);

        // Update viewport indicator
        const container = canvas.parentElement;
        const viewport = container.nextElementSibling;
        if (viewport && viewport.classList.contains('minimap-viewport')) {
            const width = viewport.clientWidth;
            const height = viewport.clientHeight;
            const left = x - width / 2;
            const top = y - height / 2;

            // Update viewport style
            viewport.style.left = `${Math.max(0, Math.min(canvas.width - width, left))}px`;
            viewport.style.top = `${Math.max(0, Math.min(canvas.height - height, top))}px`;
        }

        // Center the main map on the clicked position
        if (window.worldMapCanvas && window.worldMapContext) {
            // Calculate the center position
            const centerX = mapX * window.worldMapCanvas.width;
            const centerY = mapY * window.worldMapCanvas.height;

            // Center the map on this position
            console.log(`Centering map on: ${centerX.toFixed(2)}, ${centerY.toFixed(2)}`);

            // Redraw the map
            drawMap(window.worldMapContext, window.worldMapCanvas.width, window.worldMapCanvas.height);
        }
    });
}

// Export functions for external use
window.initMinimap = initMinimap;
window.drawMinimap = drawMinimap;
