/**
 * Backtest API Module
 * Lightweight orchestration layer that coordinates all backtest functionality
 */

// Import from barrel exports
import { setTradesData } from './backtest-trades.js';
import { 
    resetCharts,
    updateMetrics,
    getCurrentStrategy,
    getAvailableStrategies,
    collectFormData,
    storeStockData,
    sendBacktestRequest
} from '../core/index.js';
import {
    setupUIListeners,
    updateBacktestUI,
    showLoading,
    hideLoading,
    showBacktestResults
} from '../ui/index.js';
import { setChartData } from '/shared/js/modules/charts/index.js';

/**
 * Initialize backtest API functionality
 */
function initBacktestApi() {
    // Setup UI event listeners
    setupUIListeners(runBacktest);
    
    // Initialize UI with default position type
    updateBacktestUI('long');
}

/**
 * Main backtest orchestration function (Async)
 */
async function runBacktest(positionType) {
    // Get the current strategy instance
    const currentStrategy = getCurrentStrategy();
    
    // Debug: Log available strategies
    const availableStrategies = getAvailableStrategies();
    console.log(`🔍 ${positionType.toUpperCase()} Backtest Debug:`, {
        ...availableStrategies,
        currentStrategy: !!currentStrategy
    });
    
    // Validate strategy exists
    if (!currentStrategy) {
        console.error('Strategy not initialized');
        console.error('Available strategies:', availableStrategies);
        alert('Error: Strategy not initialized');
        return;
    }
    
    // Get filtered patterns
    const filteredPatterns = currentStrategy.dataManager.getFilteredPatterns();
    console.log(`📊 Filtered patterns for ${positionType.toUpperCase()} backtest:`, filteredPatterns.length);
    
    if (filteredPatterns.length === 0) {
        alert('No patterns found. Please run analysis first.');
        return;
    }
    
    // Show loading indicator
    const loading = showLoading();
    
    try {
        // Collect form data
        const formData = collectFormData(filteredPatterns);
        
        // Send request to backend (await the response)
        const data = await sendBacktestRequest(formData, positionType);
        
        // Process successful response
        processBacktestResults(data, positionType);
        
    } catch (error) {
        // Handle error
        console.error(`❌ ${positionType.toUpperCase()} backtest error:`, error);
        alert(`Error running ${positionType} backtest: ` + error.message);
        
    } finally {
        // Always hide loading indicator
        hideLoading(loading);
    }
}

/**
 * Save backtest data to both window and chartState
 */
function saveBacktestData(data, positionType) {
    // Store stock data with fallback chain (sets window.stockData)
    storeStockData(data.stock_data, data.portfolio_history, positionType);
    
    // Store data in window (backward compatibility)
    window.portfolioHistory = data.portfolio_history;
    window.hourlyPerformance = data.hourly_performance;
    window.trades = data.trades;
    // window.stockData already set by storeStockData()
    
    // Also store in centralized chartState (new system)
    setChartData({
        portfolioHistory: data.portfolio_history,
        hourlyPerformance: data.hourly_performance,
        stockData: window.stockData,
        trades: data.trades
    });
}

/**
 * Process and display backtest results
 */
function processBacktestResults(data, positionType = 'long') {
    // Show backtest results section
    showBacktestResults();
    
    // Update metrics
    updateMetrics(data);
    
    // Save data to storage
    saveBacktestData(data, positionType);
    
    // Reset charts to initial state
    resetCharts();
    
    // Set trades data and update the table
    setTradesData(data.trades);
}

// Export main initialization function
export { 
    initBacktestApi
};
