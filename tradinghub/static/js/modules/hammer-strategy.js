// Store patterns data globally
let patternsData = [];

// Store filtered patterns globally
let filteredPatterns = [];

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

// Function to convert patterns to CSV
function convertToCSV(patterns) {
    // CSV header
    const headers = ['Date & Time (Israel)', 'Trend', 'Open', 'High', 'Low', 'Close'];
    
    // Convert patterns to CSV rows
    const rows = patterns.map(pattern => [
        pattern.date,
        pattern.trend,
        pattern.open.toFixed(2),
        pattern.high.toFixed(2),
        pattern.low.toFixed(2),
        pattern.close.toFixed(2)
    ]);
    
    // Combine headers and rows
    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}

// Function to download CSV
function downloadCSV() {
    // Create CSV content
    const csv = convertToCSV(patternsData);
    
    // Create blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create download URL
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, 'hammer_patterns.csv');
    } else {
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'hammer_patterns.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Function to show error messages
function showError(message) {
    const patternCount = document.querySelector('.pattern-count');
    patternCount.textContent = message;
    patternCount.style.color = 'var(--danger-color)';
    patternCount.style.opacity = '0';
    setTimeout(() => patternCount.style.opacity = '1', 50);
}

// Initialize hammer strategy page
function initHammerStrategy() {
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
    
    // Add event listener for the volume filter toggle
    document.getElementById('use_volume_filter').addEventListener('change', function() {
        const volumeParams = document.getElementById('volume-params');
        if (this.checked) {
            volumeParams.style.display = 'block';
        } else {
            volumeParams.style.display = 'none';
        }
    });
    
    // Add event listener for download CSV button
    document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
    
    // Form submission handler
    const strategyForm = document.getElementById('strategyForm');
    const analysisResults = document.getElementById('analysisResults');
    const backtestSection = document.getElementById('backtestSection');
    const loadingIndicator = document.querySelector('.loading');
    const resultsContent = document.getElementById('results');

    if (strategyForm) {
        strategyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state and sections
            analysisResults.classList.remove('d-none');
            loadingIndicator.style.display = 'block';
            resultsContent.style.display = 'none';
            backtestSection.classList.remove('d-none');
            
            // Clear previous results
            document.getElementById('resultsBody').innerHTML = '';
            document.querySelector('.pattern-count').textContent = '';
            document.getElementById('downloadCSV').style.display = 'none';
            
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
            
            // Add volume parameters only if volume filter is enabled
            const useVolumeFilter = document.getElementById('use_volume_filter').checked;
            if (useVolumeFilter) {
                formData.min_relative_volume = document.getElementById('min_relative_volume').value;
                formData.volume_lookback = document.getElementById('volume_lookback').value;
            }
            
            try {
                // Send analysis request
                const response = await fetch('/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Store the patterns for backtesting
                patternsData = data.patterns;
                filteredPatterns = data.patterns;
                
                // Update pattern count and results
                const patternCount = document.querySelector('.pattern-count');
                patternCount.textContent = `Found ${data.patterns.length} pattern(s)`;
                
                // Update results table
                const tbody = document.getElementById('resultsBody');
                data.patterns.forEach(pattern => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${pattern.date}</td>
                        <td>${pattern.trend}</td>
                        <td>${pattern.open.toFixed(2)}</td>
                        <td>${pattern.high.toFixed(2)}</td>
                        <td>${pattern.low.toFixed(2)}</td>
                        <td>${pattern.close.toFixed(2)}</td>
                    `;
                    tbody.appendChild(row);
                });
                
                // Show download button if patterns found
                if (data.patterns.length > 0) {
                    document.getElementById('downloadCSV').style.display = 'block';
                }
                
                // Show results content
                loadingIndicator.style.display = 'none';
                resultsContent.style.display = 'block';
                
                // Scroll to results
                analysisResults.scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Error:', error);
                loadingIndicator.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Error analyzing patterns: ${error.message}
                    </div>
                `;
            }
        });
    }
}

// Export functions for use in other modules
export {
    initHammerStrategy,
    filteredPatterns,
    showError
};

// Handle form submission and section visibility
document.addEventListener('DOMContentLoaded', function() {
    const strategyForm = document.getElementById('strategyForm');
    const analysisResults = document.getElementById('analysisResults');
    const backtestSection = document.getElementById('backtestSection');
    const loadingIndicator = document.querySelector('.loading');
    const resultsContent = document.getElementById('results');

    if (strategyForm) {
        strategyForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Show loading state
            analysisResults.classList.remove('d-none');
            loadingIndicator.style.display = 'block';
            resultsContent.style.display = 'none';
            backtestSection.classList.remove('d-none');

            try {
                // Get form data
                const formData = {
                    symbol: document.getElementById('symbol').value,
                    days: document.getElementById('days').value,
                    interval: document.getElementById('interval').value,
                    bodyRatio: document.getElementById('body_size_ratio').value,
                    lowerShadowRatio: document.getElementById('lower_shadow_ratio').value,
                    upperShadowRatio: document.getElementById('upper_shadow_ratio').value,
                    maPeriod: document.getElementById('ma_period').value,
                    requireGreen: document.getElementById('require_green').checked
                };

                // Make API call to analyze patterns
                const response = await fetch('/api/analyze-patterns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                
                // Update results table with the data
                updateResultsTable(data);
                
                // Show results and backtest sections
                loadingIndicator.style.display = 'none';
                resultsContent.style.display = 'block';
                
                // Scroll to results
                analysisResults.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                console.error('Error:', error);
                // Show error message to user
                loadingIndicator.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Error analyzing patterns. Please try again.
                    </div>
                `;
            }
        });
    }
});

// Function to update results table
function updateResultsTable(data) {
    const tableBody = document.querySelector('#tradesTable tbody');
    const patternCount = document.querySelector('.pattern-count');
    const downloadButton = document.getElementById('downloadCSV');

    if (data.patterns && data.patterns.length > 0) {
        patternCount.textContent = `Found ${data.patterns.length} pattern(s)`;
        downloadButton.style.display = 'block';
        
        tableBody.innerHTML = data.patterns.map(pattern => `
            <tr>
                <td>${pattern.date}</td>
                <td>${pattern.open}</td>
                <td>${pattern.high}</td>
                <td>${pattern.low}</td>
                <td>${pattern.close}</td>
                <td>${pattern.volume}</td>
                <td>${pattern.type}</td>
            </tr>
        `).join('');
    } else {
        patternCount.textContent = 'No patterns found';
        downloadButton.style.display = 'none';
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">No patterns found in the selected timeframe</td>
            </tr>
        `;
    }
} 