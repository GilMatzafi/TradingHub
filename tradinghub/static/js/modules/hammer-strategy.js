/**
 * Hammer Strategy Module
 * This file serves as the entry point for the hammer strategy functionality
 * It imports and initializes the modular components
 */

// Import the main HammerStrategy class
import { HammerStrategy } from './hammer-strategy/index.js';

// Initialize the hammer strategy when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the hammer strategy
    const hammerStrategy = new HammerStrategy();
    
    // Export for global access if needed
    window.hammerStrategy = hammerStrategy;
});

// Export the HammerStrategy class for use in other modules
export { HammerStrategy }; 