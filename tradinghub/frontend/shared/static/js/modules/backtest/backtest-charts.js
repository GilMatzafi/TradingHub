// Import chart classes from shared directory
import { PortfolioChart } from '/shared/js/modules/charts/portfolioChart.js';
import { StrategyPerformanceChart } from '/shared/js/modules/charts/strategyPerformanceChart.js';

// Initialize chart instances
let portfolioChart = null;
let strategyChart = null;

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
}

// Reset charts to initial state
function resetCharts() {
    // Make sure charts are hidden initially
    document.getElementById('portfolioChartContainer').classList.add('d-none');
    document.getElementById('hourlyChartContainer').classList.add('d-none');
    
    // Reset chart buttons
    document.getElementById('showPortfolioChart').innerHTML = '<i class="bi bi-graph-up me-2"></i>Show Portfolio Chart';
    document.getElementById('showHourlyChart').innerHTML = '<i class="bi bi-clock me-2"></i>Show Strategy Performance';
}

// Export functions
export { initBacktestCharts, resetCharts }; 