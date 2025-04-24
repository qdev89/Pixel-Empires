/**
 * Asset Loader
 * Handles loading and fallback for game assets
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check all image elements and provide fallbacks if needed
    const images = document.querySelectorAll('img');

    // Create a function to replace resource icons with text fallbacks
    const replaceWithFallback = (img) => {
        const alt = img.alt.toLowerCase();

        // Create a fallback element
        const fallbackIcon = document.createElement('div');
        fallbackIcon.className = `resource-icon ${alt}-icon`;

        // Set the text content based on the resource type
        if (alt === 'food') {
            fallbackIcon.textContent = '🍖';
            fallbackIcon.style.backgroundColor = '#2a6e2a'; // Green
        } else if (alt === 'ore') {
            fallbackIcon.textContent = '⛏️';
            fallbackIcon.style.backgroundColor = '#6e2a2a'; // Red
        } else if (alt === 'wood') {
            fallbackIcon.textContent = '🪵';
            fallbackIcon.style.backgroundColor = '#6e4e2a'; // Brown
        } else if (alt === 'gold') {
            fallbackIcon.textContent = '💰';
            fallbackIcon.style.backgroundColor = '#8e8e2a'; // Gold
        } else {
            fallbackIcon.textContent = alt.charAt(0).toUpperCase();
            fallbackIcon.style.backgroundColor = '#2a2a6e'; // Blue
        }

        // Replace the img with the fallback if it has a parent
        if (img.parentNode) {
            img.parentNode.replaceChild(fallbackIcon, img);
        }

        return fallbackIcon;
    };

    images.forEach(img => {
        // Store the original src
        const originalSrc = img.src;

        // Add error handler to provide fallbacks
        img.onerror = function() {
            // Don't log errors for file:// protocol as they're expected in local development
            if (!originalSrc.startsWith('file://')) {
                console.warn(`Failed to load image: ${originalSrc}`);
            }

            // Check if it's a resource icon
            if (img.classList.contains('resource-icon')) {
                replaceWithFallback(img);
            } else {
                // For other images, just add a placeholder style
                img.style.backgroundColor = '#333';
                img.style.border = '1px dashed #666';
                img.style.width = img.width || '32px';
                img.style.height = img.height || '32px';
                img.alt = `Missing: ${img.alt || 'image'}`;
            }
        };

        // Fix paths for resource icons if needed
        if (img.classList.contains('resource-icon')) {
            const alt = img.alt.toLowerCase();

            // Check if we're running from a file:// URL (local development)
            const isLocalFile = window.location.protocol === 'file:';

            if (isLocalFile) {
                // In local development, just use the fallback immediately
                replaceWithFallback(img);
            } else {
                // In a web server environment, try to load the image
                if (alt === 'food' || alt === 'ore' || alt === 'wood' || alt === 'gold') {
                    // Use relative path with proper directory structure
                    img.src = `assets/icons/${alt}.png`;
                }
            }
        } else if (originalSrc.startsWith('file://')) {
            // For other images with file:// protocol, add a placeholder
            img.style.backgroundColor = '#333';
            img.style.border = '1px dashed #666';
            img.style.width = img.width || '32px';
            img.style.height = img.height || '32px';
            img.alt = `Missing: ${img.alt || 'image'}`;
        }
    });
});
