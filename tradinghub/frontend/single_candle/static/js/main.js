// Import modules
import { initBacktest } from './modules/backtest.js';

// Initialize the application based on the current page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize backtest functionality
    initBacktest();
    
    // Initialize pattern-specific strategies based on current page
    const path = window.location.pathname;
    console.log('Current path:', path);
    
    if (path === '/hammer' || path.endsWith('/hammer')) {
        // Load hammer strategy
        import('./modules/hammer-strategy.js').then(module => {
            console.log('Hammer strategy loaded successfully');
        }).catch(error => {
            console.error('Error loading hammer strategy:', error);
        });
    } else if (path === '/doji' || path.endsWith('/doji')) {
        // Doji strategy is already loaded by the template
        console.log('Doji strategy already loaded by template');
    } else if (path === '/elephant_bar' || path.endsWith('/elephant_bar')) {
        // Elephant Bar strategy is already loaded by the template
        console.log('Elephant Bar strategy already loaded by template');
    } else if (path === '/shooting_star' || path.endsWith('/shooting_star')) {
        // Load shooting star strategy (when implemented)
        console.log('Shooting star strategy not yet implemented');
    }
});