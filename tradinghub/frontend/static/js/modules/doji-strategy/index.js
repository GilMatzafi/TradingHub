/**
 * Doji Strategy Module - Uses Universal Components
 * Only the candlestick visualizer is pattern-specific
 */
import { BaseStrategy } from '../shared/base-strategy.js';
import { DojiCandlestickVisualizer } from './candlestick-visualizer.js';

/**
 * DojiStrategy - Extends BaseStrategy with doji-specific visualizer only
 */
export class DojiStrategy extends BaseStrategy {
    constructor() {
        // Create doji-specific visualizer
        const visualizer = new DojiCandlestickVisualizer();
        
        // Initialize with universal components
        super('doji', visualizer);
    }

    /**
     * Initialize the doji strategy
     */
    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
    }
}

// Initialize the doji strategy when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🕯️ Doji strategy: DOM loaded, initializing...');
    
    try {
        // Create and initialize the doji strategy
        const dojiStrategy = new DojiStrategy();
        
        // Export for global access if needed
        window.dojiStrategy = dojiStrategy;
        
        console.log('🕯️ Doji strategy: Initialization complete', {
            strategy: !!dojiStrategy,
            globalAccess: !!window.dojiStrategy,
            strategyType: typeof dojiStrategy,
            hasDataManager: !!dojiStrategy.dataManager
        });
        
    } catch (error) {
        console.error('🕯️ Doji strategy initialization error:', error);
    }
});
