import pandas as pd
import numpy as np
from typing import Dict, Any

class CandlestickUtils:
    """Utility class for candlestick calculations"""
    
    @staticmethod
    def calculate_properties(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate basic candlestick properties
        
        Args:
            df (pd.DataFrame): DataFrame with OHLC data
            
        Returns:
            pd.DataFrame: DataFrame with additional candlestick properties
        """
        df['body'] = df['Close'] - df['Open']
        df['upper_shadow'] = df['High'] - df[['Open', 'Close']].max(axis=1)
        df['lower_shadow'] = df[['Open', 'Close']].min(axis=1) - df['Low']
        df['body_size'] = abs(df['body'])
        df['total_range'] = df['High'] - df['Low']
        df['is_green'] = df['Close'] > df['Open']
        
        # Add volume calculations if Volume column exists
        if 'Volume' in df.columns:
            df['volume_ma'] = df['Volume'].rolling(window=20).mean()
            df['relative_volume'] = df['Volume'] / df['volume_ma']
        
        return df
    
    @staticmethod
    def add_trend_context(df: pd.DataFrame, ma_period: int) -> pd.DataFrame:
        """
        Add trend context using moving average
        
        Args:
            df (pd.DataFrame): DataFrame with OHLC data
            ma_period (int): Period for moving average calculation
            
        Returns:
            pd.DataFrame: DataFrame with trend information
        """
        df[f'MA{ma_period}'] = df['Close'].rolling(window=ma_period).mean()
        df['trend'] = np.where(df['Close'] > df[f'MA{ma_period}'], 'uptrend', 'downtrend')
        return df 