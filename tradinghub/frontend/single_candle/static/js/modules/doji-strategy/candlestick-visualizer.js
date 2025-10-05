/**
 * DojiCandlestickVisualizer - Handles doji-specific visualization logic
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */
import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class DojiCandlestickVisualizer extends CandlestickVisualizer {
    constructor() {
        super('doji');
    }

    /**
     * Get pattern-specific parameters for doji
     * @returns {Array} Array of doji-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['body_size_ratio', 'shadow_balance_ratio'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * DOJI-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.1);
        const shadowBalanceRatio = this.getParameterValue('shadow_balance_ratio', 0.4);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // DOJI-SPECIFIC: Calculate shadow balance logic
        const totalShadowSpace = totalHeight - bodyHeight;
        const balanceFactor = shadowBalanceRatio; // 0.1 to 0.5
        
        // Calculate shadow heights based on balance ratio
        let upperShadowHeight, lowerShadowHeight;
        
        if (balanceFactor >= 0.5) {
            // Perfect balance: shadows are exactly equal
            upperShadowHeight = totalShadowSpace / 2;
            lowerShadowHeight = totalShadowSpace / 2;
        } else {
            // Unbalanced: shadows are different based on the ratio
            const imbalanceFactor = (0.5 - balanceFactor) * 2; // 0.0 to 1.0
            const shadowDifference = totalShadowSpace * imbalanceFactor;
            upperShadowHeight = (totalShadowSpace + shadowDifference) / 2;
            lowerShadowHeight = (totalShadowSpace - shadowDifference) / 2;
        }
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // Use common functionality for updating elements
        this.updateCandlestickElements(bodyHeight, bodyTop, upperShadowHeight, lowerShadowHeight);
        
        // DOJI-SPECIFIC: Set color for indecision (random for visual variety)
        const isGreen = Math.random() > 0.5;
        if (this.candlestickBody) {
            if (isGreen) {
                this.candlestickBody.classList.add('green');
                this.candlestickBody.classList.remove('red');
            } else {
                this.candlestickBody.classList.add('red');
                this.candlestickBody.classList.remove('green');
            }
        }
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
        
        // Log the visualization update
        this.logVisualizationUpdate({
            bodySizeRatio,
            shadowBalanceRatio,
            upperShadowHeight: upperShadowHeight.toFixed(1),
            lowerShadowHeight: lowerShadowHeight.toFixed(1),
            balanceFactor: balanceFactor.toFixed(2)
        });
    }
}
