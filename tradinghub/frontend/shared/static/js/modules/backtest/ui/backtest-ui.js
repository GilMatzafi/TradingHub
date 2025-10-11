/**
 * Backtest UI Module
 * Handles all UI updates: buttons, loading states, help text, etc.
 */

/**
 * Update UI elements based on position type
 */
export function updateBacktestUI(positionType) {
    const button = document.getElementById('runBacktest');
    const helpText = document.getElementById('position_type_help');
    
    if (positionType === 'short') {
        button.innerHTML = '<i class="bi bi-arrow-down-circle me-2"></i>Run Short Backtest';
        button.className = 'btn btn-danger';
        if (helpText) {
            helpText.textContent = 'Short: Sell when pattern detected, profit when price goes down. Stop loss when price goes UP (bad for short).';
        }
    } else {
        button.innerHTML = '<i class="bi bi-play-fill me-2"></i>Run Backtest';
        button.className = 'btn btn-primary';
        if (helpText) {
            helpText.textContent = 'Long: Buy when pattern detected, profit when price goes up. Short: Sell when pattern detected, profit when price goes down.';
        }
    }
}

/**
 * Show loading indicator with fade-in effect
 */
export function showLoading() {
    const loading = document.querySelector('.loading');
    if (!loading) return;
    
    loading.style.display = 'block';
    loading.style.opacity = '0';
    setTimeout(() => loading.style.opacity = '1', 50);
    
    return loading;
}

/**
 * Hide loading indicator with fade-out effect
 */
export function hideLoading(loading) {
    if (!loading) return;
    
    loading.style.opacity = '0';
    setTimeout(() => loading.style.display = 'none', 300);
}

/**
 * Show backtest results section
 */
export function showBacktestResults() {
    const resultsSection = document.getElementById('backtest-results');
    if (resultsSection) {
        resultsSection.classList.remove('d-none');
    }
}

/**
 * Hide backtest results section
 */
export function hideBacktestResults() {
    const resultsSection = document.getElementById('backtest-results');
    if (resultsSection) {
        resultsSection.classList.add('d-none');
    }
}

/**
 * Setup UI event listeners
 */
export function setupUIListeners(onRunBacktest, onPositionTypeChange) {
    // Single backtest button that reads position type from selector
    document.getElementById('runBacktest')?.addEventListener('click', function() {
        const positionType = document.getElementById('position_type')?.value || 'long';
        onRunBacktest(positionType);
    });
    
    // Update button text and help text when position type changes
    document.getElementById('position_type')?.addEventListener('change', function() {
        const positionType = this.value;
        updateBacktestUI(positionType);
        onPositionTypeChange?.(positionType);
    });
}

