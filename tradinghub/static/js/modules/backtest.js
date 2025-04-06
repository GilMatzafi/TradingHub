// Import filteredPatterns from hammer-strategy module
import { filteredPatterns } from './hammer-strategy.js';

// Backtest functionality
function initBacktest() {
    document.getElementById('runBacktest')?.addEventListener('click', function() {
        if (filteredPatterns.length === 0) {
            alert('Please run pattern analysis first before running backtest');
            return;
        }

        // Show loading indicator
        const loading = document.querySelector('.loading');
        loading.style.display = 'block';
        loading.style.opacity = '0';
        setTimeout(() => loading.style.opacity = '1', 50);
        
        // Collect form data
        const formData = {
            symbol: document.getElementById('symbol').value.toUpperCase(),
            days: document.getElementById('days').value,
            interval: document.getElementById('interval').value,
            body_size_ratio: document.getElementById('body_size_ratio').value,
            lower_shadow_ratio: document.getElementById('lower_shadow_ratio').value,
            upper_shadow_ratio: document.getElementById('upper_shadow_ratio').value,
            ma_period: document.getElementById('ma_period').value,
            require_green: document.getElementById('require_green').checked,
            stop_loss_pct: document.getElementById('stop_loss_pct').value / 100,
            take_profit_pct: document.getElementById('take_profit_pct').value / 100,
            entry_delay: document.getElementById('entry_delay').value,
            max_holding_periods: document.getElementById('max_holding_periods').value,
            position_size: document.getElementById('position_size').value / 100,
            patterns: filteredPatterns  // Add the filtered patterns to the request
        };
        
        // Add volume parameters if volume filter is enabled
        const useVolumeFilter = document.getElementById('use_volume_filter').checked;
        if (useVolumeFilter) {
            formData.min_relative_volume = document.getElementById('min_relative_volume').value;
            formData.volume_lookback = document.getElementById('volume_lookback').value;
        }
        
        // Log the data being sent for debugging
        console.log('Sending backtest request with patterns:', filteredPatterns.length);
        
        // Send backtest request
        fetch('/backtest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Log the response for debugging
            console.log('Backtest results:', data);
            
            // Update results display
            document.getElementById('backtestResults').classList.remove('d-none');
            
            // Safely update metrics with null checks
            document.getElementById('totalTrades').textContent = data.total_trades || 0;
            document.getElementById('winRate').textContent = data.win_rate ? (data.win_rate * 100).toFixed(2) + '%' : '0%';
            document.getElementById('profitFactor').textContent = data.profit_factor ? data.profit_factor.toFixed(2) : '0.00';
            document.getElementById('averageProfit').textContent = data.average_profit ? (data.average_profit * 100).toFixed(2) + '%' : '0%';
            document.getElementById('totalProfit').textContent = data.total_profit_pct ? data.total_profit_pct.toFixed(2) + '%' : '0%';
            
            // Update trades table
            const tbody = document.querySelector('#tradesTable tbody');
            tbody.innerHTML = '';
            
            if (data.trades && Array.isArray(data.trades)) {
                if (data.trades.length === 0) {
                    // Add a message if no trades were executed
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="7" class="text-center">No trades were executed during the backtest period.</td>';
                    tbody.appendChild(row);
                } else {
                    data.trades.forEach(trade => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${trade.entry_date || '-'}</td>
                            <td>${trade.exit_date || '-'}</td>
                            <td>${trade.entry_price ? trade.entry_price.toFixed(2) : '-'}</td>
                            <td>${trade.exit_price ? trade.exit_price.toFixed(2) : '-'}</td>
                            <td class="${trade.profit_pct >= 0 ? 'text-success' : 'text-danger'}">${trade.profit_pct ? trade.profit_pct.toFixed(2) : '0.00'}%</td>
                            <td>${trade.periods_held || 0}</td>
                            <td>${trade.exit_reason || '-'}</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            } else {
                // Add a message if trades data is missing
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="7" class="text-center">No trade data available.</td>';
                tbody.appendChild(row);
            }
        })
        .catch(error => {
            console.error('Backtest error:', error);
            alert('Error running backtest: ' + error.message);
        })
        .finally(() => {
            // Hide loading indicator
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 300);
        });
    });
}

// Export the initialization function
export { initBacktest }; 