/**
 * Candlestick Chart Component - Barrel Export
 * Exports all candlestick chart functionality
 * 
 * Modular architecture (v2.0):
 * - backtestCandlestickChart.js   → Main chart class (orchestrator)
 * - candlestick-logger.js         → Hierarchical logging system
 * - candlestick-dom.js            → DOM helpers (zero direct access)
 * - candlestick-validation.js     → Data validation & sanitization
 * - candlestick-lifecycle.js      → State machine + event hooks
 * - candlestick-error-handler.js  → Centralized error handling
 * - candlestick-utils.js          → Generic async utilities
 * - candlestick-data.js           → Data transformation
 * - candlestick-lightweight.js    → Rendering logic
 */

// Main chart class
export { BacktestCandlestickChart } from './backtestCandlestickChart.js';

// Core utilities
export { logger, LOG_LEVELS } from './candlestick-logger.js';
export { LifecycleManager, ChartState } from './candlestick-lifecycle.js';
export { safelyRun, safelyRunSync, retryWithBackoff } from './candlestick-error-handler.js';
export { waitUntil, waitForValue, debounce, throttle, measureTime } from './candlestick-utils.js';

// DOM helpers
export * from './candlestick-dom.js';

// Validation
export * from './candlestick-validation.js';

// Data & rendering
export * from './candlestick-data.js';
export * from './candlestick-lightweight.js';

