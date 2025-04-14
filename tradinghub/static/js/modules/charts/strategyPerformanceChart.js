import { chartColors, defaultChartOptions, formatTime, formatPercentage } from './chartUtils.js';

export class StrategyPerformanceChart {
    constructor(containerId = 'hourlyChartContainer', canvasId = 'hourlyChart') {
        this.containerId = containerId;
        this.canvasId = canvasId;
        this.chart = null;
    }

    initialize(hourlyPerformance) {
        const container = document.getElementById(this.containerId);
        const canvas = document.getElementById(this.canvasId);
        
        if (!container || !canvas) {
            console.error('Container or canvas element not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get canvas context');
            return;
        }

        // Prepare data
        const hours = Array.from({length: 24}, (_, i) => i);
        const labels = hours.map(formatTime);
        const avgProfits = hourlyPerformance.hourly_avg_profits;
        const tradeCounts = hourlyPerformance.hourly_trades;

        // Update summary statistics
        this.updateSummaryStats(labels, avgProfits, tradeCounts);

        // Create datasets
        const datasets = this.createDatasets(avgProfits, tradeCounts);

        // Create and store the chart
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: this.createChartOptions()
        });

        // Set up toggle buttons
        this.setupToggleButtons();
    }

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

    updateSummaryStats(labels, avgProfits, tradeCounts) {
        const bestHourIndex = avgProfits.indexOf(Math.max(...avgProfits));
        const worstHourIndex = avgProfits.indexOf(Math.min(...avgProfits));
        const mostActiveHourIndex = tradeCounts.indexOf(Math.max(...tradeCounts));
        const avgTradesPerHour = tradeCounts.reduce((a, b) => a + b, 0) / tradeCounts.filter(x => x > 0).length || 0;

        // Update summary cards
        const elements = {
            bestHour: document.getElementById('bestHour'),
            worstHour: document.getElementById('worstHour'),
            mostActiveHour: document.getElementById('mostActiveHour'),
            avgTradesPerHour: document.getElementById('avgTradesPerHour')
        };

        if (elements.bestHour) elements.bestHour.textContent = `${labels[bestHourIndex]} (${formatPercentage(avgProfits[bestHourIndex])})`;
        if (elements.worstHour) elements.worstHour.textContent = `${labels[worstHourIndex]} (${formatPercentage(avgProfits[worstHourIndex])})`;
        if (elements.mostActiveHour) elements.mostActiveHour.textContent = `${labels[mostActiveHourIndex]} (${tradeCounts[mostActiveHourIndex]} trades)`;
        if (elements.avgTradesPerHour) elements.avgTradesPerHour.textContent = avgTradesPerHour.toFixed(1);
    }

    setupToggleButtons() {
        const toggleContainer = document.querySelector('.hourly-chart-toggle');
        if (toggleContainer) {
            toggleContainer.innerHTML = `
                <button type="button" class="active" data-metric="profit">Profit</button>
                <button type="button" data-metric="volume">Volume</button>
            `;

            toggleContainer.querySelectorAll('button').forEach(button => {
                button.addEventListener('click', () => this.handleMetricToggle(button));
            });
        }
    }

    handleMetricToggle(button) {
        const metric = button.dataset.metric;
        
        // Update active state
        button.parentElement.querySelectorAll('button').forEach(btn => 
            btn.classList.toggle('active', btn === button)
        );

        if (!this.chart) {
            console.error('Chart not initialized');
            return;
        }

        // Update chart visibility
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

    destroy() {
        if (this.chart instanceof Chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
} 