/**
 * Backtest Data Module
 * Handles form data collection for backtest requests
 */

import { getInputValue, getCheckboxValue, elementExists } from '../helpers/form-helpers.js';
import { getStrategyName } from './strategy-manager.js';

/**
 * Pattern-specific parameter names
 */
const PATTERN_PARAMS = [
    'body_size_ratio', 'lower_shadow_ratio', 'upper_shadow_ratio',
    'ma_period', 'require_green', 'require_high_volume', 'piercing_ratio',
    'require_trend', 'close_tolerance', 'counter_attack_type',
    'max_shadow_ratio', 'penetration_ratio', 'high_tolerance',
    'low_tolerance', 'gap_size_ratio', 'kicker_type',
    'progressive_close', 'harami_body_ratio', 'confirmation_strength',
    'gap_ratio', 'star_body_ratio'
];

/**
 * Get base backtest parameters
 */
function getBaseParameters(filteredPatterns) {
    return {
        symbol: getInputValue('symbol', v => v.toUpperCase()),
        days: getInputValue('days'),
        interval: getInputValue('interval'),
        pattern_type: getStrategyName(),
        patterns: filteredPatterns,
        position_type: getInputValue('position_type') || 'long',
        stop_loss_pct: getInputValue('stop_loss_pct', v => v / 100),
        take_profit_pct: getInputValue('take_profit_pct', v => v / 100),
        entry_delay: getInputValue('entry_delay'),
        max_holding_periods: getInputValue('max_holding_periods'),
        initial_portfolio_size: getInputValue('initial_portfolio_size', parseFloat),
        commission: getInputValue('commission', parseFloat),
        slippage: getInputValue('slippage', parseFloat)
    };
}

/**
 * Get pattern-specific parameters (only if they exist in DOM)
 */
function getPatternParameters() {
    const params = {};
    
    PATTERN_PARAMS.forEach(param => {
        if (!elementExists(param)) {
            return;
        }
        
        const element = document.getElementById(param);
        
        if (element.type === 'checkbox') {
            params[param] = getCheckboxValue(param);
        } else if (element.type === 'range') {
            params[param] = getInputValue(param, parseFloat);
        } else {
            params[param] = getInputValue(param);
        }
    });
    
    return params;
}

/**
 * Get volume filter parameters (if enabled)
 */
function getVolumeParameters() {
    const useVolumeFilter = getCheckboxValue('use_volume_filter');
    const requireHighVolume = getCheckboxValue('require_high_volume');
    
    if (!useVolumeFilter && !requireHighVolume) {
        return {};
    }
    
    const params = {};
    
    const minRelativeVolume = getInputValue('min_relative_volume');
    const volumeLookback = getInputValue('volume_lookback');
    
    if (minRelativeVolume) {
        params.min_relative_volume = minRelativeVolume;
    }
    
    if (volumeLookback) {
        params.volume_lookback = volumeLookback;
    }
    
    return params;
}

/**
 * Collect form data for the backtest request - Works for ANY pattern
 */
export function collectFormData(filteredPatterns) {
    // Collect all parameters
    return {
        ...getBaseParameters(filteredPatterns),
        ...getPatternParameters(),
        ...getVolumeParameters()
    };
}

