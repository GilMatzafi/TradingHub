# Backend Structure

This folder contains all backend-related code for the TradingHub application.

## 📁 Folder Structure

```
backend/
├── patterns/              # Pattern detection logic
│   ├── base_pattern.py   # Base pattern class
│   ├── hammer_pattern.py # Hammer pattern detection
│   └── elephant_bar_pattern.py # Elephant bar pattern detection
├── services/             # Business logic services
│   ├── stock_service.py  # Stock data and analysis service
│   └── backtest_service.py # Backtest orchestration service
├── controllers/          # API controllers
│   ├── analyze_controller.py # Analysis API endpoints
│   └── backtest_controller.py # Backtest API endpoints
├── models/              # Data models and DTOs
│   └── dto/             # Data Transfer Objects
│       ├── pattern_params.py
│       ├── analysis_results.py
│       ├── backtest_params.py
│       ├── trade_params.py
│       └── trade_results.py
├── backtest/            # Backtest engine
│   ├── base_backtest.py # Base backtest class
│   ├── hammer_backtest.py # Hammer backtest implementation
│   ├── trade_executor.py # Trade execution logic
│   └── performance_analyzer.py # Performance metrics
├── config/              # Configuration
│   ├── config.py        # App configuration
│   └── pattern_registry.py # Pattern registry
├── routes/              # API routes
│   └── main.py          # Main API endpoints
└── utils/               # Utility functions
    ├── candlestick_utils.py # Candlestick calculations
    └── time_utils.py    # Time conversion utilities
```

## 🎯 Architecture

### **Pattern Detection Layer**
- **Base Pattern**: Abstract base class for all patterns
- **Specific Patterns**: Hammer, Doji, Shooting Star, etc.
- **Pattern Registry**: Central configuration for all patterns

### **Service Layer**
- **Stock Service**: Handles data fetching and pattern analysis
- **Backtest Service**: Orchestrates backtesting for different patterns

### **Controller Layer**
- **Analysis Controller**: Handles pattern analysis API requests
- **Backtest Controller**: Handles backtest API requests

### **Route Layer**
- **Main Routes**: API endpoint definitions and routing logic

### **Model Layer**
- **DTOs**: Data Transfer Objects for API communication
- **Trade Models**: Trade execution and results models

### **Backtest Engine**
- **Base Backtest**: Abstract base class for all backtests
- **Trade Executor**: Handles individual trade execution
- **Performance Analyzer**: Calculates performance metrics

## 🚀 Benefits

1. **Clear Separation**: Backend and frontend are completely separated
2. **Modular Design**: Each component has a specific responsibility
3. **Easy Testing**: Each layer can be tested independently
4. **Scalable**: Easy to add new patterns and features
5. **Maintainable**: Clear structure makes code easy to understand

## 📝 Adding New Patterns

To add a new pattern (e.g., "Engulfing"):

1. **Pattern Detection**: Create `patterns/engulfing_pattern.py`
2. **Backtest**: Create `backtest/engulfing_backtest.py`
3. **Registry**: Add to `config/pattern_registry.py`
4. **Frontend**: Add pattern-specific components (visualization, parameters)

The service layer automatically handles the new pattern through the registry system.
