import pandas as pd
import numpy as np
from typing import Dict, Any
from .base_pattern import BasePattern
from tradinghub.utils.candlestick_utils import CandlestickUtils

class ElephantBarPattern(BasePattern):
    """Detector for Elephant Bar candlestick patterns"""
    
    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Elephant Bar pattern presence
        
        Returns:
            str: Name of the Elephant Bar pattern column
        """
        return 'is_elephant_bar'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Elephant Bar patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as multiple of average body size
                - shadow_ratio (float): Maximum shadow size as fraction of total range
                - ma_period (int): Period for moving average calculation
                - require_green (bool): Whether to require green (bullish) candles
                - require_red (bool): Whether to require red (bearish) candles
                - min_relative_volume (float, optional): Minimum relative volume compared to average
                - volume_lookback (int, optional): Number of candles to look back for volume comparison
                
        Returns:
            pd.DataFrame: DataFrame with Elephant Bar pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add trend context
        df = CandlestickUtils.add_trend_context(df, params['ma_period'])
        
        # Detect Elephant Bar patterns
        df = self._detect_elephant_bar_conditions(df, params)
        
        return df
    
    def _detect_elephant_bar_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Apply Elephant Bar pattern conditions
        
        An Elephant Bar is characterized by:
        - A very large real body (significantly bigger than recent average)
        - Very small upper and lower shadows
        - Optional high volume
        - Optional bullish/bearish requirement
        """
        # Calculate average body size over lookback period
        lookback = params.get('ma_period', 20)
        avg_body_size = df['body_size'].rolling(window=lookback).mean()
        
        # Define the pattern conditions
        elephant_bar_condition = (
            # Large real body (e.g., 2x the average)
            (df['body_size'] > params['body_size_ratio'] * avg_body_size) &
            # Small upper shadow
            (df['upper_shadow'] < params['shadow_ratio'] * df['total_range']) &
            # Small lower shadow
            (df['lower_shadow'] < params['shadow_ratio'] * df['total_range'])
        )
        
        # Add bullish/bearish condition if specified
        if params.get('require_green', False):
            elephant_bar_condition = elephant_bar_condition & df['is_green']
        elif params.get('require_red', False):
            elephant_bar_condition = elephant_bar_condition & ~df['is_green']
            
        # Add volume condition if Volume column exists and parameters are provided
        if 'Volume' in df.columns and 'min_relative_volume' in params and params.get('min_relative_volume') is not None:
            volume_lookback = params.get('volume_lookback', 20)
            volume_ma = df['Volume'].rolling(window=volume_lookback).mean()
            relative_volume = df['Volume'] / volume_ma
            elephant_bar_condition = elephant_bar_condition & (relative_volume >= params['min_relative_volume'])
            
        df['is_elephant_bar'] = elephant_bar_condition
        return df 