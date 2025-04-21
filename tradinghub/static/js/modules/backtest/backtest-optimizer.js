// Parameter ranges for optimization
const OPTIMIZATION_RANGES = {
    stopLoss: Array.from({ length: 50 }, (_, i) => (i + 1) * 0.1).filter(x => x <= 5),
    takeProfit: Array.from({ length: 50 }, (_, i) => (i + 1) * 0.1).filter(x => x <= 5),
    maxHolding: Array.from({ length: 19 }, (_, i) => i + 2)  // 2 to 20
};

// Initialize optimization functionality
function initOptimization() {
    const optimizeButton = document.getElementById('optimizeBacktest');
    if (optimizeButton) {
        optimizeButton.addEventListener('click', startOptimization);
    }
}

// Start the optimization process
async function startOptimization() {
    console.log('Starting optimization process...');
    
    // Check if patterns are available
    const patterns = window.hammerStrategy?.dataManager.getFilteredPatterns();
    if (!patterns || patterns.length === 0) {
        alert('Please run pattern analysis first before running optimization');
        return;
    }
    
    // Show modal and loader
    const modal = new bootstrap.Modal(document.getElementById('optimizationModal'));
    modal.show();
    
    const loader = document.getElementById('optimizationLoader');
    const results = document.getElementById('optimizationResults');
    
    loader.classList.remove('d-none');
    results.classList.add('d-none');
    
    try {
        // Get current form values for parameters we're not optimizing
        const currentParams = getBacktestParams();
        console.log('Base parameters:', currentParams);
        
        // Generate all parameter combinations
        const combinations = generateParameterCombinations();
        console.log(`Generated ${combinations.length} parameter combinations to test`);
        
        // Run backtests for all combinations
        const optimizationResults = await runOptimization(combinations, currentParams);
        
        // Sort results by total profit
        optimizationResults.sort((a, b) => b.totalProfit - a.totalProfit);
        console.log('Optimization completed. Best result:', optimizationResults[0]);
        
        // Display results
        displayOptimizationResults(optimizationResults);
        
        // Hide loader and show results
        loader.classList.add('d-none');
        results.classList.remove('d-none');
    } catch (error) {
        console.error('Optimization error:', error);
        alert('An error occurred during optimization. Please try again.');
    }
}

// Generate all possible parameter combinations
function generateParameterCombinations() {
    const combinations = [];
    let combinationCount = 0;
    
    console.log('Generating parameter combinations...');
    console.log(`Stop Loss range: ${Math.min(...OPTIMIZATION_RANGES.stopLoss)}% to ${Math.max(...OPTIMIZATION_RANGES.stopLoss)}%`);
    console.log(`Take Profit range: ${Math.min(...OPTIMIZATION_RANGES.takeProfit)}% to ${Math.max(...OPTIMIZATION_RANGES.takeProfit)}%`);
    console.log(`Max Holding range: ${Math.min(...OPTIMIZATION_RANGES.maxHolding)} to ${Math.max(...OPTIMIZATION_RANGES.maxHolding)} candles`);
    
    for (const stopLoss of OPTIMIZATION_RANGES.stopLoss) {
        for (const takeProfit of OPTIMIZATION_RANGES.takeProfit) {
            for (const maxHolding of OPTIMIZATION_RANGES.maxHolding) {
                combinations.push({
                    stop_loss_pct: stopLoss,
                    take_profit_pct: takeProfit,
                    max_holding_periods: maxHolding
                });
                combinationCount++;
                if (combinationCount % 1000 === 0) {
                    console.log(`Generated ${combinationCount} combinations...`);
                }
            }
        }
    }
    
    return combinations;
}

// Run backtest with each parameter combination
async function runOptimization(combinations, baseParams) {
    const results = [];
    const batchSize = 10; // Process 10 combinations at a time
    const totalBatches = Math.ceil(combinations.length / batchSize);
    
    console.log(`Starting optimization with ${combinations.length} combinations in ${totalBatches} batches`);
    
    for (let i = 0; i < combinations.length; i += batchSize) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        const batch = combinations.slice(i, i + batchSize);
        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} combinations)`);
        
        const batchPromises = batch.map(params => 
            runBacktestWithParams({
                ...baseParams,
                ...params
            })
        );
        
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter(result => result !== null);
        
        console.log(`Batch ${batchNumber} completed:`, {
            tested: batch.length,
            successful: validResults.length,
            failed: batch.length - validResults.length
        });
        
        results.push(...validResults);
        
        // Update progress
        updateOptimizationProgress(i + batchSize, combinations.length);
    }
    
    console.log('Optimization completed:', {
        totalCombinations: combinations.length,
        successfulTests: results.length,
        failedTests: combinations.length - results.length
    });
    
    return results;
}

// Run a single backtest with given parameters
async function runBacktestWithParams(params) {
    try {
        console.log('Testing parameters:', {
            stopLoss: params.stop_loss_pct.toFixed(1),
            takeProfit: params.take_profit_pct.toFixed(1),
            maxHolding: params.max_holding_periods
        });
        
        const response = await fetch('/backtest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Backtest request failed');
        }
        
        const result = await response.json();
        console.log('Test result:', {
            params: {
                stopLoss: params.stop_loss_pct.toFixed(1),
                takeProfit: params.take_profit_pct.toFixed(1),
                maxHolding: params.max_holding_periods
            },
            profit: result.total_profit_pct.toFixed(2) + '%',
            winRate: result.win_rate.toFixed(2) + '%'
        });
        
        return {
            params: {
                stop_loss_pct: params.stop_loss_pct,
                take_profit_pct: params.take_profit_pct,
                max_holding_periods: params.max_holding_periods
            },
            totalProfit: result.total_profit_pct,
            winRate: result.win_rate,
            trades: result.trades
        };
    } catch (error) {
        console.error('Error running backtest:', error);
        return null;
    }
}

// Display optimization results in the modal
function displayOptimizationResults(results) {
    const topResults = results.slice(0, 5);
    const bottomResults = results.slice(-5).reverse();
    
    displayResultSet(topResults, 'topProfitableResults');
    displayResultSet(bottomResults, 'leastProfitableResults');
}

// Display a set of results in the specified table
function displayResultSet(results, tableId) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';
    
    results.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.params.stop_loss_pct.toFixed(1)}</td>
            <td>${result.params.take_profit_pct.toFixed(1)}</td>
            <td>${result.params.max_holding_periods}</td>
            <td class="${result.totalProfit >= 0 ? 'text-success' : 'text-danger'}">
                ${result.totalProfit.toFixed(2)}%
            </td>
            <td>${result.winRate.toFixed(2)}%</td>
            <td>
                <button class="btn btn-sm btn-primary apply-params" 
                        data-stop-loss="${result.params.stop_loss_pct}"
                        data-take-profit="${result.params.take_profit_pct}"
                        data-max-holding="${result.params.max_holding_periods}">
                    Apply
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add click handlers for Apply buttons
    tbody.querySelectorAll('.apply-params').forEach(button => {
        button.addEventListener('click', () => {
            applyParameters({
                stop_loss_pct: parseFloat(button.dataset.stopLoss),
                take_profit_pct: parseFloat(button.dataset.takeProfit),
                max_holding_periods: parseInt(button.dataset.maxHolding)
            });
        });
    });
}

// Apply selected parameters to the form
function applyParameters(params) {
    document.getElementById('stop_loss_pct').value = params.stop_loss_pct;
    document.getElementById('take_profit_pct').value = params.take_profit_pct;
    document.getElementById('max_holding_periods').value = params.max_holding_periods;
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('optimizationModal'));
    modal.hide();
}

// Get current backtest parameters from the form
function getBacktestParams() {
    return {
        initial_portfolio_size: parseFloat(document.getElementById('initial_portfolio_size').value),
        commission: parseFloat(document.getElementById('commission').value),
        slippage: parseFloat(document.getElementById('slippage').value),
        entry_delay: parseInt(document.getElementById('entry_delay').value),
        // Add required parameters from the form
        symbol: document.getElementById('symbol').value.toUpperCase(),
        days: document.getElementById('days').value,
        interval: document.getElementById('interval').value,
        body_size_ratio: document.getElementById('body_size_ratio').value,
        lower_shadow_ratio: document.getElementById('lower_shadow_ratio').value,
        upper_shadow_ratio: document.getElementById('upper_shadow_ratio').value,
        ma_period: document.getElementById('ma_period').value,
        require_green: document.getElementById('require_green').checked,
        // Get patterns from hammer strategy
        patterns: window.hammerStrategy?.dataManager.getFilteredPatterns() || []
    };
}

// Update optimization progress
function updateOptimizationProgress(current, total) {
    const percentage = Math.min(100, Math.round((current / total) * 100));
    const loader = document.getElementById('optimizationLoader');
    if (loader) {
        loader.querySelector('.mt-3').textContent = 
            `Running optimization... ${percentage}% complete`;
    }
}

// Export functions
export {
    initOptimization
}; 