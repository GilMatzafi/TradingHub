import { chartColors, defaultChartOptions, formatCurrency, formatPercentage } from './chartUtils.js';

export class PortfolioChart {
    constructor(containerId = 'portfolioChartContainer', canvasId = 'portfolioChart') {
        this.containerId = containerId;
        this.canvasId = canvasId;
        this.chart = null;
        this.portfolioHistory = null;
    }

    initialize(portfolioHistory) {
        this.portfolioHistory = portfolioHistory;
        const container = document.getElementById(this.containerId);
        
        if (!container) {
            console.error('Container element not found');
            return;
        }

        // Clear existing content
        container.innerHTML = '';

        // Create chart structure
        this.createChartStructure(container);

        // Create new canvas
        const canvas = document.getElementById(this.canvasId);
        const ctx = canvas.getContext('2d');

        // Create gradient for chart background
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(75, 192, 192, 0.4)');
        gradient.addColorStop(1, 'rgba(75, 192, 192, 0.0)');

        // Prepare data
        const { labels, values } = this.prepareChartData(portfolioHistory);

        // Create and store the chart
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

        // Set up period buttons
        this.setupPeriodButtons();
        
        // Update value indicator
        this.updateValueIndicator(portfolioHistory);
    }

    createChartStructure(container) {
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
        canvas.id = this.canvasId;
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
    }

    prepareChartData(portfolioHistory) {
        const labels = portfolioHistory.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });
        });
        const values = portfolioHistory.map(item => item.value);
        return { labels, values };
    }

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

    setupPeriodButtons() {
        const periodButtons = document.querySelectorAll('.chart-period-btn');
        periodButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                periodButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                // Filter data based on selected period
                const period = button.dataset.period;
                const filteredHistory = this.filterDataByPeriod(period);

                // Update chart data
                const { labels, values } = this.prepareChartData(filteredHistory);
                this.chart.data.labels = labels;
                this.chart.data.datasets[0].data = values;
                this.chart.update();

                // Update value indicator
                this.updateValueIndicator(filteredHistory);
            });
        });
    }

    filterDataByPeriod(period) {
        if (period === 'all' || !this.portfolioHistory) {
            return this.portfolioHistory;
        }

        const now = new Date(this.portfolioHistory[this.portfolioHistory.length - 1].date);
        let cutoff = new Date(now);

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
        }

        return this.portfolioHistory.filter(item => new Date(item.date) >= cutoff);
    }

    updateValueIndicator(portfolioHistory) {
        const valueIndicator = document.querySelector('.chart-value-indicator');
        if (!valueIndicator || !portfolioHistory || portfolioHistory.length === 0) return;

        const initialValue = portfolioHistory[0].value;
        const finalValue = portfolioHistory[portfolioHistory.length - 1].value;
        const percentChange = ((finalValue - initialValue) / initialValue) * 100;
        const changeClass = percentChange >= 0 ? 'positive' : 'negative';

        valueIndicator.innerHTML = `
            <div class="chart-value-label">Current Value</div>
            <div class="chart-value ${changeClass}">
                ${formatCurrency(finalValue)}
                (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)
            </div>
        `;
    }

    destroy() {
        if (this.chart instanceof Chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
} 