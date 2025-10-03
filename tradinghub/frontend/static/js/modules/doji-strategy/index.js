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
