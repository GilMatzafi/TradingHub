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