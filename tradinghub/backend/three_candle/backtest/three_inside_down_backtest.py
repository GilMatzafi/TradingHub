"""
Three Inside Down Pattern Backtest
Backtesting implementation for Three Inside Down patterns
"""

from typing import Dict, Any
import pandas as pd
from tradinghub.backend.shared.backtest.base_backtest import BaseBacktest
from tradinghub.backend.three_candle.patterns.three_inside_down_pattern import ThreeInsideDownPattern

class ThreeInsideDownBacktest(BaseBacktest):
    """Backtest implementation for Three Inside Down patterns"""
    
    def __init__(self):
        """Initialize the Three Inside Down backtester"""
        pattern_detector = ThreeInsideDownPattern()
        super().__init__(pattern_detector)
    
    def run_backtest(self, df: pd.DataFrame, pattern_params: Dict[str, Any], backtest_params) -> Dict[str, Any]:
        """
        Run backtest on historical data for Three Inside Down patterns
        
        Args:
            df: DataFrame with OHLC data
            pattern_params: Parameters for pattern detection
            backtest_params: Parameters for backtesting
            
        Returns:
            Dictionary containing backtest results
        """
        # Use the parent class backtest logic
        return super().run_backtest(df, pattern_params, backtest_params)
