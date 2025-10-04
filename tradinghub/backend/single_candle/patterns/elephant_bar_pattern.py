"""
Elephant Bar Pattern Detection
Detects Elephant Bar candlestick patterns - strong directional momentum signals
"""

import pandas as pd
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class ElephantBarPattern(BasePattern):
    """Detector for Elephant Bar candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """Return the column name for elephant bar pattern detection"""
        return 'is_elephant_bar'

    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect elephant bar patterns in the dataframe
        
        Args:
            df: DataFrame with OHLCV data
            params: Pattern detection parameters
            
        Returns:
            DataFrame with elephant bar pattern column added
        """
        # Calculate candlestick properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add trend context
        df = CandlestickUtils.add_trend_context(df, params['ma_period'])
        
        # Detect elephant bar conditions
        df = self._detect_elephant_bar_conditions(df, params)
        
        return df

    def _detect_elephant_bar_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect elephant bar specific conditions
        
        Args:
            df: DataFrame with candlestick properties
            params: Pattern detection parameters
            
        Returns:
            DataFrame with elephant bar detection results
        """
        # Get parameters
        min_body_ratio = params.get('min_body_ratio', 0.8)  # Body must be at least 80% of range
        max_shadow_ratio = params.get('max_shadow_ratio', 0.1)  # Shadows must be max 10% of range
        min_volume_ratio = params.get('min_volume_ratio', 1.0)  # Minimum volume requirement
        
        # Elephant bar condition: very large body with small shadows
        large_body_condition = (
            (df['body_size'] >= min_body_ratio * df['total_range']) &
            (df['total_range'] > 0)
        )
        
        # Small shadows condition: both shadows should be small
        small_shadows_condition = (
            (df['upper_shadow'] <= max_shadow_ratio * df['total_range']) &
            (df['lower_shadow'] <= max_shadow_ratio * df['total_range'])
        )
        
        # Volume confirmation (optional)
        volume_condition = True
        if params.get('require_high_volume', False):
            volume_condition = df['relative_volume'] >= min_volume_ratio
        
        # Combine all conditions
        elephant_bar_condition = (
            large_body_condition &
            small_shadows_condition &
            volume_condition
        )
        
        # Add pattern detection column
        df['is_elephant_bar'] = elephant_bar_condition
        
        return df
