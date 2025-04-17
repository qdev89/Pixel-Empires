/**
 * Asset Loader
 * Handles loading and fallback for game assets
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check all image elements and provide fallbacks if needed
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Store the original src
        const originalSrc = img.src;
        
        // Add error handler to provide fallbacks
        img.onerror = function() {
            console.warn(`Failed to load image: ${originalSrc}`);
            
            // Check if it's a resource icon
            if (img.classList.contains('resource-icon')) {
                const alt = img.alt.toLowerCase();
                
                // Create a fallback element
                const fallbackIcon = document.createElement('div');
                fallbackIcon.className = `resource-icon ${alt}-icon`;
                
                // Set the text content based on the resource type
                if (alt === 'food') {
                    fallbackIcon.textContent = 'F';
                    fallbackIcon.style.backgroundColor = '#2a6e2a'; // Green
                } else if (alt === 'ore') {
                    fallbackIcon.textContent = 'O';
                    fallbackIcon.style.backgroundColor = '#6e2a2a'; // Red
                } else {
                    fallbackIcon.textContent = alt.charAt(0).toUpperCase();
                    fallbackIcon.style.backgroundColor = '#2a2a6e'; // Blue
                }
                
                // Replace the img with the fallback
                img.parentNode.replaceChild(fallbackIcon, img);
            } else {
                // For other images, just add a placeholder style
                img.style.backgroundColor = '#333';
                img.style.border = '1px dashed #666';
                img.style.width = img.width || '32px';
                img.style.height = img.height || '32px';
                img.alt = `Missing: ${img.alt || 'image'}`;
            }
        };
        
        // Force reload to trigger error handler if needed
        img.src = originalSrc;
    });
});
