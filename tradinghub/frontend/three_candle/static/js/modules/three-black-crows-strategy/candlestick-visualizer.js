/**
 * ThreeBlackCrowsCandlestickVisualizer - Handles Three Black Crows-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class ThreeBlackCrowsCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('three_black_crows', canvasId);
    }

    /**
     * Get pattern-specific parameters for Three Black Crows
     * @returns {Array} Array of Three Black Crows-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['lower_shadow_ratio', 'progressive_close', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * THREE BLACK CROWS-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.6);
        const lowerShadowRatio = this.getParameterValue('lower_shadow_ratio', 0.2);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // THREE BLACK CROWS-SPECIFIC: Update body and shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Calculate shadow heights - Three Black Crows has short lower shadows
        const totalShadowSpace = totalHeight - bodyHeight;
        const lowerShadowHeight = totalShadowSpace * lowerShadowRatio;
        const upperShadowHeight = totalShadowSpace * 0.3; // 30% for upper shadow
        
        // Update shadows
        this.setElementStyle(this.lowerShadow, 'height', `${lowerShadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        this.setElementStyle(this.upperShadow, 'height', `${upperShadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - upperShadowHeight}px`);
        
        // THREE BLACK CROWS-SPECIFIC: Set color for bearish reversal (red)
        this.setCandlestickColor('#dc3545');
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * THREE BLACK CROWS-SPECIFIC: Lower shadow ratio, progressive close, and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the lower shadow ratio slider
        const lowerShadowRatioSlider = document.getElementById('lower_shadow_ratio');
        if (lowerShadowRatioSlider) {
            lowerShadowRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('lower_shadow_ratio_value', e.target.value);
                this.updateVisualization();
            });
        }

        // Add event listener for the progressive close checkbox
        const progressiveCloseCheckbox = document.getElementById('progressive_close');
        if (progressiveCloseCheckbox) {
            progressiveCloseCheckbox.addEventListener('change', () => this.updateVisualization());
        }

        // Add event listener for the require trend checkbox
        const requireTrendCheckbox = document.getElementById('require_trend');
        if (requireTrendCheckbox) {
            requireTrendCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }

    /**
     * THREE BLACK CROWS-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
