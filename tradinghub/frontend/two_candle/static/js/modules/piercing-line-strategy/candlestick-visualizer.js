/**
 * PiercingLineCandlestickVisualizer - Handles piercing line-specific visualization logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class PiercingLineCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('piercing_line', canvasId);
    }

    /**
     * Get pattern-specific parameters for piercing line
     * @returns {Array} Array of piercing line-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['piercing_ratio', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const piercingRatio = this.getParameterValue('piercing_ratio', 0.5);
        
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
        
        // Update shadows (minimal for piercing line pattern)
        this.setElementStyle(this.upperShadow, 'height', '2px');
        this.setElementStyle(this.lowerShadow, 'height', '2px');
        
        // Set color for bullish piercing line (green)
        this.setElementStyle(this.candlestickBody, 'background-color', '#28a745');
        
        // Remove transition class after animation
        setTimeout(() => {
            if (this.candlestickBody) this.candlestickBody.classList.remove('transitioning');
            if (this.upperShadow) this.upperShadow.classList.remove('transitioning');
            if (this.lowerShadow) this.lowerShadow.classList.remove('transitioning');
        }, 300);
    }

    /**
     * Render piercing line patterns on the chart
     * @param {Array} patterns - Array of piercing line pattern data
     */
    renderPiercingLinePatterns(patterns) {
        if (!patterns || patterns.length === 0) {
            console.log('No piercing line patterns to render');
            return;
        }

        console.log(`Rendering ${patterns.length} piercing line patterns`);
        
        // Clear existing markers
        this.clearPatternMarkers();
        
        // Render each pattern
        patterns.forEach((pattern, index) => {
            this.renderPiercingLinePattern(pattern, index);
        });
    }

    /**
     * Render a single piercing line pattern
     * @param {Object} pattern - Pattern data
     * @param {number} index - Pattern index
     */
    renderPiercingLinePattern(pattern, index) {
        const { date, open, high, low, close } = pattern;
        
        // Create pattern marker
        const marker = document.createElement('div');
        marker.className = 'pattern-marker piercing-line-marker';
        marker.style.position = 'absolute';
        marker.style.left = `${index * 20}px`;
        marker.style.top = '10px';
        marker.style.width = '15px';
        marker.style.height = '15px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = '#28a745'; // Green for bullish piercing line
        marker.style.border = '2px solid white';
        marker.style.zIndex = '10';
        marker.title = `Piercing Line Pattern: ${date}`;
        
        // Add to chart container
        if (this.chartContainer) {
            this.chartContainer.appendChild(marker);
        }
    }

    /**
     * Clear all pattern markers
     */
    clearPatternMarkers() {
        const markers = document.querySelectorAll('.piercing-line-marker');
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
                if (input.id === 'body_size_ratio' || input.id === 'piercing_ratio') {
                    this.updateVisualization();
                }
            });
            
            // Add event listener for when dragging ends
            input.addEventListener('change', () => {
                this.updateRangeValue(input);
            });
        });
        
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
