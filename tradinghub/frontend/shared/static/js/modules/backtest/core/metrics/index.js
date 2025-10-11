/**
 * Metrics Layer - Barrel Export
 * Central export point for all metrics calculation modules
 */

// Metrics calculations (pure functions)
export {
    TRADING_DAYS_PER_YEAR,
    calculateTradeStats,
    calculateProfitMetrics,
    calculateRiskMetrics,
    calculatePortfolioValues,
    getProfitStatus,
    getProfitClasses,
    calculateAllMetrics
} from './metrics-calculations.js';

// Metrics orchestrator
export {
    updateMetrics
} from './backtest-metrics.js';

