// Metrics functionality
function initBacktestMetrics() {
    // No initialization needed for now
    // Metrics will be updated when backtest results are received
}

// Calculate maximum drawdown from portfolio history
function calculateMaxDrawdown(portfolioHistory) {
    if (!portfolioHistory || portfolioHistory.length === 0) {
        return 0;
    }
    
    let maxDrawdown = 0;
    let peak = portfolioHistory[0].value;
    
    for (let i = 1; i < portfolioHistory.length; i++) {
        const currentValue = portfolioHistory[i].value;
        
        // Update peak if current value is higher
        if (currentValue > peak) {
            peak = currentValue;
        }
        
        // Calculate drawdown
        const drawdown = (peak - currentValue) / peak;
        
        // Update max drawdown if current drawdown is higher
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }
    
    return maxDrawdown;
}

// Calculate Sharpe ratio from portfolio history
function calculateSharpeRatio(portfolioHistory) {
    if (!portfolioHistory || portfolioHistory.length < 2) {
        return 0;
    }
    
    // Calculate daily returns
    const returns = [];
    for (let i = 1; i < portfolioHistory.length; i++) {
        const dailyReturn = (portfolioHistory[i].value - portfolioHistory[i-1].value) / portfolioHistory[i-1].value;
        returns.push(dailyReturn);
    }
    
    // Calculate average return
    const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    
    // Calculate standard deviation
    const variance = returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate Sharpe ratio (assuming risk-free rate of 0 for simplicity)
    // Annualized Sharpe ratio = (daily Sharpe ratio) * sqrt(252) for daily data
    const dailySharpeRatio = stdDev === 0 ? 0 : avgReturn / stdDev;
    const annualizedSharpeRatio = dailySharpeRatio * Math.sqrt(252);
    
    return annualizedSharpeRatio;
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
    
    // Calculate and display max drawdown
    const maxDrawdown = calculateMaxDrawdown(data.portfolio_history);
    document.getElementById('maxDrawdown').textContent = (maxDrawdown * 100).toFixed(2) + '%';
    
    // Calculate and display Sharpe ratio
    const sharpeRatio = calculateSharpeRatio(data.portfolio_history);
    document.getElementById('sharpeRatio').textContent = sharpeRatio.toFixed(2);
    
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