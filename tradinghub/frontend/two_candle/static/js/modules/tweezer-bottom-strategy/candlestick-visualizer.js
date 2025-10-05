/**
 * TweezerBottomCandlestickVisualizer - Handles Tweezer Bottom-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class TweezerBottomCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('tweezer_bottom', canvasId);
    }

    /**
     * Get pattern-specific parameters for Tweezer Bottom
     * @returns {Array} Array of Tweezer Bottom-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['low_tolerance', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * TWEEZER BOTTOM-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const lowTolerance = this.getParameterValue('low_tolerance', 0.2);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // TWEEZER BOTTOM-SPECIFIC: Update body and shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Calculate shadow heights - Tweezer Bottom has balanced shadows
        const totalShadowSpace = totalHeight - bodyHeight;
        const shadowHeight = totalShadowSpace * 0.4; // 40% of shadow space
        
        // Update shadows
        this.setElementStyle(this.upperShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - shadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // TWEEZER BOTTOM-SPECIFIC: Set color for bullish reversal (green)
        this.setCandlestickColor('#198754');
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * TWEEZER BOTTOM-SPECIFIC: Low tolerance and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the low tolerance slider
        const lowToleranceSlider = document.getElementById('low_tolerance');
        if (lowToleranceSlider) {
            lowToleranceSlider.addEventListener('input', (e) => {
                this.updateRangeValue('low_tolerance_value', e.target.value);
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
     * TWEEZER BOTTOM-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
