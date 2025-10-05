// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { ThreeWhiteSoldiersCandlestickVisualizer } from './candlestick-visualizer.js';

class ThreeWhiteSoldiersStrategy extends BaseStrategy {
    constructor() {
        // Create Three White Soldiers-specific visualizer
        const visualizer = new ThreeWhiteSoldiersCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('three_white_soldiers', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Three White Soldiers strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.threeWhiteSoldiersStrategy = new ThreeWhiteSoldiersStrategy();
    console.log('Three White Soldiers strategy loaded');
});
