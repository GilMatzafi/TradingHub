/**
 * Strategy Performance UI Module
 * Handles DOM updates and UI interactions for strategy performance charts
 */

import { formatPercentage } from './chartUtils.js';

/**
 * DOM element IDs
 */
const ELEMENT_IDS = {
    bestHour: 'bestHour',
    worstHour: 'worstHour',
    mostActiveHour: 'mostActiveHour',
    avgTradesPerHour: 'avgTradesPerHour'
};

/**
 * Get summary stat elements
 */
function getSummaryElements() {
    return {
        bestHour: document.getElementById(ELEMENT_IDS.bestHour),
        worstHour: document.getElementById(ELEMENT_IDS.worstHour),
        mostActiveHour: document.getElementById(ELEMENT_IDS.mostActiveHour),
        avgTradesPerHour: document.getElementById(ELEMENT_IDS.avgTradesPerHour)
    };
}

/**
 * Update summary statistics display
 */
export function updateSummaryStats(labels, stats) {
    const elements = getSummaryElements();
    
    // Best hour
    if (elements.bestHour) {
        const { index, profit } = stats.bestHour;
        elements.bestHour.textContent = `${labels[index]} (${formatPercentage(profit)})`;
    }
    
    // Worst hour
    if (elements.worstHour) {
        const { index, profit } = stats.worstHour;
        elements.worstHour.textContent = `${labels[index]} (${formatPercentage(profit)})`;
    }
    
    // Most active hour
    if (elements.mostActiveHour) {
        const { index, tradeCount } = stats.mostActiveHour;
        elements.mostActiveHour.textContent = `${labels[index]} (${tradeCount} trades)`;
    }
    
    // Average trades per hour
    if (elements.avgTradesPerHour) {
        elements.avgTradesPerHour.textContent = stats.avgTradesPerHour.toFixed(1);
    }
}

/**
 * Create toggle buttons HTML
 */
function createToggleButtons() {
    return `
        <button type="button" class="active" data-metric="profit">Profit</button>
        <button type="button" data-metric="volume">Volume</button>
    `;
}

/**
 * Setup metric toggle buttons
 */
export function setupToggleButtons(onToggle) {
    const toggleContainer = document.querySelector('.hourly-chart-toggle');
    
    if (!toggleContainer) {
        console.warn('[StrategyUI] Toggle container not found');
        return;
    }
    
    // Create buttons
    toggleContainer.innerHTML = createToggleButtons();
    
    // Attach event listeners
    toggleContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            toggleContainer.querySelectorAll('button').forEach(btn => 
                btn.classList.toggle('active', btn === button)
            );
            
            // Call callback with selected metric
            const metric = button.dataset.metric;
            onToggle(metric);
        });
    });
}

