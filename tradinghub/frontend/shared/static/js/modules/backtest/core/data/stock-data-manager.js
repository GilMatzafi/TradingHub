/**
 * Stock Data Manager Module
 * Handles stock data storage, retrieval, and fallback generation
 */

import { MOCK_DATA } from '../../config/index.js';

/**
 * Get stock data from current strategy's data manager
 */
function getStockDataFromStrategy() {
    if (!window.currentStrategy?.dataManager) {
        console.log('[StockDataManager] No current strategy available');
        return null;
    }
    
    const filteredData = window.currentStrategy.dataManager.getFilteredData();
    console.log('[StockDataManager] Filtered data length:', filteredData?.length);
    
    if (!filteredData || filteredData.length === 0) {
        console.log('[StockDataManager] No filtered data available from strategy');
        return null;
    }
    
    // Convert the data to the format expected by the chart
    return filteredData.map(row => ({
        date: row.date || row.index,
        open: row.Open,
        high: row.High,
        low: row.Low,
        close: row.Close,
        volume: row.Volume
    }));
}

/**
 * Generate mock stock data as last resort fallback
 */
function generateMockStockData(portfolioHistory) {
    if (!portfolioHistory || portfolioHistory.length === 0) {
        console.warn('[StockDataManager] Cannot generate mock data: no portfolio history');
        return null;
    }
    
    console.log('[StockDataManager] Creating mock stock data as last resort');
    
    const startDate = new Date(portfolioHistory[0].date);
    const endDate = new Date(portfolioHistory[portfolioHistory.length - 1].date);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    const mockStockData = [];
    const priceRange = MOCK_DATA.BASE_PRICE_MAX - MOCK_DATA.BASE_PRICE_MIN;
    
    for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        const basePrice = MOCK_DATA.BASE_PRICE_MIN + Math.random() * priceRange;
        
        mockStockData.push({
            date: date.toISOString().split('T')[0],
            open: basePrice,
            high: basePrice + Math.random() * MOCK_DATA.PRICE_VARIATION,
            low: basePrice - Math.random() * MOCK_DATA.PRICE_VARIATION,
            close: basePrice + (Math.random() - 0.5) * 2,
            volume: Math.floor(Math.random() * MOCK_DATA.VOLUME_MAX)
        });
    }
    
    console.log('[StockDataManager] Mock stock data created:', mockStockData.length, 'records');
    return mockStockData;
}

/**
 * Store stock data with fallback chain
 * Priority: Backend data → Strategy data → Mock data
 */
export function storeStockData(backendStockData, portfolioHistory, positionType = 'long') {
    console.log(`[StockDataManager] ${positionType.toUpperCase()} backtest - storing stock data`);
    
    // Priority 1: Use real stock data from backend
    if (backendStockData && backendStockData.length > 0) {
        window.stockData = backendStockData;
        console.log('[StockDataManager] Real stock data stored from backend:', window.stockData.length, 'records');
        console.log('[StockDataManager] Sample:', window.stockData[0]);
        return window.stockData;
    }
    
    console.log('[StockDataManager] No backend data, trying fallback methods');
    
    // Priority 2: Get data from current strategy
    const strategyData = getStockDataFromStrategy();
    if (strategyData) {
        window.stockData = strategyData;
        console.log('[StockDataManager] Stock data stored from strategy:', window.stockData.length, 'records');
        return window.stockData;
    }
    
    // Priority 3: Generate mock data
    const mockData = generateMockStockData(portfolioHistory);
    if (mockData) {
        window.stockData = mockData;
        console.log('[StockDataManager] Mock stock data stored:', window.stockData.length, 'records');
        return window.stockData;
    }
    
    console.error('[StockDataManager] Failed to store stock data - all fallbacks exhausted');
    return null;
}

/**
 * Get current stock data from window
 */
export function getStockData() {
    return window.stockData || null;
}

/**
 * Check if stock data is available
 */
export function hasStockData() {
    return !!(window.stockData && window.stockData.length > 0);
}

/**
 * Clear stock data
 */
export function clearStockData() {
    window.stockData = null;
    console.log('[StockDataManager] Stock data cleared');
}

