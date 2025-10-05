"""
Dark Cloud Cover Pattern Detection
Detects Dark Cloud Cover bearish reversal candlestick patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class DarkCloudCoverPattern(BasePattern):
    """Detector for Dark Cloud Cover candlestick patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Dark Cloud Cover pattern presence
        
        Returns:
            str: Name of the Dark Cloud Cover pattern column
        """
        return 'is_dark_cloud_cover'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Dark Cloud Cover patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - max_shadow_ratio (float): Maximum shadow ratio for both candles
                - penetration_ratio (float): Minimum penetration ratio into first candle's body
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require uptrend context
                
        Returns:
            pd.DataFrame: DataFrame with Dark Cloud Cover pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Dark Cloud Cover patterns
        df = self._detect_dark_cloud_cover_conditions(df, params)
        
        return df
    
    def _detect_dark_cloud_cover_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Dark Cloud Cover pattern conditions"""
        
        # Dark Cloud Cover pattern conditions:
        # 1. First candle: Bullish (green) with substantial body
        # 2. Second candle: Bearish (red) that opens above first candle's high (gap up)
        # 3. Second candle closes below midpoint of first candle's body
        # 4. Both candles have reasonable shadow ratios
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.6)
        max_shadow_ratio = params.get('max_shadow_ratio', 0.3)
        penetration_ratio = params.get('penetration_ratio', 0.5)
        require_trend = params.get('require_trend', True)
        
        # Initialize pattern column
        df['is_dark_cloud_cover'] = False
        
        # Check for Dark Cloud Cover patterns (need at least 2 candles)
        for i in range(1, len(df)):
            current_candle = df.iloc[i]
            previous_candle = df.iloc[i-1]
            
            # First candle must be bullish (green)
            if previous_candle['Close'] <= previous_candle['Open']:
                continue
            
            # Second candle must be bearish (red)
            if current_candle['Close'] >= current_candle['Open']:
                continue
            
            # Calculate first candle properties
            first_body_size = previous_candle['Close'] - previous_candle['Open']
            first_total_range = previous_candle['High'] - previous_candle['Low']
            
            if first_total_range == 0:
                continue
            
            first_body_ratio = first_body_size / first_total_range
            first_upper_shadow = previous_candle['High'] - previous_candle['Close']
            first_lower_shadow = previous_candle['Open'] - previous_candle['Low']
            first_upper_shadow_ratio = first_upper_shadow / first_total_range
            first_lower_shadow_ratio = first_lower_shadow / first_total_range
            
            # First candle should have substantial body and reasonable shadows
            if (first_body_ratio < body_size_ratio or 
                first_upper_shadow_ratio > max_shadow_ratio or 
                first_lower_shadow_ratio > max_shadow_ratio):
                continue
            
            # Calculate second candle properties
            second_body_size = current_candle['Open'] - current_candle['Close']
            second_total_range = current_candle['High'] - current_candle['Low']
            
            if second_total_range == 0:
                continue
            
            second_body_ratio = second_body_size / second_total_range
            second_upper_shadow = current_candle['High'] - current_candle['Open']
            second_lower_shadow = current_candle['Close'] - current_candle['Low']
            second_upper_shadow_ratio = second_upper_shadow / second_total_range
            second_lower_shadow_ratio = second_lower_shadow / second_total_range
            
            # Second candle should have reasonable body and shadows
            if (second_body_ratio < 0.3 or 
                second_upper_shadow_ratio > max_shadow_ratio or 
                second_lower_shadow_ratio > max_shadow_ratio):
                continue
            
            # Gap up: Second candle opens above first candle's high
            if current_candle['Open'] <= previous_candle['High']:
                continue
            
            # Penetration check: Second candle must close below midpoint of first candle's body
            first_body_midpoint = (previous_candle['Open'] + previous_candle['Close']) / 2
            
            if current_candle['Close'] >= first_body_midpoint:
                continue
            
            # Calculate penetration depth
            penetration_depth = (first_body_midpoint - current_candle['Close']) / first_body_size
            
            # Check if penetration meets minimum requirement
            if penetration_depth < penetration_ratio:
                continue
            
            # Add trend context if required
            if require_trend and 'ma_20' in df.columns:
                # For Dark Cloud Cover, we want to be in an uptrend (price above MA)
                trend_condition = current_candle['Close'] > current_candle['ma_20']
                if not trend_condition:
                    continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_dark_cloud_cover')] = True
        
        return df