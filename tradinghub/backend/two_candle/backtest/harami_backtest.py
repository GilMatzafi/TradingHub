"""
Harami Pattern Backtest
Backtesting implementation for Harami patterns
"""

from typing import Dict, Any
import pandas as pd
from tradinghub.backend.shared.backtest.base_backtest import BaseBacktest
from tradinghub.backend.two_candle.patterns.harami_pattern import HaramiPattern

class HaramiBacktest(BaseBacktest):
    """Backtest implementation for Harami patterns"""
    
    def __init__(self):
        """Initialize the Harami backtester"""
        pattern_detector = HaramiPattern()
        super().__init__(pattern_detector)
    
    def run_backtest(self, df: pd.DataFrame, pattern_params: Dict[str, Any], backtest_params) -> Dict[str, Any]:
        """
        Run backtest on historical data for Harami patterns
        
        Args:
            df: DataFrame with OHLC data
            pattern_params: Parameters for pattern detection
            backtest_params: Parameters for backtesting
            
        Returns:
            Dictionary containing backtest results
        """
        # Use the parent class backtest logic
        return super().run_backtest(df, pattern_params, backtest_params)
