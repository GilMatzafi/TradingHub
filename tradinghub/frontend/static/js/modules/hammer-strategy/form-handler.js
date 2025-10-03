/**
 * FormHandler - Handles form submission and API interactions for the hammer strategy
 */
export class FormHandler {
    /**
     * @param {PatternDataManager} patternDataManager - Instance of PatternDataManager
     * @param {ResultsRenderer} resultsRenderer - Instance of ResultsRenderer
     */
    constructor(patternDataManager, resultsRenderer) {
        this.patternDataManager = patternDataManager;
        this.resultsRenderer = resultsRenderer;
        this.strategyForm = document.getElementById('strategyForm');
        
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners for form elements
     */
    initializeEventListeners() {
        // Add event listener for the volume filter toggle
        const useVolumeFilter = document.getElementById('use_volume_filter');
        if (useVolumeFilter) {
            useVolumeFilter.addEventListener('change', function() {
                const volumeParams = document.getElementById('volume-params');
                if (this.checked) {
                    volumeParams.style.display = 'block';
                } else {
                    volumeParams.style.display = 'none';
                }
            });
        }
        
        // Add event listener for download CSV button
        const downloadCSVButton = document.getElementById('downloadCSV');
        if (downloadCSVButton) {
            downloadCSVButton.addEventListener('click', () => this.patternDataManager.downloadCSV());
        }
        
        // Add event listener for form submission
        if (this.strategyForm) {
            this.strategyForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    /**
     * Collect form data
     * @returns {Object} - Form data object
     */
    collectFormData() {
        const formData = {
            symbol: document.getElementById('symbol').value.toUpperCase(),
            days: document.getElementById('days').value,
            interval: document.getElementById('interval').value,
            body_size_ratio: document.getElementById('body_size_ratio').value,
            lower_shadow_ratio: document.getElementById('lower_shadow_ratio').value,
            upper_shadow_ratio: document.getElementById('upper_shadow_ratio').value,
            ma_period: document.getElementById('ma_period').value,
            require_green: document.getElementById('require_green').checked
        };
        
        // Add volume parameters only if volume filter is enabled
        const useVolumeFilter = document.getElementById('use_volume_filter');
        if (useVolumeFilter && useVolumeFilter.checked) {
            formData.min_relative_volume = document.getElementById('min_relative_volume').value;
            formData.volume_lookback = document.getElementById('volume_lookback').value;
        }
        
        return formData;
    }

    /**
     * Handle form submission
     * @param {Event} e - Form submission event
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        // Show loading state
        this.resultsRenderer.toggleLoadingState(true);
        
        // Clear previous results
        this.resultsRenderer.updateResultsTable([]);
        
        try {
            // Get form data
            const formData = this.collectFormData();
            
            // Send analysis request
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Store the patterns for backtesting
            this.patternDataManager.setPatterns(data.patterns);
            
            // Update results table
            this.resultsRenderer.updateResultsTable(data.patterns);
            
            // Show results content
            this.resultsRenderer.toggleLoadingState(false);
            
            // Scroll to results
            this.resultsRenderer.scrollToResults();
            
        } catch (error) {
            console.error('Error:', error);
            
            // Handle rate limiting specifically
            if (error.message.includes('Rate limited') || error.message.includes('Too Many Requests')) {
                const rateLimitMessage = `Rate limited by Yahoo Finance API. Please wait a few minutes before trying again. 
                Tips to avoid rate limiting:
                • Use longer time intervals (1h, 1d instead of 1m, 5m)
                • Reduce the number of days to analyze
                • Wait 1-2 minutes between requests`;
                this.resultsRenderer.showError(rateLimitMessage);
            } else {
                this.resultsRenderer.showError(`Error analyzing patterns: ${error.message}`);
            }
            
            this.resultsRenderer.toggleLoadingState(false);
        }
    }
} 