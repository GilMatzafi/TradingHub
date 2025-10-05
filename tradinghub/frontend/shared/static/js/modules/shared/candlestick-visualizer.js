/**
 * Universal CandlestickVisualizer Base Class - Works for ANY pattern
 * Enhanced base class with all common functionality to eliminate code duplication
 */
export class CandlestickVisualizer {
    /**
     * @param {string} patternType - The pattern type (hammer, doji, shooting_star, etc.)
     * @param {string} canvasId - Optional canvas ID for chart rendering
     */
    constructor(patternType, canvasId = null) {
        this.patternType = patternType;
        this.canvasId = canvasId;
        this.chartContainer = canvasId ? document.getElementById(canvasId) : null;
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

    /**
     * COMMON FUNCTIONALITY - Update range value display
     * @param {HTMLInputElement} input - The range input element
     */
    updateRangeValue(input) {
        const container = input.closest('.range-container');
        if (!container) return; // Exit if no container found
        
        const valueDisplay = container.querySelector('.range-value');
        const value = input.value;
        
        // Update the value display
        if (valueDisplay) {
            valueDisplay.textContent = value;
            
            // Calculate the position
            const percent = (value - input.min) / (input.max - input.min);
            const leftOffset = percent * (input.offsetWidth - 20); // 20 is thumb width
            
            // Update value display position
            valueDisplay.style.left = `${leftOffset + 10}px`; // 10 is half of thumb width
            valueDisplay.style.transform = 'translateX(-50%)';
        }
    }

    /**
     * COMMON FUNCTIONALITY - Initialize event listeners for visualization elements
     */
    initializeEventListeners() {
        // Add event listeners for range inputs
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            // Initialize range value displays
            this.updateRangeValue(input);
            
            // Add event listeners for range input changes
            input.addEventListener('input', () => {
                this.updateRangeValue(input);
                this.handleRangeInputChange(input);
            });
            
            // Add event listener for when dragging ends
            input.addEventListener('change', () => {
                this.updateRangeValue(input);
            });
        });
        
        // Add event listeners for pattern-specific controls
        this.initializePatternSpecificEventListeners();
    }

    /**
     * COMMON FUNCTIONALITY - Handle range input changes
     * @param {HTMLInputElement} input - The range input that changed
     */
    handleRangeInputChange(input) {
        const commonParams = ['body_size_ratio', 'ma_period'];
        const patternSpecificParams = this.getPatternSpecificParameters();
        const allParams = [...commonParams, ...patternSpecificParams];
        
        if (allParams.includes(input.id)) {
            this.updateVisualization();
        }
    }

    /**
     * COMMON FUNCTIONALITY - Initialize pattern-specific event listeners
     * Override this method in pattern-specific classes for custom controls
     */
    initializePatternSpecificEventListeners() {
        // Default implementation - can be overridden
    }

    /**
     * COMMON FUNCTIONALITY - Render pattern markers on chart
     * @param {Array} patterns - Array of pattern data
     * @param {string} patternType - Type of pattern for marker styling
     */
    renderPatternMarkers(patterns, patternType) {
        if (!patterns || patterns.length === 0) {
            console.log(`No ${patternType} patterns to render`);
            return;
        }

        console.log(`Rendering ${patterns.length} ${patternType} patterns`);
        
        // Clear existing markers
        this.clearPatternMarkers(patternType);
        
        // Render each pattern
        patterns.forEach((pattern, index) => {
            this.renderSinglePatternMarker(pattern, index, patternType);
        });
    }

    /**
     * COMMON FUNCTIONALITY - Render a single pattern marker
     * @param {Object} pattern - Pattern data
     * @param {number} index - Pattern index
     * @param {string} patternType - Type of pattern
     */
    renderSinglePatternMarker(pattern, index, patternType) {
        const { date, open, high, low, close, pattern_type } = pattern;
        
        // Create pattern marker
        const marker = document.createElement('div');
        marker.className = `pattern-marker ${patternType}-marker`;
        marker.style.position = 'absolute';
        marker.style.left = `${index * 20}px`;
        marker.style.top = '10px';
        marker.style.width = '15px';
        marker.style.height = '15px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = this.getMarkerColor(pattern_type);
        marker.style.border = '2px solid white';
        marker.style.zIndex = '10';
        marker.title = `${patternType} Pattern: ${date}`;
        
        // Add to chart container
        if (this.chartContainer) {
            this.chartContainer.appendChild(marker);
        }
    }

    /**
     * COMMON FUNCTIONALITY - Get marker color based on pattern type
     * @param {string} patternType - Pattern type
     * @returns {string} Color for the marker
     */
    getMarkerColor(patternType) {
        if (patternType && patternType.includes('bullish')) {
            return '#28a745';
        } else if (patternType && patternType.includes('bearish')) {
            return '#dc3545';
        } else {
            return '#6c757d'; // Neutral color
        }
    }

    /**
     * COMMON FUNCTIONALITY - Clear all pattern markers
     * @param {string} patternType - Type of pattern markers to clear
     */
    clearPatternMarkers(patternType) {
        const markers = document.querySelectorAll(`.${patternType}-marker`);
        markers.forEach(marker => marker.remove());
    }

    /**
     * COMMON FUNCTIONALITY - Apply transition classes for smooth animation
     */
    addTransitionClasses() {
        if (this.candlestickBody) this.candlestickBody.classList.add('transitioning');
        if (this.upperShadow) this.upperShadow.classList.add('transitioning');
        if (this.lowerShadow) this.lowerShadow.classList.add('transitioning');
    }

    /**
     * COMMON FUNCTIONALITY - Remove transition classes after animation
     */
    removeTransitionClasses() {
        setTimeout(() => {
            if (this.candlestickBody) this.candlestickBody.classList.remove('transitioning');
            if (this.upperShadow) this.upperShadow.classList.remove('transitioning');
            if (this.lowerShadow) this.lowerShadow.classList.remove('transitioning');
        }, 300);
    }

    /**
     * COMMON FUNCTIONALITY - Update candlestick body and shadows
     * @param {number} bodyHeight - Height of the body
     * @param {number} bodyTop - Top position of the body
     * @param {number} upperShadowHeight - Height of upper shadow
     * @param {number} lowerShadowHeight - Height of lower shadow
     */
    updateCandlestickElements(bodyHeight, bodyTop, upperShadowHeight, lowerShadowHeight) {
        // Update the body
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update the shadows
        this.setElementStyle(this.upperShadow, 'height', `${upperShadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - upperShadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${lowerShadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
    }

    /**
     * COMMON FUNCTIONALITY - Set candlestick color
     * @param {string} color - Color to set
     */
    setCandlestickColor(color) {
        this.setElementStyle(this.candlestickBody, 'background-color', color);
    }
}
