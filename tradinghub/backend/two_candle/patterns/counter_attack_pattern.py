"""
Counter Attack Candle Pattern Detection
Detects bullish and bearish Counter Attack Candle patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.patterns.base_pattern import BasePattern
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class CounterAttackPattern(BasePattern):
    """Detector for Counter Attack Candle patterns"""

    def get_pattern_column_name(self) -> str:
        """
        Get the name of the column that indicates Counter Attack pattern presence
        
        Returns:
            str: Name of the Counter Attack pattern column
        """
        return 'is_counter_attack'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Counter Attack patterns in the given dataframe
        
        Args:
            df (pd.DataFrame): Stock data with OHLC columns
            params (Dict[str, Any]): Pattern detection parameters
                - body_size_ratio (float): Minimum body size as fraction of total range
                - size_similarity (float): Minimum similarity ratio between candle sizes
                - counter_attack_type (str): Type of counter attack ('bullish', 'bearish', or 'both')
                - ma_period (int): Moving average period for trend context
                - require_trend (bool): Whether to require trend context
                
        Returns:
            pd.DataFrame: DataFrame with Counter Attack pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Counter Attack patterns
        df = self._detect_counter_attack_conditions(df, params)
        
        return df
    
    def _detect_counter_attack_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Counter Attack pattern conditions"""
        
        # Counter Attack pattern conditions:
        # Bullish Counter Attack:
        # 1. Appears after a downtrend
        # 2. First candle: Bearish (red) with significant body
        # 3. Second candle: Bullish (green) that opens with gap down (open₂ < close₁)
        # 4. Second candle closes almost at same level as previous close (|close₂ − close₁| ≤ tolerance)
        
        # Bearish Counter Attack:
        # 1. Appears after an uptrend  
        # 2. First candle: Bullish (green) with significant body
        # 3. Second candle: Bearish (red) that opens with gap up (open₂ > close₁)
        # 4. Second candle closes almost at same level as previous close (|close₂ − close₁| ≤ tolerance)
        
        # Get parameters
        body_size_ratio = float(params.get('body_size_ratio', 0.3))
        close_tolerance = float(params.get('close_tolerance', 0.02))  # 2% tolerance for close levels
        counter_attack_type = params.get('counter_attack_type', 'both')  # 'bullish', 'bearish', or 'both'
        require_trend = params.get('require_trend', True)
        
        # Initialize pattern column
        df['is_counter_attack'] = False
        
        # Check for counter attack patterns (need at least 2 candles)
        for i in range(1, len(df)):
            current_candle = df.iloc[i]
            previous_candle = df.iloc[i-1]
            
            # Calculate body sizes and ranges
            current_body_size = abs(current_candle['Close'] - current_candle['Open'])
            previous_body_size = abs(previous_candle['Close'] - previous_candle['Open'])
            
            current_range = current_candle['High'] - current_candle['Low']
            previous_range = previous_candle['High'] - previous_candle['Low']
            
            if current_range == 0 or previous_range == 0:  # Avoid division by zero
                continue
                
            current_body_ratio = current_body_size / current_range
            previous_body_ratio = previous_body_size / previous_range
            
            # Check if first candle has significant body
            if previous_body_ratio < body_size_ratio:
                continue
            
            # Calculate close level tolerance
            close_diff = abs(float(current_candle['Close']) - float(previous_candle['Close']))
            close_tolerance_value = float(previous_candle['Close']) * close_tolerance
            
            # Bullish Counter Attack conditions:
            # 1. First candle is bearish (red)
            # 2. Second candle is bullish (green) 
            # 3. Second candle opens with gap down (open₂ < close₁)
            # 4. Second candle closes almost at same level as previous close
            bullish_counter_attack = (
                # First candle is bearish (red)
                (float(previous_candle['Close']) < float(previous_candle['Open'])) &
                # Second candle is bullish (green)
                (float(current_candle['Close']) > float(current_candle['Open'])) &
                # Second candle opens with gap down
                (float(current_candle['Open']) < float(previous_candle['Close'])) &
                # Second candle closes almost at same level as previous close
                (close_diff <= close_tolerance_value)
            )
            
            # Bearish Counter Attack conditions:
            # 1. First candle is bullish (green)
            # 2. Second candle is bearish (red)
            # 3. Second candle opens with gap up (open₂ > close₁)
            # 4. Second candle closes almost at same level as previous close
            bearish_counter_attack = (
                # First candle is bullish (green)
                (float(previous_candle['Close']) > float(previous_candle['Open'])) &
                # Second candle is bearish (red)
                (float(current_candle['Close']) < float(current_candle['Open'])) &
                # Second candle opens with gap up
                (float(current_candle['Open']) > float(previous_candle['Close'])) &
                # Second candle closes almost at same level as previous close
                (close_diff <= close_tolerance_value)
            )
            
            # Apply counter attack type filter
            if counter_attack_type == 'bullish':
                counter_attack_condition = bullish_counter_attack
            elif counter_attack_type == 'bearish':
                counter_attack_condition = bearish_counter_attack
            else:  # 'both'
                counter_attack_condition = bullish_counter_attack | bearish_counter_attack
            
            # Add trend context if required
            if require_trend and 'trend' in df.columns:
                if pd.isna(current_candle['trend']):
                    continue
                # For bullish counter attack, we want to be in a downtrend (price below MA)
                # For bearish counter attack, we want to be in an uptrend (price above MA)
                if counter_attack_type == 'bullish':
                    if current_candle['trend'] != 'downtrend':
                        continue
                elif counter_attack_type == 'bearish':
                    if current_candle['trend'] != 'uptrend':
                        continue
                else:  # 'both'
                    if not ((bullish_counter_attack and current_candle['trend'] == 'downtrend') or
                           (bearish_counter_attack and current_candle['trend'] == 'uptrend')):
                        continue
            
            # Set the pattern flag
            df.iloc[i, df.columns.get_loc('is_counter_attack')] = counter_attack_condition
        
        return df
