/**
 * CandlestickVisualizer - Handles all visualization-related logic for the hammer strategy
 */
export class CandlestickVisualizer {
    constructor() {
        this.initializeElements();
    }

    /**
     * Initialize DOM elements needed for visualization
     */
    initializeElements() {
        this.candlestickBody = document.querySelector('.candlestick-body');
        this.upperShadow = document.querySelector('.candlestick-upper-shadow');
        this.lowerShadow = document.querySelector('.candlestick-lower-shadow');
    }

    /**
     * Update the candlestick visualization based on current parameters
     */
    updateVisualization() {
        const bodySizeRatio = parseFloat(document.getElementById('body_size_ratio').value);
        const lowerShadowRatio = parseFloat(document.getElementById('lower_shadow_ratio').value);
        const upperShadowRatio = parseFloat(document.getElementById('upper_shadow_ratio').value);
        const requireGreen = document.getElementById('require_green').checked;
        
        // Calculate the total height of the candlestick (120px)
        const totalHeight = 120;
        
        // Calculate the body height based on the body size ratio
        const bodyHeight = totalHeight * bodySizeRatio;
        
        // Calculate the lower shadow height based on the lower shadow ratio
        const lowerShadowHeight = bodyHeight * lowerShadowRatio;
        
        // Calculate the upper shadow height based on the upper shadow ratio
        const upperShadowHeight = totalHeight * upperShadowRatio;
        
        // Position the body in the middle of the candlestick
        const bodyTop = (totalHeight - bodyHeight) / 2;
        
        // Add transition class for smooth animation
        this.candlestickBody.classList.add('transitioning');
        this.upperShadow.classList.add('transitioning');
        this.lowerShadow.classList.add('transitioning');
        
        // Update the body
        this.candlestickBody.style.height = `${bodyHeight}px`;
        this.candlestickBody.style.top = `${bodyTop}px`;
        
        // Update the shadows
        this.upperShadow.style.height = `${upperShadowHeight}px`;
        this.upperShadow.style.top = `${bodyTop - upperShadowHeight}px`;
        
        this.lowerShadow.style.height = `${lowerShadowHeight}px`;
        this.lowerShadow.style.top = `${bodyTop + bodyHeight}px`;
        
        // Set the color based on whether it's a green or red candle
        if (requireGreen) {
            this.candlestickBody.classList.add('green');
            this.candlestickBody.classList.remove('red');
        } else {
            // For demonstration, we'll toggle between green and red
            const isGreen = Math.random() > 0.5;
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
            this.candlestickBody.classList.remove('transitioning');
            this.upperShadow.classList.remove('transitioning');
            this.lowerShadow.classList.remove('transitioning');
        }, 300);
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
        valueDisplay.textContent = value;
        
        // Calculate the position
        const percent = (value - input.min) / (input.max - input.min);
        const leftOffset = percent * (input.offsetWidth - 20); // 20 is thumb width
        
        // Update value display position
        valueDisplay.style.left = `${leftOffset + 10}px`; // 10 is half of thumb width
        valueDisplay.style.transform = 'translateX(-50%)';
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
                if (input.id === 'body_size_ratio' || 
                    input.id === 'lower_shadow_ratio' || 
                    input.id === 'upper_shadow_ratio') {
                    this.updateVisualization();
                }
            });
            
            // Add event listener for when dragging ends
            input.addEventListener('change', () => {
                this.updateRangeValue(input);
            });
        });
        
        // Add event listener for the require green checkbox
        document.getElementById('require_green').addEventListener('change', () => this.updateVisualization());
    }
} 