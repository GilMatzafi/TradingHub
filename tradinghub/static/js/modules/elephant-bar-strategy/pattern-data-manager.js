/**
 * PatternDataManager - Handles data management and CSV operations for the elephant bar strategy
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
     * Convert patterns to CSV format
     * @returns {string} - CSV string
     */
    convertToCSV() {
        // CSV header
        const headers = ['Date & Time (Israel)', 'Trend', 'Open', 'High', 'Low', 'Close'];
        
        // Convert patterns to CSV rows
        const rows = this.patternsData.map(pattern => [
            pattern.date,
            pattern.trend,
            pattern.open.toFixed(2),
            pattern.high.toFixed(2),
            pattern.low.toFixed(2),
            pattern.close.toFixed(2)
        ]);
        
        // Combine headers and rows
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }

    /**
     * Download patterns as CSV file
     */
    downloadCSV() {
        // Create CSV content
        const csv = this.convertToCSV();
        
        // Create blob and download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        // Create download URL
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, 'elephant_bar_patterns.csv');
        } else {
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'elephant_bar_patterns.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
} 