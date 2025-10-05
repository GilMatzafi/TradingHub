// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { TweezerBottomCandlestickVisualizer } from './candlestick-visualizer.js';

class TweezerBottomStrategy extends BaseStrategy {
    constructor() {
        // Create Tweezer Bottom-specific visualizer
        const visualizer = new TweezerBottomCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('tweezer_bottom', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Tweezer Bottom strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.tweezerBottomStrategy = new TweezerBottomStrategy();
    console.log('Tweezer Bottom strategy loaded');
});
