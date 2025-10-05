"""
Three Black Crows Pattern Detection
Detects Three Black Crows bearish reversal candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class ThreeBlackCrowsPattern(BasePattern):
    """Detector for Three Black Crows candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Three Black Crows pattern presence
        
        Returns:
            str: Name of the Three Black Crows pattern column
        """
        return 'is_three_black_crows'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Three Black Crows patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - lower_shadow_ratio (float): Maximum lower shadow ratio
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require uptrend context
                - progressive_close (bool): Whether to require progressively lower closes
                
        Returns:
            pd.DataFrame: DataFrame with Three Black Crows pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Three Black Crows patterns
        df = self._detect_three_black_crows_conditions(df, params)
        
        return df
    
    def _detect_three_black_crows_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Three Black Crows pattern conditions"""
        
        # Three Black Crows pattern conditions:
        # 1. Three consecutive bearish (red) candles
        # 2. Each candle opens within the previous candle's real body
        # 3. Each candle closes progressively lower
        # 4. All candles should have long bodies with short lower shadows
        # 5. No large gaps between candles
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.6)
        lower_shadow_ratio = params.get('lower_shadow_ratio', 0.2)
        require_trend = params.get('require_trend', True)
        progressive_close = params.get('progressive_close', True)
        
        # Initialize pattern column
        df['is_three_black_crows'] = False
        
        # Check for Three Black Crows patterns (need at least 3 candles)
        for i in range(2, len(df)):
            current_candle = df.iloc[i]
            second_candle = df.iloc[i-1]
            first_candle = df.iloc[i-2]
            
            # All three candles must be bearish (red)
            if (current_candle['Close'] >= current_candle['Open'] or
                second_candle['Close'] >= second_candle['Open'] or
                first_candle['Close'] >= first_candle['Open']):
                continue
            
            # Calculate body sizes for all three candles
            first_body_size = first_candle['Open'] - first_candle['Close']
            second_body_size = second_candle['Open'] - second_candle['Close']
            third_body_size = current_candle['Open'] - current_candle['Close']
            
            # Calculate total ranges
            first_range = first_candle['High'] - first_candle['Low']
            second_range = second_candle['High'] - second_candle['Low']
            third_range = current_candle['High'] - current_candle['Low']
            
            if first_range == 0 or second_range == 0 or third_range == 0:  # Avoid division by zero
                continue
            
            # Check body size ratios for all candles
            first_body_ratio = first_body_size / first_range
            second_body_ratio = second_body_size / second_range
            third_body_ratio = third_body_size / third_range
            
            if (first_body_ratio < body_size_ratio or 
                second_body_ratio < body_size_ratio or 
                third_body_ratio < body_size_ratio):
                continue
            
            # Check lower shadow ratios for all candles
            first_lower_shadow = first_candle['Close'] - first_candle['Low']
            second_lower_shadow = second_candle['Close'] - second_candle['Low']
            third_lower_shadow = current_candle['Close'] - current_candle['Low']
            
            first_lower_shadow_ratio = first_lower_shadow / first_range
            second_lower_shadow_ratio = second_lower_shadow / second_range
            third_lower_shadow_ratio = third_lower_shadow / third_range
            
            if (first_lower_shadow_ratio > lower_shadow_ratio or
                second_lower_shadow_ratio > lower_shadow_ratio or
                third_lower_shadow_ratio > lower_shadow_ratio):
                continue
            
            # Check that each candle opens within the previous candle's body
            # Second candle should open within first candle's body
            if (second_candle['Open'] < first_candle['Close'] or 
                second_candle['Open'] > first_candle['Open']):
                continue
            
            # Third candle should open within second candle's body
            if (current_candle['Open'] < second_candle['Close'] or 
                current_candle['Open'] > second_candle['Open']):
                continue
            
            # Check for progressively lower closes if required
            if progressive_close:
                if (current_candle['Close'] >= second_candle['Close'] or
                    second_candle['Close'] >= first_candle['Close']):
                    continue
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For Three Black Crows, we want to be in an uptrend initially
                trend_condition = first_candle['Close'] > first_candle['ma_20']
                if not trend_condition:
                    continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_three_black_crows')] = True
        
        return df
