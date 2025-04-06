// Import modules
import { initHammerStrategy } from './modules/hammer-strategy.js';
import { initBacktest } from './modules/backtest.js';
import { initDashboard } from './modules/dashboard.js';

// Initialize the application based on the current page
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on and initialize accordingly
    const path = window.location.pathname;
    
    if (path.includes('/hammer')) {
        // Initialize hammer strategy page
        initHammerStrategy();
        initBacktest();
    } else if (path === '/' || path.includes('/dashboard')) {
        // Initialize dashboard
        initDashboard();
    }
});