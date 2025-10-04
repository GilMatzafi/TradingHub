"""
Harami Pattern Detection
Detects bullish and bearish Harami patterns in candlestick data
"""
import pandas as pd
import numpy as np
from typing import Dict, Any
from tradinghub.backend.shared.utils.candlestick_utils import CandlestickUtils

class HaramiPattern:
    """Detects Harami patterns in candlestick data"""
    
    def __init__(self):
        self.name = "Harami"
        self.description = "Two-candle reversal pattern where the second candle is contained within the first candle's body"
    
    def get_pattern_column_name(self):
        """Get the name of the pattern column"""
        return 'is_harami'
    
    def detect(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Harami patterns in the dataframe
        
        Args:
            df (pd.DataFrame): DataFrame with OHLC data
            params (Dict[str, Any]): Pattern detection parameters
            
        Returns:
            pd.DataFrame: DataFrame with pattern detection results
        """
        # Calculate candle properties
        df = CandlestickUtils.calculate_properties(df)
        
        # Add moving average for trend context
        if params.get('require_trend', True):
            df = CandlestickUtils.add_trend_context(df, params.get('ma_period', 20))
        
        # Detect Harami patterns
        df = self._detect_harami_conditions(df, params)
        
        return df
    
    def _detect_harami_conditions(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """Apply Harami pattern conditions"""
        
        # Harami pattern conditions:
        # 1. First candle has a large body (significant size)
        # 2. Second candle has a small body (contained within first candle's body)
        # 3. Second candle's body is completely inside first candle's body
        # 4. Opposite colors (first candle opposite to second candle)
        
        # Get parameters
        body_size_ratio = params.get('body_size_ratio', 0.3)
        harami_type = params.get('harami_type', 'both')  # 'bullish', 'bearish', or 'both'
        require_trend = params.get('require_trend', True)
        
        # Initialize pattern column
        df['is_harami'] = False
        
        # Check for Harami patterns (need at least 2 candles)
        for i in range(1, len(df)):
            current_candle = df.iloc[i]
            previous_candle = df.iloc[i-1]
            
            # Skip if any required data is missing
            if pd.isna(current_candle['body_size']) or pd.isna(previous_candle['body_size']):
                continue
            
            # Check if previous candle has significant body size
            if previous_candle['body_size'] < body_size_ratio * previous_candle['total_range']:
                continue
            
            # Check if current candle's body is completely contained within previous candle's body
            if not self._is_body_contained(current_candle, previous_candle):
                continue
            
            # Check color conditions based on harami type
            if not self._check_color_conditions(current_candle, previous_candle, harami_type):
                continue
            
            # Check trend condition if required
            if require_trend and 'trend' in df.columns:
                if pd.isna(current_candle['trend']):
                    continue
                # For bullish harami, we want downtrend before reversal
                # For bearish harami, we want uptrend before reversal
                if harami_type in ['bullish', 'both'] and current_candle['trend'] != 'downtrend':
                    continue
                if harami_type in ['bearish', 'both'] and current_candle['trend'] != 'uptrend':
                    continue
            
            # Mark as Harami pattern (use .loc with the actual index)
            df.loc[df.index[i], 'is_harami'] = True
            
            # Add pattern type classification
            if current_candle['is_green'] and not previous_candle['is_green']:
                df.loc[df.index[i], 'harami_type'] = 'bullish_harami'
            elif not current_candle['is_green'] and previous_candle['is_green']:
                df.loc[df.index[i], 'harami_type'] = 'bearish_harami'
            else:
                df.loc[df.index[i], 'harami_type'] = 'neutral_harami'
        
        return df
    
    def _is_body_contained(self, current_candle: pd.Series, previous_candle: pd.Series) -> bool:
        """Check if current candle's body is completely contained within previous candle's body"""
        
        # Get body ranges
        current_body_top = max(current_candle['Open'], current_candle['Close'])
        current_body_bottom = min(current_candle['Open'], current_candle['Close'])
        previous_body_top = max(previous_candle['Open'], previous_candle['Close'])
        previous_body_bottom = min(previous_candle['Open'], previous_candle['Close'])
        
        # Check if current body is completely within previous body
        return (current_body_top <= previous_body_top and 
                current_body_bottom >= previous_body_bottom)
    
    def _check_color_conditions(self, current_candle: pd.Series, previous_candle: pd.Series, harami_type: str) -> bool:
        """Check if color conditions are met for the specified harami type"""
        
        if harami_type == 'bullish':
            # Bullish harami: first candle red, second candle green
            return not previous_candle['is_green'] and current_candle['is_green']
        elif harami_type == 'bearish':
            # Bearish harami: first candle green, second candle red
            return previous_candle['is_green'] and not current_candle['is_green']
        else:  # 'both'
            # Either bullish or bearish harami
            return (not previous_candle['is_green'] and current_candle['is_green']) or \
                   (previous_candle['is_green'] and not current_candle['is_green'])
