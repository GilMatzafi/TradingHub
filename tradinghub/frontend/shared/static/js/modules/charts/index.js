/**
 * Charts Module - Main Entry Point
 * Central export for all chart-related functionality
 * 
 * Architecture:
 * - core/        → State management, utilities, chart manager
 * - components/  → Specific chart implementations (candlestick, portfolio, strategy)
 * - ui/          → User interface interactions
 */

// Core functionality
export * from './core/index.js';

// Chart components
export * from './components/index.js';

// UI functionality
export * from './ui/index.js';

