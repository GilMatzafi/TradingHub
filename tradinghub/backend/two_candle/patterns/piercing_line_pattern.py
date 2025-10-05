"""
Piercing Line Pattern Detection
Detects Piercing Line candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class PiercingLinePattern(BasePattern):
    """Detector for Piercing Line candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Piercing Line pattern presence
        
        Returns:
            str: Name of the Piercing Line pattern column
        """
        return 'is_piercing_line'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Piercing Line patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - piercing_ratio (float): Minimum piercing ratio (how much of first candle's body is pierced)
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require trend context
                
        Returns:
            pd.DataFrame: DataFrame with Piercing Line pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Piercing Line patterns
        df = self._detect_piercing_line_conditions(df, params)
        
        return df
    
    def _detect_piercing_line_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Piercing Line pattern conditions"""
        
        # Piercing Line pattern conditions:
        # 1. First candle is bearish (red) with significant body
        # 2. Second candle opens below the first candle's low
        # 3. Second candle closes above the midpoint of the first candle's body
        # 4. Second candle is bullish (green)
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.3)
        piercing_ratio = params.get('piercing_ratio', 0.5)
        require_trend = params.get('require_trend', True)
        
        # Initialize pattern column
        df['is_piercing_line'] = False
        
        # Check for piercing line patterns (need at least 2 candles)
        for i in range(1, len(df)):
            current_candle = df.iloc[i]
            previous_candle = df.iloc[i-1]
            
            # Calculate body sizes
            current_body_size = abs(current_candle['Close'] - current_candle['Open'])
            previous_body_size = abs(previous_candle['Close'] - previous_candle['Open'])
            
            # Check if both candles have significant bodies
            current_range = current_candle['High'] - current_candle['Low']
            previous_range = previous_candle['High'] - previous_candle['Low']
            
            if current_range == 0 or previous_range == 0:  # Avoid division by zero
                continue
                
            current_body_ratio = current_body_size / current_range
            previous_body_ratio = previous_body_size / previous_range
            
            if current_body_ratio < body_size_ratio or previous_body_ratio < body_size_ratio:
                continue
            
            # Check piercing line conditions (bullish only)
            piercing_line_condition = (
                # First candle is bearish (red)
                (previous_candle['Close'] < previous_candle['Open']) &
                # Second candle is bullish (green)
                (current_candle['Close'] > current_candle['Open']) &
                # Second candle opens below the first candle's low
                (current_candle['Open'] < previous_candle['Low']) &
                # Second candle closes above the midpoint of the first candle's body
                (current_candle['Close'] > (previous_candle['Open'] + previous_candle['Close']) / 2)
            )
            
            # Check piercing ratio (how much of the first candle's body is pierced)
            if piercing_line_condition:
                first_candle_body_midpoint = (previous_candle['Open'] + previous_candle['Close']) / 2
                piercing_amount = current_candle['Close'] - first_candle_body_midpoint
                first_candle_body_size = previous_candle['Open'] - previous_candle['Close']  # Bearish body size
                
                if first_candle_body_size > 0:  # Avoid division by zero
                    actual_piercing_ratio = piercing_amount / first_candle_body_size
                    piercing_line_condition = piercing_line_condition & (actual_piercing_ratio >= piercing_ratio)
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For piercing line, we want to be in a downtrend (price below MA)
                trend_condition = current_candle['Close'] < current_candle['ma_20']
                piercing_line_condition = piercing_line_condition & trend_condition
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_piercing_line')] = piercing_line_condition
        
        return df
