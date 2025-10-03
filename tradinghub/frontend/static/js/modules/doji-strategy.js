// Import the main DojiStrategy class
import { DojiStrategy } from './doji-strategy/index.js';

// Initialize the doji strategy when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Doji strategy: DOM loaded, initializing...');
    
    // Create and initialize the doji strategy
    const dojiStrategy = new DojiStrategy();
    
    // Export for global access if needed
    window.dojiStrategy = dojiStrategy;
    
    console.log('Doji strategy: Initialization complete', {
        strategy: !!dojiStrategy,
        globalAccess: !!window.dojiStrategy
    });
});
