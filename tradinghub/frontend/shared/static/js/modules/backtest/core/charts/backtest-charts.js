/**
 * Backtest Charts Module
 * Lightweight orchestration layer for chart functionality
 * Delegates to specialized modules: chartManager, chartUI, chartState
 */

import { initChartUI, resetChartUI, destroyAllCharts } from '/shared/js/modules/charts/index.js';

/**
 * Initialize backtest charts functionality
 */
function initBacktestCharts() {
    initChartUI();
}

/**
 * Reset charts to initial state
 */
function resetCharts() {
    // Reset UI elements
    resetChartUI();
    
    // Destroy all chart instances
    destroyAllCharts();
}

// Export functions
export { initBacktestCharts, resetCharts };
