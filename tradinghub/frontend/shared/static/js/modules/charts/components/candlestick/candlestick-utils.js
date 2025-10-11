/**
 * Candlestick Chart Utilities
 * Generic utility functions for async operations
 */

import { logger } from './candlestick-logger.js';

/**
 * Wait until a condition becomes true
 * Generic utility - can be used for DOM, API, or any async condition
 * 
 * @param {Function} condition - Function that returns boolean or Promise<boolean>
 * @param {object} options - Configuration options
 * @returns {Promise<boolean>} True if condition met, false if timeout
 * 
 * @example
 *   // Wait for element to exist
 *   await waitUntil(
 *       () => document.getElementById('myId') !== null,
 *       { timeout: 5000, interval: 100 }
 *   );
 * 
 * @example
 *   // Wait for API to be ready
 *   await waitUntil(
 *       async () => (await fetch('/health')).ok,
 *       { timeout: 10000, interval: 500 }
 *   );
 */
export async function waitUntil(condition, options = {}) {
    const {
        timeout = 5000,
        interval = 100,
        throwOnTimeout = false,
        timeoutMessage = 'Condition not met within timeout'
    } = options;
    
    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < timeout) {
        attempts++;
        
        try {
            const result = await Promise.resolve(condition());
            
            if (result === true) {
                logger.debug(`waitUntil: Condition met after ${attempts} attempts (${Date.now() - startTime}ms)`);
                return true;
            }
        } catch (error) {
            logger.warn(`waitUntil: Condition check threw error on attempt ${attempts}`, error);
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    logger.warn(`waitUntil: Timeout after ${attempts} attempts (${Date.now() - startTime}ms)`);
    
    if (throwOnTimeout) {
        throw new Error(timeoutMessage);
    }
    
    return false;
}

/**
 * Wait for a value to be available
 * Polls until getter returns non-null value
 * 
 * @param {Function} getter - Function that returns the value to wait for
 * @param {object} options - Configuration options
 * @returns {Promise<any>} The value when available
 * 
 * @example
 *   const canvas = await waitForValue(
 *       () => document.getElementById('canvasId'),
 *       { timeout: 3000 }
 *   );
 */
export async function waitForValue(getter, options = {}) {
    const {
        timeout = 5000,
        interval = 100,
        validator = (value) => value !== null && value !== undefined,
        throwOnTimeout = true
    } = options;
    
    let lastValue = null;
    
    const success = await waitUntil(
        async () => {
            lastValue = await Promise.resolve(getter());
            return validator(lastValue);
        },
        { ...options, throwOnTimeout: false }
    );
    
    if (success) {
        return lastValue;
    }
    
    if (throwOnTimeout) {
        throw new Error('Value not available within timeout');
    }
    
    return null;
}

/**
 * Debounce function execution
 * Useful for resize handlers, scroll events, etc.
 * 
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * 
 * @example
 *   const debouncedResize = debounce(() => chart.resize(), 300);
 *   window.addEventListener('resize', debouncedResize);
 */
export function debounce(fn, delay = 300) {
    let timeoutId;
    
    return function debounced(...args) {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

/**
 * Throttle function execution
 * Ensures function is called at most once per interval
 * 
 * @param {Function} fn - Function to throttle
 * @param {number} interval - Minimum interval in milliseconds
 * @returns {Function} Throttled function
 * 
 * @example
 *   const throttledUpdate = throttle(() => chart.update(), 100);
 *   dataStream.on('data', throttledUpdate);
 */
export function throttle(fn, interval = 100) {
    let lastCall = 0;
    let timeoutId;
    
    return function throttled(...args) {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;
        
        if (timeSinceLastCall >= interval) {
            lastCall = now;
            fn.apply(this, args);
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                fn.apply(this, args);
            }, interval - timeSinceLastCall);
        }
    };
}

/**
 * Measure function execution time
 * Returns result and duration
 * 
 * @param {string} label - Label for measurement
 * @param {Function} fn - Function to measure
 * @returns {Promise<{result: any, duration: number}>}
 * 
 * @example
 *   const { result, duration } = await measureTime('Render', () => chart.render());
 *   console.log(`Render took ${duration}ms`);
 */
export async function measureTime(label, fn) {
    const startTime = Date.now();
    
    try {
        const result = await Promise.resolve(fn());
        const duration = Date.now() - startTime;
        
        logger.performance(label, duration);
        
        return { result, duration };
    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`${label} failed after ${duration}ms`, error);
        throw error;
    }
}

