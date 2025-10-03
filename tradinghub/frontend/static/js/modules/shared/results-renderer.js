/**
 * Universal ResultsRenderer - Works for ANY pattern (hammer, doji, shooting star, etc.)
 * Handles rendering of results and UI updates
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
        
        console.log('ResultsRenderer: DOM elements initialized', {
            analysisResults: !!this.analysisResults,
            backtestSection: !!this.backtestSection,
            loadingIndicator: !!this.loadingIndicator,
            resultsContent: !!this.resultsContent,
            resultsBody: !!this.resultsBody,
            patternCount: !!this.patternCount,
            downloadCSVButton: !!this.downloadCSVButton
        });
    }

    /**
     * Update the results table with pattern data
     * @param {Array} patterns - Array of pattern objects
     */
    updateResultsTable(patterns) {
        if (patterns && patterns.length > 0) {
            this.patternCount.textContent = `Found ${patterns.length} pattern(s)`;
            this.downloadCSVButton.style.display = 'block';
            
            // Clear existing table content
            this.resultsBody.innerHTML = '';
            
            // Add pattern rows
            patterns.forEach(pattern => {
                const row = this.createPatternRow(pattern);
                this.resultsBody.appendChild(row);
            });
            
            // Show the results
            this.showResults();
        } else {
            this.showNoPatternsFound();
        }
    }

    /**
     * Create a table row for a pattern
     * @param {Object} pattern - Pattern object
     * @returns {HTMLElement} Table row element
     */
    createPatternRow(pattern) {
        const row = document.createElement('tr');
        
        // Debug: Log the pattern structure
        console.log('Pattern data structure:', pattern);
        
        // Format the date - try different possible field names
        let dateValue = pattern.datetime || pattern.date || pattern.timestamp || pattern.time;
        let formattedDate = 'Invalid Date';
        
        if (dateValue) {
            try {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    // Format as YYYY-MM-DD HH:MM
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
                }
            } catch (error) {
                console.error('Date formatting error:', error, 'for value:', dateValue);
            }
        }

        // Determine trend color - handle different trend formats
        const trend = pattern.trend || pattern.direction || 'Unknown';
        const trendColor = (trend.toLowerCase().includes('bull') || trend.toLowerCase().includes('up')) ? 'text-success' : 'text-danger';
        
        // Create table row with 6 columns (no volume column)
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td><span class="${trendColor}">${trend}</span></td>
            <td>$${parseFloat(pattern.open || pattern.Open || 0).toFixed(2)}</td>
            <td>$${parseFloat(pattern.high || pattern.High || 0).toFixed(2)}</td>
            <td>$${parseFloat(pattern.low || pattern.Low || 0).toFixed(2)}</td>
            <td>$${parseFloat(pattern.close || pattern.Close || 0).toFixed(2)}</td>
        `;
        
        return row;
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
            this.loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                this.loadingIndicator.style.opacity = '1';
            }, 50);
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                this.loadingIndicator.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Show results section
     */
    showResults() {
        console.log('ResultsRenderer: showResults called', {
            analysisResults: !!this.analysisResults,
            backtestSection: !!this.backtestSection
        });
        
        if (this.analysisResults) {
            // Remove Bootstrap's d-none class instead of setting display style
            this.analysisResults.classList.remove('d-none');
            console.log('ResultsRenderer: analysisResults shown (d-none class removed)');
        } else {
            console.error('ResultsRenderer: analysisResults element not found!');
        }
        
        if (this.backtestSection) {
            // Remove Bootstrap's d-none class instead of setting display style
            this.backtestSection.classList.remove('d-none');
            console.log('ResultsRenderer: backtestSection shown (d-none class removed)');
        } else {
            console.error('ResultsRenderer: backtestSection element not found!');
        }
    }

    /**
     * Show no patterns found message
     */
    showNoPatternsFound() {
        if (this.patternCount) {
            this.patternCount.textContent = 'No patterns found in the selected timeframe';
        }
        if (this.downloadCSVButton) {
            this.downloadCSVButton.style.display = 'none';
        }
        
        // Clear table and show message
        if (this.resultsBody) {
            this.resultsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        No patterns found in the selected timeframe
                    </td>
                </tr>
            `;
        }
        
        this.showResults();
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.hideLoading();
        
        if (this.patternCount) {
            this.patternCount.textContent = 'Analysis Error';
        }
        
        if (this.resultsBody) {
            this.resultsBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        ${message}
                    </td>
                </tr>
            `;
        }
        
        this.showResults();
    }

    /**
     * Update pattern count display
     * @param {number} count - Number of patterns
     */
    updatePatternCount(count) {
        if (this.patternCount) {
            this.patternCount.textContent = `Found ${count} pattern(s)`;
        }
    }

    /**
     * Clear all results
     */
    clearResults() {
        if (this.resultsBody) {
            this.resultsBody.innerHTML = '';
        }
        if (this.patternCount) {
            this.patternCount.textContent = '';
        }
        if (this.downloadCSVButton) {
            this.downloadCSVButton.style.display = 'none';
        }
    }
}
