/**
 * DojiCandlestickVisualizer - Handles doji-specific visualization logic
 */
import { CandlestickVisualizer } from '../shared/candlestick-visualizer.js';

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
     */
    updateVisualization() {
        const bodySizeRatio = this.getParameterValue('body_size_ratio', 0.1);
        const shadowBalanceRatio = this.getParameterValue('shadow_balance_ratio', 0.4);
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = this.calculateHeight(bodySizeRatio, totalHeight);
        
        // Calculate total shadow space available
        const totalShadowSpace = totalHeight - bodyHeight;
        
        // Use shadow balance ratio to determine shadow distribution
        // shadowBalanceRatio: 0.1 = very unbalanced, 0.5 = perfectly balanced
        // For doji, we want to show how balanced the shadows should be
        const balanceFactor = shadowBalanceRatio; // 0.1 to 0.5
        
        // Calculate shadow heights based on balance ratio
        // When balanceFactor is high (0.5), shadows are exactly equal
        // When balanceFactor is low (0.3), shadows are very different
        let upperShadowHeight, lowerShadowHeight;
        
        if (balanceFactor >= 0.5) {
            // Perfect balance: shadows are exactly equal
            upperShadowHeight = totalShadowSpace / 2;
            lowerShadowHeight = totalShadowSpace / 2;
        } else {
            // Unbalanced: shadows are different based on the ratio
            // Lower ratio = more imbalanced shadows
            const imbalanceFactor = (0.5 - balanceFactor) * 2; // 0.0 to 1.0
            const shadowDifference = totalShadowSpace * imbalanceFactor;
            upperShadowHeight = (totalShadowSpace + shadowDifference) / 2;
            lowerShadowHeight = (totalShadowSpace - shadowDifference) / 2;
        }
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Add transition class for smooth animation
        if (this.candlestickBody) this.candlestickBody.classList.add('transitioning');
        if (this.upperShadow) this.upperShadow.classList.add('transitioning');
        if (this.lowerShadow) this.lowerShadow.classList.add('transitioning');
        
        // Update the body
        this.setElementStyle(this.candlestickBody, 'height', `${bodyHeight}px`);
        this.setElementStyle(this.candlestickBody, 'top', `${bodyTop}px`);
        
        // Update the shadows (balance based on shadow balance ratio)
        this.setElementStyle(this.upperShadow, 'height', `${upperShadowHeight}px`);
        this.setElementStyle(this.upperShadow, 'top', `${bodyTop - upperShadowHeight}px`);
        
        this.setElementStyle(this.lowerShadow, 'height', `${lowerShadowHeight}px`);
        this.setElementStyle(this.lowerShadow, 'top', `${bodyTop + bodyHeight}px`);
        
        // Set the color based on whether it's a green or red candle
        // For Doji, the color is less significant as it indicates indecision
        // We can make it grey or randomly assign for visualization
        const isGreen = Math.random() > 0.5; // Randomly assign for visual variety
        if (this.candlestickBody) {
            if (isGreen) {
                this.candlestickBody.classList.add('green');
                this.candlestickBody.classList.remove('red');
            } else {
                this.candlestickBody.classList.add('red');
                this.candlestickBody.classList.remove('green');
            }
        }
        
        // Remove transition class after animation completes
        setTimeout(() => {
            if (this.candlestickBody) this.candlestickBody.classList.remove('transitioning');
            if (this.upperShadow) this.upperShadow.classList.remove('transitioning');
            if (this.lowerShadow) this.lowerShadow.classList.remove('transitioning');
        }, 300);
        
        // Log the visualization update
        this.logVisualizationUpdate({
            bodySizeRatio,
            shadowBalanceRatio,
            upperShadowHeight: upperShadowHeight.toFixed(1),
            lowerShadowHeight: lowerShadowHeight.toFixed(1),
            balanceFactor: balanceFactor.toFixed(2)
        });
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
            
            // Calculate the position
            const percent = (value - input.min) / (input.max - input.min);
            const leftOffset = percent * (input.offsetWidth - 20); // 20 is thumb width
            
            // Update value display position
            valueDisplay.style.left = `${leftOffset + 10}px`; // 10 is half of thumb width
            valueDisplay.style.transform = 'translateX(-50%)';
        }
    }

    /**
     * Initialize event listeners for visualization elements
     */
    initializeEventListeners() {
        // Add event listeners for range inputs
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            // Initialize range value displays
            this.updateRangeValue(input);
            
            // Add event listeners for range input changes
            input.addEventListener('input', () => {
                this.updateRangeValue(input);
                if (input.id === 'body_size_ratio' || input.id === 'shadow_balance_ratio') {
                    this.updateVisualization();
                }
            });
            
            // Add event listener for when dragging ends
            input.addEventListener('change', () => {
                this.updateRangeValue(input);
            });
        });
        
    }
}
