/**
 * ThreeInsideDownCandlestickVisualizer - Handles Three Inside Down-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class ThreeInsideDownCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('three_inside_down', canvasId);
    }

    /**
     * Get pattern-specific parameters for Three Inside Down
     * @returns {Array} Array of Three Inside Down-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['harami_body_ratio', 'confirmation_strength', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * THREE INSIDE DOWN-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.6);
        const haramiBodyRatio = this.getParameterValue('harami_body_ratio', 0.5);
        const confirmationStrength = this.getParameterValue('confirmation_strength', 0.8);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // THREE INSIDE DOWN-SPECIFIC: Update body and shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Calculate shadow heights - Three Inside Down has balanced shadows
        const totalShadowSpace = totalHeight - bodyHeight;
        const shadowHeight = totalShadowSpace * 0.3; // 30% for both shadows
        
        // Update shadows
        this.setElementStyle(this.upperShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - shadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // THREE INSIDE DOWN-SPECIFIC: Set color for bearish reversal (red)
        this.setCandlestickColor('#dc3545');
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * THREE INSIDE DOWN-SPECIFIC: Harami body ratio, confirmation strength, and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the harami body ratio slider
        const haramiBodyRatioSlider = document.getElementById('harami_body_ratio');
        if (haramiBodyRatioSlider) {
            haramiBodyRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('harami_body_ratio_value', e.target.value);
                this.updateVisualization();
            });
        }

        // Add event listener for the confirmation strength slider
        const confirmationStrengthSlider = document.getElementById('confirmation_strength');
        if (confirmationStrengthSlider) {
            confirmationStrengthSlider.addEventListener('input', (e) => {
                this.updateRangeValue('confirmation_strength_value', e.target.value);
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
     * THREE INSIDE DOWN-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
