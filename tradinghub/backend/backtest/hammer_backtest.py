from typing import Dict, Any, List
import pandas as pd
from ..patterns.hammer_pattern import HammerPattern
from ..models.dto.backtest_params import BacktestParams
from .performance_analyzer import PerformanceAnalyzer
from .trade_executor import TradeExecutor
from ..models.dto.trade_params import TradeParams
from .base_backtest import BaseBacktest

class HammerBacktest(BaseBacktest):
    """Backtester for hammer pattern strategy"""
    
    def __init__(self):
        """Initialize the hammer backtester"""
        super().__init__(HammerPattern())
        self.performance_analyzer = PerformanceAnalyzer()
    
    def run_backtest(self, df: pd.DataFrame, pattern_params: Dict[str, Any], backtest_params: BacktestParams) -> Dict[str, Any]:
        """
        Run backtest on historical data
        
        Args:
            df: DataFrame with OHLC data
            pattern_params: Parameters for hammer pattern detection
            backtest_params: Parameters for backtesting
            
        Returns:
            Dictionary containing backtest results
        """
        # Detect hammer patterns if not already detected
        if 'is_hammer' not in df.columns:
            df = self.hammer_detector.detect(df, pattern_params)
        
        # Initialize trade executor
        trade_params = TradeParams(
            stop_loss_pct=backtest_params.stop_loss_pct,
            take_profit_pct=backtest_params.take_profit_pct,
            max_holding_periods=backtest_params.max_holding_periods,
            commission=backtest_params.commission,
            slippage=backtest_params.slippage
        )
        trade_executor = TradeExecutor(trade_params)
        
        # Initialize portfolio
        portfolio_value = trade_executor.initialize_portfolio(
            backtest_params.initial_portfolio_size,
            df.index[0]
        )
        
        # Iterate through data
        for i in range(len(df) - backtest_params.entry_delay):
            # Check if this is a hammer pattern and we don't have an open position
            if df.iloc[i]['is_hammer']:
                # Enter position after entry_delay
                if i + backtest_params.entry_delay < len(df):
                    entry_date = df.index[i + backtest_params.entry_delay]
                    entry_price = df.iloc[i + backtest_params.entry_delay]['Open']
                    trade_executor.enter_position(entry_date, entry_price, portfolio_value)
            
            # Manage open position
            if i + backtest_params.entry_delay < len(df):
                current_date = df.index[i + backtest_params.entry_delay]
                current_bar = df.iloc[i + backtest_params.entry_delay]
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
        
        return results 