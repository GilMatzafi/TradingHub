import { chartColors, defaultChartOptions, formatCurrency, formatPercentage } from './chartUtils.js';

export class BacktestCandlestickChart {
    constructor(containerId = 'backtestCandlestickContainer', canvasId = 'backtestCandlestickChart') {
        this.containerId = containerId;
        this.canvasId = canvasId;
        this.chart = null;
        this.stockData = null;
        this.trades = null;
    }

    initialize(stockData, trades) {
        console.log('BacktestCandlestickChart: Initializing with data:', { stockData, trades });
        this.stockData = stockData;
        this.trades = trades;
        
        // For modal, we don't need to find a container, just the canvas
        const canvas = document.getElementById(this.canvasId);
        
        if (!canvas) {
            console.error('Canvas element not found:', this.canvasId);
            return;
        }
        
        console.log('BacktestCandlestickChart: Canvas found:', canvas);
        console.log('BacktestCandlestickChart: Canvas dimensions:', {
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight
        });

        // Clear any existing chart
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }

        // Check if canvas has proper dimensions
        if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
            console.warn('BacktestCandlestickChart: Canvas has zero dimensions, waiting for resize...');
            // Wait a bit and try again
            setTimeout(() => {
                this.initialize(stockData, trades);
            }, 200);
            return;
        }

        // Get canvas context
        const ctx = canvas.getContext('2d');

        // Prepare and render chart (Lightweight Charts preferred)
        this.renderChart(ctx);
    }

    createChartStructure(container) {
        // For modal, we don't need to create the structure as it's already in the HTML
        // Just ensure the canvas exists
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            console.error('Canvas element not found:', this.canvasId);
            return;
        }
        console.log('Canvas found for modal chart:', canvas);
    }

    renderChart(ctx) {
        console.log('BacktestCandlestickChart: Rendering chart with data:', { 
            stockDataLength: this.stockData?.length, 
            tradesLength: this.trades?.length 
        });
        
        if (!this.stockData || !this.trades) {
            console.error('Stock data or trades not provided:', { 
                stockData: this.stockData, 
                trades: this.trades 
            });
            return;
        }

        // If Lightweight Charts is available, render true candlesticks
        if (window.LightweightCharts) {
            return this.renderWithLightweightCharts();
        }

        // Fallback: Prepare candlestick-like data for Chart.js
        const candlestickData = this.prepareCandlestickData();
        console.log('BacktestCandlestickChart: Candlestick data prepared:', candlestickData);
        
        // Prepare trade markers
        const tradeMarkers = this.prepareTradeMarkers();
        console.log('BacktestCandlestickChart: Trade markers prepared:', tradeMarkers);

        // Create Chart.js configuration with zoom and pan
        // Try candlestick first, fallback to line if not available
        let chartType = 'candlestick';
        let datasets = [
            {
                label: 'Stock Price',
                data: candlestickData.data,
                parsing: false,
                color: {
                    up: '#26a69a',
                    down: '#ef5350',
                    unchanged: '#999'
                },
                borderColor: {
                    up: '#26a69a',
                    down: '#ef5350',
                    unchanged: '#999'
                },
                backgroundColor: {
                    up: 'rgba(38, 166, 154, 0.1)',
                    down: 'rgba(239, 83, 80, 0.1)',
                    unchanged: 'rgba(153, 153, 153, 0.1)'
                }
            },
            ...tradeMarkers
        ];

        // Check if candlestick is available, otherwise use custom OHLC implementation
        if (typeof Chart.controllers.candlestick === 'undefined') {
            console.warn('BacktestCandlestickChart: Candlestick not available, using custom OHLC implementation');
            chartType = 'line';
            
            // Create custom OHLC representation using multiple datasets
            const ohlcData = candlestickData.data;
            
            // Create High-Low lines by duplicating each point with slight x offset
            const highLowData = [];
            ohlcData.forEach(d => {
                const xOffset = 0.0001; // Small offset to create vertical lines
                highLowData.push(
                    {x: new Date(d.x.getTime() - xOffset), y: d.l}, // Low start
                    {x: new Date(d.x.getTime() + xOffset), y: d.l}, // Low end
                    {x: new Date(d.x.getTime() - xOffset), y: d.h}, // High start  
                    {x: new Date(d.x.getTime() + xOffset), y: d.h}  // High end
                );
            });
            
            datasets = [
                // High-Low range (vertical lines)
                {
                    label: 'High-Low Range',
                    data: highLowData,
                    borderColor: '#666',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0,
                    pointRadius: 0,
                    borderWidth: 1,
                    spanGaps: false,
                    showLine: true
                },
                // Open prices
                {
                    label: 'Open',
                    data: ohlcData.map(d => ({x: d.x, y: d.o})),
                    borderColor: '#ff6b6b',
                    backgroundColor: '#ff6b6b',
                    fill: false,
                    tension: 0,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    borderWidth: 1,
                    spanGaps: false,
                    showLine: false
                },
                // Close prices
                {
                    label: 'Close',
                    data: ohlcData.map(d => ({x: d.x, y: d.c})),
                    borderColor: '#4ecdc4',
                    backgroundColor: '#4ecdc4',
                    fill: false,
                    tension: 0,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    borderWidth: 1,
                    spanGaps: false,
                    showLine: false
                },
                ...tradeMarkers
            ];
        }

        const config = {
            type: chartType,
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Backtest Results - Candlestick Chart with Trade Markers (Zoom & Pan Enabled)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Price: $${context.parsed.y.toFixed(2)}`;
                                } else {
                                    const trade = context.raw.trade;
                                    if (trade) {
                                        return `${trade.type}: $${trade.price.toFixed(2)} (${trade.reason})`;
                                    }
                                }
                                return context.dataset.label;
                            }
                        }
                    },
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                        },
                        pan: {
                            enabled: true,
                            mode: 'x',
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        type: 'time',
                        time: {
                            displayFormats: {
                                day: 'MMM dd',
                                hour: 'MMM dd HH:mm'
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Price ($)'
                        },
                        beginAtZero: false
                    }
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        };

        // Register the zoom plugin
        Chart.register(ChartZoom);
        
        // Try to register financial controllers if available
        if (typeof Chart.controllers.candlestick === 'undefined') {
            console.log('BacktestCandlestickChart: Attempting to register financial controllers manually');
            try {
                // Check for various possible global names
                const financialGlobals = [
                    'chartjs-chart-financial',
                    'ChartjsChartFinancial', 
                    'ChartjsChartFinancial.default',
                    window['chartjs-chart-financial'],
                    window.ChartjsChartFinancial
                ];
                
                let Financial = null;
                for (const global of financialGlobals) {
                    if (global && global.CandlestickController) {
                        Financial = global;
                        break;
                    }
                }
                
                if (Financial) {
                    Chart.register(
                        Financial.CandlestickController,
                        Financial.OhlcController,
                        Financial.CandlestickElement,
                        Financial.OhlcElement,
                        Financial.FinancialScale
                    );
                    console.log('BacktestCandlestickChart: Successfully registered financial controllers manually');
                } else {
                    console.log('BacktestCandlestickChart: No financial controllers found in globals');
                }
            } catch (e) {
                console.warn('BacktestCandlestickChart: Error registering financial controllers:', e);
            }
        }
        
        console.log('BacktestCandlestickChart: Creating chart with type:', chartType);
        console.log('BacktestCandlestickChart: Chart config:', config);
        console.log('BacktestCandlestickChart: Available chart types:', Object.keys(Chart.controllers));
        console.log('BacktestCandlestickChart: Candlestick controller available:', typeof Chart.controllers.candlestick !== 'undefined');
        
        // Create the chart
        try {
            this.chart = new Chart(ctx, config);
            console.log('BacktestCandlestickChart: Chart created successfully:', this.chart);
            console.log('BacktestCandlestickChart: Chart data:', this.chart.data);
            console.log('BacktestCandlestickChart: Chart datasets:', this.chart.data.datasets.length);
        } catch (error) {
            console.error('BacktestCandlestickChart: Error creating chart:', error);
            // Try fallback to line chart
            console.log('BacktestCandlestickChart: Attempting fallback to line chart');
            config.type = 'line';
            config.data.datasets[0] = {
                label: 'Stock Price',
                data: candlestickData.data.map(d => ({x: d.x, y: d.c})),
                borderColor: '#666',
                backgroundColor: 'rgba(102, 102, 102, 0.1)',
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5,
                borderWidth: 2
            };
            this.chart = new Chart(ctx, config);
            console.log('BacktestCandlestickChart: Fallback line chart created');
        }
    }

    renderWithLightweightCharts() {
        const container = document.getElementById(this.canvasId).parentElement;
        // Remove existing canvas content (we'll use a div for LW Charts)
        const canvas = document.getElementById(this.canvasId);
        canvas.classList.add('d-none');
        const existing = container.querySelector('#lwChartContainer');
        if (existing) existing.remove();
        const chartDiv = document.createElement('div');
        chartDiv.id = 'lwChartContainer';
        chartDiv.style.width = '100%';
        chartDiv.style.height = container.style.height || '80vh';
        container.appendChild(chartDiv);

        const chart = LightweightCharts.createChart(chartDiv, {
            layout: { background: { type: 'solid', color: '#ffffff' }, textColor: '#333' },
            rightPriceScale: { borderColor: '#D1D4DC' },
            timeScale: { borderColor: '#D1D4DC', timeVisible: true, secondsVisible: false },
            grid: { horzLines: { color: '#f0f3fa' }, vertLines: { color: '#f0f3fa' } },
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a', downColor: '#ef5350', wickUpColor: '#26a69a', wickDownColor: '#ef5350', borderVisible: false,
        });

        // Map stock data to LW candles
        const candles = [...this.stockData]
            .sort((a,b) => new Date(a.date) - new Date(b.date))
            .map(d => ({ time: Math.floor(new Date(d.date).getTime() / 1000), open: d.open, high: d.high, low: d.low, close: d.close }));
        candleSeries.setData(candles);

        // Plot trade markers
        const markers = [];
        this.trades.forEach(trade => {
            if (trade.entry_date) {
                markers.push({ time: Math.floor(new Date(trade.entry_date).getTime()/1000), position: 'belowBar', color: '#00c853', shape: 'arrowUp', text: `Entry ${trade.entry_price.toFixed(2)}` });
            }
            if (trade.exit_date) {
                const color = trade.exit_reason === 'stop_loss' ? '#d32f2f' : trade.exit_reason === 'take_profit' ? '#2196f3' : '#ff9800';
                const label = trade.exit_reason === 'stop_loss' ? 'SL' : trade.exit_reason === 'take_profit' ? 'TP' : 'Time';
                markers.push({ time: Math.floor(new Date(trade.exit_date).getTime()/1000), position: 'aboveBar', color, shape: 'arrowDown', text: `${label} ${trade.exit_price?.toFixed?.(2) ?? ''}` });
            }
        });
        candleSeries.setMarkers(markers);

        // Resize on modal shown
        setTimeout(() => chart.timeScale().fitContent(), 50);

        console.log('BacktestCandlestickChart: Rendered with Lightweight Charts');
        return chart;
    }

    prepareCandlestickData() {
        const data = [];

        // Ensure data sorted by date to avoid jumps
        const sorted = [...this.stockData].sort((a, b) => new Date(a.date) - new Date(b.date));
        sorted.forEach((candle) => {
            const date = new Date(candle.date);
            data.push({ x: date, o: candle.open, h: candle.high, l: candle.low, c: candle.close });
        });

        return { data };
    }

    prepareTradeMarkers() {
        const datasets = [];
        
        // Group trades by type for different colors
        const tradeTypes = {
            entry: { color: '#00c853', label: 'Entry Points' },
            stop_loss: { color: '#d32f2f', label: 'Stop Loss Exits' },
            take_profit: { color: '#2196f3', label: 'Take Profit Exits' },
            max_periods: { color: '#ff9800', label: 'Time-based Exits' }
        };

        Object.keys(tradeTypes).forEach(type => {
            const trades = this.trades.filter(trade => 
                (type === 'entry' && trade.entry_date) || 
                (type !== 'entry' && trade.exit_reason === type)
            );

            if (trades.length > 0) {
                const data = trades.map(trade => {
                    const price = type === 'entry' ? trade.entry_price : trade.exit_price;
                    const date = type === 'entry' ? trade.entry_date : trade.exit_date;
                    
                    return {
                        x: new Date(date),
                        y: price,
                        trade: {
                            type: type,
                            price: price,
                            reason: trade.exit_reason || 'entry',
                            profit: trade.profit_pct
                        }
                    };
                });

                datasets.push({
                    label: tradeTypes[type].label,
                    data: data,
                    backgroundColor: tradeTypes[type].color,
                    borderColor: tradeTypes[type].color,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    showLine: false,
                    pointStyle: 'circle'
                });
            }
        });

        return datasets;
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    updateData(stockData, trades) {
        this.stockData = stockData;
        this.trades = trades;
        
        if (this.chart) {
            this.destroy();
        }
        
        const canvas = document.getElementById(this.canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            this.renderChart(ctx);
        }
    }
}
