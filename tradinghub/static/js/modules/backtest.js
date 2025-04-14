// Import HammerStrategy from hammer-strategy module
import { HammerStrategy } from './hammer-strategy.js';
import { PortfolioChart } from './charts/portfolioChart.js';
import { StrategyPerformanceChart } from './charts/strategyPerformanceChart.js';

// Initialize chart instances
let portfolioChart = null;
let strategyChart = null;
// Store trades data for sorting
let tradesData = [];

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
                if (!portfolioChart) {
                    portfolioChart = new PortfolioChart();
                }
                portfolioChart.initialize(window.portfolioHistory);
            }
        } else {
            // Hide the chart
            chartContainer.classList.add('d-none');
            button.innerHTML = '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart';
            if (portfolioChart) {
                portfolioChart.destroy();
            }
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
                if (!strategyChart) {
                    strategyChart = new StrategyPerformanceChart();
                }
                strategyChart.initialize(window.hourlyPerformance);
            }
        } else {
            // Hide the chart
            chartContainer.classList.add('d-none');
            button.innerHTML = '<i class="bi bi-clock me-2"></i>Show Strategy Performance';
            if (strategyChart) {
                strategyChart.destroy();
            }
        }
    });
    
    document.getElementById('runBacktest')?.addEventListener('click', function() {
        // Get the hammer strategy instance from the global window object
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
            patterns: filteredPatterns
        };
        
        // Add volume parameters if volume filter is enabled
        const useVolumeFilter = document.getElementById('use_volume_filter').checked;
        if (useVolumeFilter) {
            formData.min_relative_volume = document.getElementById('min_relative_volume').value;
            formData.volume_lookback = document.getElementById('volume_lookback').value;
        }
        
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
            
            // Update results display
            document.getElementById('backtestResults').classList.remove('d-none');
            
            // Update metrics
            updateMetrics(data);
            
            // Store data for charts
            window.portfolioHistory = data.portfolio_history;
            window.hourlyPerformance = data.hourly_performance;
            
            // Make sure charts are hidden initially
            document.getElementById('portfolioChartContainer').classList.add('d-none');
            document.getElementById('hourlyChartContainer').classList.add('d-none');
            
            // Reset chart buttons
            document.getElementById('showPortfolioChart').innerHTML = '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart';
            document.getElementById('showHourlyChart').innerHTML = '<i class="bi bi-clock me-2"></i>Show Strategy Performance';
            
            // Store trades data and update trades table
            tradesData = data.trades || [];
            updateTradesTable(tradesData);
            
            // Add click event listener to the sortable column headers
            setupTradeTableSorting();
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

function updateMetrics(data) {
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
}

// Setup sorting functionality for the trade history table
function setupTradeTableSorting() {
    const table = document.querySelector('.trade-history table');
    if (!table) return;
    
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) return;
    
    // Get the sortable column headers
    const entryDateHeader = headerRow.querySelector('th:nth-child(1)');
    const profitPercentHeader = headerRow.querySelector('th:nth-child(5)');
    const profitDollarHeader = headerRow.querySelector('th:nth-child(6)');
    
    // Setup Entry Date column sorting
    if (entryDateHeader) {
        setupSortableHeader(entryDateHeader, 'Entry Date', sortTradesByEntryDate);
    }
    
    // Setup Profit % column sorting
    if (profitPercentHeader) {
        setupSortableHeader(profitPercentHeader, 'Profit %', sortTradesByProfitPercent);
    }
    
    // Setup Profit $ column sorting
    if (profitDollarHeader) {
        setupSortableHeader(profitDollarHeader, 'Profit $', sortTradesByProfitDollar);
    }
}

// Helper function to setup a sortable header
function setupSortableHeader(header, title, sortFunction) {
    // Add sortable class and cursor pointer to indicate it's clickable
    header.classList.add('sortable');
    header.style.cursor = 'pointer';
    
    // Add sort icon
    header.innerHTML = `${title} <i class="bi bi-arrow-down-up"></i>`;
    
    // Add click event listener
    header.addEventListener('click', function() {
        // Toggle sort direction
        const isAscending = !header.classList.contains('asc');
        
        // Update sort icon and class
        header.classList.remove('asc', 'desc');
        header.classList.add(isAscending ? 'asc' : 'desc');
        header.innerHTML = `${title} <i class="bi bi-arrow-${isAscending ? 'up' : 'down'}"></i>`;
        
        // Sort trades
        sortFunction(isAscending);
    });
}

// Sort trades by entry date
function sortTradesByEntryDate(ascending = true) {
    if (!tradesData || tradesData.length === 0) return;
    
    // Sort the trades array
    tradesData.sort((a, b) => {
        const dateA = a.entry_date ? new Date(a.entry_date) : new Date(0);
        const dateB = b.entry_date ? new Date(b.entry_date) : new Date(0);
        
        return ascending ? dateA - dateB : dateB - dateA;
    });
    
    // Update the table with sorted data
    updateTradesTable(tradesData);
}

// Sort trades by profit percentage
function sortTradesByProfitPercent(ascending = true) {
    if (!tradesData || tradesData.length === 0) return;
    
    // Sort the trades array
    tradesData.sort((a, b) => {
        const profitA = a.profit_pct || 0;
        const profitB = b.profit_pct || 0;
        
        return ascending ? profitA - profitB : profitB - profitA;
    });
    
    // Update the table with sorted data
    updateTradesTable(tradesData);
}

// Sort trades by profit dollar amount
function sortTradesByProfitDollar(ascending = true) {
    if (!tradesData || tradesData.length === 0) return;
    
    // Sort the trades array
    tradesData.sort((a, b) => {
        const profitA = a.profit_amount || 0;
        const profitB = b.profit_amount || 0;
        
        return ascending ? profitA - profitB : profitB - profitA;
    });
    
    // Update the table with sorted data
    updateTradesTable(tradesData);
}

function updateTradesTable(trades) {
    const tbody = document.getElementById('tradesTable');
    if (!tbody) {
        console.error('Could not find trades table body element');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!trades || !Array.isArray(trades)) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="text-center">No trade data available.</td>';
        tbody.appendChild(row);
        return;
    }
    
    if (trades.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="text-center">No trades were executed during the backtest period.</td>';
        tbody.appendChild(row);
        return;
    }
    
    trades.forEach(trade => {
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

// Export the initialization function
export { initBacktest }; 