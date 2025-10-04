// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { HaramiCandlestickVisualizer } from './candlestick-visualizer.js';

class HaramiStrategy extends BaseStrategy {
    constructor() {
        // Create harami-specific visualizer
        const visualizer = new HaramiCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('harami', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Harami strategy initialized');
    }
}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.haramiStrategy = new HaramiStrategy();
    console.log('Harami strategy loaded');
});
