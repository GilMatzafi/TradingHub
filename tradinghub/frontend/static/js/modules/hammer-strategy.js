/**
 * Hammer Strategy Module
 * This file serves as the entry point for the hammer strategy functionality
 * It imports and initializes the modular components
 */

// Import the main HammerStrategy class
import { HammerStrategy } from './hammer-strategy/index.js';

// Initialize the hammer strategy when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Hammer strategy: DOM loaded, initializing...');
    
    // Create and initialize the hammer strategy
    const hammerStrategy = new HammerStrategy();
    
    // Export for global access if needed
    window.hammerStrategy = hammerStrategy;
    
    console.log('Hammer strategy: Initialization complete', {
        strategy: !!hammerStrategy,
        globalAccess: !!window.hammerStrategy
    });
});

// Export the HammerStrategy class for use in other modules
export { HammerStrategy }; 