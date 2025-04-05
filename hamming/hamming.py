import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pytz

def download_stock_data(symbol, start_date, end_date):
    stock = yf.Ticker(symbol)
    df = stock.history(start=start_date, end=end_date, interval='5m')
    return df

def detect_hammer_patterns(df):
    # Calculate candle properties
    df['body'] = df['Close'] - df['Open']
    df['upper_shadow'] = df['High'] - df[['Open', 'Close']].max(axis=1)
    df['lower_shadow'] = df[['Open', 'Close']].min(axis=1) - df['Low']
    df['body_size'] = abs(df['body'])
    df['total_range'] = df['High'] - df['Low']
    
    # Determine candle color (green = bullish, red = bearish)
    df['is_green'] = df['Close'] > df['Open']
    
    # Detect regular hammer patterns (bullish)
    # Criteria:
    # 1. Small real body (less than 30% of the total range)
    # 2. Long lower shadow (at least twice the size of the real body)
    # 3. Little or no upper shadow (less than 10% of the total range)
    # 4. Green candle (bullish)
    df['is_hammer'] = (
        (df['body_size'] < 0.3 * df['total_range']) &  # Small real body
        (df['lower_shadow'] > 2 * df['body_size']) &    # Long lower shadow
        (df['upper_shadow'] < 0.1 * df['total_range']) &  # Little or no upper shadow
        (df['is_green'])  # Green candle (bullish)
    )
        
    # Add trend context (simple 5-period moving average)
    df['MA5'] = df['Close'].rolling(window=5).mean()
    df['trend'] = np.where(df['Close'] > df['MA5'], 'uptrend', 'downtrend')
    
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

def main():
    symbol = 'AAPL'
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=50)).strftime('%Y-%m-%d')
    
    print(f"Downloading data for {symbol} from {start_date} to {end_date}...")
    df = download_stock_data(symbol, start_date, end_date)
    
    if df.empty:
        print("No data found. Please check the symbol and date range.")
        return
    
    print(f"Analyzing {len(df)} data points for hammer patterns...")
    df = detect_hammer_patterns(df)
    
    # Find hammer patterns
    hammers = df[df['is_hammer']]
    
    if len(hammers) == 0:
        print("No hammer patterns detected in the given time range.")
    else:
        if len(hammers) > 0:
            print(f"\nFound {len(hammers)} regular hammer patterns (times in Israel):")
            for date, row in hammers.iterrows():
                israel_time = convert_to_israel_time(date)
                print(f"Date and Time: {israel_time.strftime('%Y-%m-%d %H:%M')} - Trend: {row['trend']}")
        

if __name__ == "__main__":
    main()
