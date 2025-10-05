"""
Morning Star Pattern Detection
Detects Morning Star bullish reversal candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class MorningStarPattern(BasePattern):
    """Detector for Morning Star candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Morning Star pattern presence
        
        Returns:
            str: Name of the Morning Star pattern column
        """
        return 'is_morning_star'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Morning Star patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - gap_ratio (float): Minimum gap size as fraction of first candle body
                - penetration_ratio (float): Minimum third candle penetration into first candle
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require downtrend context
                - star_body_ratio (float): Maximum star candle body size relative to first candle
                
        Returns:
            pd.DataFrame: DataFrame with Morning Star pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Morning Star patterns
        df = self._detect_morning_star_conditions(df, params)
        
        return df
    
    def _detect_morning_star_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Morning Star pattern conditions"""
        
        # Morning Star pattern conditions:
        # 1. First candle: Long bearish (red) candle
        # 2. Second candle: Small-bodied candle that gaps down from first
        # 3. Third candle: Strong bullish (green) candle that closes well into first candle's body
        # 4. Third candle should close above first candle's midpoint
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.6)
        gap_ratio = params.get('gap_ratio', 0.1)  # Minimum gap size as fraction of first candle body
        penetration_ratio = params.get('penetration_ratio', 0.5)  # Minimum penetration into first candle
        require_trend = params.get('require_trend', True)
        star_body_ratio = params.get('star_body_ratio', 0.3)  # Maximum star candle body size
        
        # Initialize pattern column
        df['is_morning_star'] = False
        
        # Check for Morning Star patterns (need at least 3 candles)
        for i in range(2, len(df)):
            current_candle = df.iloc[i]
            star_candle = df.iloc[i-1]
            first_candle = df.iloc[i-2]
            
            # First candle must be bearish (red)
            if first_candle['Close'] >= first_candle['Open']:
                continue
            
            # Third candle must be bullish (green)
            if current_candle['Close'] <= current_candle['Open']:
                continue
            
            # Calculate body sizes
            first_body_size = first_candle['Open'] - first_candle['Close']
            star_body_size = abs(star_candle['Close'] - star_candle['Open'])
            third_body_size = current_candle['Close'] - current_candle['Open']
            
            # Calculate total ranges
            first_range = first_candle['High'] - first_candle['Low']
            star_range = star_candle['High'] - star_candle['Low']
            third_range = current_candle['High'] - current_candle['Low']
            
            if first_range == 0 or star_range == 0 or third_range == 0:  # Avoid division by zero
                continue
            
            # Check first candle body size ratio
            first_body_ratio = first_body_size / first_range
            if first_body_ratio < body_size_ratio:
                continue
            
            # Check third candle body size
            third_body_ratio = third_body_size / third_range
            if third_body_ratio < body_size_ratio:
                continue
            
            # Check gap down from first candle to star candle
            gap_size = first_candle['Close'] - star_candle['Open']
            if gap_size <= 0:  # No gap down
                continue
            
            # Check minimum gap ratio
            min_gap = first_body_size * gap_ratio
            if gap_size < min_gap:
                continue
            
            # Check star candle body size (should be small)
            star_body_ratio = star_body_size / first_body_size
            if star_body_ratio > star_body_ratio:
                continue
            
            # Check third candle penetration into first candle
            penetration = current_candle['Close'] - first_candle['Close']
            min_penetration = first_body_size * penetration_ratio
            if penetration < min_penetration:
                continue
            
            # Check that third candle closes above first candle's midpoint
            first_midpoint = (first_candle['Open'] + first_candle['Close']) / 2
            if current_candle['Close'] <= first_midpoint:
                continue
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For Morning Star, we want to be in a downtrend initially
                trend_condition = first_candle['Close'] < first_candle['ma_20']
                if not trend_condition:
                    continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_morning_star')] = True
        
        return df
