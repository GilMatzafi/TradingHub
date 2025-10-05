/**
 * Marubozu Candlestick Visualizer
 * Refactored to use enhanced base class - only contains pattern-specific logic
 */

import { CandlestickVisualizer } from '/shared/js/modules/shared/candlestick-visualizer.js';

export class MarubozuCandlestickVisualizer extends CandlestickVisualizer {
    constructor() {
        super('marubozu');
    }

    initialize() {
        this.initializeEventListeners();
        this.updateVisualization();
        console.log('🔴 Marubozu visualizer: Initialized');
    }

    /**
     * Get pattern-specific parameters for marubozu
     * @returns {Array} Array of marubozu-specific parameter IDs
     */
    getPatternSpecificParameters() {
        return ['max_shadow_ratio', 'candle_color'];
    }

    /**
     * Update the candlestick visualization based on current parameters
     * MARUBOZU-SPECIFIC LOGIC ONLY
     */
    updateVisualization() {
        const shadowRatio = this.getParameterValue('max_shadow_ratio', 0.05);
        const candleColor = this.getParameterValue('candle_color', 'both');
        
        this.updateMarubozuCandlestick(shadowRatio, candleColor);
        this.updatePatternInfo(shadowRatio, candleColor);
        this.logVisualizationUpdate({
            shadowRatio,
            candleColor,
            bodySize: `${((1.0 - (shadowRatio * 2)) * 100).toFixed(0)}%`,
            shadowHeight: `${(shadowRatio * 100).toFixed(0)}%`,
            patternStrength: shadowRatio <= 0.02 ? 'Very Strong' : shadowRatio <= 0.05 ? 'Strong' : 'Good',
            colorFilter: candleColor === 'red' ? 'Bearish Only' : candleColor === 'green' ? 'Bullish Only' : 'Both'
        });
    }

    /**
     * MARUBOZU-SPECIFIC: Update candlestick with marubozu logic
     */
    updateMarubozuCandlestick(shadowRatio, candleColor) {
        const upperShadow = document.getElementById('upperShadow');
        const lowerShadow = document.getElementById('lowerShadow');
        const body = document.getElementById('candlestickBody');
        const bodyFill = document.getElementById('bodyFill');

        if (upperShadow && lowerShadow && body && bodyFill) {
            const totalHeight = 200; // Total candlestick height
            const shadowHeight = Math.max(totalHeight * shadowRatio, 4); // Minimum 4px for visibility
            const bodyHeight = totalHeight - (shadowHeight * 2); // Body is what's left
            
            body.style.height = `${bodyHeight}px`;
            upperShadow.style.height = `${shadowHeight}px`;
            lowerShadow.style.height = `${shadowHeight}px`;
            
            this.updateCandlestickColor(candleColor, bodyFill);
        }
    }

    /**
     * MARUBOZU-SPECIFIC: Update candlestick color with gradients
     */
    updateCandlestickColor(candleColor, bodyFill) {
        if (!bodyFill) {
            bodyFill = document.getElementById('bodyFill');
        }
        if (!bodyFill) return;
        
        if (candleColor === 'red') {
            bodyFill.style.background = 'linear-gradient(135deg, #dc3545, #e83e8c)';
        } else if (candleColor === 'green') {
            bodyFill.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        } else {
            bodyFill.style.background = 'linear-gradient(135deg, #6f42c1, #e83e8c)';
        }
    }

    /**
     * MARUBOZU-SPECIFIC: Update pattern information display
     */
    updatePatternInfo(shadowRatio, candleColor) {
        const bodySize = (1.0 - (shadowRatio * 2)) * 100; // Body is 100% - (2 * shadow)
        const bodySizeDisplay = document.getElementById('bodySizeDisplay');
        const upperShadowDisplay = document.getElementById('upperShadowDisplay');
        const lowerShadowDisplay = document.getElementById('lowerShadowDisplay');
        const patternTypeDisplay = document.getElementById('patternTypeDisplay');
        const strengthIndicator = document.getElementById('strengthIndicator');

        if (bodySizeDisplay) {
            bodySizeDisplay.textContent = `${bodySize.toFixed(0)}%`;
        }
        
        if (upperShadowDisplay) {
            upperShadowDisplay.textContent = `${(shadowRatio * 100).toFixed(0)}%`;
        }
        
        if (lowerShadowDisplay) {
            lowerShadowDisplay.textContent = `${(shadowRatio * 100).toFixed(0)}%`;
        }
        
        let momentumText = '';
        if (shadowRatio <= 0.02) {
            momentumText = 'Very Strong Momentum';
        } else if (shadowRatio <= 0.05) {
            momentumText = 'Strong Momentum';
        } else {
            momentumText = 'Good Momentum';
        }
        
        if (strengthIndicator) {
            strengthIndicator.textContent = momentumText;
        }
        
        if (patternTypeDisplay) {
            if (candleColor === 'red') {
                patternTypeDisplay.textContent = `${momentumText} (Bearish)`;
            } else if (candleColor === 'green') {
                patternTypeDisplay.textContent = `${momentumText} (Bullish)`;
            } else {
                patternTypeDisplay.textContent = `${momentumText} (Both)`;
            }
        }
    }

    /**
     * Initialize pattern-specific event listeners
     * MARUBOZU-SPECIFIC: Shadow ratio and candle color controls
     */
    initializePatternSpecificEventListeners() {
        // Shadow ratio slider
        const shadowRatioSlider = document.getElementById('max_shadow_ratio');
        if (shadowRatioSlider) {
            shadowRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('max_shadow_ratio_value', e.target.value);
                this.updateVisualization();
            });
        }

        // Candle color selector
        const candleColorSelect = document.getElementById('candle_color');
        if (candleColorSelect) {
            candleColorSelect.addEventListener('change', (e) => {
                this.updateCandlestickColor(e.target.value);
                this.updateVisualization();
            });
        }
    }

    /**
     * MARUBOZU-SPECIFIC: Update range value display for specific element
     */
    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}
