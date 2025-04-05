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
    
    // Calculate the total height of the candlestick (100px)
    const totalHeight = 100;
    
    // Calculate the body height based on the body size ratio
    const bodyHeight = totalHeight * bodySizeRatio;
    
    // Calculate the lower shadow height based on the lower shadow ratio
    // For a hammer, the lower shadow is much longer than the body
    const lowerShadowHeight = bodyHeight * lowerShadowRatio;
    
    // Calculate the upper shadow height based on the upper shadow ratio
    const upperShadowHeight = totalHeight * upperShadowRatio;
    
    // Position the body in the middle of the candlestick
    const bodyTop = (totalHeight - bodyHeight) / 2;
    
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
        // In a real application, you might want to add a separate toggle for this
        const isGreen = Math.random() > 0.5;
        if (isGreen) {
            candlestickBody.classList.add('green');
            candlestickBody.classList.remove('red');
        } else {
            candlestickBody.classList.add('red');
            candlestickBody.classList.remove('green');
        }
    }
}

// Add event listeners to update the visualization when parameters change
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the visualization
    updateCandlestickVisualization();
    
    // Add event listeners to update the visualization when parameters change
    document.getElementById('body_size_ratio').addEventListener('input', updateCandlestickVisualization);
    document.getElementById('lower_shadow_ratio').addEventListener('input', updateCandlestickVisualization);
    document.getElementById('upper_shadow_ratio').addEventListener('input', updateCandlestickVisualization);
    document.getElementById('require_green').addEventListener('change', updateCandlestickVisualization);
    
    // Form submission handler
    document.getElementById('strategyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading indicator
        document.querySelector('.loading').style.display = 'block';
        document.getElementById('resultsBody').innerHTML = '';
        document.querySelector('.pattern-count').textContent = '';
        
        // Collect form data
        const formData = {
            symbol: document.getElementById('symbol').value,
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
            // Hide loading indicator
            document.querySelector('.loading').style.display = 'none';
            
            if (data.error) {
                document.querySelector('.pattern-count').textContent = data.error;
                return;
            }
            
            // Display pattern count
            document.querySelector('.pattern-count').textContent = 
                `Found ${data.count} hammer pattern${data.count !== 1 ? 's' : ''}`;
            
            // Display results
            const resultsBody = document.getElementById('resultsBody');
            resultsBody.innerHTML = '';
            
            data.patterns.forEach(pattern => {
                const row = document.createElement('tr');
                
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
            });
        })
        .catch(error => {
            document.querySelector('.loading').style.display = 'none';
            document.querySelector('.pattern-count').textContent = 
                `Error: ${error.message}. Please try again.`;
        });
    });
}); 