/**
 * Metrics UI Module
 * Handles DOM updates for backtest metrics
 * Pure UI logic - no calculations
 */

import { formatCurrency, formatPercent, formatNumber } from '../../../charts/index.js';
import { getProfitClasses } from '../core/metrics/metrics-calculations.js';

/**
 * DOM element IDs
 */
const METRIC_IDS = {
    totalTrades: 'totalTrades',
    winningTrades: 'winningTrades',
    losingTrades: 'losingTrades',
    winRate: 'winRate',
    totalProfit: 'totalProfit',
    totalProfitPct: 'totalProfitPct',
    avgProfit: 'avgProfit',
    avgWinningProfit: 'avgWinningProfit',
    avgLosingProfit: 'avgLosingProfit',
    maxDrawdown: 'maxDrawdown',
    sharpeRatio: 'sharpeRatio',
    profitFactor: 'profitFactor',
    initialValue: 'initialValue',
    finalValue: 'finalValue'
};

/**
 * Set element text content
 */
function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Set element CSS classes
 */
function setClasses(id, classes) {
    const element = document.getElementById(id);
    if (element) {
        element.className = classes;
    }
}

/**
 * Update trade statistics in DOM
 */
export function updateTradeStatsUI(stats) {
    setText(METRIC_IDS.totalTrades, stats.totalTrades);
    setText(METRIC_IDS.winningTrades, stats.winningTrades);
    setText(METRIC_IDS.losingTrades, stats.losingTrades);
    setText(METRIC_IDS.winRate, formatPercent(stats.winRate / 100));
}

/**
 * Update total profit display with styling
 */
export function updateTotalProfitUI(profit) {
    setText(METRIC_IDS.totalProfit, formatCurrency(profit.totalProfit));
    setClasses(METRIC_IDS.totalProfit, getProfitClasses(profit.totalProfit));
    
    setText(METRIC_IDS.totalProfitPct, formatPercent(profit.totalProfitPct));
    setClasses(METRIC_IDS.totalProfitPct, getProfitClasses(profit.totalProfitPct));
}

/**
 * Update average profit metrics
 */
export function updateAvgProfitUI(profit) {
    setText(METRIC_IDS.avgProfit, formatPercent(profit.avgProfit));
    setClasses(METRIC_IDS.avgProfit, getProfitClasses(profit.avgProfit));
    
    setText(METRIC_IDS.avgWinningProfit, formatPercent(profit.avgWinningProfit));
    setText(METRIC_IDS.avgLosingProfit, formatPercent(profit.avgLosingProfit));
}

/**
 * Update risk metrics in DOM
 */
export function updateRiskMetricsUI(risk) {
    setText(METRIC_IDS.maxDrawdown, formatPercent(risk.maxDrawdown));
    setText(METRIC_IDS.sharpeRatio, formatNumber(risk.sharpeRatio));
    setText(METRIC_IDS.profitFactor, formatNumber(risk.profitFactor));
}

/**
 * Update portfolio values in DOM
 */
export function updatePortfolioValuesUI(portfolio) {
    setText(METRIC_IDS.initialValue, formatCurrency(portfolio.initialValue));
    setText(METRIC_IDS.finalValue, formatCurrency(portfolio.finalValue));
    setClasses(METRIC_IDS.finalValue, getProfitClasses(portfolio.finalValue - portfolio.initialValue));
}

/**
 * Update all metrics in DOM at once
 */
export function updateAllMetricsUI(metrics) {
    updateTradeStatsUI(metrics.trade);
    updateTotalProfitUI(metrics.profit);
    updateAvgProfitUI(metrics.profit);
    updateRiskMetricsUI(metrics.risk);
    updatePortfolioValuesUI(metrics.portfolio);
}

