"""
Doji Pattern Detection
Detects Standard Doji candlestick patterns - market indecision signals
"""

import pandas as pd
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

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
        Detect Standard Doji pattern conditions
        
        Standard Doji criteria:
        - Very small real body (body_size < threshold)
        - Body positioned in the middle of the candle (not at top or bottom)
        - Equal or similar upper and lower shadows
        - Optional: High volume confirmation
        """
        body_size_ratio = params.get('body_size_ratio', 0.1)  # Default to 10% of total range
        shadow_balance_ratio = params.get('shadow_balance_ratio', 0.3)  # How balanced shadows should be
        
        # Primary doji condition: very small real body
        small_body_condition = (
            (df['body_size'] < body_size_ratio * df['total_range']) &  # Small real body
            (df['total_range'] > 0)  # Avoid division by zero
        )
        
        # Standard Doji condition: body should be in the middle (not at top or bottom)
        # Calculate body position relative to total range
        body_top = df[['Open', 'Close']].max(axis=1)  # Top of body
        body_bottom = df[['Open', 'Close']].min(axis=1)  # Bottom of body
        body_center = (body_top + body_bottom) / 2  # Center of body
        range_center = (df['High'] + df['Low']) / 2  # Center of total range
        
        # Body should be close to the center of the total range
        body_center_offset = abs(body_center - range_center) / df['total_range']
        centered_body_condition = body_center_offset < shadow_balance_ratio
        
        # Shadow balance condition: upper and lower shadows should be similar in size
        upper_shadow = df['High'] - body_top
        lower_shadow = body_bottom - df['Low']
        
        # Shadow balance condition: shadows should be similar in size
        # Allow for cases where one shadow might be very small (but not zero)
        # Stricter logic: 0.5 = perfect balance (0% difference), 0.3 = very imbalanced (8% difference)
        max_allowed_difference = (0.5 - shadow_balance_ratio) * 0.4  # 0.5→0%, 0.4→4%, 0.3→8%
        shadow_balance_condition = (
            (abs(upper_shadow - lower_shadow) / df['total_range'] <= max_allowed_difference)  # Shadows are balanced (<= for perfect balance)
        )
        
        # Combine all conditions for Standard Doji
        doji_condition = (
            small_body_condition &
            centered_body_condition &
            shadow_balance_condition
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
