// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { PiercingLineCandlestickVisualizer } from './candlestick-visualizer.js';

class PiercingLineStrategy extends BaseStrategy {
    constructor() {
        // Create piercing line-specific visualizer
        const visualizer = new PiercingLineCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('piercing_line', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Piercing Line strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.piercingLineStrategy = new PiercingLineStrategy();
    console.log('Piercing Line strategy loaded');
});
