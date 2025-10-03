# Frontend Structure

This folder contains all frontend-related files for the TradingHub application.

## 📁 Folder Structure

```
frontend/
├── static/                    # Static assets (CSS, JS, images)
│   ├── css/                  # Stylesheets
│   │   ├── main.css         # Main stylesheet
│   │   └── modules/         # Modular CSS files
│   └── js/                  # JavaScript files
│       ├── main.js          # Main JavaScript entry point
│       └── modules/         # Modular JavaScript files
│           ├── backtest/    # Backtest functionality (universal)
│           ├── charts/      # Chart components (universal)
│           ├── shared/      # Shared components (universal)
│           ├── hammer-strategy/    # Hammer-specific components
│           ├── doji-strategy/      # Doji-specific components
│           └── elephant-bar-strategy/ # Elephant bar-specific components
└── templates/               # HTML templates
    ├── base.html           # Base template
    ├── shared/             # Shared templates
    ├── hammer_analyzer/    # Hammer pattern templates
    ├── doji_analyzer/      # Doji pattern templates
    └── elephant_bar_analyzer/ # Elephant bar pattern templates
```

## 🎯 Modular Architecture

### ✅ Universal Components (Work for ALL patterns):
- **Backtest Engine**: `js/modules/backtest/` - Same for all patterns
- **Charts**: `js/modules/charts/` - Same for all patterns  
- **Shared Components**: `js/modules/shared/` - Same for all patterns
- **Base Templates**: `templates/shared/` - Same for all patterns

### 🎨 Pattern-Specific Components (Only what's different):
- **Hammer**: `js/modules/hammer-strategy/`, `templates/hammer_analyzer/`
- **Doji**: `js/modules/doji-strategy/`, `templates/doji_analyzer/`
- **Elephant Bar**: `js/modules/elephant-bar-strategy/`, `templates/elephant_bar_analyzer/`

## 🚀 Benefits

1. **Clear Separation**: Frontend and backend are clearly separated
2. **Easy Maintenance**: All frontend code in one place
3. **Modular Design**: Universal components eliminate code duplication
4. **Scalable**: Easy to add new patterns without duplicating code
5. **Organized**: Logical folder structure for easy navigation

## 📝 Adding New Patterns

To add a new pattern (e.g., "Engulfing"):

1. **Backend**: Create pattern detection logic
2. **Frontend**: Create only pattern-specific components:
   - `js/modules/engulfing-strategy/candlestick-visualizer.js`
   - `templates/engulfing_analyzer/components/pattern_params.html`
   - `templates/engulfing_analyzer/components/candlestick.html`

Everything else (backtest, analysis, forms) works automatically!
