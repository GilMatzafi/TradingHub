"""
Doji Pattern Detection
Detects Standard Doji candlestick patterns - market indecision signals
"""

import pandas as pd
from typing import Dict, Any
from .base_pattern import BasePattern
from tradinghub.backend.utils.candlestick_utils import CandlestickUtils

class DojiPattern(BasePattern):
    """Detector for Standard Doji candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """Return the column name for doji pattern detection"""
        return 'is_doji'

    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect doji patterns in the dataframe
        
        Args:
            df: DataFrame with OHLCV data
            params: Pattern detection parameters
            
        Returns:
            DataFrame with doji pattern column added
        """
        # Calculate candlestick properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add trend context
        df = CandlestickUtils.add_trend_context(df, params['ma_period'])
        
        # Detect doji conditions
        df = self._detect_doji_conditions(df, params)
        
        return df

    def _detect_doji_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect doji pattern conditions
        
        Doji pattern criteria:
        - Very small real body (body_size < threshold)
        - Equal or similar upper and lower shadows
        - Optional: High volume confirmation
        """
        body_size_ratio = params.get('body_size_ratio', 0.1)  # Default to 10% of total range
        
        # Primary doji condition: very small real body
        doji_condition = (
            (df['body_size'] < body_size_ratio * df['total_range']) &  # Small real body
            (df['total_range'] > 0)  # Avoid division by zero
        )
        
        # Optional: Volume confirmation
        if params.get('require_high_volume', False):
            lookback = params.get('volume_lookback', 20)
            min_relative_volume = params.get('min_relative_volume', 1.5)
            
            if 'Volume' in df.columns:
                # Calculate relative volume
                volume_ma = df['Volume'].rolling(window=lookback).mean()
                relative_volume = df['Volume'] / volume_ma
                
                # Add volume condition
                doji_condition = doji_condition & (relative_volume >= min_relative_volume)
            else:
                # No volume data available
                doji_condition = doji_condition & False
        
        # Add doji column to dataframe
        df['is_doji'] = doji_condition
        
        return df

    def get_pattern_description(self) -> str:
        """Return description of the doji pattern"""
        return "Standard Doji - Market indecision pattern with very small body and equal shadows"

    def get_pattern_insights(self) -> list:
        """Return trading insights for doji patterns"""
        return [
            "Doji patterns indicate market indecision and potential reversal",
            "Look for doji patterns at key support/resistance levels",
            "Volume confirmation increases pattern reliability",
            "Doji after strong trends often signals trend exhaustion",
            "Multiple doji patterns in sequence suggest high uncertainty"
        ]
