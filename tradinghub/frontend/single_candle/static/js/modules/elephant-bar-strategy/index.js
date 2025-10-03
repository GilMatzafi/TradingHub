/**
 * Elephant Bar Strategy Module - Uses Universal Components
 * Only the candlestick visualizer is pattern-specific
 */
import { BaseStrategy } from '../shared/base-strategy.js';
import { ElephantBarCandlestickVisualizer } from './candlestick-visualizer.js';

/**
 * ElephantBarStrategy - Extends BaseStrategy with elephant bar-specific visualizer only
 */
export class ElephantBarStrategy extends BaseStrategy {
    constructor() {
        // Create elephant bar-specific visualizer
        const visualizer = new ElephantBarCandlestickVisualizer();
        
        // Initialize with universal components
        super('elephant_bar', visualizer);
    }

    /**
     * Initialize the elephant bar strategy
     */
    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
    }
}

// Initialize the elephant bar strategy when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐘 Elephant Bar strategy: DOM loaded, initializing...');
    
    try {
        // Create and initialize the elephant bar strategy
        const elephantBarStrategy = new ElephantBarStrategy();
        
        // Export for global access if needed
        window.elephantBarStrategy = elephantBarStrategy;
        
        console.log('🐘 Elephant Bar strategy: Initialization complete', {
            strategy: !!elephantBarStrategy,
            globalAccess: !!window.elephantBarStrategy,
            strategyType: typeof elephantBarStrategy,
            hasDataManager: !!elephantBarStrategy.dataManager
        });
        
    } catch (error) {
        console.error('🐘 Elephant Bar strategy initialization error:', error);
    }
});
