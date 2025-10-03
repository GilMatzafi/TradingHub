/**
 * Universal CandlestickVisualizer Base Class - Works for ANY pattern
 * Base class for pattern-specific candlestick visualizations
 */
export class CandlestickVisualizer {
    /**
     * @param {string} patternType - The pattern type (hammer, doji, shooting_star, etc.)
     */
    constructor(patternType) {
        this.patternType = patternType;
        this.initializeElements();
    }

    /**
     * Initialize DOM elements needed for visualization
     */
    initializeElements() {
        this.candlestickBody = document.querySelector('.candlestick-body');
        this.upperShadow = document.querySelector('.candlestick-upper-shadow');
        this.lowerShadow = document.querySelector('.candlestick-lower-shadow');
    }

    /**
     * Update the candlestick visualization based on current parameters
     * This method should be overridden by pattern-specific classes
     */
    updateVisualization() {
        console.log(`Visualization update requested for ${this.patternType} pattern`);
        // Default implementation - should be overridden
    }

    /**
     * Get parameter value safely
     * @param {string} paramId - Parameter ID
     * @param {*} defaultValue - Default value if parameter doesn't exist
     * @returns {*} Parameter value or default
     */
    getParameterValue(paramId, defaultValue = 0) {
        const element = document.getElementById(paramId);
        if (element) {
            if (element.type === 'checkbox') {
                return element.checked;
            } else if (element.type === 'range' || element.type === 'number') {
                return parseFloat(element.value);
            } else {
                return element.value;
            }
        }
        return defaultValue;
    }

    /**
     * Set element style safely
     * @param {HTMLElement} element - Element to style
     * @param {string} property - CSS property
     * @param {string} value - CSS value
     */
    setElementStyle(element, property, value) {
        if (element) {
            element.style[property] = value;
        }
    }

    /**
     * Calculate percentage-based height
     * @param {number} ratio - Ratio (0-1)
     * @param {number} totalHeight - Total height in pixels
     * @returns {number} Calculated height in pixels
     */
    calculateHeight(ratio, totalHeight = 120) {
        return Math.max(2, ratio * totalHeight); // Minimum 2px height
    }

    /**
     * Get color based on pattern type
     * @param {boolean} isGreen - Whether the candle is green
     * @returns {string} Color value
     */
    getCandleColor(isGreen) {
        return isGreen ? '#00c853' : '#d32f2f'; // Green or red
    }

    /**
     * Get shadow color
     * @returns {string} Shadow color
     */
    getShadowColor() {
        return '#666666'; // Gray for shadows
    }

    /**
     * Validate parameter exists
     * @param {string} paramId - Parameter ID to check
     * @returns {boolean} Whether parameter exists
     */
    parameterExists(paramId) {
        return document.getElementById(paramId) !== null;
    }

    /**
     * Get all available parameters for this pattern
     * @returns {Array} Array of parameter IDs that exist
     */
    getAvailableParameters() {
        const commonParams = ['body_size_ratio', 'ma_period'];
        const patternSpecificParams = this.getPatternSpecificParameters();
        
        return [...commonParams, ...patternSpecificParams].filter(param => 
            this.parameterExists(param)
        );
    }

    /**
     * Get pattern-specific parameters (to be overridden)
     * @returns {Array} Array of pattern-specific parameter IDs
     */
    getPatternSpecificParameters() {
        // Default implementation - should be overridden
        return [];
    }

    /**
     * Log visualization update
     * @param {Object} params - Parameters used for visualization
     */
    logVisualizationUpdate(params) {
        console.log(`${this.patternType} visualization updated with params:`, params);
    }
}
