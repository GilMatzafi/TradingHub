/**
 * Modules Layer - Barrel Export
 * Central export point for all orchestration modules
 */

// Main API orchestrator
export {
    initBacktestApi,
    runBacktest,
    saveBacktestData,
    processBacktestResults
} from './backtest-api.js';

// Trades orchestrator
export {
    initBacktestTrades,
    updateTradesTable,
    setupTradeTableSorting,
    setTradesData
} from './backtest-trades.js';

