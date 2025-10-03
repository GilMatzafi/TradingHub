"""
Hammer Pattern Backtest
Backtests the hammer pattern strategy - NO CODE DUPLICATION!
"""

from ..patterns.hammer_pattern import HammerPattern
from .base_backtest import BaseBacktest

class HammerBacktest(BaseBacktest):
    """Backtester for hammer pattern strategy"""
    
    def __init__(self):
        """Initialize the hammer backtester"""
        super().__init__(HammerPattern()) 