/**
 * Main Hammer Strategy Module
 * Orchestrates all components of the hammer strategy functionality
 */
import { CandlestickVisualizer } from './candlestick-visualizer.js';
import { PatternDataManager } from './pattern-data-manager.js';
import { ResultsRenderer } from './results-renderer.js';
import { FormHandler } from './form-handler.js';

/**
 * HammerStrategy - Main class that orchestrates all components
 */
export class HammerStrategy {
    constructor() {
        // Initialize components
        this.visualizer = new CandlestickVisualizer();
        this.dataManager = new PatternDataManager();
        this.resultsRenderer = new ResultsRenderer();
        this.formHandler = new FormHandler(this.dataManager, this.resultsRenderer);
        
        // Initialize the strategy
        this.initialize();
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