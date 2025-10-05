"""
Tweezer Bottom Pattern Detection
Detects Tweezer Bottom bullish reversal candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class TweezerBottomPattern(BasePattern):
    """Detector for Tweezer Bottom candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Tweezer Bottom pattern presence
        
        Returns:
            str: Name of the Tweezer Bottom pattern column
        """
        return 'is_tweezer_bottom'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Tweezer Bottom patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - low_tolerance (float): Maximum difference between lows as percentage
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require downtrend context
                
        Returns:
            pd.DataFrame: DataFrame with Tweezer Bottom pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Tweezer Bottom patterns
        df = self._detect_tweezer_bottom_conditions(df, params)
        
        return df
    
    def _detect_tweezer_bottom_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Tweezer Bottom pattern conditions"""
        
        # Tweezer Bottom pattern conditions:
        # 1. Two consecutive candles with nearly identical lows
        # 2. First candle: Bearish (red) - continues downtrend
        # 3. Second candle: Bullish (green) - shows buying pressure
        # 4. Both candles should have reasonable body sizes
        # 5. Lows should be within tolerance range
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.3)
        low_tolerance = params.get('low_tolerance', 0.2)  # 0.2% tolerance by default
        require_trend = params.get('require_trend', True)
        
        # Initialize pattern column
        df['is_tweezer_bottom'] = False
        
        # Check for Tweezer Bottom patterns (need at least 2 candles)
        for i in range(1, len(df)):
            current_candle = df.iloc[i]
            previous_candle = df.iloc[i-1]
            
            # First candle must be bearish (red)
            if previous_candle['Close'] >= previous_candle['Open']:
                continue
            
            # Second candle must be bullish (green)
            if current_candle['Close'] <= current_candle['Open']:
                continue
            
            # Calculate body sizes for both candles
            first_body_size = abs(previous_candle['Open'] - previous_candle['Close'])
            second_body_size = abs(current_candle['Close'] - current_candle['Open'])
            
            # Calculate total ranges
            first_range = previous_candle['High'] - previous_candle['Low']
            second_range = current_candle['High'] - current_candle['Low']
            
            if first_range == 0 or second_range == 0:  # Avoid division by zero
                continue
            
            # Check body size ratios
            first_body_ratio = first_body_size / first_range
            second_body_ratio = second_body_size / second_range
            
            if first_body_ratio < body_size_ratio or second_body_ratio < body_size_ratio:
                continue
            
            # Check if lows are nearly identical (within tolerance)
            low_difference = abs(previous_candle['Low'] - current_candle['Low'])
            average_low = (previous_candle['Low'] + current_candle['Low']) / 2
            low_tolerance_pct = low_tolerance / 100  # Convert percentage to decimal
            
            # Calculate tolerance in price terms
            price_tolerance = average_low * low_tolerance_pct
            
            if low_difference > price_tolerance:
                continue
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For Tweezer Bottom, we want to be in a downtrend (price below MA)
                trend_condition = current_candle['Close'] < current_candle['ma_20']
                if not trend_condition:
                    continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_tweezer_bottom')] = True
        
        return df
