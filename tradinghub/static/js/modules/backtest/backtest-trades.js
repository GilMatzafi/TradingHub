// Store trades data for sorting
let tradesData = [];

// Trade history table functionality
function initBacktestTrades() {
    // Initialize download CSV button
    const downloadCSVButton = document.getElementById('downloadBacktestCSV');
    if (downloadCSVButton) {
        downloadCSVButton.addEventListener('click', downloadBacktestCSV);
    }
}

// Convert trades to CSV format
function convertTradesToCSV() {
    if (!tradesData || tradesData.length === 0) return '';
    
    // CSV header
    const headers = [
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
    
    // Convert trades to CSV rows
    const rows = tradesData.map(trade => [
        trade.entry_date,
        trade.exit_date,
        trade.entry_price.toFixed(2),
        trade.exit_price.toFixed(2),
        trade.profit_pct.toFixed(2),
        trade.profit_amount.toFixed(2),
        trade.commission.toFixed(2),
        trade.slippage_cost.toFixed(2),
        trade.periods_held,
        trade.exit_reason
    ]);
    
    // Combine headers and rows
    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}

// Download trades as CSV file
function downloadBacktestCSV() {
    // Create CSV content
    const csv = convertTradesToCSV();
    
    // Create blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create download URL
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, 'backtest_trades.csv');
    } else {
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'backtest_trades.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Update the trades table with the provided data
function updateTradesTable(trades) {
    const tbody = document.getElementById('tradesTable');
    if (!tbody) {
        console.error('Could not find trades table body element');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!trades || !Array.isArray(trades)) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="text-center">No trade data available.</td>';
        tbody.appendChild(row);
        return;
    }
    
    if (trades.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="text-center">No trades were executed during the backtest period.</td>';
        tbody.appendChild(row);
        return;
    }
    
    trades.forEach(trade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trade.entry_date || '-'}</td>
            <td>${trade.exit_date || '-'}</td>
            <td>${trade.entry_price ? trade.entry_price.toFixed(2) : '-'}</td>
            <td>${trade.exit_price ? trade.exit_price.toFixed(2) : '-'}</td>
            <td class="${trade.profit_pct >= 0 ? 'text-success' : 'text-danger'}">${trade.profit_pct ? trade.profit_pct.toFixed(2) : '0.00'}%</td>
            <td class="${trade.profit_amount >= 0 ? 'text-success' : 'text-danger'}">$${trade.profit_amount ? trade.profit_amount.toFixed(2) : '0.00'}</td>
            <td>${trade.periods_held || 0}</td>
            <td>${trade.exit_reason || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Setup sorting functionality for the trade history table
function setupTradeTableSorting() {
    const table = document.querySelector('.trade-history table');
    if (!table) return;
    
    const headerRow = table.querySelector('thead tr');
    if (!headerRow) return;
    
    // Get the sortable column headers
    const entryDateHeader = headerRow.querySelector('th:nth-child(1)');
    const profitPercentHeader = headerRow.querySelector('th:nth-child(5)');
    const profitDollarHeader = headerRow.querySelector('th:nth-child(6)');
    
    // Setup Entry Date column sorting
    if (entryDateHeader) {
        setupSortableHeader(entryDateHeader, 'Entry Date', sortTradesByEntryDate);
    }
    
    // Setup Profit % column sorting
    if (profitPercentHeader) {
        setupSortableHeader(profitPercentHeader, 'Profit %', sortTradesByProfitPercent);
    }
    
    // Setup Profit $ column sorting
    if (profitDollarHeader) {
        setupSortableHeader(profitDollarHeader, 'Profit $', sortTradesByProfitDollar);
    }
}

// Helper function to setup a sortable header
function setupSortableHeader(header, title, sortFunction) {
    // Add sortable class and cursor pointer to indicate it's clickable
    header.classList.add('sortable');
    header.style.cursor = 'pointer';
    
    // Add sort icon
    header.innerHTML = `${title} <i class="bi bi-arrow-down-up"></i>`;
    
    // Add click event listener
    header.addEventListener('click', function() {
        // Toggle sort direction
        const isAscending = !header.classList.contains('asc');
        
        // Update sort icon and class
        header.classList.remove('asc', 'desc');
        header.classList.add(isAscending ? 'asc' : 'desc');
        header.innerHTML = `${title} <i class="bi bi-arrow-${isAscending ? 'up' : 'down'}"></i>`;
        
        // Sort trades
        sortFunction(isAscending);
    });
}

// Sort trades by entry date
function sortTradesByEntryDate(ascending = true) {
    if (!tradesData || tradesData.length === 0) return;
    
    // Sort the trades array
    tradesData.sort((a, b) => {
        const dateA = a.entry_date ? new Date(a.entry_date) : new Date(0);
        const dateB = b.entry_date ? new Date(b.entry_date) : new Date(0);
        
        return ascending ? dateA - dateB : dateB - dateA;
    });
    
    // Update the table with sorted data
    updateTradesTable(tradesData);
}

// Sort trades by profit percentage
function sortTradesByProfitPercent(ascending = true) {
    if (!tradesData || tradesData.length === 0) return;
    
    // Sort the trades array
    tradesData.sort((a, b) => {
        const profitA = a.profit_pct || 0;
        const profitB = b.profit_pct || 0;
        
        return ascending ? profitA - profitB : profitB - profitA;
    });
    
    // Update the table with sorted data
    updateTradesTable(tradesData);
}

// Sort trades by profit dollar amount
function sortTradesByProfitDollar(ascending = true) {
    if (!tradesData || tradesData.length === 0) return;
    
    // Sort the trades array
    tradesData.sort((a, b) => {
        const profitA = a.profit_amount || 0;
        const profitB = b.profit_amount || 0;
        
        return ascending ? profitA - profitB : profitB - profitA;
    });
    
    // Update the table with sorted data
    updateTradesTable(tradesData);
}

// Set trades data and update the table
function setTradesData(trades) {
    tradesData = trades || [];
    updateTradesTable(tradesData);
    setupTradeTableSorting();
    
    // Show/hide download button based on whether there are trades
    const downloadCSVButton = document.getElementById('downloadBacktestCSV');
    if (downloadCSVButton) {
        downloadCSVButton.style.display = tradesData.length > 0 ? 'block' : 'none';
    }
}

// Export functions
export { 
    initBacktestTrades, 
    updateTradesTable, 
    setupTradeTableSorting, 
    setTradesData 
}; 