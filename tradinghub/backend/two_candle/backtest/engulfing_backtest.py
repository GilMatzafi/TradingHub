"""
Engulfing Pattern Backtest
Backtesting implementation for Engulfing patterns
"""

from typing import Dict, Any
import pandas as pd
from tradinghub.backend.shared.backtest.base_backtest import BaseBacktest
from tradinghub.backend.two_candle.patterns.engulfing_pattern import EngulfingPattern

class EngulfingBacktest(BaseBacktest):
    """Backtest implementation for Engulfing patterns"""
    
    def __init__(self):
        """Initialize the Engulfing backtester"""
        pattern_detector = EngulfingPattern()
        super().__init__(pattern_detector)
    
    def run_backtest(self, df: pd.DataFrame, pattern_params: Dict[str, Any], backtest_params) -> Dict[str, Any]:
        """
        Run backtest on historical data for Engulfing patterns
        
        Args:
            df: DataFrame with OHLC data
            pattern_params: Parameters for pattern detection
            backtest_params: Parameters for backtesting
            
        Returns:
            Dictionary containing backtest results
        """
        # Use the parent class backtest logic
        return super().run_backtest(df, pattern_params, backtest_params)
