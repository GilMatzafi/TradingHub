/**
 * HaramiCandlestickVisualizer - Handles harami-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class HaramiCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('harami', canvasId);
    }

    /**
     * Get pattern-specific parameters for harami
     * @returns {Array} Array of harami-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['harami_type', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * HARAMI-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const haramiType = this.getParameterValue('harami_type', 'both');
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // HARAMI-SPECIFIC: Update body and minimal shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update shadows (minimal for harami pattern)
        this.setElementStyle(this.upperShadow, 'height', '2px');
        this.setElementStyle(this.lowerShadow, 'height', '2px');
        
        // HARAMI-SPECIFIC: Set color based on harami type
        if (haramiType === 'bullish') {
            this.setCandlestickColor('#28a745');
        } else if (haramiType === 'bearish') {
            this.setCandlestickColor('#dc3545');
        } else {
            // Both types - show neutral color
            this.setCandlestickColor('#6c757d');
        }
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
    }

    /**
     * Initialize pattern-specific event listeners
     * HARAMI-SPECIFIC: Harami type and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the harami type select
        const haramiTypeSelect = document.getElementById('harami_type');
        if (haramiTypeSelect) {
            haramiTypeSelect.addEventListener('change', () => this.updateVisualization());
        }
        
        // Add event listener for the require trend checkbox
        const requireTrendCheckbox = document.getElementById('require_trend');
        if (requireTrendCheckbox) {
            requireTrendCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }
}
