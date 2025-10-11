/**
 * Core Layer - Main Barrel Export
 * Central export point for all business logic modules
 * 
 * NO DOM ACCESS - Pure business logic only
 */

// Configuration Layer
export * from '../config/index.js';

// Data Layer
export * from './data/index.js';

// Metrics Layer
export * from './metrics/index.js';

// Services Layer
export { sendBacktestRequest } from './services/backtest-service.js';

// Charts Layer
export { resetCharts } from './charts/backtest-charts.js';

// Helpers Layer
export {
    getInputValue,
    getCheckboxValue,
    getSelectValue,
    getRangeValue,
    elementExists
} from './helpers/form-helpers.js';

