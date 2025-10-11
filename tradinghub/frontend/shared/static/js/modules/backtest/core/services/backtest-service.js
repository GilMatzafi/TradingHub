/**
 * Backtest Service Module
 * Handles all API communication with the backend
 */

import { API_ENDPOINTS, API_BASE_URL, HTTP_CONFIG } from '../../config/index.js';

/**
 * Send backtest request to the server (Returns Promise)
 */
export async function sendBacktestRequest(formData, positionType = 'long') {
    const endpoint = positionType === 'short' 
        ? API_ENDPOINTS.BACKTEST_SHORT 
        : API_ENDPOINTS.BACKTEST_LONG;
    
    const url = API_BASE_URL + endpoint;
    
    console.log(`📋 ${positionType.toUpperCase()} Backtest form data:`, formData);
    
    const response = await fetch(url, {
        method: HTTP_CONFIG.METHOD,
        headers: HTTP_CONFIG.HEADERS,
        body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error);
    }
    
    console.log(`✅ ${positionType.toUpperCase()} Backtest response:`, data);
    return data;
}

