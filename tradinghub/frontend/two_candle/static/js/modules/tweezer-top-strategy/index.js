// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { TweezerTopCandlestickVisualizer } from './candlestick-visualizer.js';

class TweezerTopStrategy extends BaseStrategy {
    constructor() {
        // Create Tweezer Top-specific visualizer
        const visualizer = new TweezerTopCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('tweezer_top', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Tweezer Top strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.tweezerTopStrategy = new TweezerTopStrategy();
    console.log('Tweezer Top strategy loaded');
});
