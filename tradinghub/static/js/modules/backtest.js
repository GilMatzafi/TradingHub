// Import HammerStrategy from hammer-strategy module
import { HammerStrategy } from './hammer-strategy.js';
import { initBacktestCharts } from './backtest/backtest-charts.js';
import { initBacktestTrades } from './backtest/backtest-trades.js';
import { initBacktestMetrics } from './backtest/backtest-metrics.js';
import { initBacktestApi } from './backtest/backtest-api.js';
import { initOptimization } from './backtest/backtest-optimizer.js';

// Backtest functionality
function initBacktest() {
    // Initialize all backtest components
    initBacktestCharts();
    initBacktestTrades();
    initBacktestMetrics();
    initBacktestApi();
    initOptimization();
}

// Export the initialization function
export { initBacktest }; 