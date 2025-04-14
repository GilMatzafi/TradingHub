// Import HammerStrategy from hammer-strategy module
import { HammerStrategy } from '../hammer-strategy.js';
import { resetCharts } from './backtest-charts.js';
import { setTradesData } from './backtest-trades.js';
import { updateMetrics, showBacktestResults } from './backtest-metrics.js';

// API functionality
function initBacktestApi() {
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
        const formData = collectFormData(filteredPatterns);
        
        // Send backtest request
        sendBacktestRequest(formData, loading);
    });
}

// Collect form data for the backtest request
function collectFormData(filteredPatterns) {
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
    
    return formData;
}

// Send backtest request to the server
function sendBacktestRequest(formData, loading) {
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
        
        // Process backtest results
        processBacktestResults(data);
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
}

// Process backtest results
function processBacktestResults(data) {
    // Show backtest results section
    showBacktestResults();
    
    // Update metrics
    updateMetrics(data);
    
    // Store data for charts
    window.portfolioHistory = data.portfolio_history;
    window.hourlyPerformance = data.hourly_performance;
    
    // Reset charts to initial state
    resetCharts();
    
    // Set trades data and update the table
    setTradesData(data.trades);
}

// Export functions
export { 
    initBacktestApi
}; 