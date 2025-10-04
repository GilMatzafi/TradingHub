// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { EngulfingCandlestickVisualizer } from './candlestick-visualizer.js';

class EngulfingStrategy extends BaseStrategy {
    constructor() {
        // Create engulfing-specific visualizer
        const visualizer = new EngulfingCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('engulfing', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Engulfing strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.engulfingStrategy = new EngulfingStrategy();
    console.log('Engulfing strategy loaded');
});
