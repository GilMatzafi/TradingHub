/**
 * Candlestick Chart Validation
 * Robust data validation to prevent rendering errors
 */

import { logger } from './candlestick-logger.js';

/**
 * Validation result structure
 */
class ValidationResult {
    constructor(valid, errors = []) {
        this.valid = valid;
        this.errors = errors;
    }

    addError(error) {
        this.errors.push(error);
        this.valid = false;
    }

    getErrorMessage() {
        return this.errors.join('; ');
    }
}

/**
 * Validate stock data structure
 */
export function validateStockData(stockData) {
    const result = new ValidationResult(true);

    // Check if data exists
    if (!stockData) {
        result.addError('Stock data is null or undefined');
        return result;
    }

    // Check if it's an array
    if (!Array.isArray(stockData)) {
        result.addError('Stock data is not an array');
        return result;
    }

    // Check if array is not empty
    if (stockData.length === 0) {
        result.addError('Stock data array is empty');
        return result;
    }

    // Check minimum data points (at least 2 for a meaningful chart)
    if (stockData.length < 2) {
        result.addError(`Insufficient data points: ${stockData.length} (minimum: 2)`);
        return result;
    }

    // Validate first item structure
    const firstItem = stockData[0];
    const requiredFields = ['date', 'open', 'high', 'low', 'close'];
    
    for (const field of requiredFields) {
        if (!(field in firstItem)) {
            result.addError(`Missing required field: ${field}`);
        }
    }

    // Validate data types
    if (typeof firstItem.open !== 'number' || isNaN(firstItem.open)) {
        result.addError('Invalid open price (not a number)');
    }
    if (typeof firstItem.high !== 'number' || isNaN(firstItem.high)) {
        result.addError('Invalid high price (not a number)');
    }
    if (typeof firstItem.low !== 'number' || isNaN(firstItem.low)) {
        result.addError('Invalid low price (not a number)');
    }
    if (typeof firstItem.close !== 'number' || isNaN(firstItem.close)) {
        result.addError('Invalid close price (not a number)');
    }

    // Validate OHLC logic (high >= low, etc.)
    if (firstItem.high < firstItem.low) {
        result.addError('Invalid OHLC: high < low');
    }
    if (firstItem.open < 0 || firstItem.high < 0 || firstItem.low < 0 || firstItem.close < 0) {
        result.addError('Invalid OHLC: negative prices');
    }

    // Log validation result
    if (!result.valid) {
        logger.error('Stock data validation failed', {
            errors: result.errors,
            dataLength: stockData.length,
            sampleData: firstItem
        });
    } else {
        logger.debug('Stock data validation passed', {
            dataPoints: stockData.length
        });
    }

    return result;
}

/**
 * Validate trades data structure
 */
export function validateTrades(trades) {
    const result = new ValidationResult(true);

    // Check if data exists
    if (!trades) {
        result.addError('Trades data is null or undefined');
        return result;
    }

    // Check if it's an array
    if (!Array.isArray(trades)) {
        result.addError('Trades data is not an array');
        return result;
    }

    // Empty trades array is valid (no trades executed)
    if (trades.length === 0) {
        logger.debug('Trades array is empty (no trades)');
        return result;
    }

    // Validate first trade structure
    const firstTrade = trades[0];
    const requiredFields = ['entry_date', 'entry_price', 'exit_type'];
    
    for (const field of requiredFields) {
        if (!(field in firstTrade)) {
            result.addError(`Missing required field in trade: ${field}`);
        }
    }

    // Validate data types
    if (typeof firstTrade.entry_price !== 'number' || isNaN(firstTrade.entry_price)) {
        result.addError('Invalid entry price (not a number)');
    }

    if (firstTrade.entry_price <= 0) {
        result.addError('Invalid entry price (must be positive)');
    }

    // Log validation result
    if (!result.valid) {
        logger.error('Trades validation failed', {
            errors: result.errors,
            tradesCount: trades.length,
            sampleTrade: firstTrade
        });
    } else {
        logger.debug('Trades validation passed', {
            tradesCount: trades.length
        });
    }

    return result;
}

/**
 * Validate complete chart data (stock + trades)
 */
export function validateChartData(stockData, trades) {
    const stockValidation = validateStockData(stockData);
    const tradesValidation = validateTrades(trades);

    const result = new ValidationResult(
        stockValidation.valid && tradesValidation.valid,
        [...stockValidation.errors, ...tradesValidation.errors]
    );

    if (!result.valid) {
        logger.error('Chart data validation failed', {
            stockDataValid: stockValidation.valid,
            tradesValid: tradesValidation.valid,
            errors: result.errors
        });
    } else {
        logger.info('Chart data validation passed', {
            stockDataPoints: stockData?.length || 0,
            tradesCount: trades?.length || 0
        });
    }

    return result;
}

/**
 * Sanitize stock data (remove invalid entries)
 */
export function sanitizeStockData(stockData) {
    if (!stockData || !Array.isArray(stockData)) {
        logger.warn('Cannot sanitize: invalid stock data');
        return [];
    }

    const sanitized = stockData.filter(item => {
        // Must have all required fields
        if (!item.date || !item.open || !item.high || !item.low || !item.close) {
            return false;
        }

        // Must be valid numbers
        if (isNaN(item.open) || isNaN(item.high) || isNaN(item.low) || isNaN(item.close)) {
            return false;
        }

        // Must follow OHLC logic
        if (item.high < item.low) {
            return false;
        }

        // Must be positive
        if (item.open < 0 || item.high < 0 || item.low < 0 || item.close < 0) {
            return false;
        }

        return true;
    });

    const removed = stockData.length - sanitized.length;
    if (removed > 0) {
        logger.warn(`Sanitized stock data: removed ${removed} invalid entries`, {
            original: stockData.length,
            sanitized: sanitized.length
        });
    }

    return sanitized;
}

/**
 * Sanitize trades data (remove invalid entries)
 */
export function sanitizeTrades(trades) {
    if (!trades || !Array.isArray(trades)) {
        logger.warn('Cannot sanitize: invalid trades data');
        return [];
    }

    const sanitized = trades.filter(trade => {
        // Must have required fields
        if (!trade.entry_date || !trade.entry_price) {
            return false;
        }

        // Must be valid numbers
        if (isNaN(trade.entry_price) || trade.entry_price <= 0) {
            return false;
        }

        return true;
    });

    const removed = trades.length - sanitized.length;
    if (removed > 0) {
        logger.warn(`Sanitized trades: removed ${removed} invalid entries`, {
            original: trades.length,
            sanitized: sanitized.length
        });
    }

    return sanitized;
}

