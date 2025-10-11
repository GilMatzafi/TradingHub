/**
 * Backtest Module - Unified Entry Point
 * 
 * This is the main entry point for the backtest system.
 * It exports all public APIs and initializes the system.
 * 
 * Architecture:
 * =============
 * - core/      → Business logic (NO DOM, pure logic)
 * - ui/        → User interface (DOM manipulation only)
 * - modules/   → Orchestration (coordinates core + ui)
 */

// Import from barrel exports
import { initBacktestApi } from './modules/index.js';

// Export public API
export { initBacktestApi };

// Re-export core functionality (using barrel exports)
export {
    // Data Layer
    getCurrentStrategy,
    getAvailableStrategies,
    STRATEGIES,
    getStockData,
    hasStockData,
    
    // Metrics Layer
    calculateAllMetrics
} from './core/index.js';

/**
 * Initialize the backtest system
 * Call this once when the page loads
 */
export function init() {
    console.log('[Backtest] Initializing backtest system...');
    initBacktestApi();
    console.log('[Backtest] System initialized successfully');
}

// Auto-initialize if this is the main module
if (typeof window !== 'undefined') {
    // Make init available globally for backward compatibility
    window.initBacktest = init;
}

