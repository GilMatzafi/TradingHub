from typing import Dict, Any
import pandas as pd
import numpy as np
from ..patterns.base_pattern import BasePattern
from tradinghub.backend.shared.models.dto.backtest_params import BacktestParams
from .performance_analyzer import PerformanceAnalyzer
from .trade_executor import TradeExecutor
from tradinghub.backend.shared.models.dto.trade_params import TradeParams

class BaseBacktest:
    """Base class for all pattern backtesters"""
    
    def __init__(self, pattern_detector: BasePattern, position_type: str = 'long'):
        """
        Initialize the backtester
        
        Args:
            pattern_detector: Pattern detector instance that implements BasePattern
            position_type: 'long' or 'short' position type
        """
        self.pattern_detector = pattern_detector
        self.position_type = position_type
        self.performance_analyzer = PerformanceAnalyzer()
    
    def run_backtest(self, df: pd.DataFrame, pattern_params: Dict[str, Any], backtest_params: BacktestParams) -> Dict[str, Any]:
        """
        Run backtest on historical data
        
        Args:
            df: DataFrame with OHLC data
            pattern_params: Parameters for pattern detection
            backtest_params: Parameters for backtesting
            
        Returns:
            Dictionary containing backtest results
        """
        # Detect patterns if not already detected
        pattern_column = self.pattern_detector.get_pattern_column_name()
        if pattern_column not in df.columns:
            df = self.pattern_detector.detect(df, pattern_params)
        
        # Initialize trade executor
        trade_params = TradeParams(
            stop_loss_pct=backtest_params.stop_loss_pct,
            take_profit_pct=backtest_params.take_profit_pct,
            max_holding_periods=backtest_params.max_holding_periods,
            commission=backtest_params.commission,
            slippage=backtest_params.slippage
        )
        trade_executor = TradeExecutor(trade_params, self.position_type)
        
        # Initialize portfolio
        portfolio_value = trade_executor.initialize_portfolio(
            backtest_params.initial_portfolio_size,
            df.index[0]
        )
        
        # Pre-compute arrays for faster access (vectorization optimization)
        pattern_signals = df[pattern_column].values
        dates = df.index.values
        open_prices = df['Open'].values
        max_iterations = len(df) - backtest_params.entry_delay
        
        # Iterate through data with optimized access
        for i in range(max_iterations):
            # Check if this is a pattern and we don't have an open position
            if pattern_signals[i]:
                # Enter position after entry_delay
                entry_idx = i + backtest_params.entry_delay
                if entry_idx < len(df):
                    entry_date = pd.Timestamp(dates[entry_idx])
                    entry_price = open_prices[entry_idx]
                    trade_executor.enter_position(entry_date, entry_price, portfolio_value)
            
            # Manage open position
            current_idx = i + backtest_params.entry_delay
            if current_idx < len(df):
                current_date = pd.Timestamp(dates[current_idx])
                current_bar = df.iloc[current_idx]  # Still need full bar for OHLC data
                position_closed = trade_executor.manage_position(current_date, current_bar)
                
                if position_closed:
                    portfolio_value = trade_executor.get_portfolio_history()[-1]['value']
        
        # Calculate performance metrics using PerformanceAnalyzer
        results = self.performance_analyzer.calculate_performance_metrics(trade_executor.get_trades())
        
        # Add portfolio tracking information
        results['initial_portfolio_value'] = backtest_params.initial_portfolio_size
        results['final_portfolio_value'] = portfolio_value
        results['portfolio_history'] = trade_executor.get_portfolio_history()
        results['total_commission'] = trade_executor.get_total_commission()
        results['total_slippage'] = trade_executor.get_total_slippage()
        
        # Add position type indicator
        results['position_type'] = self.position_type
        
        return results 