/**
 * Hammer Strategy Module - Uses Universal Components
 * Only the candlestick visualizer is pattern-specific
 */
import { BaseStrategy } from '../shared/base-strategy.js';
import { HammerCandlestickVisualizer } from './candlestick-visualizer.js';

/**
 * HammerStrategy - Extends BaseStrategy with hammer-specific visualizer only
 */
export class HammerStrategy extends BaseStrategy {
    constructor() {
        // Create hammer-specific visualizer
        const visualizer = new HammerCandlestickVisualizer();
        
        // Initialize with universal components
        super('hammer', visualizer);
    }

    /**
     * Initialize the hammer strategy
     */
    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
    }
}

// Initialize the hammer strategy when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔨 Hammer strategy: DOM loaded, initializing...');
    
    try {
        // Create and initialize the hammer strategy
        const hammerStrategy = new HammerStrategy();
        
        // Export for global access if needed
        window.hammerStrategy = hammerStrategy;
        
        console.log('🔨 Hammer strategy: Initialization complete', {
            strategy: !!hammerStrategy,
            globalAccess: !!window.hammerStrategy,
            strategyType: typeof hammerStrategy,
            hasDataManager: !!hammerStrategy.dataManager
        });
        
    } catch (error) {
        console.error('🔨 Hammer strategy initialization error:', error);
    }
}); 