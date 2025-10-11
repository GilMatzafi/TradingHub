/**
 * Backtest Trades Module
 * Orchestration layer that coordinates trade data management and UI display
 */

// Import from barrel exports
import {
    setTradesData as setTradesDataCore,
    getTradesData
} from '../core/index.js';

import {
    updateTradesTable as updateTradesTableUI,
    setupTradeTableSorting as setupSortingUI,
    updateDownloadButtonVisibility,
    initDownloadButton
} from '../ui/index.js';

/**
 * Initialize backtest trades module
 */
function initBacktestTrades() {
    initDownloadButton();
}

/**
 * Update the trades table with the provided data
 * (Wrapper for backward compatibility)
 */
function updateTradesTable(trades) {
    updateTradesTableUI(trades);
}

/**
 * Setup sorting functionality for the trade history table
 * (Wrapper for backward compatibility)
 */
function setupTradeTableSorting() {
    setupSortingUI();
}

/**
 * Set trades data and update the complete UI
 */
function setTradesData(trades) {
    // Store data
    setTradesDataCore(trades);
    
    // Update UI
    updateTradesTableUI(getTradesData());
    setupSortingUI();
    updateDownloadButtonVisibility();
}

// Export functions
export { 
    initBacktestTrades, 
    updateTradesTable, 
    setupTradeTableSorting, 
    setTradesData 
};
