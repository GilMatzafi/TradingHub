/**
 * Trades UI Module
 * Handles trade table display, sorting UI, and user interactions
 */

import * as tradesData from './trades-data.js';

// Constants
const SORT_ICONS = {
    default: 'bi-arrow-down-up',
    ascending: 'bi-arrow-up',
    descending: 'bi-arrow-down'
};

const CSS_CLASSES = {
    positive: 'text-success',
    negative: 'text-danger',
    sortable: 'sortable',
    ascending: 'asc',
    descending: 'desc'
};

/**
 * DOM Helper: Get element by ID safely
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Format price to 2 decimal places
 */
function formatPrice(value) {
    return value != null ? value.toFixed(2) : '-';
}

/**
 * Format percentage with color class
 */
function formatPercent(value) {
    if (value == null) return { text: '0.00%', className: '' };
    const className = value >= 0 ? CSS_CLASSES.positive : CSS_CLASSES.negative;
    return {
        text: `${value.toFixed(2)}%`,
        className
    };
}

/**
 * Format currency with color class
 */
function formatCurrency(value) {
    if (value == null) return { text: '$0.00', className: '' };
    const className = value >= 0 ? CSS_CLASSES.positive : CSS_CLASSES.negative;
    return {
        text: `$${value.toFixed(2)}`,
        className
    };
}

/**
 * Create empty row message
 */
function createEmptyRow(message, colspan = 8) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="${colspan}" class="text-center">${message}</td>`;
    return row;
}

/**
 * Create trade row HTML
 */
function createTradeRow(trade) {
    const row = document.createElement('tr');
    
    const profitPct = formatPercent(trade.profit_pct);
    const profitAmount = formatCurrency(trade.profit_amount);
    
    row.innerHTML = `
        <td>${trade.entry_date || '-'}</td>
        <td>${trade.exit_date || '-'}</td>
        <td>${formatPrice(trade.entry_price)}</td>
        <td>${formatPrice(trade.exit_price)}</td>
        <td class="${profitPct.className}">${profitPct.text}</td>
        <td class="${profitAmount.className}">${profitAmount.text}</td>
        <td>${trade.periods_held || 0}</td>
        <td>${trade.exit_reason || '-'}</td>
    `;
    
    return row;
}

/**
 * Update the trades table with the provided data
 */
export function updateTradesTable(trades) {
    const tbody = getElement('tradesTable');
    if (!tbody) {
        console.error('Could not find trades table body element');
        return;
    }
    
    // Clear existing content
    tbody.innerHTML = '';
    
    // Handle invalid data
    if (!trades || !Array.isArray(trades)) {
        tbody.appendChild(createEmptyRow('No trade data available.'));
        return;
    }
    
    // Handle empty trades
    if (trades.length === 0) {
        tbody.appendChild(createEmptyRow('No trades were executed during the backtest period.'));
        return;
    }
    
    // Add trade rows
    trades.forEach(trade => {
        tbody.appendChild(createTradeRow(trade));
    });
}

/**
 * Update sort icon for header
 */
function updateSortIcon(header, title, isAscending) {
    const iconClass = isAscending ? SORT_ICONS.ascending : SORT_ICONS.descending;
    header.innerHTML = `${title} <i class="bi ${iconClass}"></i>`;
    
    // Update CSS classes
    header.classList.remove(CSS_CLASSES.ascending, CSS_CLASSES.descending);
    header.classList.add(isAscending ? CSS_CLASSES.ascending : CSS_CLASSES.descending);
}

/**
 * Setup sortable header with click handler
 */
function setupSortableHeader(header, title, sortKey) {
    if (!header) return;
    
    // Add sortable styling
    header.classList.add(CSS_CLASSES.sortable);
    header.style.cursor = 'pointer';
    header.innerHTML = `${title} <i class="bi ${SORT_ICONS.default}"></i>`;
    
    // Add click event listener
    header.addEventListener('click', function() {
        const isAscending = !header.classList.contains(CSS_CLASSES.ascending);
        updateSortIcon(header, title, isAscending);
        
        // Sort data and update table
        tradesData.sortTrades(sortKey, isAscending);
        updateTradesTable(tradesData.getTradesData());
    });
}

/**
 * Setup sorting functionality for the trade history table
 */
export function setupTradeTableSorting() {
    const table = document.querySelector('.trade-history table');
    if (!table) return;
    
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) return;
    
    // Define sortable columns (column index, title, sort key)
    const sortableColumns = [
        { index: 1, title: 'Entry Date', key: 'entry_date' },
        { index: 5, title: 'Profit %', key: 'profit_pct' },
        { index: 6, title: 'Profit $', key: 'profit_amount' }
    ];
    
    // Setup each sortable column
    sortableColumns.forEach(({ index, title, key }) => {
        const header = headerRow.querySelector(`th:nth-child(${index})`);
        setupSortableHeader(header, title, key);
    });
}

/**
 * Trigger file download in browser
 */
function triggerDownload(blob, filename) {
    const link = document.createElement('a');
    
    // Handle IE 10+
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
        return;
    }
    
    // Standard browsers
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Download trades as CSV file
 */
export function downloadBacktestCSV() {
    const csv = tradesData.convertTradesToCSV();
    
    if (!csv) {
        console.warn('No trade data to export');
        return;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, 'backtest_trades.csv');
}

/**
 * Update download button visibility
 */
export function updateDownloadButtonVisibility() {
    const downloadButton = getElement('downloadBacktestCSV');
    if (downloadButton) {
        downloadButton.style.display = tradesData.hasTradesData() ? 'block' : 'none';
    }
}

/**
 * Initialize download button event listener
 */
export function initDownloadButton() {
    const downloadButton = getElement('downloadBacktestCSV');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadBacktestCSV);
    }
}

