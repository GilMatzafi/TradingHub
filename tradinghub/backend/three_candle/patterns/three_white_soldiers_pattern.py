"""
Three White Soldiers Pattern Detection
Detects Three White Soldiers bullish reversal candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class ThreeWhiteSoldiersPattern(BasePattern):
    """Detector for Three White Soldiers candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Three White Soldiers pattern presence
        
        Returns:
            str: Name of the Three White Soldiers pattern column
        """
        return 'is_three_white_soldiers'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Three White Soldiers patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - upper_shadow_ratio (float): Maximum upper shadow ratio
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require downtrend context
                - progressive_close (bool): Whether to require progressively higher closes
                
        Returns:
            pd.DataFrame: DataFrame with Three White Soldiers pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Three White Soldiers patterns
        df = self._detect_three_white_soldiers_conditions(df, params)
        
        return df
    
    def _detect_three_white_soldiers_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Three White Soldiers pattern conditions"""
        
        # Three White Soldiers pattern conditions:
        # 1. Three consecutive bullish (green) candles
        # 2. Each candle opens within the previous candle's real body
        # 3. Each candle closes progressively higher
        # 4. All candles should have long bodies with short upper shadows
        # 5. No large gaps between candles
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.6)
        upper_shadow_ratio = params.get('upper_shadow_ratio', 0.2)
        require_trend = params.get('require_trend', True)
        progressive_close = params.get('progressive_close', True)
        
        # Initialize pattern column
        df['is_three_white_soldiers'] = False
        
        # Check for Three White Soldiers patterns (need at least 3 candles)
        for i in range(2, len(df)):
            current_candle = df.iloc[i]
            second_candle = df.iloc[i-1]
            first_candle = df.iloc[i-2]
            
            # All three candles must be bullish (green)
            if (current_candle['Close'] <= current_candle['Open'] or
                second_candle['Close'] <= second_candle['Open'] or
                first_candle['Close'] <= first_candle['Open']):
                continue
            
            # Calculate body sizes for all three candles
            first_body_size = first_candle['Close'] - first_candle['Open']
            second_body_size = second_candle['Close'] - second_candle['Open']
            third_body_size = current_candle['Close'] - current_candle['Open']
            
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
            
            # Check upper shadow ratios for all candles
            first_upper_shadow = first_candle['High'] - first_candle['Close']
            second_upper_shadow = second_candle['High'] - second_candle['Close']
            third_upper_shadow = current_candle['High'] - current_candle['Close']
            
            first_upper_shadow_ratio = first_upper_shadow / first_range
            second_upper_shadow_ratio = second_upper_shadow / second_range
            third_upper_shadow_ratio = third_upper_shadow / third_range
            
            if (first_upper_shadow_ratio > upper_shadow_ratio or
                second_upper_shadow_ratio > upper_shadow_ratio or
                third_upper_shadow_ratio > upper_shadow_ratio):
                continue
            
            # Check that each candle opens within the previous candle's body
            # Second candle should open within first candle's body
            if (second_candle['Open'] < first_candle['Open'] or 
                second_candle['Open'] > first_candle['Close']):
                continue
            
            # Third candle should open within second candle's body
            if (current_candle['Open'] < second_candle['Open'] or 
                current_candle['Open'] > second_candle['Close']):
                continue
            
            # Check for progressively higher closes if required
            if progressive_close:
                if (current_candle['Close'] <= second_candle['Close'] or
                    second_candle['Close'] <= first_candle['Close']):
                    continue
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For Three White Soldiers, we want to be in a downtrend initially
                trend_condition = first_candle['Close'] < first_candle['ma_20']
                if not trend_condition:
                    continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_three_white_soldiers')] = True
        
        return df
