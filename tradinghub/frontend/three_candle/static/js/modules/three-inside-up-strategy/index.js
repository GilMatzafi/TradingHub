// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { ThreeInsideUpCandlestickVisualizer } from './candlestick-visualizer.js';

class ThreeInsideUpStrategy extends BaseStrategy {
    constructor() {
        // Create Three Inside Up-specific visualizer
        const visualizer = new ThreeInsideUpCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('three_inside_up', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Three Inside Up strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.threeInsideUpStrategy = new ThreeInsideUpStrategy();
    console.log('Three Inside Up strategy loaded');
});
