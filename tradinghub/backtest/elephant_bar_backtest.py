from typing import Dict, Any
from ..patterns.elephant_bar_pattern import ElephantBarPattern
from .base_backtest import BaseBacktest

class ElephantBarBacktest(BaseBacktest):
    """Backtester for Elephant Bar pattern strategy"""
    
    def __init__(self):
        """Initialize the Elephant Bar backtester"""
        super().__init__(ElephantBarPattern()) 