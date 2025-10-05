/**
 * EveningStarCandlestickVisualizer - Handles Evening Star-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class EveningStarCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('evening_star', canvasId);
    }

    /**
     * Get pattern-specific parameters for Evening Star
     * @returns {Array} Array of Evening Star-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['gap_ratio', 'penetration_ratio', 'star_body_ratio', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * EVENING STAR-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.6);
        const gapRatio = this.getParameterValue('gap_ratio', 0.1);
        const penetrationRatio = this.getParameterValue('penetration_ratio', 0.5);
        const starBodyRatio = this.getParameterValue('star_body_ratio', 0.3);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // EVENING STAR-SPECIFIC: Update body and shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Calculate shadow heights - Evening Star has balanced shadows
        const totalShadowSpace = totalHeight - bodyHeight;
        const shadowHeight = totalShadowSpace * 0.3; // 30% for both shadows
        
        // Update shadows
        this.setElementStyle(this.upperShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - shadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // EVENING STAR-SPECIFIC: Set color for bearish reversal (red)
        this.setCandlestickColor('#dc3545');
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * EVENING STAR-SPECIFIC: Gap ratio, penetration ratio, star body ratio, and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the gap ratio slider
        const gapRatioSlider = document.getElementById('gap_ratio');
        if (gapRatioSlider) {
            gapRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('gap_ratio_value', e.target.value);
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

        // Add event listener for the star body ratio slider
        const starBodyRatioSlider = document.getElementById('star_body_ratio');
        if (starBodyRatioSlider) {
            starBodyRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('star_body_ratio_value', e.target.value);
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
     * EVENING STAR-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
