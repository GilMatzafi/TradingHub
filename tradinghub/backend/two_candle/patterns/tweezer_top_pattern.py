"""
Tweezer Top Pattern Detection
Detects Tweezer Top bearish reversal candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class TweezerTopPattern(BasePattern):
    """Detector for Tweezer Top candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Tweezer Top pattern presence
        
        Returns:
            str: Name of the Tweezer Top pattern column
        """
        return 'is_tweezer_top'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Tweezer Top patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - high_tolerance (float): Maximum difference between highs as percentage
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require uptrend context
                
        Returns:
            pd.DataFrame: DataFrame with Tweezer Top pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Tweezer Top patterns
        df = self._detect_tweezer_top_conditions(df, params)
        
        return df
    
    def _detect_tweezer_top_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Tweezer Top pattern conditions"""
        
        # Tweezer Top pattern conditions:
        # 1. Two consecutive candles with nearly identical highs
        # 2. First candle: Bullish (green) - continues uptrend
        # 3. Second candle: Bearish (red) - shows selling pressure
        # 4. Both candles should have reasonable body sizes
        # 5. Highs should be within tolerance range
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.3)
        high_tolerance = params.get('high_tolerance', 0.2)  # 0.2% tolerance by default
        require_trend = params.get('require_trend', True)
        
        # Initialize pattern column
        df['is_tweezer_top'] = False
        
        # Check for Tweezer Top patterns (need at least 2 candles)
        for i in range(1, len(df)):
            current_candle = df.iloc[i]
            previous_candle = df.iloc[i-1]
            
            # First candle must be bullish (green)
            if previous_candle['Close'] <= previous_candle['Open']:
                continue
            
            # Second candle must be bearish (red)
            if current_candle['Close'] >= current_candle['Open']:
                continue
            
            # Calculate body sizes for both candles
            first_body_size = abs(previous_candle['Close'] - previous_candle['Open'])
            second_body_size = abs(current_candle['Open'] - current_candle['Close'])
            
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
            
            # Check if highs are nearly identical (within tolerance)
            high_difference = abs(previous_candle['High'] - current_candle['High'])
            average_high = (previous_candle['High'] + current_candle['High']) / 2
            high_tolerance_pct = high_tolerance / 100  # Convert percentage to decimal
            
            # Calculate tolerance in price terms
            price_tolerance = average_high * high_tolerance_pct
            
            if high_difference > price_tolerance:
                continue
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For Tweezer Top, we want to be in an uptrend (price above MA)
                trend_condition = current_candle['Close'] > current_candle['ma_20']
                if not trend_condition:
                    continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_tweezer_top')] = True
        
        return df
