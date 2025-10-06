// Import backtest components
import { initBacktestCharts } from './backtest/backtest-charts.js';
import { initBacktestTrades } from './backtest/backtest-trades.js';
import { initBacktestMetrics } from './backtest/backtest-metrics.js';
import { initBacktestApi } from './backtest/backtest-api.js';
import { initShortBacktestApi } from './backtest/short-backtest-api.js';

// Backtest functionality
function initBacktest() {
    // Initialize all backtest components
    initBacktestCharts();
    initBacktestTrades();
    initBacktestMetrics();
    initBacktestApi();
    initShortBacktestApi();
}

// Export the initialization function
export { initBacktest }; 