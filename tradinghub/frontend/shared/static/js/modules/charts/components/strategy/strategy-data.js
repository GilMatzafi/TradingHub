/**
 * Strategy Performance Data Module
 * Handles data transformation and analysis for strategy performance charts
 */

import { formatTime } from './chartUtils.js';

/**
 * Generate hour labels (0-23)
 */
export function generateHourLabels() {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(formatTime);
}

/**
 * Prepare chart data from hourly performance
 */
export function prepareChartData(hourlyPerformance) {
    if (!hourlyPerformance) {
        return {
            labels: generateHourLabels(),
            avgProfits: new Array(24).fill(0),
            tradeCounts: new Array(24).fill(0)
        };
    }
    
    return {
        labels: generateHourLabels(),
        avgProfits: hourlyPerformance.hourly_avg_profits || new Array(24).fill(0),
        tradeCounts: hourlyPerformance.hourly_trades || new Array(24).fill(0)
    };
}

/**
 * Find best performing hour
 */
export function findBestHour(avgProfits) {
    const maxProfit = Math.max(...avgProfits);
    const index = avgProfits.indexOf(maxProfit);
    return { index, profit: maxProfit };
}

/**
 * Find worst performing hour
 */
export function findWorstHour(avgProfits) {
    const minProfit = Math.min(...avgProfits);
    const index = avgProfits.indexOf(minProfit);
    return { index, profit: minProfit };
}

/**
 * Find most active trading hour
 */
export function findMostActiveHour(tradeCounts) {
    const maxTrades = Math.max(...tradeCounts);
    const index = tradeCounts.indexOf(maxTrades);
    return { index, tradeCount: maxTrades };
}

/**
 * Calculate average trades per hour (excluding hours with no trades)
 */
export function calculateAvgTradesPerHour(tradeCounts) {
    const activeHours = tradeCounts.filter(x => x > 0);
    if (activeHours.length === 0) {
        return 0;
    }
    
    const totalTrades = tradeCounts.reduce((a, b) => a + b, 0);
    return totalTrades / activeHours.length;
}

/**
 * Get summary statistics
 */
export function getSummaryStats(avgProfits, tradeCounts) {
    return {
        bestHour: findBestHour(avgProfits),
        worstHour: findWorstHour(avgProfits),
        mostActiveHour: findMostActiveHour(tradeCounts),
        avgTradesPerHour: calculateAvgTradesPerHour(tradeCounts)
    };
}

