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
                - upper_shadow_ratio (float): Maximum upper shadow size as fraction of total range
                - lower_shadow_ratio (float): Maximum lower shadow size as fraction of total range
                - candle_color (str): Candle color filter ('red', 'green', or 'both')
                
        Returns:
            pd.DataFrame: DataFrame with Marubozu pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Detect Marubozu patterns (no trend context needed)
        df = self._detect_marubozu_conditions(df, params)
        
        return df
    
    def _detect_marubozu_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Marubozu pattern conditions"""
        
        # Marubozu conditions:
        # 1. No shadows (or very small shadows) - this automatically means large body
        # 2. Strong directional movement
        
        marubozu_condition = (
            (df['upper_shadow'] <= params['upper_shadow_ratio'] * df['total_range']) &  # No upper shadow
            (df['lower_shadow'] <= params['lower_shadow_ratio'] * df['total_range'])  # No lower shadow
        )
        
        # Add candle color filtering
        candle_color = params.get('candle_color', 'both')  # 'red', 'green', or 'both'
        if candle_color == 'red':
            # Only bearish (red) Marubozu candles
            marubozu_condition = marubozu_condition & (~df['is_green'])  # Not green = red
        elif candle_color == 'green':
            # Only bullish (green) Marubozu candles
            marubozu_condition = marubozu_condition & df['is_green']  # Green candles
        # If 'both', no additional filtering needed
        
        df['is_marubozu'] = marubozu_condition
        return df
