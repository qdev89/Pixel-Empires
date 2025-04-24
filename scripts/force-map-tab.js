/**
 * Force Map Tab Script
 * This script forces the map tab to be active when the page loads
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the DOM to be fully loaded
    setTimeout(forceMapTabActive, 1000);
});

function forceMapTabActive() {
    console.log('Forcing map tab to be active');
    
    // Get all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Get all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Find the map tab button
    const mapTabButton = document.querySelector('.tab-button[data-tab="map"]');
    
    // Find the map tab content
    const mapTabContent = document.getElementById('map-tab');
    
    if (!mapTabButton || !mapTabContent) {
        console.error('Map tab elements not found');
        return;
    }
    
    // Remove active class from all tab buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Remove active class from all tab contents
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to map tab button
    mapTabButton.classList.add('active');
    
    // Add active class to map tab content
    mapTabContent.classList.add('active');
    
    // Force the map tab content to be visible
    mapTabContent.style.display = 'block';
    
    console.log('Map tab forced to be active');
}
