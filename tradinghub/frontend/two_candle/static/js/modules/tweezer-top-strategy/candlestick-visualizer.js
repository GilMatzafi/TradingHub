/**
 * TweezerTopCandlestickVisualizer - Handles Tweezer Top-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class TweezerTopCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('tweezer_top', canvasId);
    }

    /**
     * Get pattern-specific parameters for Tweezer Top
     * @returns {Array} Array of Tweezer Top-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['high_tolerance', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * TWEEZER TOP-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const highTolerance = this.getParameterValue('high_tolerance', 0.2);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // TWEEZER TOP-SPECIFIC: Update body and shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Calculate shadow heights - Tweezer Top has balanced shadows
        const totalShadowSpace = totalHeight - bodyHeight;
        const shadowHeight = totalShadowSpace * 0.4; // 40% of shadow space
        
        // Update shadows
        this.setElementStyle(this.upperShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - shadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // TWEEZER TOP-SPECIFIC: Set color for bearish reversal (red)
        this.setCandlestickColor('#dc3545');
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * TWEEZER TOP-SPECIFIC: High tolerance and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the high tolerance slider
        const highToleranceSlider = document.getElementById('high_tolerance');
        if (highToleranceSlider) {
            highToleranceSlider.addEventListener('input', (e) => {
                this.updateRangeValue('high_tolerance_value', e.target.value);
                this.updateVisualization();
            });
        }

        // Add event listener for the require trend checkbox
        const requireTrendCheckbox = document.getElementById('require_trend');
        if (requireTrendCheckbox) {
            requireTrendCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }

    /**
     * TWEEZER TOP-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
