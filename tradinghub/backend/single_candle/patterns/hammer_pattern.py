import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class HammerPattern(BasePattern):
    """Detector for hammer candlestick patterns"""
    
    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates hammer pattern presence
        
        Returns:
            str: Name of the hammer pattern column
        """
        return 'is_hammer'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect hammer patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Maximum body size as fraction of total range
                - lower_shadow_ratio (float): Minimum lower shadow size relative to body
                - upper_shadow_ratio (float): Maximum upper shadow size as fraction of total range
                - ma_period (int): Period for moving average calculation
                - require_green (bool): Whether to require green (bullish) candles
                - min_relative_volume (float, optional): Minimum relative volume compared to average
                - volume_lookback (int, optional): Number of candles to look back for volume comparison
                
        Returns:
            pd.DataFrame: DataFrame with hammer pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add trend context
        df = CandlestickUtils.add_trend_context(df, params['ma_period'])
        
        # Detect hammer patterns
        df = self._detect_hammer_conditions(df, params)
        
        return df
    
    def _detect_hammer_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply hammer pattern conditions"""
        hammer_condition = (
            (df['body_size'] < params['body_size_ratio'] * df['total_range']) &  # Small real body
            (df['lower_shadow'] > params['lower_shadow_ratio'] * df['body_size']) &  # Long lower shadow
            (df['upper_shadow'] < params['upper_shadow_ratio'] * df['total_range'])  # Little or no upper shadow
        )
        
        if params['require_green']:
            hammer_condition = hammer_condition & df['is_green']
            
        # Add volume condition if Volume column exists and parameters are provided
        if 'Volume' in df.columns and 'min_relative_volume' in params and params.get('min_relative_volume') is not None:
            lookback = params.get('volume_lookback', 20)
            volume_ma = df['Volume'].rolling(window=lookback).mean()
            relative_volume = df['Volume'] / volume_ma
            hammer_condition = hammer_condition & (relative_volume >= params['min_relative_volume'])
            
        df['is_hammer'] = hammer_condition
        return df 