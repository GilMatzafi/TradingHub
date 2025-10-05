/**
 * KickerCandlestickVisualizer - Handles Kicker-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class KickerCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('kicker', canvasId);
    }

    /**
     * Get pattern-specific parameters for Kicker
     * @returns {Array} Array of Kicker-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['gap_size_ratio', 'kicker_type', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * KICKER-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const gapSizeRatio = this.getParameterValue('gap_size_ratio', 0.5);
        const kickerType = this.getParameterValue('kicker_type', 'both');
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // KICKER-SPECIFIC: Update body and shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Calculate shadow heights - Kicker has balanced shadows
        const totalShadowSpace = totalHeight - bodyHeight;
        const shadowHeight = totalShadowSpace * 0.3; // 30% of shadow space
        
        // Update shadows
        this.setElementStyle(this.upperShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - shadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${shadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // KICKER-SPECIFIC: Set color based on kicker type
        if (kickerType === 'bullish') {
            this.setCandlestickColor('#198754'); // Green for bullish
        } else if (kickerType === 'bearish') {
            this.setCandlestickColor('#dc3545'); // Red for bearish
        } else {
            // Default to bullish for 'both' type
            this.setCandlestickColor('#198754');
        }
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * KICKER-SPECIFIC: Gap size ratio, kicker type, and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the gap size ratio slider
        const gapSizeRatioSlider = document.getElementById('gap_size_ratio');
        if (gapSizeRatioSlider) {
            gapSizeRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('gap_size_ratio_value', e.target.value);
                this.updateVisualization();
            });
        }

        // Add event listener for the kicker type select
        const kickerTypeSelect = document.getElementById('kicker_type');
        if (kickerTypeSelect) {
            kickerTypeSelect.addEventListener('change', () => this.updateVisualization());
        }

        // Add event listener for the require trend checkbox
        const requireTrendCheckbox = document.getElementById('require_trend');
        if (requireTrendCheckbox) {
            requireTrendCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }

    /**
     * KICKER-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
