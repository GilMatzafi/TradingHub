// Import chart classes from shared directory
import { PortfolioChart } from '/shared/js/modules/charts/portfolioChart.js';
import { StrategyPerformanceChart } from '/shared/js/modules/charts/strategyPerformanceChart.js';
import { BacktestCandlestickChart } from '/shared/js/modules/charts/backtestCandlestickChart.js';

// Initialize chart instances
let portfolioChart = null;
let strategyChart = null;
let backtestCandlestickChart = null;

// Chart functionality
function initBacktestCharts() {
    // Add event listener for the portfolio chart button
    document.getElementById('showPortfolioChart')?.addEventListener('click', function() {
        const chartContainer = document.getElementById('portfolioChartContainer');
        const button = document.getElementById('showPortfolioChart');
        
        if (chartContainer.classList.contains('d-none')) {
            // Show the chart
            chartContainer.classList.remove('d-none');
            button.innerHTML = '<i class="bi bi-graph-down me-2"></i>Hide Portfolio Chart';
            
            // If we have portfolio history data, render the chart
            if (window.portfolioHistory && window.portfolioHistory.length > 0) {
                if (!portfolioChart) {
                    portfolioChart = new PortfolioChart();
                }
                portfolioChart.initialize(window.portfolioHistory);
            }
        } else {
            // Hide the chart
            chartContainer.classList.add('d-none');
            button.innerHTML = '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart';
            if (portfolioChart) {
                portfolioChart.destroy();
            }
        }
    });
    
    // Add event listener for the hourly performance chart button
    document.getElementById('showHourlyChart')?.addEventListener('click', function() {
        const chartContainer = document.getElementById('hourlyChartContainer');
        const button = document.getElementById('showHourlyChart');
        
        if (chartContainer.classList.contains('d-none')) {
            // Show the chart
            chartContainer.classList.remove('d-none');
            button.innerHTML = '<i class="bi bi-clock me-2"></i>Hide Strategy Performance';
            
            // If we have hourly performance data, render the chart
            if (window.hourlyPerformance) {
                if (!strategyChart) {
                    strategyChart = new StrategyPerformanceChart();
                }
                strategyChart.initialize(window.hourlyPerformance);
            }
        } else {
            // Hide the chart
            chartContainer.classList.add('d-none');
            button.innerHTML = '<i class="bi bi-clock me-2"></i>Show Strategy Performance';
            if (strategyChart) {
                strategyChart.destroy();
            }
        }
    });

    // Add event listener for the backtest candlestick chart button
    document.getElementById('showBacktestCandlestickChart')?.addEventListener('click', function() {
        console.log('Backtest candlestick chart button clicked');
        const modal = document.getElementById('backtestCandlestickModal');
        
        console.log('Modal found:', modal);
        console.log('Window data available:', { 
            stockData: window.stockData?.length, 
            trades: window.trades?.length 
        });
        
        // If we have stock data and trades, render the chart
        if (window.stockData && window.trades && window.stockData.length > 0 && window.trades.length > 0) {
            console.log('Rendering backtest candlestick chart with data');
            
            // Show the modal first
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
            
            // Initialize chart after modal is fully shown
            modal.addEventListener('shown.bs.modal', function() {
                console.log('Modal fully shown, initializing chart');
                
                // Small delay to ensure canvas has proper dimensions
                setTimeout(() => {
                    if (!backtestCandlestickChart) {
                        backtestCandlestickChart = new BacktestCandlestickChart('backtestCandlestickModal', 'backtestCandlestickChart');
                    }
                    backtestCandlestickChart.initialize(window.stockData, window.trades);
                }, 100);
            }, { once: true });
        } else {
            console.log('No stock data or trades available for chart');
            alert('No stock data or trades available for chart. Please run a backtest first.');
        }
    });

    // Add event listener for reset zoom button
    document.getElementById('resetZoomBtn').addEventListener('click', function() {
        console.log('Backtest Charts: Reset zoom button clicked');
        if (backtestCandlestickChart && backtestCandlestickChart.chart) {
            backtestCandlestickChart.chart.resetZoom();
        }
    });
}

// Reset charts to initial state
function resetCharts() {
    // Make sure charts are hidden initially
    document.getElementById('portfolioChartContainer').classList.add('d-none');
    document.getElementById('hourlyChartContainer').classList.add('d-none');
    
    // Reset chart buttons
    document.getElementById('showPortfolioChart').innerHTML = '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart';
    document.getElementById('showHourlyChart').innerHTML = '<i class="bi bi-clock me-2"></i>Show Strategy Performance';
    document.getElementById('showBacktestCandlestickChart').innerHTML = '<i class="bi bi-graph-up me-2"></i>Show Price Chart with Trades';
    
    // Destroy existing charts
    if (portfolioChart) {
        portfolioChart.destroy();
        portfolioChart = null;
    }
    if (strategyChart) {
        strategyChart.destroy();
        strategyChart = null;
    }
    if (backtestCandlestickChart) {
        backtestCandlestickChart.destroy();
        backtestCandlestickChart = null;
    }
}

// Export functions
export { initBacktestCharts, resetCharts }; 