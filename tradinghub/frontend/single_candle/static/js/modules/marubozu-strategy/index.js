/**
 * Marubozu Strategy - Main entry point
 * Handles Marubozu pattern analysis and visualization
 */

import { BaseStrategy } from '../shared/base-strategy.js';
import { MarubozuCandlestickVisualizer } from './candlestick-visualizer.js';

class MarubozuStrategy extends BaseStrategy {
    constructor() {
        super('marubozu', new MarubozuCandlestickVisualizer());
        console.log('🔴 Marubozu strategy: DOM loaded, initializing...');
    }

    async initialize() {
        try {
            // Initialize base strategy components
            await super.initialize();
            
            // Initialize Marubozu-specific visualization
            this.visualizer.initialize();
            
            // Set up Marubozu-specific event listeners
            this.setupMarubozuEventListeners();
            
            console.log('🔴 Marubozu strategy: Initialization complete', {
                strategy: !!this,
                globalAccess: !!window.marubozuStrategy,
                strategyType: typeof this,
                hasDataManager: !!this.dataManager
            });
            
        } catch (error) {
            console.error('🔴 Marubozu strategy initialization error:', error);
        }
    }

    setupMarubozuEventListeners() {
        // Add any Marubozu-specific event listeners here
        console.log('🔴 Marubozu strategy: Event listeners set up');
    }

    getPatternType() {
        return 'marubozu';
    }

    getPatternName() {
        return 'Marubozu Pattern';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.marubozuStrategy = new MarubozuStrategy();
        window.marubozuStrategy.initialize();
    } catch (error) {
        console.error('🔴 Marubozu strategy: Failed to initialize:', error);
    }
});
