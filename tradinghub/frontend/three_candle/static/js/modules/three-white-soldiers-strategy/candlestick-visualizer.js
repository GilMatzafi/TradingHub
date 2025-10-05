/**
 * ThreeWhiteSoldiersCandlestickVisualizer - Handles Three White Soldiers-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class ThreeWhiteSoldiersCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('three_white_soldiers', canvasId);
    }

    /**
     * Get pattern-specific parameters for Three White Soldiers
     * @returns {Array} Array of Three White Soldiers-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['upper_shadow_ratio', 'progressive_close', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * THREE WHITE SOLDIERS-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.6);
        const upperShadowRatio = this.getParameterValue('upper_shadow_ratio', 0.2);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // THREE WHITE SOLDIERS-SPECIFIC: Update body and shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Calculate shadow heights - Three White Soldiers has short upper shadows
        const totalShadowSpace = totalHeight - bodyHeight;
        const upperShadowHeight = totalShadowSpace * upperShadowRatio;
        const lowerShadowHeight = totalShadowSpace * 0.3; // 30% for lower shadow
        
        // Update shadows
        this.setElementStyle(this.upperShadow, 'height', `${upperShadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - upperShadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${lowerShadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // THREE WHITE SOLDIERS-SPECIFIC: Set color for bullish reversal (green)
        this.setCandlestickColor('#198754');
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * THREE WHITE SOLDIERS-SPECIFIC: Upper shadow ratio, progressive close, and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the upper shadow ratio slider
        const upperShadowRatioSlider = document.getElementById('upper_shadow_ratio');
        if (upperShadowRatioSlider) {
            upperShadowRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('upper_shadow_ratio_value', e.target.value);
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
     * THREE WHITE SOLDIERS-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
