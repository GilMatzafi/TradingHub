# Candlestick Chart Component - Refactored

A **production-ready**, **enterprise-grade** candlestick chart component with proper lifecycle management, robust error handling, and clean architecture.

## 🎯 Refactoring Goals Achieved

| Goal | Status | Implementation |
|------|--------|----------------|
| **Separate lifecycle from rendering** | ✅ | `candlestick-lifecycle.js` - State machine with validation |
| **Robust error handling** | ✅ | `candlestick-validation.js` - Validation & sanitization |
| **Controlled logging** | ✅ | `candlestick-logger.js` - Leveled logger (ERROR/WARN/INFO/DEBUG) |
| **Reduce DOM dependency** | ✅ | `candlestick-dom.js` - All DOM access centralized |
| **React/TypeScript ready** | ✅ | Clean separation, async/await, proper interfaces |

---

## 📁 Architecture

### New Modular Structure

```
candlestick/
├── index.js                         ← Barrel export
├── backtestCandlestickChart.js      ← Main chart class (orchestrator)
│
├── candlestick-logger.js            ← Logging system
├── candlestick-dom.js               ← DOM helpers
├── candlestick-validation.js        ← Data validation
├── candlestick-lifecycle.js         ← State management
│
├── candlestick-data.js              ← Data transformation
└── candlestick-lightweight.js       ← Rendering logic
```

### Separation of Concerns

| Module | Responsibility | Exports |
|--------|---------------|---------|
| **backtestCandlestickChart** | Orchestration, public API | `BacktestCandlestickChart` class |
| **candlestick-logger** | Logging with levels | `logger`, `LOG_LEVELS` |
| **candlestick-dom** | DOM access, element waiting | `getCanvasElement()`, `waitForElementReady()` |
| **candlestick-validation** | Data validation, sanitization | `validateChartData()`, `sanitizeStockData()` |
| **candlestick-lifecycle** | State machine, transitions | `LifecycleManager`, `ChartState` |
| **candlestick-data** | Data transformation | `toLightweightChartsFormat()` |
| **candlestick-lightweight** | Chart rendering | `renderLightweightCharts()` |

---

## 🚀 Usage

### Basic Usage (Async/Await)

```javascript
import { BacktestCandlestickChart } from './charts/index.js';

// Create chart instance
const chart = new BacktestCandlestickChart('containerId', 'canvasId');

// Initialize with data (async - waits for DOM)
const success = await chart.initialize(stockData, trades);

if (success) {
    console.log('Chart rendered successfully!');
} else {
    console.error('Chart failed:', chart.getErrorMessage());
}

// Clean up when done
await chart.destroy();
```

### Advanced Usage with Configuration

```javascript
const chart = new BacktestCandlestickChart('containerId', 'canvasId', {
    retryAttempts: 10,          // Wait longer for DOM
    retryDelay: 150,            // Check every 150ms
    enableSanitization: true,   // Auto-fix bad data
    strictValidation: false,    // Don't fail on invalid data
    logLevel: LOG_LEVELS.DEBUG  // Enable debug logging
});

await chart.initialize(stockData, trades);
```

### Error Handling

```javascript
const chart = new BacktestCandlestickChart();

try {
    const success = await chart.initialize(stockData, trades);
    
    if (!success) {
        if (chart.hasError()) {
            console.error('Initialization failed:', chart.getErrorMessage());
            
            // Get detailed lifecycle info
            console.log('Lifecycle:', chart.getLifecycleSummary());
        }
    }
} catch (error) {
    console.error('Unexpected error:', error);
}
```

### Update Chart Data

```javascript
// Update with new data
const updated = await chart.updateData(newStockData, newTrades);

if (updated) {
    console.log('Chart updated successfully');
}
```

### Lifecycle State Checking

```javascript
// Check current state
console.log('Current state:', chart.getState());

// Check if ready
if (chart.isReady()) {
    console.log('Chart is rendered and ready');
}

// Check for errors
if (chart.hasError()) {
    console.error('Chart has error:', chart.getErrorMessage());
}
```

### Debug Mode

```javascript
// Enable detailed logging
chart.enableDebug();

await chart.initialize(stockData, trades);

// Disable debug logging
chart.disableDebug();
```

---

## 🔄 Lifecycle States

The chart follows a **strict state machine**:

```
CREATED
   ↓
INITIALIZING (validating data, waiting for DOM)
   ↓
INITIALIZED (data ready, DOM ready)
   ↓
RENDERING (drawing chart)
   ↓
RENDERED (chart displayed)
   ↓
UPDATING (re-rendering with new data)
   ↓
DESTROYING (cleanup)
   ↓
DESTROYED (removed)
```

### State Validation

Invalid state transitions are **automatically prevented**:

```javascript
const chart = new BacktestCandlestickChart();

// ❌ Can't render before initializing
await chart._renderChart(); // Logs error: "Chart not ready to render"

// ✅ Must initialize first
await chart.initialize(stockData, trades);
```

---

## 🛡️ Error Handling & Validation

### Data Validation

Validates:
- ✅ Non-null, array structure
- ✅ Minimum data points (≥2)
- ✅ Required fields (`date`, `open`, `high`, `low`, `close`)
- ✅ Valid number types
- ✅ OHLC logic (`high >= low`, positive prices)
- ✅ Trade structure (`entry_date`, `entry_price`, `exit_type`)

```javascript
import { validateChartData } from './charts/index.js';

const result = validateChartData(stockData, trades);

if (!result.valid) {
    console.error('Validation failed:', result.getErrorMessage());
}
```

### Data Sanitization

Auto-removes invalid entries:

```javascript
import { sanitizeStockData, sanitizeTrades } from './charts/index.js';

// Remove bad data automatically
const cleanStockData = sanitizeStockData(dirtyStockData);
const cleanTrades = sanitizeTrades(dirtyTrades);
```

### Strict vs Lenient Modes

**Lenient (default)**: Try to fix bad data
```javascript
const chart = new BacktestCandlestickChart('id', 'canvasId', {
    strictValidation: false,
    enableSanitization: true
});
```

**Strict**: Fail on any invalid data
```javascript
const chart = new BacktestCandlestickChart('id', 'canvasId', {
    strictValidation: true,
    enableSanitization: false
});
```

---

## 📊 Logging System

### Log Levels

| Level | When to Use | Enabled By Default |
|-------|-------------|-------------------|
| **ERROR** | Critical failures | ✅ Always |
| **WARN** | Recoverable issues | ✅ Always |
| **INFO** | Important events | ❌ Debug mode only |
| **DEBUG** | Detailed diagnostics | ❌ Debug mode only |

### Example Log Output

```
[14:32:15] [CandlestickChart] [INFO] Lifecycle: Chart created
[14:32:15] [CandlestickChart] [INFO] Lifecycle: State transition: created → initializing
[14:32:15] [CandlestickChart] [DEBUG] Stock data validation passed
[14:32:15] [CandlestickChart] [DEBUG] Trades validation passed
[14:32:15] [CandlestickChart] [INFO] Chart data validation passed
[14:32:16] [CandlestickChart] [DEBUG] Canvas ready: {width: 800, height: 400}
[14:32:16] [CandlestickChart] [INFO] Chart rendered successfully
[14:32:16] [CandlestickChart] [DEBUG] Performance: Full initialization took 1234ms
```

### Control Logging

```javascript
// Via window global (affects all charts)
window.CHART_DEBUG_LEVEL = 3; // DEBUG level

// Or per-chart instance
chart.enableDebug();  // Set to DEBUG
chart.disableDebug(); // Set to WARN
```

---

## 🎨 DOM Independence

All DOM access is **centralized** in `candlestick-dom.js`:

### Before (Direct DOM Access)
```javascript
// ❌ Direct, error-prone
const canvas = document.getElementById(this.canvasId);
if (canvas.offsetWidth === 0) { ... }
```

### After (Helper Functions)
```javascript
// ✅ Safe, abstracted
import { getCanvasElement, hasValidDimensions } from './candlestick-dom.js';

const canvas = getCanvasElement(this.canvasId);
if (hasValidDimensions(canvas)) { ... }
```

### Benefits

| Benefit | Why It Matters |
|---------|---------------|
| **Null safety** | Always returns `null` instead of throwing |
| **Type validation** | Ensures element is actually a canvas |
| **Easy mocking** | Test without real DOM |
| **React migration** | Replace DOM helpers with React refs |

---

## 🧪 Testing

### Unit Testing (Data & Validation)

```javascript
import { validateStockData, sanitizeStockData } from './candlestick-validation.js';

describe('Candlestick Validation', () => {
    it('should reject invalid data', () => {
        const result = validateStockData([]);
        expect(result.valid).toBe(false);
    });

    it('should sanitize bad entries', () => {
        const dirty = [
            { date: '2024-01-01', open: 100, high: 110, low: 90, close: 105 },
            { date: '2024-01-02', open: -1, high: 110, low: 90, close: 105 }, // Invalid!
        ];
        const clean = sanitizeStockData(dirty);
        expect(clean).toHaveLength(1);
    });
});
```

### Integration Testing (with Mock DOM)

```javascript
import { BacktestCandlestickChart } from './backtestCandlestickChart.js';

describe('BacktestCandlestickChart', () => {
    let chart;

    beforeEach(() => {
        // Mock DOM
        document.body.innerHTML = '<canvas id="testCanvas"></canvas>';
        chart = new BacktestCandlestickChart('container', 'testCanvas');
    });

    it('should initialize successfully', async () => {
        const success = await chart.initialize(mockStockData, mockTrades);
        expect(success).toBe(true);
        expect(chart.isReady()).toBe(true);
    });

    it('should handle errors gracefully', async () => {
        const success = await chart.initialize(null, null);
        expect(success).toBe(false);
        expect(chart.hasError()).toBe(true);
    });
});
```

---

## 🚀 React Migration Path

The refactored architecture is **React-ready**:

### Step 1: Create React Hook

```typescript
import { useEffect, useRef, useState } from 'react';
import { BacktestCandlestickChart } from './backtestCandlestickChart';

export function useCandlestickChart(stockData, trades) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [chart, setChart] = useState<BacktestCandlestickChart | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const chartInstance = new BacktestCandlestickChart(
            'container',
            canvasRef.current.id
        );

        chartInstance.initialize(stockData, trades).then(success => {
            if (success) {
                setChart(chartInstance);
            } else {
                setError(chartInstance.getErrorMessage());
            }
        });

        return () => {
            chartInstance.destroy();
        };
    }, [stockData, trades]);

    return { chart, error, canvasRef };
}
```

### Step 2: Use in Component

```typescript
function CandlestickChart({ stockData, trades }) {
    const { chart, error, canvasRef } = useCandlestickChart(stockData, trades);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <canvas ref={canvasRef} id="candlestickChart" />;
}
```

---

## 📈 Performance

### Optimization Features

| Feature | Benefit |
|---------|---------|
| **Async initialization** | Non-blocking, responsive UI |
| **DOM retry logic** | Handles dynamic rendering |
| **Performance logging** | Track slow operations |
| **Lazy validation** | Skip validation in production |
| **Efficient updates** | Destroy + re-render only |

### Performance Metrics (Logged Automatically)

```javascript
// Example performance logs
[14:32:16] [CandlestickChart] [DEBUG] Performance: Chart initialization → render took 234ms
[14:32:16] [CandlestickChart] [DEBUG] Performance: Full initialization took 456ms
```

---

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retryAttempts` | number | `5` | Max retries waiting for DOM |
| `retryDelay` | number | `200` | Delay between retries (ms) |
| `enableSanitization` | boolean | `true` | Auto-fix bad data |
| `strictValidation` | boolean | `false` | Fail on validation errors |
| `logLevel` | number | `LOG_LEVELS.WARN` | Logging verbosity |

---

## 🎯 Migration Guide (Old → New)

### Old API (Still Supported)

```javascript
const chart = new BacktestCandlestickChart();
chart.initialize(stockData, trades); // Sync (may fail)
```

### New API (Recommended)

```javascript
const chart = new BacktestCandlestickChart();
await chart.initialize(stockData, trades); // Async (robust)
```

### Breaking Changes

None! Old API still works via backward-compatible wrappers.

---

## ✅ Summary

| Before Refactor | After Refactor |
|----------------|----------------|
| ❌ Monolithic class | ✅ 7 focused modules |
| ❌ Sync, blocking | ✅ Async, non-blocking |
| ❌ No state management | ✅ Strict state machine |
| ❌ Basic error handling | ✅ Validation + sanitization |
| ❌ Console.log everywhere | ✅ Leveled logger |
| ❌ Direct DOM access | ✅ DOM helpers |
| ❌ Hard to test | ✅ Easily mockable |
| ❌ React migration difficult | ✅ React-ready |

---

**Built with ❤️ for TradingHub**

