/**
 * EngulfingCandlestickVisualizer - Handles engulfing-specific visualization logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class EngulfingCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('engulfing', canvasId);
    }

    /**
     * Get pattern-specific parameters for engulfing
     * @returns {Array} Array of engulfing-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['engulfing_type', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const engulfingType = this.getParameterValue('engulfing_type', 'bullish');
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Add transition class for smooth animation
        if (this.candlestickBody) this.candlestickBody.classList.add('transitioning');
        if (this.upperShadow) this.upperShadow.classList.add('transitioning');
        if (this.lowerShadow) this.lowerShadow.classList.add('transitioning');
        
        // Update the body
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update shadows (minimal for engulfing pattern)
        this.setElementStyle(this.upperShadow, 'height', '2px');
        this.setElementStyle(this.lowerShadow, 'height', '2px');
        
        // Set color based on engulfing type
        if (engulfingType === 'bullish') {
            this.setElementStyle(this.candlestickBody, 'background-color', '#28a745');
        } else {
            this.setElementStyle(this.candlestickBody, 'background-color', '#dc3545');
        }
        
        // Remove transition class after animation
        setTimeout(() => {
            if (this.candlestickBody) this.candlestickBody.classList.remove('transitioning');
            if (this.upperShadow) this.upperShadow.classList.remove('transitioning');
            if (this.lowerShadow) this.lowerShadow.classList.remove('transitioning');
        }, 300);
    }

    /**
     * Render engulfing patterns on the chart
     * @param {Array} patterns - Array of engulfing pattern data
     */
    renderEngulfingPatterns(patterns) {
        if (!patterns || patterns.length === 0) {
            console.log('No engulfing patterns to render');
            return;
        }

        console.log(`Rendering ${patterns.length} engulfing patterns`);
        
        // Clear existing markers
        this.clearPatternMarkers();
        
        // Render each pattern
        patterns.forEach((pattern, index) => {
            this.renderEngulfingPattern(pattern, index);
        });
    }

    /**
     * Render a single engulfing pattern
     * @param {Object} pattern - Pattern data
     * @param {number} index - Pattern index
     */
    renderEngulfingPattern(pattern, index) {
        const { date, open, high, low, close, pattern_type } = pattern;
        
        // Create pattern marker
        const marker = document.createElement('div');
        marker.className = 'pattern-marker engulfing-marker';
        marker.style.position = 'absolute';
        marker.style.left = `${index * 20}px`;
        marker.style.top = '10px';
        marker.style.width = '15px';
        marker.style.height = '15px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = pattern_type === 'bullish_engulfing' ? '#28a745' : '#dc3545';
        marker.style.border = '2px solid white';
        marker.style.zIndex = '10';
        marker.title = `Engulfing Pattern: ${date}`;
        
        // Add to chart container
        if (this.chartContainer) {
            this.chartContainer.appendChild(marker);
        }
    }

    /**
     * Clear all pattern markers
     */
    clearPatternMarkers() {
        const markers = document.querySelectorAll('.engulfing-marker');
        markers.forEach(marker => marker.remove());
    }

    /**
     * Initialize event listeners for visualization elements
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
                if (input.id === 'body_size_ratio') {
                    this.updateVisualization();
                }
            });
            
            // Add event listener for when dragging ends
            input.addEventListener('change', () => {
                this.updateRangeValue(input);
            });
        });
        
        // Add event listener for the engulfing type select
        const engulfingTypeSelect = document.getElementById('engulfing_type');
        if (engulfingTypeSelect) {
            engulfingTypeSelect.addEventListener('change', () => this.updateVisualization());
        }
        
        // Add event listener for the require trend checkbox
        const requireTrendCheckbox = document.getElementById('require_trend');
        if (requireTrendCheckbox) {
            requireTrendCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }

    /**
     * Update range value display
     * @param {HTMLInputElement} input - Range input element
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
}