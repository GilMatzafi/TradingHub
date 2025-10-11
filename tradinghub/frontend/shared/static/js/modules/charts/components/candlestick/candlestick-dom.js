/**
 * Candlestick Chart DOM Helpers
 * Centralized DOM access - reduces direct DOM dependency
 * Makes migration to React/Virtual DOM easier
 */

import { logger } from './candlestick-logger.js';
import { waitUntil } from './candlestick-utils.js';

/**
 * Safely get element by ID
 * Returns null if not found (no throwing)
 */
export function getElementByIdSafe(elementId) {
    try {
        const element = document.getElementById(elementId);
        
        if (!element) {
            logger.warn(`Element not found: ${elementId}`);
            return null;
        }
        
        return element;
    } catch (error) {
        logger.error(`Error accessing element: ${elementId}`, error);
        return null;
    }
}

/**
 * Get canvas element with validation
 */
export function getCanvasElement(canvasId) {
    const canvas = getElementByIdSafe(canvasId);
    
    if (!canvas) {
        logger.error(`Canvas element not found: ${canvasId}`);
        return null;
    }
    
    if (!(canvas instanceof HTMLCanvasElement)) {
        logger.error(`Element is not a canvas: ${canvasId}`, {
            tagName: canvas.tagName,
            type: typeof canvas
        });
        return null;
    }
    
    return canvas;
}

/**
 * Check if element has valid dimensions
 */
export function hasValidDimensions(element) {
    if (!element) {
        return false;
    }
    
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    
    const isValid = width > 0 && height > 0;
    
    if (!isValid) {
        logger.warn('Element has invalid dimensions', {
            width,
            height,
            elementId: element.id
        });
    }
    
    return isValid;
}

/**
 * Get element dimensions safely
 */
export function getElementDimensions(element) {
    if (!element) {
        return { width: 0, height: 0, valid: false };
    }
    
    const width = element.offsetWidth || 0;
    const height = element.offsetHeight || 0;
    const valid = width > 0 && height > 0;
    
    return { width, height, valid };
}

/**
 * Wait for element to be ready (has valid dimensions)
 * Useful for dynamically rendered elements
 * Now uses generic waitUntil utility
 */
export async function waitForElementReady(elementId, maxRetries = 10, retryDelay = 100) {
    logger.debug(`Waiting for element to be ready: ${elementId}`);
    
    const timeout = maxRetries * retryDelay;
    let lastElement = null;
    
    const success = await waitUntil(
        () => {
            lastElement = getElementByIdSafe(elementId);
            return lastElement && hasValidDimensions(lastElement);
        },
        {
            timeout,
            interval: retryDelay,
            throwOnTimeout: false
        }
    );
    
    if (success && lastElement) {
        logger.debug(`Element ready: ${elementId}`, getElementDimensions(lastElement));
        return lastElement;
    }
    
    // Determine specific error
    if (!lastElement) {
        const error = new Error(`Element not found: ${elementId}`);
        logger.error(error.message);
        throw error;
    }
    
    const error = new Error(`Element dimensions invalid: ${elementId}`);
    logger.error(error.message, getElementDimensions(lastElement));
    throw error;
}

/**
 * Clear canvas content (useful for cleanup)
 */
export function clearCanvas(canvas) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        logger.warn('Cannot clear: invalid canvas element');
        return false;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return true;
    } catch (error) {
        logger.error('Error clearing canvas', error);
        return false;
    }
}

