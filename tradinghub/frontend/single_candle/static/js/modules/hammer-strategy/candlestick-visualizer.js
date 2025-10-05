/**
 * HammerCandlestickVisualizer - Handles hammer-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

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
     * HAMMER-SPECIFIC LOGIC ONLY
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
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // Use common functionality for updating elements
        this.updateCandlestickElements(bodyHeight, bodyTop, upperShadowHeight, lowerShadowHeight);
        
        // HAMMER-SPECIFIC: Set the color based on whether it's a green or red candle
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
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
        
        // Log the visualization update
        this.logVisualizationUpdate({
            bodySizeRatio,
            lowerShadowRatio,
            upperShadowRatio,
            requireGreen
        });
    }

    /**
     * Initialize pattern-specific event listeners
     * HAMMER-SPECIFIC: Only the require green checkbox
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the require green checkbox
        const requireGreenCheckbox = document.getElementById('require_green');
        if (requireGreenCheckbox) {
            requireGreenCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }
}