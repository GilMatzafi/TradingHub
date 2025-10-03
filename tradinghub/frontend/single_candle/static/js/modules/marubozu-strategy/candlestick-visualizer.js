/**
 * Marubozu Candlestick Visualizer
 * Handles Marubozu-specific candlestick visualization and parameter updates
 */

import { CandlestickVisualizer } from '../shared/candlestick-visualizer.js';

export class MarubozuCandlestickVisualizer extends CandlestickVisualizer {
    constructor() {
        super('marubozu');
    }

    initialize() {
        this.initializeEventListeners();
        this.updateVisualization();
        console.log('🔴 Marubozu visualizer: Initialized');
    }

    initializeEventListeners() {
        // Body ratio slider
        const bodyRatioSlider = document.getElementById('min_body_ratio');
        if (bodyRatioSlider) {
            bodyRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('min_body_ratio_value', e.target.value);
                this.updateVisualization();
            });
        }

        // Shadow ratio slider
        const shadowRatioSlider = document.getElementById('max_shadow_ratio');
        if (shadowRatioSlider) {
            shadowRatioSlider.addEventListener('input', (e) => {
                this.updateRangeValue('max_shadow_ratio_value', e.target.value);
                this.updateVisualization();
            });
        }

        // MA period slider
        const maPeriodSlider = document.getElementById('ma_period');
        if (maPeriodSlider) {
            maPeriodSlider.addEventListener('input', (e) => {
                this.updateRangeValue('ma_period_value', e.target.value);
            });
        }

        // Volume checkbox
        const volumeCheckbox = document.getElementById('require_high_volume');
        if (volumeCheckbox) {
            volumeCheckbox.addEventListener('change', (e) => {
                this.toggleVolumeControls(e.target.checked);
            });
        }

        // Volume threshold slider
        const volumeThresholdSlider = document.getElementById('min_relative_volume');
        if (volumeThresholdSlider) {
            volumeThresholdSlider.addEventListener('input', (e) => {
                this.updateRangeValue('min_relative_volume_value', e.target.value);
            });
        }

        // Volume lookback slider
        const volumeLookbackSlider = document.getElementById('volume_lookback');
        if (volumeLookbackSlider) {
            volumeLookbackSlider.addEventListener('input', (e) => {
                this.updateRangeValue('volume_lookback_value', e.target.value);
            });
        }
    }

    updateVisualization() {
        const bodyRatio = parseFloat(document.getElementById('min_body_ratio')?.value || 0.9);
        const shadowRatio = parseFloat(document.getElementById('max_shadow_ratio')?.value || 0.05);
        
        this.updateMarubozuCandlestick(bodyRatio, shadowRatio);
        this.updatePatternInfo(bodyRatio, shadowRatio);
        this.logVisualizationUpdate(bodyRatio, shadowRatio);
    }

    updateMarubozuCandlestick(bodyRatio, shadowRatio) {
        const upperShadow = document.getElementById('upperShadow');
        const lowerShadow = document.getElementById('lowerShadow');
        const body = document.getElementById('candlestickBody');
        const bodyFill = document.getElementById('bodyFill');

        if (upperShadow && lowerShadow && body && bodyFill) {
            // Calculate heights based on ratios
            const totalHeight = 150; // Total candlestick height
            const bodyHeight = totalHeight * bodyRatio;
            const shadowHeight = totalHeight * shadowRatio;
            
            // Update body height (should be very large for Marubozu)
            body.style.height = `${bodyHeight}px`;
            
            // Update shadow heights (should be very small for Marubozu)
            upperShadow.style.height = `${shadowHeight}px`;
            lowerShadow.style.height = `${shadowHeight}px`;
            
            // Update body color based on strength
            const strength = bodyRatio;
            if (strength >= 0.95) {
                bodyFill.style.background = 'linear-gradient(135deg, #dc3545, #e83e8c)'; // Very strong - red
            } else if (strength >= 0.9) {
                bodyFill.style.background = 'linear-gradient(135deg, #fd7e14, #ffc107)'; // Strong - orange
            } else {
                bodyFill.style.background = 'linear-gradient(135deg, #28a745, #20c997)'; // Good - green
            }
        }
    }

    updatePatternInfo(bodyRatio, shadowRatio) {
        const bodySizeDisplay = document.getElementById('bodySizeDisplay');
        const upperShadowDisplay = document.getElementById('upperShadowDisplay');
        const lowerShadowDisplay = document.getElementById('lowerShadowDisplay');
        const patternTypeDisplay = document.getElementById('patternTypeDisplay');

        if (bodySizeDisplay) {
            bodySizeDisplay.textContent = `${(bodyRatio * 100).toFixed(0)}%`;
        }
        
        if (upperShadowDisplay) {
            upperShadowDisplay.textContent = `${(shadowRatio * 100).toFixed(0)}%`;
        }
        
        if (lowerShadowDisplay) {
            lowerShadowDisplay.textContent = `${(shadowRatio * 100).toFixed(0)}%`;
        }
        
        if (patternTypeDisplay) {
            if (bodyRatio >= 0.95) {
                patternTypeDisplay.textContent = 'Very Strong Momentum';
            } else if (bodyRatio >= 0.9) {
                patternTypeDisplay.textContent = 'Strong Momentum';
            } else {
                patternTypeDisplay.textContent = 'Good Momentum';
            }
        }
    }

    toggleVolumeControls(show) {
        const volumeThresholdSection = document.getElementById('volume_threshold_section');
        const volumeLookbackSection = document.getElementById('volume_lookback_section');
        
        if (volumeThresholdSection) {
            volumeThresholdSection.style.display = show ? 'block' : 'none';
        }
        
        if (volumeLookbackSection) {
            volumeLookbackSection.style.display = show ? 'block' : 'none';
        }
    }

    updateRangeValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    logVisualizationUpdate(bodyRatio, shadowRatio) {
        console.log('🔴 Marubozu visualization updated with params:', {
            bodyRatio: bodyRatio,
            shadowRatio: shadowRatio,
            bodyHeight: `${(bodyRatio * 100).toFixed(0)}%`,
            shadowHeight: `${(shadowRatio * 100).toFixed(0)}%`,
            patternStrength: bodyRatio >= 0.95 ? 'Very Strong' : bodyRatio >= 0.9 ? 'Strong' : 'Good'
        });
    }

    getPatternSpecificParameters() {
        return [
            'min_body_ratio',
            'max_shadow_ratio',
            'ma_period',
            'require_high_volume',
            'min_relative_volume',
            'volume_lookback'
        ];
    }
}
