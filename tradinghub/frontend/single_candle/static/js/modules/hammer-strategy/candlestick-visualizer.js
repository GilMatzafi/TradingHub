/**
 * HammerCandlestickVisualizer - Handles hammer-specific visualization logic
 */
import { CandlestickVisualizer } from '../shared/candlestick-visualizer.js';

export class HammerCandlestickVisualizer extends CandlestickVisualizer {
    constructor() {
        super('hammer');
    }

    /**
     * Get pattern-specific parameters for hammer
     * @returns {Array} Array of hammer-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['lower_shadow_ratio', 'upper_shadow_ratio', 'require_green'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.1);
        const lowerShadowRatio = this.getParameterValue('lower_shadow_ratio', 0.6);
        const upperShadowRatio = this.getParameterValue('upper_shadow_ratio', 0.1);
        const requireGreen = this.getParameterValue('require_green', false);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Calculate the lower shadow height based on the lower shadow ratio
        const lowerShadowHeight = this.calculateHeight(lowerShadowRatio, bodyHeight);
        
        // Calculate the upper shadow height based on the upper shadow ratio
        const upperShadowHeight = this.calculateHeight(upperShadowRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Add transition class for smooth animation
        if (this.candlestickBody) this.candlestickBody.classList.add('transitioning');
        if (this.upperShadow) this.upperShadow.classList.add('transitioning');
        if (this.lowerShadow) this.lowerShadow.classList.add('transitioning');
        
        // Update the body
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update the shadows
        this.setElementStyle(this.upperShadow, 'height', `${upperShadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - upperShadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${lowerShadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // Set the color based on whether it's a green or red candle
        if (requireGreen) {
            if (this.candlestickBody) {
                this.candlestickBody.classList.add('green');
                this.candlestickBody.classList.remove('red');
            }
        } else {
            // For demonstration, we'll toggle between green and red
            const isGreen = Math.random() > 0.5;
            if (this.candlestickBody) {
                if (isGreen) {
                    this.candlestickBody.classList.add('green');
                    this.candlestickBody.classList.remove('red');
                } else {
                    this.candlestickBody.classList.add('red');
                    this.candlestickBody.classList.remove('green');
                }
            }
        }
        
        // Remove transition class after animation completes
        setTimeout(() => {
            if (this.candlestickBody) this.candlestickBody.classList.remove('transitioning');
            if (this.upperShadow) this.upperShadow.classList.remove('transitioning');
            if (this.lowerShadow) this.lowerShadow.classList.remove('transitioning');
        }, 300);
        
        // Log the visualization update
        this.logVisualizationUpdate({
            bodySizeRatio,
            lowerShadowRatio,
            upperShadowRatio,
            requireGreen
        });
    }

    /**
     * Update the range value display
     * @param {HTMLInputElement} input - The range input element
     */
    updateRangeValue(input) {
        const container = input.closest('.range-container');
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
                if (input.id === 'body_size_ratio' || 
                    input.id === 'lower_shadow_ratio' || 
                    input.id === 'upper_shadow_ratio') {
                    this.updateVisualization();
                }
            });
            
            // Add event listener for when dragging ends
            input.addEventListener('change', () => {
                this.updateRangeValue(input);
            });
        });
        
        // Add event listener for the require green checkbox
        const requireGreenCheckbox = document.getElementById('require_green');
        if (requireGreenCheckbox) {
            requireGreenCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }
}