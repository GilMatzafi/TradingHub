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
    
    // Add event listener for the hourly performance chart button
    document.getElementById('showHourlyChart')?.addEventListener('click', function() {
        const chartContainer = document.getElementById('hourlyChartContainer');
        const button = document.getElementById('showHourlyChart');
        
        if (chartContainer.classList.contains('d-none')) {
            // Show the chart
            chartContainer.classList.remove('d-none');
            button.innerHTML = '<i class="bi bi-clock me-2"></i>Hide Strategy Performance';
            
            // If we have hourly performance data, render the chart
            if (window.hourlyPerformance) {
                renderHourlyPerformanceChart(window.hourlyPerformance);
            }
        } else {
            // Hide the chart
            chartContainer.classList.add('d-none');
            button.innerHTML = '<i class="bi bi-clock me-2"></i>Show Strategy Performance';
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
            slippage: parseFloat(document.getElementById('slippage').value),
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
            
            console.log('Backtest response:', data); // Debug log
            
            // Update results display
            document.getElementById('backtestResults').classList.remove('d-none');
            
            // Safely update metrics with null checks
            document.getElementById('totalTrades').textContent = data.total_trades || 0;
            document.getElementById('winningTrades').textContent = data.winning_trades || 0;
            document.getElementById('losingTrades').textContent = data.losing_trades || 0;
            document.getElementById('winRate').textContent = data.win_rate ? (data.win_rate * 100).toFixed(2) + '%' : '0%';
            document.getElementById('profitFactor').textContent = data.profit_factor ? data.profit_factor.toFixed(2) : '0.00';
            document.getElementById('averageProfit').textContent = data.average_profit ? (data.average_profit * 100).toFixed(2) + '%' : '0%';
            
            const totalProfitElement = document.getElementById('totalProfit');
            const totalProfitValue = data.total_profit_pct ? data.total_profit_pct.toFixed(2) : '0.00';
            totalProfitElement.textContent = totalProfitValue + '%';
            totalProfitElement.classList.remove('positive', 'negative');
            totalProfitElement.classList.add(parseFloat(totalProfitValue) >= 0 ? 'positive' : 'negative');
            
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
            
            // Store hourly performance data and render chart
            if (data.hourly_performance) {
                window.hourlyPerformance = data.hourly_performance;
                const hourlyChartContainer = document.getElementById('hourlyChartContainer');
                // Make sure the container starts hidden
                hourlyChartContainer.classList.add('d-none');
                // Reset the button text to show state
                const button = document.getElementById('showHourlyChart');
                if (button) {
                    button.innerHTML = '<i class="bi bi-clock me-2"></i>Show Strategy Performance';
                }
            } else {
                console.error('No hourly performance data in response');
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
    const chartContainer = canvas.parentElement;
    
    // Clear existing content
    chartContainer.innerHTML = '';
    
    // Create chart title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'chart-title';
    titleDiv.innerHTML = `
        <span>Portfolio Performance</span>
        <i class="bi bi-graph-up"></i>
    `;
    chartContainer.appendChild(titleDiv);
    
    // Create chart controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'chart-controls';
    controlsDiv.innerHTML = `
        <div class="chart-period-selector">
            <button class="chart-period-btn active" data-period="all">All</button>
            <button class="chart-period-btn" data-period="1m">1M</button>
            <button class="chart-period-btn" data-period="1w">1W</button>
            <button class="chart-period-btn" data-period="1d">1D</button>
        </div>
    `;
    chartContainer.appendChild(controlsDiv);
    
    // Create new canvas
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'portfolioChart';
    chartContainer.appendChild(newCanvas);
    
    // Create value indicator
    const valueIndicator = document.createElement('div');
    valueIndicator.className = 'chart-value-indicator';
    const initialValue = portfolioHistory[0].value;
    const finalValue = portfolioHistory[portfolioHistory.length - 1].value;
    const percentChange = ((finalValue - initialValue) / initialValue) * 100;
    const changeClass = percentChange >= 0 ? 'positive' : 'negative';
    
    valueIndicator.innerHTML = `
        <div class="chart-value-label">Current Value</div>
        <div class="chart-value ${changeClass}">
            $${finalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)
        </div>
    `;
    chartContainer.appendChild(valueIndicator);
    
    // Prepare data for the chart
    const labels = portfolioHistory.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    });
    const values = portfolioHistory.map(item => item.value);
    
    // Calculate gradient
    const ctx = newCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0.0)');
    
    // Create the chart
    window.portfolioChart = new Chart(newCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value',
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHitRadius: 20,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointHoverBorderColor: 'white',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'white',
                    titleColor: 'rgba(0, 0, 0, 0.7)',
                    bodyColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 13,
                        weight: 'normal'
                    },
                    bodyFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 12,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
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
    
    // Add event listeners for period buttons
    const periodButtons = chartContainer.querySelectorAll('.chart-period-btn');
    periodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            periodButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter data based on selected period
            const period = button.dataset.period;
            let filteredHistory = [...portfolioHistory];
            
            if (period !== 'all') {
                const now = new Date(portfolioHistory[portfolioHistory.length - 1].date);
                let cutoff = new Date(now);
                
                switch (period) {
                    case '1m':
                        cutoff.setMonth(now.getMonth() - 1);
                        break;
                    case '1w':
                        cutoff.setDate(now.getDate() - 7);
                        break;
                    case '1d':
                        cutoff.setDate(now.getDate() - 1);
                        break;
                }
                
                filteredHistory = portfolioHistory.filter(item => 
                    new Date(item.date) >= cutoff
                );
            }
            
            // Update chart data
            window.portfolioChart.data.labels = filteredHistory.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                });
            });
            window.portfolioChart.data.datasets[0].data = filteredHistory.map(item => item.value);
            window.portfolioChart.update();
            
            // Update value indicator
            const initialValue = filteredHistory[0].value;
            const finalValue = filteredHistory[filteredHistory.length - 1].value;
            const percentChange = ((finalValue - initialValue) / initialValue) * 100;
            const changeClass = percentChange >= 0 ? 'positive' : 'negative';
            
            valueIndicator.innerHTML = `
                <div class="chart-value-label">Current Value</div>
                <div class="chart-value ${changeClass}">
                    $${finalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)
                </div>
            `;
        });
    });
    
    // Create legend
    const legendDiv = document.createElement('div');
    legendDiv.className = 'chart-legend';
    legendDiv.innerHTML = `
        <div class="chart-legend-item">
            <div class="chart-legend-color portfolio"></div>
            <span>Portfolio Value</span>
        </div>
    `;
    chartContainer.appendChild(legendDiv);
}

function renderBacktestResults(results) {
    const backtestResults = document.getElementById('backtestResults');
    backtestResults.classList.remove('d-none');

    // Update metrics with proper formatting
    document.getElementById('totalTrades').textContent = results.total_trades;
    document.getElementById('winningTrades').textContent = results.winning_trades;
    document.getElementById('losingTrades').textContent = results.losing_trades;
    document.getElementById('winRate').textContent = `${(results.win_rate * 100).toFixed(2)}%`;
    document.getElementById('profitFactor').textContent = results.profit_factor.toFixed(2);
    document.getElementById('averageProfit').textContent = `${(results.average_profit * 100).toFixed(2)}%`;
    
    const totalProfitElement = document.getElementById('totalProfit');
    const totalProfitValue = (results.total_profit * 100).toFixed(2);
    totalProfitElement.textContent = `${totalProfitValue}%`;
    totalProfitElement.classList.add(totalProfitValue >= 0 ? 'positive' : 'negative');

    // Update portfolio values with currency formatting
    const formatCurrency = (value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    document.getElementById('initialPortfolioValue').textContent = formatCurrency(results.initial_portfolio_value);
    document.getElementById('finalPortfolioValue').textContent = formatCurrency(results.final_portfolio_value);
    document.getElementById('totalCommission').textContent = formatCurrency(results.total_commission);
    document.getElementById('totalSlippage').textContent = formatCurrency(results.total_slippage);

    // Render trades table
    const tradesTable = document.getElementById('tradesTable');
    tradesTable.innerHTML = '';

    if (results.trades.length === 0) {
        const noTradesRow = document.createElement('tr');
        noTradesRow.innerHTML = '<td colspan="8" class="text-center">No trades executed during the backtest period.</td>';
        tradesTable.appendChild(noTradesRow);
        return;
    }

    results.trades.forEach(trade => {
        const row = document.createElement('tr');
        const profitClass = trade.profit_pct >= 0 ? 'positive' : 'negative';
        
        row.innerHTML = `
            <td>${new Date(trade.entry_date).toLocaleDateString()}</td>
            <td>${new Date(trade.exit_date).toLocaleDateString()}</td>
            <td>${formatCurrency(trade.entry_price)}</td>
            <td>${formatCurrency(trade.exit_price)}</td>
            <td class="${profitClass}">${(trade.profit_pct * 100).toFixed(2)}%</td>
            <td class="${profitClass}">${formatCurrency(trade.profit_amount)}</td>
            <td>${trade.periods_held}</td>
            <td>${trade.exit_reason}</td>
        `;
        
        tradesTable.appendChild(row);
    });

    // Update portfolio chart if visible
    const chartContainer = document.getElementById('portfolioChartContainer');
    if (!chartContainer.classList.contains('d-none')) {
        renderPortfolioChart(results.portfolio_history);
    }
}

/**
 * Render the hourly performance chart using Chart.js
 * @param {Object} hourlyPerformance - Object containing hourly performance data
 */
function renderHourlyPerformanceChart(hourlyPerformance) {
    // Debug log to check incoming data
    console.log('Hourly Performance Data:', hourlyPerformance);

    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded');
        return;
    }

    // Check if we have valid data
    if (!hourlyPerformance || !hourlyPerformance.hourly_avg_profits) {
        console.error('Invalid hourly performance data');
        return;
    }
    
    // Get the canvas element
    const canvas = document.getElementById('hourlyChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Get the canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Destroy existing chart if it exists
    if (window.hourlyChart instanceof Chart) {
        window.hourlyChart.destroy();
        window.hourlyChart = null;
    }

    // Prepare data for the chart
    const hours = Array.from({length: 24}, (_, i) => i);
    const labels = hours.map(hour => `${hour.toString().padStart(2, '0')}:00`);
    
    // Get the data
    const avgProfits = hourlyPerformance.hourly_avg_profits;
    const tradeCounts = hourlyPerformance.hourly_trades;

    // Calculate summary statistics
    const bestHourIndex = avgProfits.indexOf(Math.max(...avgProfits));
    const worstHourIndex = avgProfits.indexOf(Math.min(...avgProfits));
    const mostActiveHourIndex = tradeCounts.indexOf(Math.max(...tradeCounts));
    const avgTradesPerHour = tradeCounts.reduce((a, b) => a + b, 0) / tradeCounts.filter(x => x > 0).length || 0;
    
    // Update summary cards
    const bestHourEl = document.getElementById('bestHour');
    const worstHourEl = document.getElementById('worstHour');
    const mostActiveHourEl = document.getElementById('mostActiveHour');
    const avgTradesPerHourEl = document.getElementById('avgTradesPerHour');

    if (bestHourEl) bestHourEl.textContent = `${labels[bestHourIndex]} (${(avgProfits[bestHourIndex] * 100).toFixed(2)}%)`;
    if (worstHourEl) worstHourEl.textContent = `${labels[worstHourIndex]} (${(avgProfits[worstHourIndex] * 100).toFixed(2)}%)`;
    if (mostActiveHourEl) mostActiveHourEl.textContent = `${labels[mostActiveHourIndex]} (${tradeCounts[mostActiveHourIndex]} trades)`;
    if (avgTradesPerHourEl) avgTradesPerHourEl.textContent = avgTradesPerHour.toFixed(1);

    // Create datasets
    const datasets = [
        {
            label: 'Average Profit %',
            data: avgProfits.map(profit => profit * 100),
            backgroundColor: avgProfits.map(profit => 
                profit >= 0 ? 'rgba(0, 200, 83, 0.6)' : 'rgba(211, 47, 47, 0.6)'
            ),
            borderColor: avgProfits.map(profit => 
                profit >= 0 ? 'rgba(0, 200, 83, 1)' : 'rgba(211, 47, 47, 1)'
            ),
            borderWidth: 1,
            yAxisID: 'y',
            type: 'bar',
            hidden: false
        },
        {
            label: 'Number of Trades',
            data: tradeCounts,
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y2',
            type: 'bar',
            hidden: true  // Start with volume hidden
        }
    ];

    // Create chart configuration
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Profit %'
                    },
                    grid: {
                        drawOnChartArea: true
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,  // Start with volume axis hidden
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Number of Trades'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    };

    // Create the chart
    try {
        window.hourlyChart = new Chart(ctx, config);
    } catch (error) {
        console.error('Error creating chart:', error);
        return;
    }

    // Update the toggle buttons HTML
    const toggleContainer = document.querySelector('.hourly-chart-toggle');
    if (toggleContainer) {
        toggleContainer.innerHTML = `
            <button type="button" class="active" data-metric="profit">Profit</button>
            <button type="button" data-metric="volume">Volume</button>
        `;
    }

    // Add event listeners for metric toggle buttons
    const toggleButtons = document.querySelectorAll('.hourly-chart-toggle button');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const metric = button.dataset.metric;
            console.log('Toggle clicked:', metric);

            // Update active state
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update chart visibility
            const chart = window.hourlyChart;
            if (!chart) {
                console.error('Chart not initialized');
                return;
            }

            if (metric === 'profit') {
                chart.data.datasets[0].hidden = false;
                chart.data.datasets[1].hidden = true;
                chart.options.scales.y.display = true;
                chart.options.scales.y2.display = false;
            } else if (metric === 'volume') {
                chart.data.datasets[0].hidden = true;
                chart.data.datasets[1].hidden = false;
                chart.options.scales.y.display = false;
                chart.options.scales.y2.display = true;
            }

            chart.update();
        });
    });
}

// Export the initialization function
export { initBacktest }; 