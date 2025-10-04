"""
Elephant Bar Pattern Backtest
Backtests the elephant bar pattern strategy - NO CODE DUPLICATION!
"""

from ..patterns.elephant_bar_pattern import ElephantBarPattern
from tradinghub.backend.shared.backtest.base_backtest import BaseBacktest

class ElephantBarBacktest(BaseBacktest):
    """Backtester for elephant bar pattern strategy"""
    
    def __init__(self):
        """Initialize the elephant bar backtester"""
        super().__init__(ElephantBarPattern())
