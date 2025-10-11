/**
 * Portfolio Data Module
 * Handles data transformation and filtering for portfolio charts
 */

/**
 * Format date for chart labels
 */
function formatDateLabel(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });
}

/**
 * Prepare chart data from portfolio history
 */
export function prepareChartData(portfolioHistory) {
    if (!portfolioHistory || portfolioHistory.length === 0) {
        return { labels: [], values: [] };
    }
    
    const labels = portfolioHistory.map(item => formatDateLabel(item.date));
    const values = portfolioHistory.map(item => item.value);
    
    return { labels, values };
}

/**
 * Calculate percent change between initial and final values
 */
export function calculatePercentChange(portfolioHistory) {
    if (!portfolioHistory || portfolioHistory.length < 2) {
        return 0;
    }
    
    const initialValue = portfolioHistory[0].value;
    const finalValue = portfolioHistory[portfolioHistory.length - 1].value;
    
    return ((finalValue - initialValue) / initialValue) * 100;
}

/**
 * Get final value from portfolio history
 */
export function getFinalValue(portfolioHistory) {
    if (!portfolioHistory || portfolioHistory.length === 0) {
        return 0;
    }
    
    return portfolioHistory[portfolioHistory.length - 1].value;
}

/**
 * Filter portfolio history by time period
 */
export function filterDataByPeriod(portfolioHistory, period) {
    if (!portfolioHistory || portfolioHistory.length === 0) {
        return [];
    }
    
    if (period === 'all') {
        return portfolioHistory;
    }
    
    const now = new Date(portfolioHistory[portfolioHistory.length - 1].date);
    const cutoff = new Date(now);
    
    switch (period) {
        case '1m':
            cutoff.setMonth(now.getMonth() - 1);
            break;
        case '1w':
            cutoff.setDate(now.getDate() - 7);
            break;
        case '1d':
            cutoff.setDate(now.getDate() - 1);
            break;
        default:
            return portfolioHistory;
    }
    
    return portfolioHistory.filter(item => new Date(item.date) >= cutoff);
}

