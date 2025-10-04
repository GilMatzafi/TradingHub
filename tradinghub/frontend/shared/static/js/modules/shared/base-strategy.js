/**
 * Universal BaseStrategy - Works for ANY pattern (hammer, doji, shooting star, etc.)
 * Base class that orchestrates all components
 */
import { FormHandler } from './form-handler.js';
import { PatternDataManager } from './pattern-data-manager.js';
import { ResultsRenderer } from './results-renderer.js';

export class BaseStrategy {
    /**
     * @param {string} patternType - The pattern type (hammer, doji, shooting_star, etc.)
     * @param {CandlestickVisualizer} visualizer - Pattern-specific visualizer
     */
    constructor(patternType, visualizer) {
        this.patternType = patternType;
        this.visualizer = visualizer;
        
        // Initialize universal components
        this.initializeUniversalComponents();
        
        // Initialize the strategy
        this.initialize();
    }

    /**
     * Initialize universal components (same for all patterns)
     */
    initializeUniversalComponents() {
        console.log('BaseStrategy: Initializing universal components for pattern:', this.patternType);
        
        // Initialize components with universal classes
        this.dataManager = new PatternDataManager();
        this.resultsRenderer = new ResultsRenderer();
        this.formHandler = new FormHandler(this.dataManager, this.resultsRenderer, this.patternType);
        
        console.log('BaseStrategy: Universal components initialized', {
            dataManager: !!this.dataManager,
            resultsRenderer: !!this.resultsRenderer,
            formHandler: !!this.formHandler
        });
    }

    /**
     * Initialize the strategy (pattern-specific)
     */
    initialize() {
        // Initialize visualization
        this.visualizer.updateVisualization();
        
        // Initialize CSV download functionality
        this.initializeCSVDownload();
        
        // Set up global reference
        this.setGlobalReference();
    }

    /**
     * Set global reference for backtest API
     */
    setGlobalReference() {
        // Set global reference so backtest API can find this strategy
        window[`${this.patternType}Strategy`] = this;
    }

    /**
     * Initialize CSV download functionality
     */
    initializeCSVDownload() {
        const downloadCSVButton = document.getElementById('downloadCSV');
        if (downloadCSVButton) {
            downloadCSVButton.addEventListener('click', () => {
                this.dataManager.exportToCSV();
            });
        }
    }

    /**
     * Get pattern type
     * @returns {string} Pattern type
     */
    getPatternType() {
        return this.patternType;
    }

    /**
     * Get data manager
     * @returns {PatternDataManager} Data manager instance
     */
    getDataManager() {
        return this.dataManager;
    }

    /**
     * Get results renderer
     * @returns {ResultsRenderer} Results renderer instance
     */
    getResultsRenderer() {
        return this.resultsRenderer;
    }

    /**
     * Get form handler
     * @returns {FormHandler} Form handler instance
     */
    getFormHandler() {
        return this.formHandler;
    }

    /**
     * Get visualizer
     * @returns {CandlestickVisualizer} Visualizer instance
     */
    getVisualizer() {
        return this.visualizer;
    }

    /**
     * Update visualization (delegates to pattern-specific visualizer)
     */
    updateVisualization() {
        if (this.visualizer && this.visualizer.updateVisualization) {
            this.visualizer.updateVisualization();
        }
    }

    /**
     * Handle parameter changes (delegates to form handler)
     */
    handleParameterChange() {
        if (this.formHandler && this.formHandler.updateVisualization) {
            this.formHandler.updateVisualization();
        }
    }
}
