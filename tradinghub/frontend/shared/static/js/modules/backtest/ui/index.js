/**
 * UI Layer - Barrel Export
 * Central export point for all UI modules
 * 
 * ONLY DOM MANIPULATION - No business logic
 */

// Backtest UI
export {
    updateBacktestUI,
    showLoading,
    hideLoading,
    showBacktestResults,
    hideBacktestResults,
    setupUIListeners
} from './backtest-ui.js';

// Metrics UI
export {
    updateTradeStatsUI,
    updateTotalProfitUI,
    updateAvgProfitUI,
    updateRiskMetricsUI,
    updatePortfolioValuesUI,
    updateAllMetricsUI
} from './metrics-ui.js';

// Trades UI
export {
    updateTradesTable,
    setupTradeTableSorting,
    updateDownloadButtonVisibility,
    initDownloadButton
} from './trades-ui.js';

