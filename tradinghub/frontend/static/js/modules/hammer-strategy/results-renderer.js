/**
 * ResultsRenderer - Handles rendering of results and UI updates for the hammer strategy
 */
export class ResultsRenderer {
    constructor() {
        this.initializeElements();
    }

    /**
     * Initialize DOM elements needed for rendering
     */
    initializeElements() {
        this.analysisResults = document.getElementById('analysisResults');
        this.backtestSection = document.getElementById('backtestSection');
        this.loadingIndicator = document.querySelector('.loading');
        this.resultsContent = document.getElementById('results');
        this.resultsBody = document.getElementById('resultsBody');
        this.patternCount = document.querySelector('.pattern-count');
        this.downloadCSVButton = document.getElementById('downloadCSV');
    }

    /**
     * Update the results table with pattern data
     * @param {Array} patterns - Array of pattern objects
     */
    updateResultsTable(patterns) {
        if (patterns && patterns.length > 0) {
            this.patternCount.textContent = `Found ${patterns.length} pattern(s)`;
            this.downloadCSVButton.style.display = 'block';
            
            this.resultsBody.innerHTML = patterns.map(pattern => `
                <tr>
                    <td>${pattern.date}</td>
                    <td>${pattern.trend}</td>
                    <td>${pattern.open.toFixed(2)}</td>
                    <td>${pattern.high.toFixed(2)}</td>
                    <td>${pattern.low.toFixed(2)}</td>
                    <td>${pattern.close.toFixed(2)}</td>
                </tr>
            `).join('');
        } else {
            this.patternCount.textContent = 'No patterns found';
            this.downloadCSVButton.style.display = 'none';
            this.resultsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No patterns found in the selected timeframe</td>
                </tr>
            `;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.patternCount.textContent = message;
        this.patternCount.style.color = 'var(--danger-color)';
        this.patternCount.style.opacity = '0';
        setTimeout(() => this.patternCount.style.opacity = '1', 50);
    }

    /**
     * Toggle loading state
     * @param {boolean} isLoading - Whether to show loading state
     */
    toggleLoadingState(isLoading) {
        if (isLoading) {
            this.analysisResults.classList.remove('d-none');
            this.loadingIndicator.style.display = 'block';
            this.resultsContent.style.display = 'none';
            this.backtestSection.classList.remove('d-none');
        } else {
            this.loadingIndicator.style.display = 'none';
            this.resultsContent.style.display = 'block';
        }
    }

    /**
     * Scroll to results section
     */
    scrollToResults() {
        this.analysisResults.scrollIntoView({ behavior: 'smooth' });
    }
} 