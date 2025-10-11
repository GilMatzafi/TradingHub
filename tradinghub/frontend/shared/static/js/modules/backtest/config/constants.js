/**
 * Backtest Configuration Constants
 * Centralized configuration for the entire backtest system
 * 
 * Environment-aware: Can switch between DEV/PROD
 */

// ========================================
// 🌐 API Configuration
// ========================================

/**
 * Base API URL (can be overridden for different environments)
 */
export const API_BASE_URL = window.BACKTEST_API_URL || '';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
    BACKTEST_LONG: '/backtest',
    BACKTEST_SHORT: '/backtest-short'
};

/**
 * HTTP Configuration
 */
export const HTTP_CONFIG = {
    METHOD: 'POST',
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// ========================================
// 📊 Trading Constants
// ========================================

/**
 * Number of trading days per year (used for Sharpe ratio calculation)
 */
export const TRADING_DAYS_PER_YEAR = 252;

/**
 * Default portfolio size (fallback if not provided)
 */
export const DEFAULT_PORTFOLIO_SIZE = 10000;

// ========================================
// 🎲 Mock Data Configuration
// ========================================

/**
 * Mock data generation parameters (used when real data unavailable)
 */
export const MOCK_DATA = {
    BASE_PRICE_MIN: 100,
    BASE_PRICE_MAX: 150,
    PRICE_VARIATION: 5,
    VOLUME_MAX: 1000000,
    DEFAULT_DAYS: 30
};

// ========================================
// 🎯 Strategy Configuration
// ========================================

/**
 * List of all available candlestick pattern strategies
 */
export const STRATEGIES = [
    'hammer',
    'doji',
    'elephantBar',
    'marubozu',
    'shootingStar',
    'engulfing',
    'harami',
    'piercingLine',
    'counter_attack',
    'darkCloudCover',
    'tweezerTop',
    'tweezerBottom',
    'kicker',
    'threeWhiteSoldiers',
    'threeBlackCrows',
    'threeInsideUp',
    'threeInsideDown',
    'morningStar',
    'eveningStar'
];

/**
 * Default strategy (fallback)
 */
export const DEFAULT_STRATEGY = 'hammer';

// ========================================
// 🎨 UI Configuration
// ========================================

/**
 * Loading transition timing (milliseconds)
 */
export const UI_TIMING = {
    LOADING_FADE_IN: 50,
    LOADING_FADE_OUT: 300
};

/**
 * CSS class names for profit/loss states
 */
export const PROFIT_CLASSES = {
    PROFIT: 'profit',
    LOSS: 'loss',
    NEUTRAL: 'neutral'
};

// ========================================
// 🐛 Debug Configuration
// ========================================

/**
 * Enable debug logging
 * Can be set via: window.DEBUG_BACKTEST = true
 */
export const DEBUG = window.DEBUG_BACKTEST || false;

/**
 * Log levels
 */
export const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

/**
 * Current log level (change in production)
 */
export const CURRENT_LOG_LEVEL = DEBUG ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

// ========================================
// 📈 Chart Configuration
// ========================================

/**
 * Chart display limits and defaults
 */
export const CHART_CONFIG = {
    MAX_POINTS_DISPLAY: 500,
    DEFAULT_PERIOD: 'all',
    PERIODS: ['1d', '1w', '1m', '3m', '6m', '1y', 'all']
};

// ========================================
// 🔄 Data Validation
// ========================================

/**
 * Minimum data requirements for valid backtest
 */
export const DATA_VALIDATION = {
    MIN_TRADES: 1,
    MIN_STOCK_DATA_POINTS: 10,
    MIN_PORTFOLIO_HISTORY_POINTS: 2
};

// ========================================
// 💾 Storage Configuration
// ========================================

/**
 * LocalStorage keys (if needed in future)
 */
export const STORAGE_KEYS = {
    LAST_BACKTEST: 'backtest_last_result',
    USER_PREFERENCES: 'backtest_preferences',
    DEBUG_MODE: 'backtest_debug'
};

/**
 * Session storage expiry (milliseconds)
 */
export const STORAGE_EXPIRY = {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes
    LONG: 24 * 60 * 60 * 1000  // 24 hours
};

// ========================================
// 🚀 Export Configuration Helper
// ========================================

/**
 * Get current environment configuration
 */
export function getEnvironmentConfig() {
    return {
        isDevelopment: DEBUG,
        apiBaseUrl: API_BASE_URL,
        logLevel: CURRENT_LOG_LEVEL
    };
}

/**
 * Check if running in debug mode
 */
export function isDebugMode() {
    return DEBUG;
}

