/**
 * Chart UI Module
 * Handles all UI interactions: buttons, modals, show/hide logic
 */

import * as chartManager from '../core/chartManager.js';
import * as chartState from '../core/chartState.js';

/**
 * Helper: Update button text safely
 */
function setButtonText(buttonId, html) {
    const button = document.getElementById(buttonId);
    if (button) button.innerHTML = html;
}

/**
 * Helper: Toggle container visibility
 */
function toggleContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return false;
    return container.classList.toggle('d-none');
}

/**
 * Generic chart toggle handler
 * Reduces code duplication by 70%
 */
function setupChartToggle(config) {
    const { buttonId, containerId, initFn, destroyFn, showLabel, hideLabel } = config;
    
    const button = document.getElementById(buttonId);
    if (!button) return;
    
    button.addEventListener('click', () => {
        const isHidden = toggleContainer(containerId);
        setButtonText(buttonId, isHidden ? showLabel : hideLabel);
        
        if (!isHidden) {
            initFn();
        } else {
            destroyFn();
        }
    });
}

/**
 * Setup Portfolio Chart Toggle
 */
export function setupPortfolioChartToggle() {
    setupChartToggle({
        buttonId: 'showPortfolioChart',
        containerId: 'portfolioChartContainer',
        initFn: () => chartManager.initPortfolioChart(window.portfolioHistory),
        destroyFn: chartManager.destroyPortfolioChart,
        showLabel: '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart',
        hideLabel: '<i class="bi bi-graph-down me-2"></i>Hide Portfolio Chart'
    });
}

/**
 * Setup Strategy Performance Chart Toggle
 */
export function setupStrategyChartToggle() {
    setupChartToggle({
        buttonId: 'showHourlyChart',
        containerId: 'hourlyChartContainer',
        initFn: () => chartManager.initStrategyChart(window.hourlyPerformance),
        destroyFn: chartManager.destroyStrategyChart,
        showLabel: '<i class="bi bi-clock me-2"></i>Show Strategy Performance',
        hideLabel: '<i class="bi bi-clock me-2"></i>Hide Strategy Performance'
    });
}

/**
 * Setup Candlestick Chart Modal
 */
export function setupCandlestickChartModal() {
    const button = document.getElementById('showBacktestCandlestickChart');
    const modal = document.getElementById('backtestCandlestickModal');
    
    if (!button || !modal) return;
    
    // Add modal shown listener once (not every time button is clicked)
    modal.addEventListener('shown.bs.modal', function() {
        // Small delay to ensure canvas has proper dimensions
        setTimeout(() => {
            chartManager.initCandlestickChart(
                window.stockData,
                window.trades
            );
        }, 100);
    }, { once: false }); // Keep false to reinitialize on each show
    
    // Button click handler
    button.addEventListener('click', () => {
        if (!window.stockData || !window.trades || window.stockData.length === 0 || window.trades.length === 0) {
            alert('No stock data or trades available for chart. Please run a backtest first.');
            return;
        }
        
        // Show the modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    });
}

/**
 * Setup Reset Zoom Button
 */
export function setupResetZoomButton() {
    const resetZoomBtn = document.getElementById('resetZoomBtn');
    if (!resetZoomBtn) return;
    
    resetZoomBtn.addEventListener('click', () => {
        chartManager.resetCandlestickZoom();
    });
}

/**
 * Reset all UI elements to initial state
 */
export function resetChartUI() {
    // Hide chart containers
    const portfolioContainer = document.getElementById('portfolioChartContainer');
    const hourlyContainer = document.getElementById('hourlyChartContainer');
    
    if (portfolioContainer) portfolioContainer.classList.add('d-none');
    if (hourlyContainer) hourlyContainer.classList.add('d-none');
    
    // Reset button texts
    setButtonText('showPortfolioChart', '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart');
    setButtonText('showHourlyChart', '<i class="bi bi-clock me-2"></i>Show Strategy Performance');
    setButtonText('showBacktestCandlestickChart', '<i class="bi bi-graph-up me-2"></i>Show Price Chart with Trades');
}

/**
 * Initialize all chart UI components
 */
export function initChartUI() {
    setupPortfolioChartToggle();
    setupStrategyChartToggle();
    setupCandlestickChartModal();
    setupResetZoomButton();
}

