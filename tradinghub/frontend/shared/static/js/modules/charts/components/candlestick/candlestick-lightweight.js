/**
 * Candlestick Lightweight Charts Renderer
 * Handles Lightweight Charts specific rendering logic
 */

import { toLightweightChartsFormat, prepareLightweightMarkers } from './candlestick-data.js';

/**
 * Chart configuration
 */
const CHART_CONFIG = {
    layout: {
        background: { type: 'solid', color: '#ffffff' },
        textColor: '#333'
    },
    rightPriceScale: {
        borderColor: '#D1D4DC'
    },
    timeScale: {
        borderColor: '#D1D4DC',
        timeVisible: true,
        secondsVisible: false
    },
    grid: {
        horzLines: { color: '#f0f3fa' },
        vertLines: { color: '#f0f3fa' }
    }
};

/**
 * Candlestick series configuration
 */
const CANDLESTICK_SERIES_CONFIG = {
    upColor: '#26a69a',
    downColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
    borderVisible: false
};

/**
 * Create chart container element
 */
function createChartContainer(canvas) {
    const container = canvas.parentElement;
    
    // Hide existing canvas
    canvas.classList.add('d-none');
    
    // Remove existing Lightweight Charts container if present
    const existing = container.querySelector('#lwChartContainer');
    if (existing) {
        existing.remove();
    }
    
    // Create new container
    const chartDiv = document.createElement('div');
    chartDiv.id = 'lwChartContainer';
    chartDiv.style.width = '100%';
    chartDiv.style.height = container.style.height || '80vh';
    container.appendChild(chartDiv);
    
    return chartDiv;
}

/**
 * Render chart with Lightweight Charts
 */
export function renderLightweightCharts(canvas, stockData, trades) {
    console.log('[LightweightCharts] Starting render with', stockData.length, 'candles and', trades.length, 'trades');
    
    // Create container
    const chartDiv = createChartContainer(canvas);
    
    // Create chart
    const chart = LightweightCharts.createChart(chartDiv, CHART_CONFIG);
    
    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries(CANDLESTICK_SERIES_CONFIG);
    
    // Set candle data
    const candles = toLightweightChartsFormat(stockData);
    candleSeries.setData(candles);
    
    // Set trade markers
    const markers = prepareLightweightMarkers(trades);
    candleSeries.setMarkers(markers);
    
    // Fit content
    setTimeout(() => chart.timeScale().fitContent(), 50);
    
    console.log('[LightweightCharts] Render complete');
    
    return chart;
}

/**
 * Destroy Lightweight Charts instance
 */
export function destroyLightweightCharts(chart, canvasId) {
    if (!chart) return;
    
    // Remove chart
    chart.remove();
    
    // Remove container
    const container = document.querySelector('#lwChartContainer');
    if (container) {
        container.remove();
    }
    
    // Show canvas again
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        canvas.classList.remove('d-none');
    }
}

/**
 * Check if Lightweight Charts is available
 */
export function isLightweightChartsAvailable() {
    return typeof window.LightweightCharts !== 'undefined';
}

