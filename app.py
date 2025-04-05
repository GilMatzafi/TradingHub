from flask import Flask, render_template, request, jsonify
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pytz
import json

app = Flask(__name__)

def download_stock_data(symbol, start_date, end_date, interval):
    stock = yf.Ticker(symbol)
    df = stock.history(start=start_date, end=end_date, interval=interval)
    return df

def detect_hammer_patterns(df, params):
    # Extract parameters
    body_size_ratio = params.get('body_size_ratio', 0.3)
    lower_shadow_ratio = params.get('lower_shadow_ratio', 2.0)
    upper_shadow_ratio = params.get('upper_shadow_ratio', 0.1)
    ma_period = params.get('ma_period', 5)
    require_green = params.get('require_green', True)
    
    # Calculate candle properties
    df['body'] = df['Close'] - df['Open']
    df['upper_shadow'] = df['High'] - df[['Open', 'Close']].max(axis=1)
    df['lower_shadow'] = df[['Open', 'Close']].min(axis=1) - df['Low']
    df['body_size'] = abs(df['body'])
    df['total_range'] = df['High'] - df['Low']
    
    # Determine candle color (green = bullish, red = bearish)
    df['is_green'] = df['Close'] > df['Open']
    
    # Add trend context (simple moving average)
    df[f'MA{ma_period}'] = df['Close'].rolling(window=ma_period).mean()
    df['trend'] = np.where(df['Close'] > df[f'MA{ma_period}'], 'uptrend', 'downtrend')
    
    # Detect hammer patterns based on user parameters
    hammer_condition = (
        (df['body_size'] < body_size_ratio * df['total_range']) &  # Small real body
        (df['lower_shadow'] > lower_shadow_ratio * df['body_size']) &  # Long lower shadow
        (df['upper_shadow'] < upper_shadow_ratio * df['total_range'])  # Little or no upper shadow
    )
    
    # Add color requirement if specified
    if require_green:
        hammer_condition = hammer_condition & df['is_green']
    
    df['is_hammer'] = hammer_condition
    
    return df

def convert_to_israel_time(date):
    # Convert from US Eastern Time to Israel Time
    et_tz = pytz.timezone('US/Eastern')
    israel_tz = pytz.timezone('Asia/Jerusalem')
    
    # If the date is naive (no timezone), assume it's in ET
    if date.tzinfo is None:
        date = et_tz.localize(date)
    
    # Convert to Israel time
    israel_time = date.astimezone(israel_tz)
    return israel_time

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    
    # Extract parameters from request
    symbol = data.get('symbol', 'AAPL')
    days = int(data.get('days', 50))
    interval = data.get('interval', '5m')
    
    # Strategy parameters
    strategy_params = {
        'body_size_ratio': float(data.get('body_size_ratio', 0.3)),
        'lower_shadow_ratio': float(data.get('lower_shadow_ratio', 2.0)),
        'upper_shadow_ratio': float(data.get('upper_shadow_ratio', 0.1)),
        'ma_period': int(data.get('ma_period', 5)),
        'require_green': data.get('require_green', True)
    }
    
    # Calculate date range
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    
    # Download and analyze data
    df = download_stock_data(symbol, start_date, end_date, interval)
    
    if df.empty:
        return jsonify({'error': 'No data found. Please check the symbol and date range.'})
    
    df = detect_hammer_patterns(df, strategy_params)
    
    # Find hammer patterns
    hammers = df[df['is_hammer']]
    
    # Prepare results
    results = []
    for date, row in hammers.iterrows():
        israel_time = convert_to_israel_time(date)
        results.append({
            'date': israel_time.strftime('%Y-%m-%d %H:%M'),
            'trend': row['trend'],
            'open': float(row['Open']),
            'high': float(row['High']),
            'low': float(row['Low']),
            'close': float(row['Close'])
        })
    
    return jsonify({
        'count': len(results),
        'patterns': results
    })

if __name__ == '__main__':
    app.run(debug=True) 