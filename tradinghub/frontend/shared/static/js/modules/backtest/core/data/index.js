/**
 * Data Layer - Barrel Export
 * Central export point for all data management modules
 */

// Backtest data collection
export { 
    collectFormData,
    PATTERN_PARAMS
} from './backtest-data.js';

// Re-export strategy manager
export { 
    getCurrentStrategy,
    getAvailableStrategies,
    isStrategyAvailable,
    getStrategyName,
    STRATEGIES
} from './strategy-manager.js';

// Re-export stock data manager
export {
    storeStockData,
    getStockData,
    hasStockData,
    clearStockData
} from './stock-data-manager.js';

// Re-export trades data
export {
    setTradesData,
    getTradesData,
    hasTrades,
    convertTradesToCSV,
    downloadBacktestCSV
} from './trades-data.js';

