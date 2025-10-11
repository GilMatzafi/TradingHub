/**
 * Chart Manager Module
 * Responsible for creating, storing, and destroying chart instances
 */

import { PortfolioChart } from '../components/portfolio/portfolioChart.js';
import { StrategyPerformanceChart } from '../components/strategy/strategyPerformanceChart.js';
import { BacktestCandlestickChart } from '../components/candlestick/backtestCandlestickChart.js';

// Chart instances
let portfolioChart = null;
let strategyChart = null;
let backtestCandlestickChart = null;

// Debug mode flag
const DEBUG = true; // Set to false in production

function log(...args) {
    if (DEBUG) console.log('[ChartManager]', ...args);
}

/**
 * Portfolio Chart
 */
export function initPortfolioChart(portfolioHistory) {
    if (!portfolioHistory || portfolioHistory.length === 0) {
        log('No portfolio history data available');
        return false;
    }
    
    if (!portfolioChart) {
        portfolioChart = new PortfolioChart();
    }
    portfolioChart.initialize(portfolioHistory);
    log('Portfolio chart initialized');
    return true;
}

export function destroyPortfolioChart() {
    if (portfolioChart) {
        portfolioChart.destroy();
        portfolioChart = null;
        log('Portfolio chart destroyed');
    }
}

/**
 * Strategy Performance Chart
 */
export function initStrategyChart(hourlyPerformance) {
    if (!hourlyPerformance) {
        log('No hourly performance data available');
        return false;
    }
    
    if (!strategyChart) {
        strategyChart = new StrategyPerformanceChart();
    }
    strategyChart.initialize(hourlyPerformance);
    log('Strategy chart initialized');
    return true;
}

export function destroyStrategyChart() {
    if (strategyChart) {
        strategyChart.destroy();
        strategyChart = null;
        log('Strategy chart destroyed');
    }
}

/**
 * Backtest Candlestick Chart
 */
export function initCandlestickChart(stockData, trades) {
    if (!stockData || stockData.length === 0 || !trades || trades.length === 0) {
        log('No stock data or trades available');
        return false;
    }
    
    if (!backtestCandlestickChart) {
        backtestCandlestickChart = new BacktestCandlestickChart(
            'backtestCandlestickModal',
            'backtestCandlestickChart'
        );
    }
    backtestCandlestickChart.initialize(stockData, trades);
    log('Candlestick chart initialized');
    return true;
}

export function destroyCandlestickChart() {
    if (backtestCandlestickChart) {
        backtestCandlestickChart.destroy();
        backtestCandlestickChart = null;
        log('Candlestick chart destroyed');
    }
}

/**
 * Get chart instance (for special operations like reset zoom)
 */
export function getCandlestickChartInstance() {
    return backtestCandlestickChart;
}

/**
 * Reset zoom on candlestick chart
 */
export function resetCandlestickZoom() {
    if (!backtestCandlestickChart?.chart) {
        log('No candlestick chart instance available');
        return;
    }
    
    // Check if it's a Lightweight Charts instance
    if (backtestCandlestickChart.chart.timeScale) {
        // Lightweight Charts - fit content to reset zoom
        backtestCandlestickChart.chart.timeScale().fitContent();
        log('Reset zoom (Lightweight Charts)');
    } else if (backtestCandlestickChart.chart.resetZoom) {
        // Chart.js - reset zoom
        backtestCandlestickChart.chart.resetZoom();
        log('Reset zoom (Chart.js)');
    }
}

/**
 * Destroy all charts
 */
export function destroyAllCharts() {
    destroyPortfolioChart();
    destroyStrategyChart();
    destroyCandlestickChart();
    log('All charts destroyed');
}

