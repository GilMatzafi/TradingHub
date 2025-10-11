/**
 * Backtest Candlestick Chart - Refactored v2.0
 * 
 * Improvements (Phase 2):
 * ✅ Centralized error handling (safelyRun)
 * ✅ Hierarchical logging (logger.for('Init'))
 * ✅ Generic lifecycle manager (no DOM dependencies)
 * ✅ Performance monitoring hooks
 * ✅ Generic async utilities (waitUntil)
 * 
 * Previous improvements (Phase 1):
 * ✅ Separated lifecycle management from rendering logic
 * ✅ Robust error handling and validation
 * ✅ Controlled, leveled logging
 * ✅ Reduced DOM dependency (via helpers)
 * ✅ Ready for React/TypeScript migration
 * 
 * Usage:
 *   const chart = new BacktestCandlestickChart('containerId', 'canvasId');
 *   await chart.initialize(stockData, trades);
 *   
 *   // Optional: Add performance monitoring
 *   chart.onRenderComplete((duration) => {
 *       console.log(`Chart rendered in ${duration}ms`);
 *   });
 */

import { renderLightweightCharts, destroyLightweightCharts } from './candlestick-lightweight.js';
import { logger, LOG_LEVELS } from './candlestick-logger.js';
import { 
    getCanvasElement, 
    waitForElementReady, 
    hasValidDimensions,
    getElementDimensions 
} from './candlestick-dom.js';
import { 
    validateChartData, 
    sanitizeStockData, 
    sanitizeTrades 
} from './candlestick-validation.js';
import { LifecycleManager, ChartState } from './candlestick-lifecycle.js';
import { safelyRun } from './candlestick-error-handler.js';
import { measureTime } from './candlestick-utils.js';

/**
 * Configuration constants
 */
const DEFAULT_CONFIG = {
    retryAttempts: 5,
    retryDelay: 200,
    enableSanitization: true,
    strictValidation: false, // If true, fails on validation errors; if false, tries to sanitize
    logLevel: LOG_LEVELS.WARN,
    enablePerformanceHooks: false // Enable automatic performance monitoring
};

/**
 * Backtest Candlestick Chart Class
 */
export class BacktestCandlestickChart {
    /**
     * Constructor
     * @param {string} containerId - DOM container ID
     * @param {string} canvasId - Canvas element ID
     * @param {object} config - Configuration options
     */
    constructor(
        containerId = 'backtestCandlestickContainer', 
        canvasId = 'backtestCandlestickChart',
        config = {}
    ) {
        // Configuration
        this.config = { ...DEFAULT_CONFIG, ...config };
        
        // DOM references (never accessed directly, only via helpers)
        this.containerId = containerId;
        this.canvasId = canvasId;
        
        // Chart state
        this.chart = null;
        this.stockData = null;
        this.trades = null;
        
        // Lifecycle manager (generic, no DOM dependency)
        this.lifecycle = new LifecycleManager(`CandlestickChart-${canvasId}`);
        
        // Hierarchical logger
        this.log = logger.for('CandlestickChart');
        
        // Configure logger
        logger.setLogLevel(this.config.logLevel);
        
        // Setup performance hooks if enabled
        if (this.config.enablePerformanceHooks) {
            this._setupPerformanceMonitoring();
        }
        
        this.log.lifecycle('Chart created', {
            containerId,
            canvasId,
            config: this.config
        });
    }

    /**
     * Setup automatic performance monitoring
     * @private
     */
    _setupPerformanceMonitoring() {
        this.lifecycle.on('render:complete', (duration) => {
            this.log.performance('Render complete', duration);
        });

        this.lifecycle.on('init:complete', (timestamp) => {
            this.log.debug('Initialization complete', { timestamp });
        });

        this.lifecycle.on('destroy:complete', (timestamp) => {
            this.log.debug('Destruction complete', { timestamp });
        });
    }

    /**
     * Register a callback for render complete events
     * @param {Function} callback - Called with duration in ms
     * 
     * @example
     *   chart.onRenderComplete((duration) => {
     *       metricsCollector.record('chart_render_time', duration);
     *   });
     */
    onRenderComplete(callback) {
        this.lifecycle.on('render:complete', callback);
    }

    /**
     * Initialize chart with data (ASYNC - properly handles DOM readiness)
     * @param {Array} stockData - Stock OHLC data
     * @param {Array} trades - Trade markers
     * @returns {Promise<boolean>} Success status
     */
    async initialize(stockData, trades) {
        const initLog = this.log.for('Init');
        
        initLog.info('Starting initialization', {
            stockDataLength: stockData?.length,
            tradesLength: trades?.length
        });

        // Transition to initializing state
        if (!this.lifecycle.transitionTo(ChartState.INITIALIZING)) {
            return false;
        }

        // Step 1: Validate and sanitize data
        const { success: dataReady, result: validatedData } = await safelyRun(
            'Validate and Sanitize Data',
            async () => await this._prepareData(stockData, trades),
            this
        );

        if (!dataReady) {
            return false;
        }

        const { stockData: cleanStockData, trades: cleanTrades } = validatedData;

        // Step 2: Store validated data
        this.stockData = cleanStockData;
        this.trades = cleanTrades;

        // Transition to initialized
        if (!this.lifecycle.transitionTo(ChartState.INITIALIZED)) {
            return false;
        }

        // Step 3: Wait for DOM to be ready
        const { success: domReady, result: canvas } = await safelyRun(
            'Wait for Canvas DOM',
            async () => await this._waitForCanvas(),
            this
        );

        if (!domReady || !canvas) {
            return false;
        }

        // Step 4: Clean up any existing chart
        await this.destroy();

        // Step 5: Render the chart
        const { success: rendered } = await safelyRun(
            'Render Chart',
            async () => await this._renderChart(),
            this
        );

        return rendered;
    }

    /**
     * Prepare and validate data (internal method)
     * @private
     */
    async _prepareData(stockData, trades) {
        const dataLog = this.log.for('Data');
        
        // Validate input data
        const validation = validateChartData(stockData, trades);
        
        if (!validation.valid) {
            if (this.config.strictValidation) {
                throw new Error(`Validation failed: ${validation.getErrorMessage()}`);
            }
            
            dataLog.warn('Validation failed, attempting to sanitize data');
            
            // Try to sanitize data
            stockData = sanitizeStockData(stockData);
            trades = sanitizeTrades(trades);
            
            // Re-validate after sanitization
            const revalidation = validateChartData(stockData, trades);
            if (!revalidation.valid) {
                throw new Error(`Sanitization failed: ${revalidation.getErrorMessage()}`);
            }
            
            dataLog.info('Data sanitized successfully', {
                stockDataPoints: stockData.length,
                tradesCount: trades.length
            });
        }

        return { stockData, trades };
    }

    /**
     * Wait for canvas to be ready (internal method)
     * @private
     */
    async _waitForCanvas() {
        const domLog = this.log.for('DOM');
        
        domLog.debug(`Waiting for canvas: ${this.canvasId}`);
        
        const canvas = await waitForElementReady(
            this.canvasId,
            this.config.retryAttempts,
            this.config.retryDelay
        );
        
        const dimensions = getElementDimensions(canvas);
        domLog.debug('Canvas ready', dimensions);
        
        return canvas;
    }

    /**
     * Render the chart (internal method)
     * @private
     */
    async _renderChart() {
        const renderLog = this.log.for('Render');
        
        if (!this.lifecycle.isReadyToRender()) {
            throw new Error(`Chart not ready to render (state: ${this.lifecycle.getState()})`);
        }

        // Transition to rendering
        if (!this.lifecycle.transitionTo(ChartState.RENDERING)) {
            throw new Error('Failed to transition to rendering state');
        }

        const canvas = getCanvasElement(this.canvasId);
        
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        if (!hasValidDimensions(canvas)) {
            throw new Error('Canvas has invalid dimensions');
        }

        // Measure render time
        const { result: chart, duration } = await measureTime(
            'Lightweight Charts Render',
            () => renderLightweightCharts(canvas, this.stockData, this.trades)
        );

        if (!chart) {
            throw new Error('Chart rendering returned null');
        }

        this.chart = chart;

        // Transition to rendered
        if (!this.lifecycle.transitionTo(ChartState.RENDERED)) {
            throw new Error('Failed to transition to rendered state');
        }

        renderLog.info('Chart rendered successfully', {
            stockDataPoints: this.stockData.length,
            tradesCount: this.trades.length,
            renderTime: `${duration}ms`
        });

        return true;
    }

    /**
     * Update chart with new data (ASYNC)
     * @param {Array} stockData - New stock data
     * @param {Array} trades - New trades data
     * @returns {Promise<boolean>} Success status
     */
    async updateData(stockData, trades) {
        const updateLog = this.log.for('Update');
        
        updateLog.info('Updating chart data');

        if (!this.lifecycle.isRendered()) {
            updateLog.warn('Chart not rendered, calling initialize instead');
            return await this.initialize(stockData, trades);
        }

        // Transition to updating
        if (!this.lifecycle.transitionTo(ChartState.UPDATING)) {
            return false;
        }

        // Validate and prepare new data
        const { success: dataReady, result: validatedData } = await safelyRun(
            'Prepare Update Data',
            async () => await this._prepareData(stockData, trades),
            this
        );

        if (!dataReady) {
            return false;
        }

        // Update stored data
        this.stockData = validatedData.stockData;
        this.trades = validatedData.trades;

        // Destroy and re-render
        await this.destroy();
        
        const { success: rendered } = await safelyRun(
            'Re-render Chart',
            async () => await this._renderChart(),
            this
        );

        return rendered;
    }

    /**
     * Destroy chart and clean up resources
     * @returns {Promise<boolean>} Success status
     */
    async destroy() {
        const destroyLog = this.log.for('Destroy');
        
        if (this.lifecycle.isDestroyed()) {
            destroyLog.debug('Chart already destroyed');
            return true;
        }

        destroyLog.info('Destroying chart');

        // Transition to destroying
        this.lifecycle.transitionTo(ChartState.DESTROYING);

        const { success } = await safelyRun(
            'Destroy Chart Instance',
            () => {
                if (this.chart) {
                    destroyLightweightCharts(this.chart, this.canvasId);
                    this.chart = null;
                    destroyLog.debug('Chart instance destroyed');
                }
                return true;
            },
            null // Don't update lifecycle on error (we're already destroying)
        );

        // Transition to destroyed
        this.lifecycle.transitionTo(ChartState.DESTROYED);
        
        return success;
    }

    /**
     * Get current lifecycle state
     * @returns {string} Current state
     */
    getState() {
        return this.lifecycle.getState();
    }

    /**
     * Get lifecycle summary (for debugging)
     * @returns {object} Lifecycle information
     */
    getLifecycleSummary() {
        return this.lifecycle.getSummary();
    }

    /**
     * Check if chart is ready
     * @returns {boolean}
     */
    isReady() {
        return this.lifecycle.isRendered();
    }

    /**
     * Check if chart has error
     * @returns {boolean}
     */
    hasError() {
        return this.lifecycle.hasError();
    }

    /**
     * Get error message
     * @returns {string|null}
     */
    getErrorMessage() {
        return this.lifecycle.getErrorMessage();
    }

    /**
     * Enable debug logging
     */
    enableDebug() {
        logger.setLogLevel(LOG_LEVELS.DEBUG);
        this.log.info('Debug logging enabled');
    }

    /**
     * Disable debug logging
     */
    disableDebug() {
        logger.setLogLevel(LOG_LEVELS.WARN);
        this.log.info('Debug logging disabled');
    }

    // ========================================
    // Legacy API (for backward compatibility)
    // ========================================

    /**
     * Get canvas element (DEPRECATED - use DOM helpers instead)
     * @deprecated Use getCanvasElement() from candlestick-dom.js
     */
    getCanvas() {
        this.log.warn('getCanvas() is deprecated, use DOM helpers instead');
        return getCanvasElement(this.canvasId);
    }

    /**
     * Validate data (DEPRECATED - use validation module)
     * @deprecated Use validateChartData() from candlestick-validation.js
     */
    validateData() {
        this.log.warn('validateData() is deprecated, use validation module instead');
        const result = validateChartData(this.stockData, this.trades);
        return result.valid;
    }

    /**
     * Render (DEPRECATED - use initialize())
     * @deprecated Use initialize() instead
     */
    render() {
        this.log.warn('render() is deprecated, use initialize() instead');
        return this._renderChart();
    }
}
