// Import modules
import { initBacktest } from './modules/backtest.js';

// Initialize the application based on the current page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize backtest functionality
    initBacktest();
    
    // Initialize pattern-specific strategies based on current page
    const path = window.location.pathname;
    
    if (path.includes('/hammer')) {
        // Load hammer strategy
        import('./modules/hammer-strategy.js').then(module => {
            console.log('Hammer strategy loaded successfully');
        }).catch(error => {
            console.error('Error loading hammer strategy:', error);
        });
    } else if (path.includes('/doji')) {
        // Load doji strategy (when implemented)
        console.log('Doji strategy not yet implemented');
    } else if (path.includes('/shooting_star')) {
        // Load shooting star strategy (when implemented)
        console.log('Shooting star strategy not yet implemented');
    }
});