// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { MorningStarCandlestickVisualizer } from './candlestick-visualizer.js';

class MorningStarStrategy extends BaseStrategy {
    constructor() {
        // Create Morning Star-specific visualizer
        const visualizer = new MorningStarCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('morning_star', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Morning Star strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.morningStarStrategy = new MorningStarStrategy();
    console.log('Morning Star strategy loaded');
});
