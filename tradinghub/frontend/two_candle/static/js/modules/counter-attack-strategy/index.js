// Import shared components
import { BaseStrategy } from '/shared/js/modules/shared/base-strategy.js';
import { CounterAttackCandlestickVisualizer } from './candlestick-visualizer.js';

class CounterAttackStrategy extends BaseStrategy {
    constructor() {
        // Create counter attack-specific visualizer
        const visualizer = new CounterAttackCandlestickVisualizer('candlestickChart');
        
        // Initialize with universal components
        super('counter_attack', visualizer);
    }

    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
        
        console.log('Counter Attack strategy initialized');
    }
}

// Initialize the strategy when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.counter_attackStrategy = new CounterAttackStrategy();
    console.log('Counter Attack strategy loaded');
});
