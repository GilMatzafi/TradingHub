// Import shared backtest components
import { resetCharts } from './backtest-charts.js';
import { setTradesData } from './backtest-trades.js';
import { updateMetrics, showBacktestResults } from './backtest-metrics.js';

// API functionality - Works for ANY pattern (hammer, doji, shooting star, etc.)
function initBacktestApi() {
    document.getElementById('runBacktest')?.addEventListener('click', function() {
        // Get the current strategy instance (works for any pattern)
        const currentStrategy = window.hammerStrategy || window.dojiStrategy || window.elephantBarStrategy || window.marubozuStrategy || window.shootingStarStrategy || window.engulfingStrategy || window.haramiStrategy;
        
        // Debug: Log what strategies are available
        console.log('🔍 Backtest API Debug:', {
            hammerStrategy: !!window.hammerStrategy,
            dojiStrategy: !!window.dojiStrategy,
            elephantBarStrategy: !!window.elephantBarStrategy,
            marubozuStrategy: !!window.marubozuStrategy,
            shootingStarStrategy: !!window.shootingStarStrategy,
            engulfingStrategy: !!window.engulfingStrategy,
            haramiStrategy: !!window.haramiStrategy,
            currentStrategy: !!currentStrategy
        });
        
        if (!currentStrategy) {
            console.error('Strategy not initialized');
            console.error('Available strategies:', {
                hammer: !!window.hammerStrategy,
                doji: !!window.dojiStrategy,
                elephantBar: !!window.elephantBarStrategy,
                marubozu: !!window.marubozuStrategy,
                shootingStar: !!window.shootingStarStrategy,
                engulfing: !!window.engulfingStrategy,
                harami: !!window.haramiStrategy
            });
            alert('Error: Strategy not initialized');
            return;
        }
        
        // Get the filtered patterns from the pattern data manager
        const filteredPatterns = currentStrategy.dataManager.getFilteredPatterns();
        
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

// Collect form data for the backtest request - Works for ANY pattern
function collectFormData(filteredPatterns) {
    // Base form data (same for all patterns)
    const formData = {
        symbol: document.getElementById('symbol').value.toUpperCase(),
        days: document.getElementById('days').value,
        interval: document.getElementById('interval').value,
        patterns: filteredPatterns,
        
        // Backtest parameters (same for all patterns)
        stop_loss_pct: document.getElementById('stop_loss_pct').value / 100,
        take_profit_pct: document.getElementById('take_profit_pct').value / 100,
        entry_delay: document.getElementById('entry_delay').value,
        max_holding_periods: document.getElementById('max_holding_periods').value,
        initial_portfolio_size: parseFloat(document.getElementById('initial_portfolio_size').value),
        commission: parseFloat(document.getElementById('commission').value),
        slippage: parseFloat(document.getElementById('slippage').value)
    };

    // Add pattern-specific parameters (only if they exist)
    const patternParams = [
        'body_size_ratio', 'lower_shadow_ratio', 'upper_shadow_ratio',
        'ma_period', 'require_green', 'require_high_volume'
    ];

    patternParams.forEach(param => {
        const element = document.getElementById(param);
        if (element) {
            if (element.type === 'checkbox') {
                formData[param] = element.checked;
            } else {
                formData[param] = element.value;
            }
        }
    });
    
    // Add volume parameters if volume filter is enabled
    const useVolumeFilter = document.getElementById('use_volume_filter');
    const requireHighVolume = document.getElementById('require_high_volume');
    
    if ((useVolumeFilter && useVolumeFilter.checked) || (requireHighVolume && requireHighVolume.checked)) {
        const minRelativeVolume = document.getElementById('min_relative_volume');
        const volumeLookback = document.getElementById('volume_lookback');
        
        if (minRelativeVolume) formData.min_relative_volume = minRelativeVolume.value;
        if (volumeLookback) formData.volume_lookback = volumeLookback.value;
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