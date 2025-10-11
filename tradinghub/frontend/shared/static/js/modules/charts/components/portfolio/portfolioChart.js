/**
 * Portfolio Chart
 * Renders portfolio performance using Chart.js
 */

import { defaultChartOptions, formatCurrency } from '../../core/chartUtils.js';
import { prepareChartData, filterDataByPeriod, calculatePercentChange, getFinalValue } from './portfolio-data.js';
import { createChartStructure, updateValueIndicator, setupPeriodButtons } from './portfolio-ui.js';

export class PortfolioChart {
    constructor(containerId = 'portfolioChartContainer', canvasId = 'portfolioChart') {
        this.containerId = containerId;
        this.canvasId = canvasId;
        this.chart = null;
        this.portfolioHistory = null;
    }

    /**
     * Initialize chart with portfolio history data
     */
    initialize(portfolioHistory) {
        console.log('[PortfolioChart] Initializing with', portfolioHistory?.length, 'data points');
        
        this.portfolioHistory = portfolioHistory;
        
        if (!portfolioHistory || portfolioHistory.length === 0) {
            console.error('[PortfolioChart] No portfolio history data provided');
            return;
        }
        
        // Create DOM structure
        const canvas = createChartStructure(this.containerId, this.canvasId);
        if (!canvas) {
            return;
        }
        
        // Render chart
        this.renderChart(canvas, portfolioHistory);
        
        // Setup period filter buttons
        setupPeriodButtons((period) => this.handlePeriodChange(period));
        
        // Update value indicator
        this.updateIndicator(portfolioHistory);
        
        console.log('[PortfolioChart] Initialization complete');
    }

    /**
     * Render Chart.js chart
     */
    renderChart(canvas, portfolioHistory) {
        const ctx = canvas.getContext('2d');
        
        // Create gradient for chart background
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
        gradient.addColorStop(1, 'rgba(75, 192, 192, 0.0)');
        
        // Prepare data
        const { labels, values } = prepareChartData(portfolioHistory);
        
        // Create chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: values,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHitRadius: 20,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointHoverBorderColor: 'white',
                    pointHoverBorderWidth: 2
                }]
            },
            options: this.createChartOptions()
        });
    }

    /**
     * Handle period filter change
     */
    handlePeriodChange(period) {
        const filteredHistory = filterDataByPeriod(this.portfolioHistory, period);
        
        // Update chart data
        const { labels, values } = prepareChartData(filteredHistory);
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = values;
        this.chart.update();
        
        // Update value indicator
        this.updateIndicator(filteredHistory);
    }

    /**
     * Update value indicator
     */
    updateIndicator(portfolioHistory) {
        const finalValue = getFinalValue(portfolioHistory);
        const percentChange = calculatePercentChange(portfolioHistory);
        updateValueIndicator(finalValue, percentChange);
    }

    /**
     * Create chart configuration options
     */
    createChartOptions() {
        return {
            ...defaultChartOptions,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'white',
                    titleColor: 'rgba(0, 0, 0, 0.7)',
                    bodyColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 13,
                        weight: 'normal'
                    },
                    bodyFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 12,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        title: context => context[0].label,
                        label: context => formatCurrency(context.parsed.y)
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        font: {
                            size: 11
                        },
                        callback: value => '$' + value.toLocaleString()
                    }
                }
            }
        };
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