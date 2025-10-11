/**
 * Strategy Manager Module
 * Handles strategy detection and availability checking
 */

import { STRATEGIES, DEFAULT_STRATEGY } from '../../config/index.js';

/**
 * Re-export STRATEGIES for backward compatibility
 */
export { STRATEGIES };

/**
 * Get the current active strategy from window
 */
export function getCurrentStrategy() {
    return STRATEGIES
        .map(name => window[`${name}Strategy`])
        .find(Boolean);
}

/**
 * Get all available strategies (for debugging)
 */
export function getAvailableStrategies() {
    return STRATEGIES.reduce((acc, name) => {
        acc[name] = !!window[`${name}Strategy`];
        return acc;
    }, {});
}

/**
 * Check if a specific strategy is available
 */
export function isStrategyAvailable(strategyName) {
    return !!window[`${strategyName}Strategy`];
}

/**
 * Get strategy name from current pattern type
 */
export function getStrategyName() {
    // Try multiple sources
    const patternTypeElement = document.getElementById('pattern_type');
    
    return patternTypeElement?.value
        || window.currentPatternType
        || window.location.pathname.replace('/', '')
        || DEFAULT_STRATEGY;
}

