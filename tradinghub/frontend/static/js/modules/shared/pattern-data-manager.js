/**
 * Universal PatternDataManager - Works for ANY pattern (hammer, doji, shooting star, etc.)
 * Handles data management and CSV operations
 */
export class PatternDataManager {
    constructor() {
        this.patternsData = [];
        this.filteredPatterns = [];
    }

    /**
     * Set the patterns data
     * @param {Array} patterns - Array of pattern objects
     */
    setPatterns(patterns) {
        this.patternsData = patterns;
        this.filteredPatterns = patterns;
    }

    /**
     * Get the current patterns data
     * @returns {Array} - Array of pattern objects
     */
    getPatterns() {
        return this.patternsData;
    }

    /**
     * Get the filtered patterns data
     * @returns {Array} - Array of filtered pattern objects
     */
    getFilteredPatterns() {
        return this.filteredPatterns;
    }

    /**
     * Filter patterns based on criteria
     * @param {Object} criteria - Filter criteria
     */
    filterPatterns(criteria) {
        this.filteredPatterns = this.patternsData.filter(pattern => {
            // Add filtering logic here if needed
            return true; // For now, return all patterns
        });
    }

    /**
     * Export patterns to CSV
     * @param {Array} patterns - Patterns to export (defaults to filtered patterns)
     */
    exportToCSV(patterns = this.filteredPatterns) {
        if (!patterns || patterns.length === 0) {
            alert('No patterns to export');
            return;
        }

        // Get the pattern column name based on the pattern type
        const patternColumn = this.getPatternColumnName();
        
        // Define CSV headers
        const headers = [
            'Date & Time (Israel)',
            'Trend',
            'Open',
            'High',
            'Low',
            'Close',
            'Volume',
            'Pattern Detected'
        ];

        // Create CSV content
        let csvContent = headers.join(',') + '\n';

        patterns.forEach(pattern => {
            const row = [
                pattern.datetime || '',
                pattern.trend || '',
                pattern.open || '',
                pattern.high || '',
                pattern.low || '',
                pattern.close || '',
                pattern.volume || '',
                pattern[patternColumn] ? 'Yes' : 'No'
            ];
            csvContent += row.join(',') + '\n';
        });

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${this.getPatternType()}_patterns.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Get the pattern column name (to be overridden by pattern-specific classes)
     * @returns {string} Pattern column name
     */
    getPatternColumnName() {
        // Default implementation - try to detect from URL or use generic
        const path = window.location.pathname;
        if (path.includes('/hammer')) {
            return 'is_hammer';
        } else if (path.includes('/doji')) {
            return 'is_doji';
        } else if (path.includes('/shooting_star')) {
            return 'is_shooting_star';
        }
        return 'is_pattern';
    }

    /**
     * Get the pattern type (to be overridden by pattern-specific classes)
     * @returns {string} Pattern type
     */
    getPatternType() {
        // Default implementation - try to detect from URL or use generic
        const path = window.location.pathname;
        if (path.includes('/hammer')) {
            return 'hammer';
        } else if (path.includes('/doji')) {
            return 'doji';
        } else if (path.includes('/shooting_star')) {
            return 'shooting_star';
        }
        return 'pattern';
    }

    /**
     * Get pattern statistics
     * @returns {Object} Pattern statistics
     */
    getPatternStatistics() {
        const patterns = this.getFilteredPatterns();
        const totalPatterns = patterns.length;
        const bullishPatterns = patterns.filter(p => p.trend === 'Bullish').length;
        const bearishPatterns = patterns.filter(p => p.trend === 'Bearish').length;

        return {
            total: totalPatterns,
            bullish: bullishPatterns,
            bearish: bearishPatterns,
            bullishPercentage: totalPatterns > 0 ? (bullishPatterns / totalPatterns * 100).toFixed(1) : 0,
            bearishPercentage: totalPatterns > 0 ? (bearishPatterns / totalPatterns * 100).toFixed(1) : 0
        };
    }
}
