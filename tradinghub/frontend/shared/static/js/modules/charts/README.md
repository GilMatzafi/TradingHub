# Charts Module - Clean Architecture

A professional, modular charting system built with **component-based architecture**.

## 📁 Project Structure

```
/charts/
├── index.js                    ← Main entry point (barrel export)
│
├── core/                       ← Core Functionality
│   ├── index.js                - Barrel export
│   ├── chartManager.js         (138 lines) - Chart lifecycle management
│   ├── chartState.js           (75 lines) - Centralized state
│   └── chartUtils.js           (50 lines) - Formatting & utilities
│
├── components/                 ← Chart Components
│   ├── index.js                - Barrel export (all components)
│   │
│   ├── candlestick/            ← Candlestick Charts
│   │   ├── index.js            - Barrel export
│   │   ├── backtestCandlestickChart.js  (108 lines) - Main component
│   │   ├── candlestick-data.js          (154 lines) - Data transformation
│   │   └── candlestick-lightweight.js   (126 lines) - Lightweight Charts renderer
│   │
│   ├── portfolio/              ← Portfolio Performance Charts
│   │   ├── index.js            - Barrel export
│   │   ├── portfolioChart.js   (184 lines) - Main component
│   │   ├── portfolio-data.js   (72 lines) - Data processing
│   │   └── portfolio-ui.js     (104 lines) - UI management
│   │
│   └── strategy/               ← Strategy Performance Charts
│       ├── index.js            - Barrel export
│       ├── strategyPerformanceChart.js  (177 lines) - Main component
│       ├── strategy-data.js             (67 lines) - Data analysis
│       └── strategy-ui.js               (79 lines) - UI controls
│
└── ui/                         ← User Interface Layer
    ├── index.js                - Barrel export
    └── chartUI.js              (148 lines) - Chart UI interactions
```

**Total**: 20 files, ~1,600 lines of clean, modular code

---

## 🎯 Architecture Principles

### 1. Component-Based Organization

Each chart type is **self-contained** in its own folder:

```
components/
├── candlestick/  ← Everything related to candlestick charts
├── portfolio/    ← Everything related to portfolio charts
└── strategy/     ← Everything related to strategy charts
```

**Benefits:**
- ✅ Easy to find related code
- ✅ Clear ownership and responsibility
- ✅ Simple to add new chart types
- ✅ Independent testing per component

### 2. Separation of Concerns

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Core** | State, lifecycle, utilities | `chartManager`, `chartState` |
| **Components** | Chart-specific logic | `portfolioChart`, `candlestickChart` |
| **UI** | User interactions | Button handlers, modals |

### 3. Data Flow

```
User Action (UI)
    ↓
Chart Manager (Core)
    ↓
Chart Component (Components)
    ↓
Chart Renderer (Lightweight Charts / Chart.js)
```

---

## 🔗 Barrel Exports (Clean Imports)

Every folder has an **`index.js`** file for clean imports:

### Example: Before vs After

```javascript
// ❌ WITHOUT barrel exports (verbose)
import { PortfolioChart } from '../charts/components/portfolio/portfolioChart.js';
import { StrategyPerformanceChart } from '../charts/components/strategy/strategyPerformanceChart.js';
import { BacktestCandlestickChart } from '../charts/components/candlestick/backtestCandlestickChart.js';
import { formatCurrency } from '../charts/core/chartUtils.js';

// ✅ WITH barrel exports (clean)
import { 
    PortfolioChart, 
    StrategyPerformanceChart,
    BacktestCandlestickChart,
    formatCurrency
} from '../charts/index.js';
```

### Available Barrel Exports

| File | Exports |
|------|---------|
| `charts/index.js` | All chart functionality |
| `core/index.js` | State, manager, utilities |
| `components/index.js` | All chart components |
| `components/candlestick/index.js` | Candlestick chart |
| `components/portfolio/index.js` | Portfolio chart |
| `components/strategy/index.js` | Strategy chart |
| `ui/index.js` | UI interactions |

---

## 🚀 Usage

### Quick Start

```javascript
// Import everything from one place
import { 
    PortfolioChart, 
    initPortfolioChart,
    formatCurrency 
} from './charts/index.js';

// Initialize a portfolio chart
const portfolioData = [...];
initPortfolioChart(portfolioData);
```

### Component-Specific Import

```javascript
// Import only what you need from a specific component
import { 
    BacktestCandlestickChart,
    renderLightweightCharts 
} from './charts/components/candlestick/index.js';

const chart = new BacktestCandlestickChart();
chart.initialize(stockData, trades);
```

### Using Core Utilities

```javascript
// Import core utilities
import { 
    formatCurrency, 
    formatPercent,
    defaultChartOptions 
} from './charts/core/index.js';

const formatted = formatCurrency(1234.56); // "$1,234.56"
```

---

## 📊 Chart Components

### 1️⃣ Candlestick Chart

**Purpose:** Display stock price movements with trade markers

**Files:**
- `backtestCandlestickChart.js` - Main chart component
- `candlestick-data.js` - Data transformation utilities
- `candlestick-lightweight.js` - Lightweight Charts renderer

**Usage:**
```javascript
import { BacktestCandlestickChart } from './charts/index.js';

const chart = new BacktestCandlestickChart();
chart.initialize(stockData, trades);
```

### 2️⃣ Portfolio Chart

**Purpose:** Show portfolio value over time

**Files:**
- `portfolioChart.js` - Main chart component (Chart.js)
- `portfolio-data.js` - Data filtering & calculations
- `portfolio-ui.js` - Period buttons & value indicator

**Usage:**
```javascript
import { PortfolioChart } from './charts/index.js';

const chart = new PortfolioChart();
chart.initialize(portfolioHistory);
```

### 3️⃣ Strategy Performance Chart

**Purpose:** Display hourly trading performance

**Files:**
- `strategyPerformanceChart.js` - Main chart component
- `strategy-data.js` - Hourly data aggregation
- `strategy-ui.js` - Summary stats & toggle buttons

**Usage:**
```javascript
import { StrategyPerformanceChart } from './charts/index.js';

const chart = new StrategyPerformanceChart();
chart.initialize(hourlyPerformance);
```

---

## 🧩 Core Modules

### Chart Manager

**Purpose:** Manage chart lifecycle (create, destroy)

```javascript
import { 
    initPortfolioChart,
    destroyPortfolioChart,
    destroyAllCharts 
} from './charts/index.js';

// Initialize chart
initPortfolioChart(data);

// Clean up
destroyAllCharts();
```

### Chart State

**Purpose:** Centralized state management for charts

```javascript
import { setChartData, getChartData } from './charts/index.js';

// Store chart data
setChartData({ portfolioHistory, trades });

// Retrieve chart data
const data = getChartData();
```

### Chart Utils

**Purpose:** Formatting utilities

```javascript
import { 
    formatCurrency,
    formatPercent,
    formatNumber 
} from './charts/index.js';

formatCurrency(1234.56);  // "$1,234.56"
formatPercent(0.1523);    // "15.23%"
formatNumber(1234567);    // "1,234,567"
```

---

## 🎨 UI Layer

**Purpose:** Handle user interactions (buttons, modals, toggles)

```javascript
import { 
    setupPortfolioChartToggle,
    setupStrategyChartToggle,
    setupCandlestickChartModal 
} from './charts/index.js';

// Setup UI interactions
setupPortfolioChartToggle();
setupStrategyChartToggle();
setupCandlestickChartModal();
```

---

## 🔄 Adding a New Chart Component

Follow this structure to add a new chart type:

```
1. Create component folder:
   components/newChart/

2. Add component files:
   - newChart.js         (main component)
   - newChart-data.js    (data processing)
   - newChart-ui.js      (UI logic)
   - index.js            (barrel export)

3. Export from components/index.js:
   export * from './newChart/index.js';

4. Done! Import from charts/index.js
```

**Example:**
```javascript
// components/newChart/index.js
export { NewChart } from './newChart.js';
export * from './newChart-data.js';
export * from './newChart-ui.js';

// components/index.js
export * from './newChart/index.js';
```

---

## ✅ Best Practices

| Practice | Why |
|----------|-----|
| **Use barrel exports** | Cleaner imports, easier refactoring |
| **Separate data/UI** | Testable logic, reusable components |
| **Consistent naming** | Easy navigation, predictable structure |
| **Self-contained components** | Independent modules, minimal coupling |
| **Document exports** | Clear public API |

---

## 🧪 Testing

Each component can be tested independently:

```javascript
// Test candlestick data transformation
import { toLightweightChartsFormat } from './charts/components/candlestick/index.js';

const result = toLightweightChartsFormat(mockData);
expect(result).toHaveLength(100);
```

---

## 🚀 Future Enhancements

- [ ] Add TypeScript definitions
- [ ] Create React component wrappers
- [ ] Add storybook documentation
- [ ] Implement chart themes
- [ ] Add export functionality (PNG, PDF)

---

## 📚 Related Documentation

- [Backtest Module README](../backtest/README.md)
- [Lightweight Charts Docs](https://tradingview.github.io/lightweight-charts/)
- [Chart.js Docs](https://www.chartjs.org/)

---

**Built with ❤️ for TradingHub**

