// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { KickerCandlestickVisualizer } from './candlestick-visualizer.js';

class KickerStrategy extends BaseStrategy {
    constructor() {
        // Create Kicker-specific visualizer
        const visualizer = new KickerCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('kicker', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Kicker strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.kickerStrategy = new KickerStrategy();
    console.log('Kicker strategy loaded');
});
