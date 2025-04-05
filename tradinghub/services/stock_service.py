import yfinance as yf
import pandas as pd
import numpy as np

class StockService:
    """Service for handling stock data operations"""
    
    def download_stock_data(self, symbol, start_date, end_date, interval):
        """
        Download stock data from Yahoo Finance
        
        Args:
            symbol (str): Stock symbol
            start_date (str): Start date in YYYY-MM-DD format
            end_date (str): End date in YYYY-MM-DD format
            interval (str): Data interval (1m, 5m, 15m, 30m, 1h, 1d)
            
        Returns:
            pandas.DataFrame: Stock data
        """
        stock = yf.Ticker(symbol)
        df = stock.history(start=start_date, end=end_date, interval=interval)
        return df
    
    def detect_hammer_patterns(self, df, params):
        """
        Detect hammer patterns in stock data
        
        Args:
            df (pandas.DataFrame): Stock data
            params (dict): Strategy parameters
            
        Returns:
            pandas.DataFrame: Stock data with hammer pattern detection
        """
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