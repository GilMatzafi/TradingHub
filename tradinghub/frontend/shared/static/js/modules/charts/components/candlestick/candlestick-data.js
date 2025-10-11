/**
 * Candlestick Data Module
 * Handles data transformation and preparation for candlestick charts
 */

/**
 * Sort stock data by date
 */
export function sortStockDataByDate(stockData) {
    return [...stockData].sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Convert stock data to candlestick format for Chart.js
 */
export function toCandlestickFormat(stockData) {
    const sorted = sortStockDataByDate(stockData);
    return sorted.map(candle => ({
        x: new Date(candle.date),
        o: candle.open,
        h: candle.high,
        l: candle.low,
        c: candle.close
    }));
}

/**
 * Convert stock data to Lightweight Charts format
 */
export function toLightweightChartsFormat(stockData) {
    const sorted = sortStockDataByDate(stockData);
    return sorted.map(d => ({
        time: Math.floor(new Date(d.date).getTime() / 1000),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close
    }));
}

/**
 * Create OHLC data for line chart fallback
 */
export function createOHLCLineData(stockData) {
    const candlestickData = toCandlestickFormat(stockData);
    
    const highLowData = [];
    candlestickData.forEach(d => {
        const xOffset = 0.0001; // Small offset to create vertical lines
        highLowData.push(
            { x: new Date(d.x.getTime() - xOffset), y: d.l }, // Low start
            { x: new Date(d.x.getTime() + xOffset), y: d.l }, // Low end
            { x: new Date(d.x.getTime() - xOffset), y: d.h }, // High start  
            { x: new Date(d.x.getTime() + xOffset), y: d.h }  // High end
        );
    });
    
    return {
        highLow: highLowData,
        open: candlestickData.map(d => ({ x: d.x, y: d.o })),
        close: candlestickData.map(d => ({ x: d.x, y: d.c }))
    };
}

/**
 * Group trades by type
 */
export function groupTradesByType(trades) {
    return {
        entry: trades.filter(trade => trade.entry_date),
        stop_loss: trades.filter(trade => trade.exit_reason === 'stop_loss'),
        take_profit: trades.filter(trade => trade.exit_reason === 'take_profit'),
        max_periods: trades.filter(trade => trade.exit_reason === 'max_periods')
    };
}

/**
 * Convert trade to marker point for Chart.js
 */
export function tradeToMarkerPoint(trade, type) {
    const isEntry = type === 'entry';
    const price = isEntry ? trade.entry_price : trade.exit_price;
    const date = isEntry ? trade.entry_date : trade.exit_date;
    
    return {
        x: new Date(date),
        y: price,
        trade: {
            type: type,
            price: price,
            reason: trade.exit_reason || 'entry',
            profit: trade.profit_pct
        }
    };
}

/**
 * Convert trade to marker for Lightweight Charts
 */
export function tradeToLightweightMarker(trade, type) {
    const isEntry = type === 'entry';
    
    if (isEntry && trade.entry_date) {
        return {
            time: Math.floor(new Date(trade.entry_date).getTime() / 1000),
            position: 'belowBar',
            color: '#00c853',
            shape: 'arrowUp',
            text: `Entry ${trade.entry_price.toFixed(2)}`
        };
    }
    
    if (!isEntry && trade.exit_date) {
        const colors = {
            stop_loss: '#d32f2f',
            take_profit: '#2196f3',
            max_periods: '#ff9800'
        };
        const labels = {
            stop_loss: 'SL',
            take_profit: 'TP',
            max_periods: 'Time'
        };
        
        return {
            time: Math.floor(new Date(trade.exit_date).getTime() / 1000),
            position: 'aboveBar',
            color: colors[trade.exit_reason] || '#ff9800',
            shape: 'arrowDown',
            text: `${labels[trade.exit_reason] || 'Exit'} ${trade.exit_price?.toFixed?.(2) ?? ''}`
        };
    }
    
    return null;
}

/**
 * Prepare trade markers for Lightweight Charts
 */
export function prepareLightweightMarkers(trades) {
    const markers = [];
    
    trades.forEach(trade => {
        const entryMarker = tradeToLightweightMarker(trade, 'entry');
        if (entryMarker) markers.push(entryMarker);
        
        const exitMarker = tradeToLightweightMarker(trade, 'exit');
        if (exitMarker) markers.push(exitMarker);
    });
    
    return markers;
}

