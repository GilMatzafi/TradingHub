// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { ThreeInsideDownCandlestickVisualizer } from './candlestick-visualizer.js';

class ThreeInsideDownStrategy extends BaseStrategy {
    constructor() {
        // Create Three Inside Down-specific visualizer
        const visualizer = new ThreeInsideDownCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('three_inside_down', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Three Inside Down strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.threeInsideDownStrategy = new ThreeInsideDownStrategy();
    console.log('Three Inside Down strategy loaded');
});
