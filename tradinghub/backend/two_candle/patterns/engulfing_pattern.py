"""
Engulfing Pattern Detection
Detects Bullish and Bearish Engulfing candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class EngulfingPattern(BasePattern):
    """Detector for Engulfing candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Engulfing pattern presence
        
        Returns:
            str: Name of the Engulfing pattern column
        """
        return 'is_engulfing'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Engulfing patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - engulfing_type (str): Type of engulfing ('bullish', 'bearish', or 'both')
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require trend context
                
        Returns:
            pd.DataFrame: DataFrame with Engulfing pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_moving_average(df, params.get('ma_period', 20))
        
        # Detect Engulfing patterns
        df = self._detect_engulfing_conditions(df, params)
        
        return df
    
    def _detect_engulfing_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Engulfing pattern conditions"""
        
        # Engulfing pattern conditions:
        # 1. Second candle completely engulfs the first candle's body
        # 2. Opposite colors (first candle opposite to second candle)
        # 3. Second candle has significant body size
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.3)
        engulfing_type = params.get('engulfing_type', 'both')  # 'bullish', 'bearish', or 'both'
        require_trend = params.get('require_trend', True)
        
        # Initialize pattern column
        df['is_engulfing'] = False
        
        # Check for engulfing patterns (need at least 2 candles)
        for i in range(1, len(df)):
            current_candle = df.iloc[i]
            previous_candle = df.iloc[i-1]
            
            # Calculate body sizes
            current_body_size = abs(current_candle['Close'] - current_candle['Open'])
            previous_body_size = abs(previous_candle['Close'] - previous_candle['Open'])
            
            # Check if current candle has significant body
            current_range = current_candle['High'] - current_candle['Low']
            if current_range == 0:  # Avoid division by zero
                continue
                
            current_body_ratio = current_body_size / current_range
            if current_body_ratio < body_size_ratio:
                continue
            
            # Check engulfing conditions
            bullish_engulfing = (
                # Previous candle is bearish (red)
                (previous_candle['Close'] < previous_candle['Open']) &
                # Current candle is bullish (green)
                (current_candle['Close'] > current_candle['Open']) &
                # Current candle's body completely engulfs previous candle's body
                (current_candle['Open'] < previous_candle['Close']) &  # Current opens below previous close
                (current_candle['Close'] > previous_candle['Open'])     # Current closes above previous open
            )
            
            bearish_engulfing = (
                # Previous candle is bullish (green)
                (previous_candle['Close'] > previous_candle['Open']) &
                # Current candle is bearish (red)
                (current_candle['Close'] < current_candle['Open']) &
                # Current candle's body completely engulfs previous candle's body
                (current_candle['Open'] > previous_candle['Close']) &  # Current opens above previous close
                (current_candle['Close'] < previous_candle['Open'])     # Current closes below previous open
            )
            
            # Apply engulfing type filter
            if engulfing_type == 'bullish':
                engulfing_condition = bullish_engulfing
            elif engulfing_type == 'bearish':
                engulfing_condition = bearish_engulfing
            else:  # 'both'
                engulfing_condition = bullish_engulfing | bearish_engulfing
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For bullish engulfing, we want to be in a downtrend (price below MA)
                # For bearish engulfing, we want to be in an uptrend (price above MA)
                if engulfing_type == 'bullish':
                    trend_condition = current_candle['Close'] < current_candle['ma_20']
                elif engulfing_type == 'bearish':
                    trend_condition = current_candle['Close'] > current_candle['ma_20']
                else:  # 'both'
                    trend_condition = (
                        (bullish_engulfing & (current_candle['Close'] < current_candle['ma_20'])) |
                        (bearish_engulfing & (current_candle['Close'] > current_candle['ma_20']))
                    )
                engulfing_condition = engulfing_condition & trend_condition
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_engulfing')] = engulfing_condition
        
        return df
