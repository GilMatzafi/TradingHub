"""
Doji Pattern Backtest
Backtests the doji pattern strategy - NO CODE DUPLICATION!
"""

from ..patterns.doji_pattern import DojiPattern
from .base_backtest import BaseBacktest

class DojiBacktest(BaseBacktest):
    """Backtester for doji pattern strategy"""
    
    def __init__(self):
        """Initialize the doji backtester"""
        super().__init__(DojiPattern())
