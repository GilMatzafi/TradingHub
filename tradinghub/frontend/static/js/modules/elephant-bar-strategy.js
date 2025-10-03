// Import the main ElephantBarStrategy class
import { ElephantBarStrategy } from './elephant-bar-strategy/index.js';

// Initialize the elephant bar strategy when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐘 Elephant Bar strategy: DOM loaded, initializing...');
    
    try {
        // Create and initialize the elephant bar strategy
        const elephantBarStrategy = new ElephantBarStrategy();
        
        // Export for global access if needed
        window.elephantBarStrategy = elephantBarStrategy;
        
        console.log('🐘 Elephant Bar strategy: Initialization complete', {
            strategy: !!elephantBarStrategy,
            globalAccess: !!window.elephantBarStrategy,
            strategyType: typeof elephantBarStrategy,
            hasDataManager: !!elephantBarStrategy.dataManager
        });
        
        // Debug: Check if strategy is accessible globally
        setTimeout(() => {
            console.log('🐘 Debug: window.elephantBarStrategy exists?', !!window.elephantBarStrategy);
            console.log('🐘 Debug: window.elephantBarStrategy type:', typeof window.elephantBarStrategy);
        }, 1000);
        
    } catch (error) {
        console.error('🐘 Elephant Bar strategy initialization error:', error);
    }
});
