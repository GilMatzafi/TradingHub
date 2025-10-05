/**
 * CounterAttackCandlestickVisualizer - Handles counter attack-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class CounterAttackCandlestickVisualizer extends CandlestickVisualizer {
    constructor(canvasId) {
        super('counter_attack', canvasId);
    }

    /**
     * Get pattern-specific parameters for counter attack
     * @returns {Array} Array of counter attack-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['counter_attack_type', 'close_tolerance', 'require_trend'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * COUNTER ATTACK-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.3);
        const counterAttackType = this.getParameterValue('counter_attack_type', 'both');
        const closeTolerance = this.getParameterValue('close_tolerance', 0.02);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // COUNTER ATTACK-SPECIFIC: Update body and minimal shadows
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update shadows (minimal for counter attack pattern)
        this.setElementStyle(this.upperShadow, 'height', '2px');
        this.setElementStyle(this.lowerShadow, 'height', '2px');
        
        // COUNTER ATTACK-SPECIFIC: Set color based on counter attack type
        if (counterAttackType === 'bullish') {
            this.setCandlestickColor('#28a745');
        } else if (counterAttackType === 'bearish') {
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
     * COUNTER ATTACK-SPECIFIC: Counter attack type and require trend controls
     */
    initializePatternSpecificEventListeners() {
        // Add event listener for the counter attack type select
        const counterAttackTypeSelect = document.getElementById('counter_attack_type');
        if (counterAttackTypeSelect) {
            counterAttackTypeSelect.addEventListener('change', () => this.updateVisualization());
        }
        
        // Add event listener for the require trend checkbox
        const requireTrendCheckbox = document.getElementById('require_trend');
        if (requireTrendCheckbox) {
            requireTrendCheckbox.addEventListener('change', () => this.updateVisualization());
        }
    }
}
