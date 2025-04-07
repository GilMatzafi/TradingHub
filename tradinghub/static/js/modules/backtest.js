// Import HammerStrategy from hammer-strategy module
import { HammerStrategy } from './hammer-strategy.js';

// Backtest functionality
function initBacktest() {
    // Add event listener for the portfolio chart button
    document.getElementById('showPortfolioChart')?.addEventListener('click', function() {
        const chartContainer = document.getElementById('portfolioChartContainer');
        const button = document.getElementById('showPortfolioChart');
        
        if (chartContainer.classList.contains('d-none')) {
            // Show the chart
            chartContainer.classList.remove('d-none');
            button.innerHTML = '<i class="bi bi-graph-down me-2"></i>Hide Portfolio Chart';
            
            // If we have portfolio history data, render the chart
            if (window.portfolioHistory && window.portfolioHistory.length > 0) {
                renderPortfolioChart(window.portfolioHistory);
            }
        } else {
            // Hide the chart
            chartContainer.classList.add('d-none');
            button.innerHTML = '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart';
        }
    });
    
    document.getElementById('runBacktest')?.addEventListener('click', function() {
        // Get the hammer strategy instance from the global window object
        // This is set in hammer-strategy.js
        const hammerStrategy = window.hammerStrategy;
        
        if (!hammerStrategy) {
            console.error('HammerStrategy not initialized');
            alert('Error: HammerStrategy not initialized');
            return;
        }
        
        // Get the filtered patterns from the pattern data manager
        const filteredPatterns = hammerStrategy.dataManager.getFilteredPatterns();
        
        if (filteredPatterns.length === 0) {
            alert('Please run pattern analysis first before running backtest');
            return;
        }
        
        // Show loading indicator
        const loading = document.querySelector('.loading');
        loading.style.display = 'block';
        loading.style.opacity = '0';
        setTimeout(() => loading.style.opacity = '1', 50);
        
        // Collect form data
        const formData = {
            symbol: document.getElementById('symbol').value.toUpperCase(),
            days: document.getElementById('days').value,
            interval: document.getElementById('interval').value,
            body_size_ratio: document.getElementById('body_size_ratio').value,
            lower_shadow_ratio: document.getElementById('lower_shadow_ratio').value,
            upper_shadow_ratio: document.getElementById('upper_shadow_ratio').value,
            ma_period: document.getElementById('ma_period').value,
            require_green: document.getElementById('require_green').checked,
            stop_loss_pct: document.getElementById('stop_loss_pct').value / 100,
            take_profit_pct: document.getElementById('take_profit_pct').value / 100,
            entry_delay: document.getElementById('entry_delay').value,
            max_holding_periods: document.getElementById('max_holding_periods').value,
            initial_portfolio_size: parseFloat(document.getElementById('initial_portfolio_size').value),
            commission: parseFloat(document.getElementById('commission').value),
            slippage_pct: parseFloat(document.getElementById('slippage_pct').value) / 100,
            patterns: filteredPatterns  // Add the filtered patterns to the request
        };
        
        // Add volume parameters if volume filter is enabled
        const useVolumeFilter = document.getElementById('use_volume_filter').checked;
        if (useVolumeFilter) {
            formData.min_relative_volume = document.getElementById('min_relative_volume').value;
            formData.volume_lookback = document.getElementById('volume_lookback').value;
        }
        
        // Log the data being sent for debugging
        console.log('Sending backtest request with patterns:', filteredPatterns.length);
        
        // Send backtest request
        fetch('/backtest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Log the response for debugging
            console.log('Backtest results:', data);
            
            // Update results display
            document.getElementById('backtestResults').classList.remove('d-none');
            
            // Safely update metrics with null checks
            document.getElementById('totalTrades').textContent = data.total_trades || 0;
            document.getElementById('winningTrades').textContent = data.winning_trades || 0;
            document.getElementById('losingTrades').textContent = data.losing_trades || 0;
            document.getElementById('winRate').textContent = data.win_rate ? (data.win_rate * 100).toFixed(2) + '%' : '0%';
            document.getElementById('profitFactor').textContent = data.profit_factor ? data.profit_factor.toFixed(2) : '0.00';
            document.getElementById('averageProfit').textContent = data.average_profit ? (data.average_profit * 100).toFixed(2) + '%' : '0%';
            document.getElementById('totalProfit').textContent = data.total_profit_pct ? data.total_profit_pct.toFixed(2) + '%' : '0%';
            
            // Update portfolio values
            if (data.initial_portfolio_value) {
                document.getElementById('initialPortfolioValue').textContent = 
                    `$${data.initial_portfolio_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
            if (data.final_portfolio_value) {
                document.getElementById('finalPortfolioValue').textContent = 
                    `$${data.final_portfolio_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
            if (data.total_commission) {
                document.getElementById('totalCommission').textContent = 
                    `$${data.total_commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
            if (data.total_slippage) {
                document.getElementById('totalSlippage').textContent = 
                    `$${data.total_slippage.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
            
            // Store portfolio history data for later use
            if (data.portfolio_history && data.portfolio_history.length > 0) {
                window.portfolioHistory = data.portfolio_history;
                
                // Reset the chart button and container
                const chartContainer = document.getElementById('portfolioChartContainer');
                const button = document.getElementById('showPortfolioChart');
                chartContainer.classList.add('d-none');
                button.innerHTML = '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart';
            }
            
            // Update trades table
            const tbody = document.getElementById('tradesTable');
            if (!tbody) {
                console.error('Could not find trades table body element');
                return;
            }
            
            tbody.innerHTML = '';
            
            if (data.trades && Array.isArray(data.trades)) {
                if (data.trades.length === 0) {
                    // Add a message if no trades were executed
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="8" class="text-center">No trades were executed during the backtest period.</td>';
                    tbody.appendChild(row);
                } else {
                    data.trades.forEach(trade => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${trade.entry_date || '-'}</td>
                            <td>${trade.exit_date || '-'}</td>
                            <td>${trade.entry_price ? trade.entry_price.toFixed(2) : '-'}</td>
                            <td>${trade.exit_price ? trade.exit_price.toFixed(2) : '-'}</td>
                            <td class="${trade.profit_pct >= 0 ? 'text-success' : 'text-danger'}">${trade.profit_pct ? trade.profit_pct.toFixed(2) : '0.00'}%</td>
                            <td class="${trade.profit_amount >= 0 ? 'text-success' : 'text-danger'}">$${trade.profit_amount ? trade.profit_amount.toFixed(2) : '0.00'}</td>
                            <td>${trade.periods_held || 0}</td>
                            <td>${trade.exit_reason || '-'}</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            } else {
                // Add a message if trades data is missing
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="8" class="text-center">No trade data available.</td>';
                tbody.appendChild(row);
            }
        })
        .catch(error => {
            console.error('Backtest error:', error);
            alert('Error running backtest: ' + error.message);
        })
        .finally(() => {
            // Hide loading indicator
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 300);
        });
    });
}

/**
 * Render the portfolio chart using Chart.js
 * @param {Array} portfolioHistory - Array of portfolio value data points
 */
function renderPortfolioChart(portfolioHistory) {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }
    
    // Get the canvas element
    const canvas = document.getElementById('portfolioChart');
    
    // Set a fixed height for the chart container
    const chartContainer = canvas.parentElement;
    chartContainer.style.height = '300px';
    
    // Destroy existing chart if it exists
    if (window.portfolioChart && typeof window.portfolioChart.destroy === 'function') {
        window.portfolioChart.destroy();
    }
    
    // Prepare data for the chart
    const labels = portfolioHistory.map(item => item.date);
    const values = portfolioHistory.map(item => item.value);
    
    // Create the chart
    window.portfolioChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value ($)',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            }
        }
    });
}

// Export the initialization function
export { initBacktest }; 