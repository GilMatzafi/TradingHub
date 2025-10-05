// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { ThreeBlackCrowsCandlestickVisualizer } from './candlestick-visualizer.js';

class ThreeBlackCrowsStrategy extends BaseStrategy {
    constructor() {
        // Create Three Black Crows-specific visualizer
        const visualizer = new ThreeBlackCrowsCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('three_black_crows', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Three Black Crows strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.threeBlackCrowsStrategy = new ThreeBlackCrowsStrategy();
    console.log('Three Black Crows strategy loaded');
});
