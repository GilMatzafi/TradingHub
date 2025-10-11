/**
 * Candlestick Error Handler
 * Centralized error handling utility - reduces try/catch boilerplate
 */

import { logger } from './candlestick-logger.js';

/**
 * Safely run an async function with automatic error handling
 * @param {string} taskName - Description of the task
 * @param {Function} fn - Async function to execute
 * @param {object} context - Chart context (for lifecycle management)
 * @returns {Promise<{success: boolean, result: any, error: Error|null}>}
 */
export async function safelyRun(taskName, fn, context = null) {
    const startTime = Date.now();
    
    try {
        logger.debug(`Starting: ${taskName}`);
        
        const result = await fn();
        
        const duration = Date.now() - startTime;
        logger.info(`${taskName} succeeded`, { duration: `${duration}ms` });
        logger.performance(taskName, duration);
        
        return {
            success: true,
            result,
            error: null
        };
        
    } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(`${taskName} failed after ${duration}ms`, {
            error: error.message,
            stack: error.stack
        });
        
        // Update lifecycle if context provided
        if (context?.lifecycle) {
            context.lifecycle.setError(`${taskName}: ${error.message}`, error);
        }
        
        return {
            success: false,
            result: null,
            error
        };
    }
}

/**
 * Safely run a synchronous function with automatic error handling
 * @param {string} taskName - Description of the task
 * @param {Function} fn - Function to execute
 * @param {object} context - Chart context (for lifecycle management)
 * @returns {{success: boolean, result: any, error: Error|null}}
 */
export function safelyRunSync(taskName, fn, context = null) {
    const startTime = Date.now();
    
    try {
        logger.debug(`Starting: ${taskName}`);
        
        const result = fn();
        
        const duration = Date.now() - startTime;
        logger.info(`${taskName} succeeded`, { duration: `${duration}ms` });
        
        return {
            success: true,
            result,
            error: null
        };
        
    } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(`${taskName} failed after ${duration}ms`, {
            error: error.message,
            stack: error.stack
        });
        
        // Update lifecycle if context provided
        if (context?.lifecycle) {
            context.lifecycle.setError(`${taskName}: ${error.message}`, error);
        }
        
        return {
            success: false,
            result: null,
            error
        };
    }
}

/**
 * Retry a function with exponential backoff
 * @param {string} taskName - Description of the task
 * @param {Function} fn - Function to retry
 * @param {object} options - Retry options
 * @returns {Promise<any>}
 */
export async function retryWithBackoff(taskName, fn, options = {}) {
    const {
        maxRetries = 3,
        initialDelay = 100,
        maxDelay = 5000,
        backoffFactor = 2,
        shouldRetry = (error) => true
    } = options;
    
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
                logger.debug(`Retry attempt ${attempt}/${maxRetries} for ${taskName} after ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            return await fn();
            
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries) {
                logger.error(`${taskName} failed after ${maxRetries} retries`, error);
                throw error;
            }
            
            if (!shouldRetry(error)) {
                logger.warn(`${taskName} not retryable, stopping`, error);
                throw error;
            }
            
            logger.warn(`${taskName} attempt ${attempt + 1} failed, retrying...`, error);
        }
    }
    
    throw lastError;
}

