"""
Three Inside Up Pattern Detection
Detects Three Inside Up bullish reversal candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class ThreeInsideUpPattern(BasePattern):
    """Detector for Three Inside Up candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Three Inside Up pattern presence
        
        Returns:
            str: Name of the Three Inside Up pattern column
        """
        return 'is_three_inside_up'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Three Inside Up patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - harami_body_ratio (float): Maximum second candle body size relative to first
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require downtrend context
                - confirmation_strength (float): Minimum strength of third candle close
                
        Returns:
            pd.DataFrame: DataFrame with Three Inside Up pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Three Inside Up patterns
        df = self._detect_three_inside_up_conditions(df, params)
        
        return df
    
    def _detect_three_inside_up_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Three Inside Up pattern conditions"""
        
        # Three Inside Up pattern conditions:
        # 1. First candle: Long bearish (red) candle
        # 2. Second candle: Small bullish (green) candle contained within first candle's body (Harami)
        # 3. Third candle: Bullish (green) candle that closes above first candle's high
        # 4. Third candle should close strongly near its high
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.6)
        harami_body_ratio = params.get('harami_body_ratio', 0.5)  # Second candle body max 50% of first
        require_trend = params.get('require_trend', True)
        confirmation_strength = params.get('confirmation_strength', 0.8)  # Third candle close strength
        
        # Initialize pattern column
        df['is_three_inside_up'] = False
        
        # Check for Three Inside Up patterns (need at least 3 candles)
        for i in range(2, len(df)):
            current_candle = df.iloc[i]
            second_candle = df.iloc[i-1]
            first_candle = df.iloc[i-2]
            
            # First candle must be bearish (red)
            if first_candle['Close'] >= first_candle['Open']:
                continue
            
            # Second candle must be bullish (green) and contained within first candle's body
            if (second_candle['Close'] <= second_candle['Open'] or
                second_candle['Open'] >= first_candle['Open'] or
                second_candle['Close'] <= first_candle['Close']):
                continue
            
            # Third candle must be bullish (green)
            if current_candle['Close'] <= current_candle['Open']:
                continue
            
            # Calculate body sizes
            first_body_size = first_candle['Open'] - first_candle['Close']
            second_body_size = second_candle['Close'] - second_candle['Open']
            third_body_size = current_candle['Close'] - current_candle['Open']
            
            # Calculate total ranges
            first_range = first_candle['High'] - first_candle['Low']
            second_range = second_candle['High'] - second_candle['Low']
            third_range = current_candle['High'] - current_candle['Low']
            
            if first_range == 0 or second_range == 0 or third_range == 0:  # Avoid division by zero
                continue
            
            # Check first candle body size ratio
            first_body_ratio = first_body_size / first_range
            if first_body_ratio < body_size_ratio:
                continue
            
            # Check that second candle body is small relative to first candle body (Harami)
            harami_ratio = second_body_size / first_body_size
            if harami_ratio > harami_body_ratio:
                continue
            
            # Check third candle body size
            third_body_ratio = third_body_size / third_range
            if third_body_ratio < body_size_ratio:
                continue
            
            # Third candle must close above first candle's high
            if current_candle['Close'] <= first_candle['High']:
                continue
            
            # Third candle should close strongly near its high (confirmation strength)
            third_close_strength = (current_candle['Close'] - current_candle['Open']) / (current_candle['High'] - current_candle['Open'])
            if third_close_strength < confirmation_strength:
                continue
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For Three Inside Up, we want to be in a downtrend initially
                trend_condition = first_candle['Close'] < first_candle['ma_20']
                if not trend_condition:
                    continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_three_inside_up')] = True
        
        return df
