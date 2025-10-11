/**
 * Candlestick Chart Logger
 * Centralized, controlled logging for debugging
 */

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

/**
 * Logger configuration
 * Can be controlled via window.CHART_DEBUG_LEVEL
 */
const DEFAULT_LOG_LEVEL = window.CHART_DEBUG_LEVEL || LOG_LEVELS.WARN;

/**
 * Logger class for candlestick chart with hierarchical support
 */
class CandlestickLogger {
    constructor(componentName = 'CandlestickChart', parentLogger = null) {
        this.componentName = componentName;
        this.parentLogger = parentLogger;
        this.logLevel = parentLogger?.logLevel || DEFAULT_LOG_LEVEL;
        this.children = new Map();
    }

    /**
     * Create a child logger with hierarchical naming
     * @param {string} childName - Child component name
     * @returns {CandlestickLogger} New child logger
     * 
     * Example:
     *   const mainLog = logger.for('CandlestickChart');
     *   const initLog = mainLog.for('Init');
     *   initLog.info('started'); // [CandlestickChart:Init] started
     */
    for(childName) {
        // Check if child already exists
        if (this.children.has(childName)) {
            return this.children.get(childName);
        }
        
        // Create new child logger
        const fullName = this.componentName ? `${this.componentName}:${childName}` : childName;
        const childLogger = new CandlestickLogger(fullName, this);
        
        // Cache it
        this.children.set(childName, childLogger);
        
        return childLogger;
    }

    /**
     * Set log level dynamically (propagates to children)
     */
    setLogLevel(level) {
        this.logLevel = level;
        
        // Propagate to all children
        for (const child of this.children.values()) {
            child.setLogLevel(level);
        }
    }

    /**
     * Format log message with timestamp and component name
     */
    _format(level, message, data = null) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const prefix = `[${timestamp}] [${this.componentName}] [${level}]`;
        
        if (data !== null && typeof data === 'object') {
            return [prefix, message, data];
        }
        return [prefix, message];
    }

    /**
     * Log error (always shown)
     */
    error(message, data = null) {
        if (this.logLevel >= LOG_LEVELS.ERROR) {
            console.error(...this._format('ERROR', message, data));
        }
    }

    /**
     * Log warning
     */
    warn(message, data = null) {
        if (this.logLevel >= LOG_LEVELS.WARN) {
            console.warn(...this._format('WARN', message, data));
        }
    }

    /**
     * Log info
     */
    info(message, data = null) {
        if (this.logLevel >= LOG_LEVELS.INFO) {
            console.log(...this._format('INFO', message, data));
        }
    }

    /**
     * Log debug (only in debug mode)
     */
    debug(message, data = null) {
        if (this.logLevel >= LOG_LEVELS.DEBUG) {
            console.log(...this._format('DEBUG', message, data));
        }
    }

    /**
     * Log lifecycle events
     */
    lifecycle(event, data = null) {
        this.info(`Lifecycle: ${event}`, data);
    }

    /**
     * Log performance metrics
     */
    performance(action, duration) {
        this.debug(`Performance: ${action} took ${duration}ms`);
    }
}

// Export singleton instance
export const logger = new CandlestickLogger();

// Export log levels for external use
export { LOG_LEVELS };

