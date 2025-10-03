/**
 * Elephant Bar Candlestick Visualizer
 * Handles elephant bar-specific visualization logic
 */

import { CandlestickVisualizer } from '../shared/candlestick-visualizer.js';

export class ElephantBarCandlestickVisualizer extends CandlestickVisualizer {
    constructor() {
        super('elephant_bar');
    }

    getPatternSpecificParameters() {
        return ['min_body_ratio', 'max_shadow_ratio'];
    }

    updateVisualization() {
        const minBodyRatio = this.getParameterValue('min_body_ratio', 0.8);
        const maxShadowRatio = this.getParameterValue('max_shadow_ratio', 0.1);
        
        const totalHeight = 120;
        const bodyHeight = this.calculateHeight(minBodyRatio, totalHeight);
        const totalShadowSpace = totalHeight - bodyHeight;
        
        // Calculate shadow heights based on max shadow ratio
        // For elephant bars, shadows should be small relative to the body
        const maxShadowHeight = totalShadowSpace * maxShadowRatio;
        const upperShadowHeight = maxShadowHeight;
        const lowerShadowHeight = maxShadowHeight;
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Add transition class for smooth animation
        if (this.candlestickBody) this.candlestickBody.classList.add('transitioning');
        if (this.upperShadow) this.upperShadow.classList.add('transitioning');
        if (this.lowerShadow) this.lowerShadow.classList.add('transitioning');
        
        // Update the body
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update the shadows (small for elephant bars)
        this.setElementStyle(this.upperShadow, 'height', `${upperShadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - upperShadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${lowerShadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // Update colors based on body size (green for bullish, red for bearish)
        // For elephant bars, we'll use a neutral color since they can be either
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
        
        // Remove transition class after animation
        setTimeout(() => {
            if (this.candlestickBody) this.candlestickBody.classList.remove('transitioning');
            if (this.upperShadow) this.upperShadow.classList.remove('transitioning');
            if (this.lowerShadow) this.lowerShadow.classList.remove('transitioning');
        }, 300);
        
        this.logVisualizationUpdate({
            minBodyRatio,
            maxShadowRatio,
            bodyHeight: bodyHeight.toFixed(1),
            upperShadowHeight: upperShadowHeight.toFixed(1),
            lowerShadowHeight: lowerShadowHeight.toFixed(1)
        });
    }

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

    /**
     * Update the range value display
     * @param {HTMLInputElement} input - The range input element
     */
    updateRangeValue(input) {
        const container = input.closest('.range-container');
        const valueDisplay = container.querySelector('.range-value');
        const value = input.value;
        
        // Update the value display
        if (valueDisplay) {
            valueDisplay.textContent = value;
        }
    }

    initializeEventListeners() {
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            this.updateRangeValue(input);
            input.addEventListener('input', () => {
                this.updateRangeValue(input);
                if (input.id === 'min_body_ratio' || input.id === 'max_shadow_ratio') {
                    this.updateVisualization();
                }
            });
            input.addEventListener('change', () => {
                this.updateRangeValue(input);
            });
        });
    }
}
