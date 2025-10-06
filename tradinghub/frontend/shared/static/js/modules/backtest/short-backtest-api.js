// Import shared backtest components
import { resetCharts } from './backtest-charts.js';
import { setTradesData } from './backtest-trades.js';
import { updateMetrics, showBacktestResults } from './backtest-metrics.js';

// SHORT position API functionality - Works for ANY pattern (hammer, doji, shooting star, etc.)
function initShortBacktestApi() {
    document.getElementById('runShortBacktest')?.addEventListener('click', function() {
        // Get the current strategy instance (works for any pattern)
        const currentStrategy = window.hammerStrategy || window.dojiStrategy || window.elephantBarStrategy || window.marubozuStrategy || window.shootingStarStrategy || window.engulfingStrategy || window.haramiStrategy || window.piercingLineStrategy || window.counter_attackStrategy || window.darkCloudCoverStrategy || window.tweezerTopStrategy || window.tweezerBottomStrategy || window.kickerStrategy || window.threeWhiteSoldiersStrategy || window.threeBlackCrowsStrategy || window.threeInsideUpStrategy || window.threeInsideDownStrategy || window.morningStarStrategy || window.eveningStarStrategy;
        
        // Debug: Log what strategies are available
        console.log('🔍 Short Backtest API Debug:', {
            hammerStrategy: !!window.hammerStrategy,
            dojiStrategy: !!window.dojiStrategy,
            elephantBarStrategy: !!window.elephantBarStrategy,
            marubozuStrategy: !!window.marubozuStrategy,
            shootingStarStrategy: !!window.shootingStarStrategy,
            engulfingStrategy: !!window.engulfingStrategy,
            haramiStrategy: !!window.haramiStrategy,
            piercingLineStrategy: !!window.piercingLineStrategy,
            counter_attackStrategy: !!window.counter_attackStrategy,
            darkCloudCoverStrategy: !!window.darkCloudCoverStrategy,
            tweezerTopStrategy: !!window.tweezerTopStrategy,
            tweezerBottomStrategy: !!window.tweezerBottomStrategy,
            kickerStrategy: !!window.kickerStrategy,
            threeWhiteSoldiersStrategy: !!window.threeWhiteSoldiersStrategy,
            threeBlackCrowsStrategy: !!window.threeBlackCrowsStrategy,
            threeInsideUpStrategy: !!window.threeInsideUpStrategy,
            threeInsideDownStrategy: !!window.threeInsideDownStrategy,
            morningStarStrategy: !!window.morningStarStrategy,
            eveningStarStrategy: !!window.eveningStarStrategy,
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
                harami: !!window.haramiStrategy,
                piercingLine: !!window.piercingLineStrategy,
                counter_attack: !!window.counter_attackStrategy,
                dark_cloud_cover: !!window.darkCloudCoverStrategy,
                tweezer_top: !!window.tweezerTopStrategy,
                tweezer_bottom: !!window.tweezerBottomStrategy,
                kicker: !!window.kickerStrategy,
                three_white_soldiers: !!window.threeWhiteSoldiersStrategy,
                three_black_crows: !!window.threeBlackCrowsStrategy,
                three_inside_up: !!window.threeInsideUpStrategy,
                three_inside_down: !!window.threeInsideDownStrategy,
                morning_star: !!window.morningStarStrategy,
                evening_star: !!window.eveningStarStrategy
            });
            alert('Strategy not initialized. Please refresh the page and try again.');
            return;
        }
        
        // Get the filtered patterns from the pattern data manager
        const filteredPatterns = currentStrategy.dataManager.getFilteredPatterns();
        console.log('📊 Filtered patterns for SHORT backtest:', filteredPatterns.length);
        
        if (filteredPatterns.length === 0) {
            alert('No patterns found. Please run analysis first.');
            return;
        }
        
        // Collect form data
        const formData = collectShortFormData(filteredPatterns);
        console.log('📋 SHORT Backtest form data:', formData);
        
        // Show loading indicator
        const loading = document.querySelector('.loading');
        loading.style.display = 'block';
        loading.style.opacity = '0';
        setTimeout(() => loading.style.opacity = '1', 50);
        
        // Send SHORT backtest request
        sendShortBacktestRequest(formData, loading);
    });
}

// Collect form data for SHORT backtest - Works for ANY pattern
function collectShortFormData(filteredPatterns) {
    // Base form data (same for all patterns)
    const formData = {
        symbol: document.getElementById('symbol').value.toUpperCase(),
        days: document.getElementById('days').value,
        interval: document.getElementById('interval').value,
        patterns: filteredPatterns,
        
        // SHORT Backtest parameters (same as long backtest but for short positions)
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
        'ma_period', 'require_green', 'require_high_volume', 'piercing_ratio', 'require_trend',
        'close_tolerance', 'counter_attack_type', 'max_shadow_ratio', 'penetration_ratio',
        'high_tolerance', 'low_tolerance', 'gap_size_ratio', 'kicker_type', 'progressive_close',
        'harami_body_ratio', 'confirmation_strength', 'gap_ratio', 'star_body_ratio'
    ];

    patternParams.forEach(param => {
        const element = document.getElementById(param);
        if (element) {
            if (element.type === 'checkbox') {
                formData[param] = element.checked;
            } else if (element.type === 'range') {
                formData[param] = parseFloat(element.value);
            } else {
                formData[param] = element.value;
            }
        }
    });

    // Add pattern type from the current strategy
    const currentStrategy = window.hammerStrategy || window.dojiStrategy || window.elephantBarStrategy || window.marubozuStrategy || window.shootingStarStrategy || window.engulfingStrategy || window.haramiStrategy || window.piercingLineStrategy || window.counter_attackStrategy || window.darkCloudCoverStrategy || window.tweezerTopStrategy || window.tweezerBottomStrategy || window.kickerStrategy || window.threeWhiteSoldiersStrategy || window.threeBlackCrowsStrategy || window.threeInsideUpStrategy || window.threeInsideDownStrategy || window.morningStarStrategy || window.eveningStarStrategy;
    
    if (currentStrategy) {
        formData.pattern_type = currentStrategy.getPatternType();
    }
    
    return formData;
}

// Send SHORT backtest request
function sendShortBacktestRequest(formData, loading) {
    fetch('/backtest-short', {
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
        
        // Process SHORT backtest results
        processShortBacktestResults(data);
    })
    .catch(error => {
        console.error('Short backtest error:', error);
        alert('Error running short backtest: ' + error.message);
    })
    .finally(() => {
        // Hide loading indicator
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 300);
        }
    });
}

// Process SHORT backtest results
function processShortBacktestResults(data) {
    // Show backtest results section
    showBacktestResults();
    
    // Update metrics
    updateMetrics(data);
    
    // Store data for charts
    window.portfolioHistory = data.portfolio_history;
    window.hourlyPerformance = data.hourly_performance;
    window.trades = data.trades;
    
    // Store stock data for candlestick chart
    console.log('Short Backtest API: Storing stock data for candlestick chart');
    
    // Use real stock data from backend if available
    if (data.stock_data && data.stock_data.length > 0) {
        window.stockData = data.stock_data;
        console.log('Real stock data stored from backend:', window.stockData.length, 'records');
        console.log('Sample real stock data:', window.stockData[0]);
    } else {
        console.log('No stock data from backend, trying fallback methods');
        
        // Fallback 1: Try to get data from current strategy
        if (window.currentStrategy && window.currentStrategy.dataManager) {
            const filteredData = window.currentStrategy.dataManager.getFilteredData();
            console.log('Filtered data length:', filteredData?.length);
            
            if (filteredData && filteredData.length > 0) {
                // Convert the data to the format expected by the chart
                window.stockData = filteredData.map(row => ({
                    date: row.date || row.index,
                    open: row.Open,
                    high: row.High,
                    low: row.Low,
                    close: row.Close,
                    volume: row.Volume
                }));
                console.log('Stock data stored from strategy:', window.stockData.length, 'records');
            } else {
                console.log('No filtered data available from strategy');
            }
        } else {
            console.log('No current strategy available');
        }
        
        // Fallback 2: Create mock data if no real data available
        if (!window.stockData && data.portfolio_history && data.portfolio_history.length > 0) {
            console.log('Creating mock stock data as last resort');
            // Create stock data from portfolio history dates
            const startDate = new Date(data.portfolio_history[0].date);
            const endDate = new Date(data.portfolio_history[data.portfolio_history.length - 1].date);
            
            // Generate mock stock data for the date range
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const mockStockData = [];
            
            for (let i = 0; i < daysDiff; i++) {
                const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
                const basePrice = 100 + Math.random() * 50; // Mock price between 100-150
                
                mockStockData.push({
                    date: date.toISOString().split('T')[0],
                    open: basePrice,
                    high: basePrice + Math.random() * 5,
                    low: basePrice - Math.random() * 5,
                    close: basePrice + (Math.random() - 0.5) * 2,
                    volume: Math.floor(Math.random() * 1000000)
                });
            }
            
            window.stockData = mockStockData;
            console.log('Mock stock data created:', window.stockData.length, 'records');
        }
    }
    
    // Reset charts to initial state
    resetCharts();
    
    // Set trades data and update the table
    setTradesData(data.trades);
}

// Export functions
export { 
    initShortBacktestApi
};
