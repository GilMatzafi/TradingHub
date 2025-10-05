/**
 * PiercingLineCandlestickVisualizer - Handles piercing line-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class PiercingLineCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('piercing_line', canvasId);
    }

    /**
     * Get pattern-specific parameters for piercing line
     * @returns {Array} Array of piercing line-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['piercing_ratio', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * PIERCING LINE-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const piercingRatio = this.getParameterValue('piercing_ratio', 0.5);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // PIERCING LINE-SPECIFIC: Update body and minimal shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update shadows (minimal for piercing line pattern)
        this.setElementStyle(this.upperShadow, 'height', '2px');
        this.setElementStyle(this.lowerShadow, 'height', '2px');
        
        // PIERCING LINE-SPECIFIC: Set color for bullish piercing line (green)
        this.setCandlestickColor('#28a745');
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * PIERCING LINE-SPECIFIC: Require trend control
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the require trend checkbox
        const requireTrendCheckbox = document.getElementById('require_trend');
        if (requireTrendCheckbox) {
            requireTrendCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }
}
