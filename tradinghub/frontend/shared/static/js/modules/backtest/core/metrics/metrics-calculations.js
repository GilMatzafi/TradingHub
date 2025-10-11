/**
 * Metrics Calculations Module
 * Pure functions for calculating backtest metrics
 * NO DOM ACCESS - only data transformations
 */

import { TRADING_DAYS_PER_YEAR, DEFAULT_PORTFOLIO_SIZE } from '../../config/index.js';

/**
 * Re-export constants for backward compatibility
 */
export { TRADING_DAYS_PER_YEAR };

/**
 * Calculate trade statistics
 */
export function calculateTradeStats(data) {
    const totalTrades = data.num_trades || 0;
    const winningTrades = data.num_winning_trades || 0;
    const losingTrades = data.num_losing_trades || 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    return {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate
    };
}

/**
 * Calculate profit metrics
 */
export function calculateProfitMetrics(data) {
    const totalProfit = data.total_profit || 0;
    const totalProfitPct = data.total_profit_pct || 0;
    const avgProfit = data.avg_profit_pct || 0;
    const avgWinningProfit = data.avg_winning_profit_pct || 0;
    const avgLosingProfit = data.avg_losing_profit_pct || 0;
    
    return {
        totalProfit,
        totalProfitPct,
        avgProfit,
        avgWinningProfit,
        avgLosingProfit
    };
}

/**
 * Calculate risk metrics
 */
export function calculateRiskMetrics(data) {
    const maxDrawdown = data.max_drawdown || 0;
    const sharpeRatio = data.sharpe_ratio || 0;
    const profitFactor = data.profit_factor || 0;
    
    return {
        maxDrawdown,
        sharpeRatio,
        profitFactor
    };
}

/**
 * Calculate portfolio values
 */
export function calculatePortfolioValues(data) {
    const initialValue = data.initial_portfolio_size || DEFAULT_PORTFOLIO_SIZE;
    const finalValue = data.final_portfolio_size || initialValue;
    
    return {
        initialValue,
        finalValue
    };
}

/**
 * Determine profit/loss status
 */
export function getProfitStatus(value) {
    if (value > 0) return 'profit';
    if (value < 0) return 'loss';
    return 'neutral';
}

/**
 * Get CSS classes for profit/loss display
 */
export function getProfitClasses(value) {
    const status = getProfitStatus(value);
    return `metric-value ${status}`;
}

/**
 * Calculate all metrics at once
 */
export function calculateAllMetrics(data) {
    return {
        trade: calculateTradeStats(data),
        profit: calculateProfitMetrics(data),
        risk: calculateRiskMetrics(data),
        portfolio: calculatePortfolioValues(data)
    };
}

