/**
 * DarkCloudCoverCandlestickVisualizer - Handles Dark Cloud Cover-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class DarkCloudCoverCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('dark_cloud_cover', canvasId);
    }

    /**
     * Get pattern-specific parameters for Dark Cloud Cover
     * @returns {Array} Array of Dark Cloud Cover-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['max_shadow_ratio', 'penetration_ratio', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * DARK CLOUD COVER-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.6);
        const maxShadowRatio = this.getParameterValue('max_shadow_ratio', 0.3);
        const penetrationRatio = this.getParameterValue('penetration_ratio', 0.5);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // DARK CLOUD COVER-SPECIFIC: Update body and shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Calculate shadow heights based on max shadow ratio
        const totalShadowSpace = totalHeight - bodyHeight;
        const maxShadowHeight = totalShadowSpace * maxShadowRatio;
        const upperShadowHeight = maxShadowHeight;
        const lowerShadowHeight = maxShadowHeight;
        
        // Update shadows
        this.setElementStyle(this.upperShadow, 'height', `${upperShadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - upperShadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${lowerShadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // DARK CLOUD COVER-SPECIFIC: Set color for bearish reversal (red)
        this.setCandlestickColor('#dc3545');
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * DARK CLOUD COVER-SPECIFIC: Max shadow ratio, penetration ratio, and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the max shadow ratio slider
        const maxShadowRatioSlider = document.getElementById('max_shadow_ratio');
        if (maxShadowRatioSlider) {
            maxShadowRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('max_shadow_ratio_value', e.target.value);
                this.updateVisualization();
            });
        }

        // Add event listener for the penetration ratio slider
        const penetrationRatioSlider = document.getElementById('penetration_ratio');
        if (penetrationRatioSlider) {
            penetrationRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('penetration_ratio_value', e.target.value);
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
     * DARK CLOUD COVER-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
