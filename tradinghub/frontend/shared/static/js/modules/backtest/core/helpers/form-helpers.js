/**
 * Form Helpers Module
 * Centralized DOM access for form inputs
 */

/**
 * Get input value from DOM with optional parser
 * Prevents null errors and provides type safety
 */
export function getInputValue(id, parser = (v) => v) {
    const el = document.getElementById(id);
    if (!el) {
        return null;
    }
    
    return parser(el.value);
}

/**
 * Get checkbox value from DOM
 */
export function getCheckboxValue(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
}

/**
 * Get select value from DOM
 */
export function getSelectValue(id, defaultValue = null) {
    const el = document.getElementById(id);
    return el ? el.value : defaultValue;
}

/**
 * Get range/slider value from DOM
 */
export function getRangeValue(id, parser = parseFloat) {
    return getInputValue(id, parser);
}

/**
 * Check if element exists in DOM
 */
export function elementExists(id) {
    return document.getElementById(id) !== null;
}

