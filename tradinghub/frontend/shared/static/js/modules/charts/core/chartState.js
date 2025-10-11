/**
 * Chart State Module
 * Centralized state management for chart data (replaces window globals)
 */

const chartState = {
    portfolioHistory: [],
    hourlyPerformance: null,
    stockData: [],
    trades: []
};

/**
 * Set chart data (replaces window.portfolioHistory, etc.)
 */
export function setChartData(data) {
    if (data.portfolioHistory) chartState.portfolioHistory = data.portfolioHistory;
    if (data.hourlyPerformance) chartState.hourlyPerformance = data.hourlyPerformance;
    if (data.stockData) chartState.stockData = data.stockData;
    if (data.trades) chartState.trades = data.trades;
}

/**
 * Get all chart data
 */
export function getChartData() {
    return { ...chartState };
}

/**
 * Get specific data
 */
export function getPortfolioHistory() {
    return chartState.portfolioHistory;
}

export function getHourlyPerformance() {
    return chartState.hourlyPerformance;
}

export function getStockData() {
    return chartState.stockData;
}

export function getTrades() {
    return chartState.trades;
}

/**
 * Check if data is available
 */
export function hasPortfolioData() {
    return chartState.portfolioHistory && chartState.portfolioHistory.length > 0;
}

export function hasHourlyData() {
    return chartState.hourlyPerformance && Object.keys(chartState.hourlyPerformance).length > 0;
}

export function hasStockData() {
    return chartState.stockData && chartState.stockData.length > 0 && 
           chartState.trades && chartState.trades.length > 0;
}

/**
 * Clear all chart data
 */
export function clearChartData() {
    chartState.portfolioHistory = [];
    chartState.hourlyPerformance = null;
    chartState.stockData = [];
    chartState.trades = [];
}

