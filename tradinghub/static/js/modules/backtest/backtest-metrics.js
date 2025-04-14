// Metrics functionality
function initBacktestMetrics() {
    // No initialization needed for now
    // Metrics will be updated when backtest results are received
}

// Update metrics display with the provided data
function updateMetrics(data) {
    document.getElementById('totalTrades').textContent = data.total_trades || 0;
    document.getElementById('winningTrades').textContent = data.winning_trades || 0;
    document.getElementById('losingTrades').textContent = data.losing_trades || 0;
    document.getElementById('winRate').textContent = data.win_rate ? (data.win_rate * 100).toFixed(2) + '%' : '0%';
    document.getElementById('profitFactor').textContent = data.profit_factor ? data.profit_factor.toFixed(2) : '0.00';
    document.getElementById('averageProfit').textContent = data.average_profit ? (data.average_profit * 100).toFixed(2) + '%' : '0%';
    
    const totalProfitElement = document.getElementById('totalProfit');
    const totalProfitValue = data.total_profit_pct ? data.total_profit_pct.toFixed(2) : '0.00';
    totalProfitElement.textContent = totalProfitValue + '%';
    totalProfitElement.classList.remove('positive', 'negative');
    totalProfitElement.classList.add(parseFloat(totalProfitValue) >= 0 ? 'positive' : 'negative');
    
    // Update portfolio values
    if (data.initial_portfolio_value) {
        document.getElementById('initialPortfolioValue').textContent = 
            `$${data.initial_portfolio_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    if (data.final_portfolio_value) {
        document.getElementById('finalPortfolioValue').textContent = 
            `$${data.final_portfolio_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    if (data.total_commission) {
        document.getElementById('totalCommission').textContent = 
            `$${data.total_commission.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    if (data.total_slippage) {
        document.getElementById('totalSlippage').textContent = 
            `$${data.total_slippage.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
}

// Show the backtest results section
function showBacktestResults() {
    document.getElementById('backtestResults').classList.remove('d-none');
}

// Export functions
export { 
    initBacktestMetrics, 
    updateMetrics,
    showBacktestResults
}; 