"""
Marubozu Pattern Detection
Detects Marubozu candlestick patterns - strong directional momentum with no shadows
"""

import pandas as pd
from typing import Dict, Any
from .base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class MarubozuPattern(BasePattern):
    """Detector for Marubozu candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Marubozu pattern presence
        
        Returns:
            str: Name of the Marubozu pattern column
        """
        return 'is_marubozu'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Marubozu patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - min_body_ratio (float): Minimum body size as fraction of total range
                - max_shadow_ratio (float): Maximum shadow size as fraction of total range
                - ma_period (int): Period for moving average calculation
                - require_high_volume (bool): Whether to require high volume
                - min_relative_volume (float, optional): Minimum relative volume compared to average
                - volume_lookback (int, optional): Number of candles to look back for volume comparison
                
        Returns:
            pd.DataFrame: DataFrame with Marubozu pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add trend context
        df = CandlestickUtils.add_trend_context(df, params['ma_period'])
        
        # Detect Marubozu patterns
        df = self._detect_marubozu_conditions(df, params)
        
        return df
    
    def _detect_marubozu_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Marubozu pattern conditions"""
        
        # Marubozu conditions:
        # 1. Large body (body should be most of the total range)
        # 2. No shadows (or very small shadows)
        # 3. Strong directional movement
        
        marubozu_condition = (
            (df['body_size'] >= params['body_size_ratio'] * df['total_range']) &  # Large body
            (df['upper_shadow'] <= params['upper_shadow_ratio'] * df['total_range']) &  # No upper shadow
            (df['lower_shadow'] <= params['lower_shadow_ratio'] * df['total_range'])  # No lower shadow
        )
        
        # Add volume condition if Volume column exists and parameters are provided
        if 'Volume' in df.columns and 'min_relative_volume' in params and params.get('min_relative_volume') is not None:
            lookback = params.get('volume_lookback', 20)
            volume_ma = df['Volume'].rolling(window=lookback).mean()
            relative_volume = df['Volume'] / volume_ma
            marubozu_condition = marubozu_condition & (relative_volume >= params['min_relative_volume'])
            
        df['is_marubozu'] = marubozu_condition
        return df
