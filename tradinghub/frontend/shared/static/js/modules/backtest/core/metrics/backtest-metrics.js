/**
 * Backtest Metrics Module
 * Orchestrates metric calculations and UI updates
 * Thin coordination layer between data and UI
 */

import { calculateAllMetrics } from './metrics-calculations.js';
import { updateAllMetricsUI } from '../../ui/metrics-ui.js';

/**
 * Update all backtest metrics
 * Main entry point for metric updates
 */
export function updateMetrics(data) {
    console.log('[BacktestMetrics] Updating metrics with data:', data);
    
    if (!data) {
        console.error('[BacktestMetrics] No data provided');
        return;
    }
    
    // Calculate all metrics (pure logic)
    const metrics = calculateAllMetrics(data);
    
    // Update UI (DOM updates)
    updateAllMetricsUI(metrics);
    
    console.log('[BacktestMetrics] Metrics updated successfully');
}

