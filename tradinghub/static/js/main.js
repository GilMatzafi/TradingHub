// Function to update range value display
function updateRangeValue(input) {
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

// Function to update the candlestick visualization
function updateCandlestickVisualization() {
    const bodySizeRatio = parseFloat(document.getElementById('body_size_ratio').value);
    const lowerShadowRatio = parseFloat(document.getElementById('lower_shadow_ratio').value);
    const upperShadowRatio = parseFloat(document.getElementById('upper_shadow_ratio').value);
    const requireGreen = document.getElementById('require_green').checked;
    
    // Get the candlestick elements
    const candlestickBody = document.querySelector('.candlestick-body');
    const upperShadow = document.querySelector('.candlestick-upper-shadow');
    const lowerShadow = document.querySelector('.candlestick-lower-shadow');
    
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
    candlestickBody.classList.add('transitioning');
    upperShadow.classList.add('transitioning');
    lowerShadow.classList.add('transitioning');
    
    // Update the body
    candlestickBody.style.height = `${bodyHeight}px`;
    candlestickBody.style.top = `${bodyTop}px`;
    
    // Update the shadows
    upperShadow.style.height = `${upperShadowHeight}px`;
    upperShadow.style.top = `${bodyTop - upperShadowHeight}px`;
    
    lowerShadow.style.height = `${lowerShadowHeight}px`;
    lowerShadow.style.top = `${bodyTop + bodyHeight}px`;
    
    // Set the color based on whether it's a green or red candle
    if (requireGreen) {
        candlestickBody.classList.add('green');
        candlestickBody.classList.remove('red');
    } else {
        // For demonstration, we'll toggle between green and red
        const isGreen = Math.random() > 0.5;
        if (isGreen) {
            candlestickBody.classList.add('green');
            candlestickBody.classList.remove('red');
        } else {
            candlestickBody.classList.add('red');
            candlestickBody.classList.remove('green');
        }
    }
    
    // Remove transition class after animation completes
    setTimeout(() => {
        candlestickBody.classList.remove('transitioning');
        upperShadow.classList.remove('transitioning');
        lowerShadow.classList.remove('transitioning');
    }, 300);
}

// Add event listeners to update the visualization when parameters change
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the visualization
    updateCandlestickVisualization();
    
    // Add event listeners for range inputs
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        // Initialize range value displays
        updateRangeValue(input);
        
        // Add event listeners for range input changes
        input.addEventListener('input', () => {
            updateRangeValue(input);
            if (input.id === 'body_size_ratio' || 
                input.id === 'lower_shadow_ratio' || 
                input.id === 'upper_shadow_ratio') {
                updateCandlestickVisualization();
            }
        });
        
        // Add event listener for when dragging ends
        input.addEventListener('change', () => {
            updateRangeValue(input);
        });
    });
    
    // Add event listener for the require green checkbox
    document.getElementById('require_green').addEventListener('change', updateCandlestickVisualization);
    
    // Form submission handler
    document.getElementById('strategyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading indicator with animation
        const loading = document.querySelector('.loading');
        loading.style.display = 'block';
        loading.style.opacity = '0';
        setTimeout(() => loading.style.opacity = '1', 50);
        
        // Clear previous results
        document.getElementById('resultsBody').innerHTML = '';
        document.querySelector('.pattern-count').textContent = '';
        
        // Collect form data
        const formData = {
            symbol: document.getElementById('symbol').value.toUpperCase(),
            days: document.getElementById('days').value,
            interval: document.getElementById('interval').value,
            body_size_ratio: document.getElementById('body_size_ratio').value,
            lower_shadow_ratio: document.getElementById('lower_shadow_ratio').value,
            upper_shadow_ratio: document.getElementById('upper_shadow_ratio').value,
            ma_period: document.getElementById('ma_period').value,
            require_green: document.getElementById('require_green').checked
        };
        
        // Send request to server
        fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator with animation
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 300);
            
            if (data.error) {
                showError(data.error);
                return;
            }
            
            // Display pattern count with animation
            const patternCount = document.querySelector('.pattern-count');
            patternCount.textContent = `Found ${data.count} hammer pattern${data.count !== 1 ? 's' : ''}`;
            patternCount.style.opacity = '0';
            setTimeout(() => patternCount.style.opacity = '1', 50);
            
            // Display results with animation
            const resultsBody = document.getElementById('resultsBody');
            resultsBody.innerHTML = '';
            
            data.patterns.forEach((pattern, index) => {
                const row = document.createElement('tr');
                row.style.opacity = '0';
                row.style.transform = 'translateY(20px)';
                
                // Format date
                const dateCell = document.createElement('td');
                dateCell.textContent = pattern.date;
                row.appendChild(dateCell);
                
                // Format trend with color
                const trendCell = document.createElement('td');
                trendCell.textContent = pattern.trend;
                trendCell.classList.add(pattern.trend === 'uptrend' ? 'uptrend' : 'downtrend');
                row.appendChild(trendCell);
                
                // Format OHLC values
                ['open', 'high', 'low', 'close'].forEach(field => {
                    const cell = document.createElement('td');
                    cell.textContent = pattern[field].toFixed(2);
                    row.appendChild(cell);
                });
                
                resultsBody.appendChild(row);
                
                // Animate row appearance
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, index * 100);
            });
        })
        .catch(error => {
            // Hide loading indicator with animation
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 300);
            
            showError(`Error: ${error.message}. Please try again.`);
        });
    });
});

// Function to show error messages
function showError(message) {
    const patternCount = document.querySelector('.pattern-count');
    patternCount.textContent = message;
    patternCount.style.color = 'var(--danger-color)';
    patternCount.style.opacity = '0';
    setTimeout(() => patternCount.style.opacity = '1', 50);
} 