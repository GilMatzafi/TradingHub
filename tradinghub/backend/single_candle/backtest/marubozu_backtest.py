"""
Marubozu Pattern Backtest
Backtests the Marubozu pattern strategy - NO CODE DUPLICATION!
"""

from ..patterns.marubozu_pattern import MarubozuPattern
from tradinghub.backend.shared.backtest.base_backtest import BaseBacktest

class MarubozuBacktest(BaseBacktest):
    """Backtester for Marubozu pattern strategy"""
    
    def __init__(self):
        """Initialize the Marubozu backtester"""
        super().__init__(MarubozuPattern())
