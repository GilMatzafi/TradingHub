// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { DarkCloudCoverCandlestickVisualizer } from './candlestick-visualizer.js';

class DarkCloudCoverStrategy extends BaseStrategy {
    constructor() {
        // Create Dark Cloud Cover-specific visualizer
        const visualizer = new DarkCloudCoverCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('dark_cloud_cover', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Dark Cloud Cover strategy initialized');
    }

}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.darkCloudCoverStrategy = new DarkCloudCoverStrategy();
    console.log('Dark Cloud Cover strategy loaded');
});
