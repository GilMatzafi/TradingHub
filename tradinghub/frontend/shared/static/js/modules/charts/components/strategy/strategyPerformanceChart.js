/**
 * Strategy Performance Chart
 * Renders hourly performance metrics using Chart.js
 */

import { chartColors, defaultChartOptions } from '../../core/chartUtils.js';
import { prepareChartData, getSummaryStats } from './strategy-data.js';
import { updateSummaryStats, setupToggleButtons } from './strategy-ui.js';

export class StrategyPerformanceChart {
    constructor(containerId = 'hourlyChartContainer', canvasId = 'hourlyChart') {
        this.containerId = containerId;
        this.canvasId = canvasId;
        this.chart = null;
    }

    /**
     * Initialize chart with hourly performance data
     */
    initialize(hourlyPerformance) {
        console.log('[StrategyChart] Initializing with hourly performance data');
        
        const canvas = this.getCanvas();
        if (!canvas) {
            console.error('[StrategyChart] Canvas element not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('[StrategyChart] Could not get canvas context');
            return;
        }

        // Prepare data
        const { labels, avgProfits, tradeCounts } = prepareChartData(hourlyPerformance);

        // Update summary statistics
        const stats = getSummaryStats(avgProfits, tradeCounts);
        updateSummaryStats(labels, stats);

        // Render chart
        this.renderChart(ctx, labels, avgProfits, tradeCounts);

        // Setup toggle buttons
        setupToggleButtons((metric) => this.handleMetricToggle(metric));
        
        console.log('[StrategyChart] Initialization complete');
    }

    /**
     * Get canvas element
     */
    getCanvas() {
        return document.getElementById(this.canvasId);
    }

    /**
     * Render Chart.js chart
     */
    renderChart(ctx, labels, avgProfits, tradeCounts) {
        const datasets = this.createDatasets(avgProfits, tradeCounts);

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: this.createChartOptions()
        });
    }

    /**
     * Create chart datasets
     */
    createDatasets(avgProfits, tradeCounts) {
        return [
            {
                label: 'Average Profit %',
                data: avgProfits.map(profit => profit * 100),
                backgroundColor: avgProfits.map(profit => 
                    profit >= 0 ? chartColors.profit.positive.background : chartColors.profit.negative.background
                ),
                borderColor: avgProfits.map(profit => 
                    profit >= 0 ? chartColors.profit.positive.border : chartColors.profit.negative.border
                ),
                borderWidth: 1,
                yAxisID: 'y',
                type: 'bar',
                hidden: false
            },
            {
                label: 'Number of Trades',
                data: tradeCounts,
                backgroundColor: chartColors.volume.background,
                borderColor: chartColors.volume.border,
                borderWidth: 1,
                yAxisID: 'y2',
                type: 'bar',
                hidden: true
            }
        ];
    }

    /**
     * Create chart configuration options
     */
    createChartOptions() {
        return {
            ...defaultChartOptions,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Profit %'
                    },
                    grid: {
                        drawOnChartArea: true
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Number of Trades'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        };
    }

    /**
     * Handle metric toggle (profit vs volume)
     */
    handleMetricToggle(metric) {
        if (!this.chart) {
            console.error('[StrategyChart] Chart not initialized');
            return;
        }

        // Update chart visibility based on selected metric
        if (metric === 'profit') {
            this.chart.data.datasets[0].hidden = false;
            this.chart.data.datasets[1].hidden = true;
            this.chart.options.scales.y.display = true;
            this.chart.options.scales.y2.display = false;
        } else if (metric === 'volume') {
            this.chart.data.datasets[0].hidden = true;
            this.chart.data.datasets[1].hidden = false;
            this.chart.options.scales.y.display = false;
            this.chart.options.scales.y2.display = true;
        }

        this.chart.update();
    }

    /**
     * Destroy chart instance
     */
    destroy() {
        if (this.chart instanceof Chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
} 