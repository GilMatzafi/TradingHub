/**
 * EngulfingCandlestickVisualizer - Handles engulfing-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class EngulfingCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('engulfing', canvasId);
    }

    /**
     * Get pattern-specific parameters for engulfing
     * @returns {Array} Array of engulfing-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['engulfing_type', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * ENGULFING-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const engulfingType = this.getParameterValue('engulfing_type', 'bullish');
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // ENGULFING-SPECIFIC: Update body and minimal shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update shadows (minimal for engulfing pattern)
        this.setElementStyle(this.upperShadow, 'height', '2px');
        this.setElementStyle(this.lowerShadow, 'height', '2px');
        
        // ENGULFING-SPECIFIC: Set color based on engulfing type
        if (engulfingType === 'bullish') {
            this.setCandlestickColor('#28a745');
        } else {
            this.setCandlestickColor('#dc3545');
        }
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * ENGULFING-SPECIFIC: Engulfing type and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the engulfing type select
        const engulfingTypeSelect = document.getElementById('engulfing_type');
        if (engulfingTypeSelect) {
            engulfingTypeSelect.addEventListener('change', () => this.updateVisualization());
        }
        
        // Add event listener for the require trend checkbox
        const requireTrendCheckbox = document.getElementById('require_trend');
        if (requireTrendCheckbox) {
            requireTrendCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }
}