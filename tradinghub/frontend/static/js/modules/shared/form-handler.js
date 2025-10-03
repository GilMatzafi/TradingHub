/**
 * Universal FormHandler - Works for ANY pattern (hammer, doji, shooting star, etc.)
 * Handles form submission and API interactions
 */
export class FormHandler {
    /**
     * @param {PatternDataManager} patternDataManager - Instance of PatternDataManager
     * @param {ResultsRenderer} resultsRenderer - Instance of ResultsRenderer
     * @param {string} patternType - The pattern type (hammer, doji, shooting_star, etc.)
     */
    constructor(patternDataManager, resultsRenderer, patternType) {
        this.patternDataManager = patternDataManager;
        this.resultsRenderer = resultsRenderer;
        this.patternType = patternType;
        this.strategyForm = document.getElementById('strategyForm');
        
        console.log('FormHandler constructor:', {
            patternType: this.patternType,
            formFound: !!this.strategyForm,
            formElement: this.strategyForm
        });
        
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

        // Add event listener for the require high volume toggle
        const requireHighVolume = document.getElementById('require_high_volume');
        if (requireHighVolume) {
            requireHighVolume.addEventListener('change', function() {
                const volumeParams = document.getElementById('volume-params');
                if (this.checked) {
                    volumeParams.style.display = 'block';
                } else {
                    volumeParams.style.display = 'none';
                }
            });
        }

        // Add event listener for the strategy form
        if (this.strategyForm) {
            console.log('Adding submit event listener to form');
            this.strategyForm.addEventListener('submit', (event) => {
                console.log('Form submit event triggered!');
                event.preventDefault();
                this.handleSubmit();
            });
        } else {
            console.error('Strategy form not found! Form element:', this.strategyForm);
        }

        // Add event listeners for parameter changes to update visualization
        this.addParameterChangeListeners();
    }

    /**
     * Add event listeners for parameter changes (pattern-specific)
     */
    addParameterChangeListeners() {
        // Common parameters that all patterns might have
        const commonParams = ['body_size_ratio', 'ma_period'];
        
        commonParams.forEach(paramId => {
            const element = document.getElementById(paramId);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateVisualization();
                });
            }
        });

        // Pattern-specific parameters
        const patternSpecificParams = this.getPatternSpecificParams();
        patternSpecificParams.forEach(paramId => {
            const element = document.getElementById(paramId);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateVisualization();
                });
            }
        });
    }

    /**
     * Get pattern-specific parameters (to be overridden by pattern-specific classes)
     * @returns {Array} Array of parameter IDs
     */
    getPatternSpecificParams() {
        // Try to get pattern-specific parameters from the visualizer
        const strategy = window[`${this.patternType}Strategy`];
        if (strategy && strategy.visualizer && strategy.visualizer.getPatternSpecificParameters) {
            return strategy.visualizer.getPatternSpecificParameters();
        }
        
        // Fallback to default implementation for hammer patterns
        const commonPatternParams = ['lower_shadow_ratio', 'upper_shadow_ratio', 'require_green'];
        return commonPatternParams.filter(param => this.parameterExists(param));
    }

    /**
     * Check if a parameter exists in the DOM
     * @param {string} paramId - Parameter ID to check
     * @returns {boolean} Whether parameter exists
     */
    parameterExists(paramId) {
        return document.getElementById(paramId) !== null;
    }

    /**
     * Update visualization (to be overridden by pattern-specific classes)
     */
    updateVisualization() {
        // Default implementation - can be overridden
        console.log('Visualization update requested for pattern:', this.patternType);
    }

    /**
     * Handle form submission
     */
    async handleSubmit() {
        console.log('handleSubmit called');
        try {
            // Show loading indicator
            this.resultsRenderer.showLoading();

            // Collect form data
            const formData = await this.collectFormData();
            console.log('Form data collected:', formData);

            // Send analysis request
            await this.sendAnalysisRequest(formData);

        } catch (error) {
            console.error('Form submission error:', error);
            this.resultsRenderer.showError('Error analyzing patterns: ' + error.message);
        }
    }

    /**
     * Collect form data - Universal for all patterns
     */
    async collectFormData() {
        return new Promise((resolve) => {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                const formData = {
                    symbol: document.getElementById('symbol').value.toUpperCase(),
                    days: document.getElementById('days').value,
                    interval: document.getElementById('interval').value,
                    pattern_type: this.patternType
                };

                // Add pattern-specific parameters (only if they exist)
                const patternParams = this.getAllPatternParams();
                patternParams.forEach(param => {
                    const element = document.getElementById(param);
                    if (element) {
                        if (element.type === 'checkbox') {
                            formData[param] = element.checked;
                        } else {
                            formData[param] = element.value;
                        }
                    }
                });

                // Add volume parameters if volume filter is enabled
                const useVolumeFilter = document.getElementById('use_volume_filter');
                const requireHighVolume = document.getElementById('require_high_volume');
                
                if ((useVolumeFilter && useVolumeFilter.checked) || (requireHighVolume && requireHighVolume.checked)) {
                    const minRelativeVolume = document.getElementById('min_relative_volume');
                    const volumeLookback = document.getElementById('volume_lookback');
                    
                    if (minRelativeVolume) formData.min_relative_volume = minRelativeVolume.value;
                    if (volumeLookback) formData.volume_lookback = volumeLookback.value;
                }

                resolve(formData);
            }, 100);
        });
    }

    /**
     * Get all pattern parameters (common + pattern-specific)
     * @returns {Array} Array of parameter IDs
     */
    getAllPatternParams() {
        const commonParams = ['body_size_ratio', 'ma_period', 'shadow_balance_ratio', 'min_body_ratio', 'max_shadow_ratio'];
        const patternSpecificParams = this.getPatternSpecificParams();
        return [...commonParams, ...patternSpecificParams];
    }

    /**
     * Send analysis request to the server
     * @param {Object} formData - Form data to send
     */
    async sendAnalysisRequest(formData) {
        console.log('Sending analysis request to /analyze');
        
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        if (data.error) {
            throw new Error(data.error);
        }

        // Process the results
        console.log('Processing results...');
        this.resultsRenderer.hideLoading();
        this.resultsRenderer.showResults();
        this.patternDataManager.setPatterns(data.patterns);
        this.resultsRenderer.updateResultsTable(data.patterns);
        console.log('Results processing complete');
    }
}
