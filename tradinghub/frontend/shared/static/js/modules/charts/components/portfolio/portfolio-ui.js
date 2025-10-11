/**
 * Portfolio UI Module
 * Handles DOM structure creation and UI updates for portfolio charts
 */

import { formatCurrency } from './chartUtils.js';

/**
 * Create chart structure (title, controls, canvas, indicator, legend)
 */
export function createChartStructure(containerId, canvasId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('[PortfolioUI] Container not found:', containerId);
        return null;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'chart-title';
    titleDiv.innerHTML = `
        <span>Portfolio Performance</span>
        <i class="bi bi-graph-up"></i>
    `;
    container.appendChild(titleDiv);
    
    // Create controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'chart-controls';
    controlsDiv.innerHTML = `
        <div class="chart-period-selector">
            <button class="chart-period-btn active" data-period="all">All</button>
            <button class="chart-period-btn" data-period="1m">1M</button>
            <button class="chart-period-btn" data-period="1w">1W</button>
            <button class="chart-period-btn" data-period="1d">1D</button>
        </div>
    `;
    container.appendChild(controlsDiv);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = canvasId;
    container.appendChild(canvas);
    
    // Create value indicator
    const valueIndicator = document.createElement('div');
    valueIndicator.className = 'chart-value-indicator';
    container.appendChild(valueIndicator);
    
    // Create legend
    const legendDiv = document.createElement('div');
    legendDiv.className = 'chart-legend';
    legendDiv.innerHTML = `
        <div class="chart-legend-item">
            <div class="chart-legend-color portfolio"></div>
            <span>Portfolio Value</span>
        </div>
    `;
    container.appendChild(legendDiv);
    
    return canvas;
}

/**
 * Update value indicator with current value and percent change
 */
export function updateValueIndicator(finalValue, percentChange) {
    const valueIndicator = document.querySelector('.chart-value-indicator');
    
    if (!valueIndicator) {
        console.warn('[PortfolioUI] Value indicator not found');
        return;
    }
    
    const changeClass = percentChange >= 0 ? 'positive' : 'negative';
    const sign = percentChange >= 0 ? '+' : '';
    
    valueIndicator.innerHTML = `
        <div class="chart-value-label">Current Value</div>
        <div class="chart-value ${changeClass}">
            ${formatCurrency(finalValue)}
            (${sign}${percentChange.toFixed(2)}%)
        </div>
    `;
}

/**
 * Setup period filter buttons with callback
 */
export function setupPeriodButtons(onPeriodChange) {
    const periodButtons = document.querySelectorAll('.chart-period-btn');
    
    periodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            periodButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Call callback with selected period
            const period = button.dataset.period;
            onPeriodChange(period);
        });
    });
}

