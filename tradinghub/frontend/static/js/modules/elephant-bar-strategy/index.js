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
