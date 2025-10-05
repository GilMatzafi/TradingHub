// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { EveningStarCandlestickVisualizer } from './candlestick-visualizer.js';

class EveningStarStrategy extends BaseStrategy {
    constructor() {
        // Create Evening Star-specific visualizer
        const visualizer = new EveningStarCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('evening_star', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Evening Star strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.eveningStarStrategy = new EveningStarStrategy();
    console.log('Evening Star strategy loaded');
});
