/**
 * Elephant Bar Candlestick Visualizer
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */

import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class ElephantBarCandlestickVisualizer extends CandlestickVisualizer {
    constructor() {
        super('elephant_bar');
    }

    /**
     * Get pattern-specific parameters for elephant bar
     * @returns {Array} Array of elephant bar-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['min_body_ratio', 'max_shadow_ratio'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * ELEPHANT BAR-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const minBodyRatio = this.getParameterValue('min_body_ratio', 0.8);
        const maxShadowRatio = this.getParameterValue('max_shadow_ratio', 0.1);
        
        const totalHeight = 120;
        const bodyHeight = this.calculateHeight(minBodyRatio, totalHeight);
        const totalShadowSpace = totalHeight - bodyHeight;
        
        // ELEPHANT BAR-SPECIFIC: Calculate shadow heights based on max shadow ratio
        // For elephant bars, shadows should be small relative to the body
        const maxShadowHeight = totalShadowSpace * maxShadowRatio;
        const upperShadowHeight = maxShadowHeight;
        const lowerShadowHeight = maxShadowHeight;
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Use common functionality for transitions
        this.addTransitionClasses();
        
        // Use common functionality for updating elements
        this.updateCandlestickElements(bodyHeight, bodyTop, upperShadowHeight, lowerShadowHeight);
        
        // ELEPHANT BAR-SPECIFIC: Update colors based on body size
        const isBullish = minBodyRatio > 0.8; // Large body suggests strong momentum
        const bodyColor = isBullish ? '#28a745' : '#dc3545';
        
        if (this.candlestickBody) {
            this.candlestickBody.style.backgroundColor = bodyColor;
            this.candlestickBody.style.borderColor = bodyColor;
        }
        
        // Update shadow colors
        if (this.upperShadow) {
            this.upperShadow.style.backgroundColor = '#6c757d';
        }
        if (this.lowerShadow) {
            this.lowerShadow.style.backgroundColor = '#6c757d';
        }
        
        // Update description text
        this.updateDescriptionText(minBodyRatio, maxShadowRatio);
        
        // Use common functionality for removing transitions
        this.removeTransitionClasses();
        
        this.logVisualizationUpdate({
            minBodyRatio,
            maxShadowRatio,
            bodyHeight: bodyHeight.toFixed(1),
            upperShadowHeight: upperShadowHeight.toFixed(1),
            lowerShadowHeight: lowerShadowHeight.toFixed(1)
        });
    }

    /**
     * ELEPHANT BAR-SPECIFIC: Update description text
     */
    updateDescriptionText(minBodyRatio, maxShadowRatio) {
        const bodyRatioDisplay = document.getElementById('body-ratio-display');
        const shadowRatioDisplay = document.getElementById('shadow-ratio-display');
        
        if (bodyRatioDisplay) {
            bodyRatioDisplay.textContent = `${(minBodyRatio * 100).toFixed(0)}%`;
        }
        
        if (shadowRatioDisplay) {
            shadowRatioDisplay.textContent = `${(maxShadowRatio * 100).toFixed(0)}%`;
        }
    }
}
