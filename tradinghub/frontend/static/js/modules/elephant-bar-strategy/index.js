/**
 * Main Elephant Bar Strategy Module
 * Orchestrates all components of the elephant bar strategy functionality
 */
import { CandlestickVisualizer } from './candlestick-visualizer.js';
import { PatternDataManager } from './pattern-data-manager.js';
import { ResultsRenderer } from './results-renderer.js';
import { FormHandler } from './form-handler.js';

/**
 * ElephantBarStrategy - Main class that orchestrates all components
 */
export class ElephantBarStrategy {
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
     * Initialize the elephant bar strategy
     */
    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        this.visualizer.initializeEventListeners();
    }
} 