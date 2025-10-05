"""
Kicker Pattern Detection
Detects Kicker reversal candlestick patterns (both bullish and bearish)
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class KickerPattern(BasePattern):
    """Detector for Kicker candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Kicker pattern presence
        
        Returns:
            str: Name of the Kicker pattern column
        """
        return 'is_kicker'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Kicker patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - gap_size_ratio (float): Minimum gap size as percentage of price
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require trend context
                - kicker_type (str): 'bullish', 'bearish', or 'both'
                
        Returns:
            pd.DataFrame: DataFrame with Kicker pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Kicker patterns
        df = self._detect_kicker_conditions(df, params)
        
        return df
    
    def _detect_kicker_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Kicker pattern conditions"""
        
        # Kicker pattern conditions:
        # 1. Two consecutive candles with a significant gap
        # 2. No overlap between the candles' bodies
        # 3. Strong directional move in the second candle
        # 4. Gap must be significant relative to price
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.3)
        gap_size_ratio = params.get('gap_size_ratio', 0.5)  # 0.5% minimum gap
        require_trend = params.get('require_trend', True)
        kicker_type = params.get('kicker_type', 'both')  # 'bullish', 'bearish', or 'both'
        
        # Initialize pattern column
        df['is_kicker'] = False
        
        # Check for Kicker patterns (need at least 2 candles)
        for i in range(1, len(df)):
            current_candle = df.iloc[i]
            previous_candle = df.iloc[i-1]
            
            # Calculate body sizes for both candles
            first_body_size = abs(previous_candle['Close'] - previous_candle['Open'])
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
            
            # Check for gap and no overlap
            gap_size = 0
            is_bullish_kicker = False
            is_bearish_kicker = False
            
            # Check for Bullish Kicker (gap up)
            if (current_candle['Open'] > previous_candle['Open'] and 
                current_candle['Open'] > previous_candle['Close'] and
                current_candle['Close'] > current_candle['Open']):
                
                # Calculate gap size
                gap_size = current_candle['Open'] - previous_candle['Close']
                gap_percentage = (gap_size / previous_candle['Close']) * 100
                
                if gap_percentage >= gap_size_ratio:
                    is_bullish_kicker = True
            
            # Check for Bearish Kicker (gap down)
            elif (current_candle['Open'] < previous_candle['Open'] and 
                  current_candle['Open'] < previous_candle['Close'] and
                  current_candle['Close'] < current_candle['Open']):
                
                # Calculate gap size
                gap_size = previous_candle['Close'] - current_candle['Open']
                gap_percentage = (gap_size / previous_candle['Close']) * 100
                
                if gap_percentage >= gap_size_ratio:
                    is_bearish_kicker = True
            
            # Check if pattern matches the requested type
            if kicker_type == 'bullish' and not is_bullish_kicker:
                continue
            elif kicker_type == 'bearish' and not is_bearish_kicker:
                continue
            elif kicker_type == 'both' and not (is_bullish_kicker or is_bearish_kicker):
                continue
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                if is_bullish_kicker:
                    # For bullish kicker, we want to be in a downtrend (price below MA)
                    trend_condition = previous_candle['Close'] < previous_candle['ma_20']
                elif is_bearish_kicker:
                    # For bearish kicker, we want to be in an uptrend (price above MA)
                    trend_condition = previous_candle['Close'] > previous_candle['ma_20']
                else:
                    continue
                
                if not trend_condition:
                    continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_kicker')] = True
        
        return df
