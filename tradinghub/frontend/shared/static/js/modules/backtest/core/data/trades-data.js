/**
 * Trades Data Module
 * Handles trade data management, sorting, and CSV export logic
 */

// Module state
let tradesData = [];

// Constants
const CSV_HEADERS = [
    'Entry Date',
    'Exit Date',
    'Entry Price',
    'Exit Price',
    'Profit %',
    'Profit Amount',
    'Commission',
    'Slippage Cost',
    'Periods Held',
    'Exit Reason'
];

/**
 * Format price to 2 decimal places
 */
function formatPrice(value) {
    return value != null ? value.toFixed(2) : '-';
}

/**
 * Get trades data
 */
export function getTradesData() {
    return tradesData;
}

/**
 * Set trades data
 */
export function setTradesData(trades) {
    tradesData = trades || [];
    return tradesData;
}

/**
 * Check if trades data exists
 */
export function hasTradesData() {
    return tradesData && tradesData.length > 0;
}

/**
 * Get trades count
 */
export function getTradesCount() {
    return tradesData.length;
}

/**
 * Generic sort function for trades
 */
export function sortTrades(sortKey, ascending = true) {
    if (!tradesData || tradesData.length === 0) return tradesData;
    
    tradesData.sort((a, b) => {
        let valueA, valueB;
        
        // Handle different data types
        if (sortKey === 'entry_date') {
            valueA = a.entry_date ? new Date(a.entry_date) : new Date(0);
            valueB = b.entry_date ? new Date(b.entry_date) : new Date(0);
        } else {
            valueA = a[sortKey] || 0;
            valueB = b[sortKey] || 0;
        }
        
        // Sort comparison
        if (ascending) {
            return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
            return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
    });
    
    return tradesData;
}

/**
 * Convert single trade to CSV row
 */
function tradeToCSVRow(trade) {
    return [
        trade.entry_date || '',
        trade.exit_date || '',
        formatPrice(trade.entry_price),
        formatPrice(trade.exit_price),
        formatPrice(trade.profit_pct),
        formatPrice(trade.profit_amount),
        formatPrice(trade.commission),
        formatPrice(trade.slippage_cost),
        trade.periods_held || 0,
        trade.exit_reason || ''
    ];
}

/**
 * Convert trades to CSV format
 */
export function convertTradesToCSV() {
    if (!tradesData || tradesData.length === 0) return '';
    
    // Convert trades to CSV rows
    const rows = tradesData.map(tradeToCSVRow);
    
    // Combine headers and rows
    return [CSV_HEADERS, ...rows]
        .map(row => row.join(','))
        .join('\n');
}

/**
 * Get trades filtered by criteria
 */
export function getFilteredTrades(filterFn) {
    return tradesData.filter(filterFn);
}

/**
 * Get winning trades
 */
export function getWinningTrades() {
    return getFilteredTrades(trade => trade.profit_pct > 0);
}

/**
 * Get losing trades
 */
export function getLosingTrades() {
    return getFilteredTrades(trade => trade.profit_pct < 0);
}

/**
 * Clear trades data
 */
export function clearTradesData() {
    tradesData = [];
}

