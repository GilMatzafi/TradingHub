from typing import Dict, Any, List, Type
import pandas as pd
from ..models.dto.backtest_params import BacktestParams
from ..models.dto.pattern_params import PatternParams
from ..backtest.base_backtest import BaseBacktest
from ..backtest.hammer_backtest import HammerBacktest
from ..services.stock_service import StockService

class BacktestService:
    """Service for running backtests on different pattern strategies"""
    
    def __init__(self):
        self.stock_service = StockService()
        self.backtesters = {
            'hammer': HammerBacktest()
            # Add more pattern backtesters here as they are implemented
        }
    
    def get_backtester(self, pattern_type: str) -> BaseBacktest:
        """
        Get the appropriate backtester for the given pattern type
        
        Args:
            pattern_type: Type of pattern to backtest
            
        Returns:
            BaseBacktest instance for the given pattern type
            
        Raises:
            ValueError: If pattern type is not supported
        """
        if pattern_type not in self.backtesters:
            raise ValueError(f'Unsupported pattern type: {pattern_type}')
        return self.backtesters[pattern_type]

    def run_backtest(self, 
                    symbol: str, 
                    days: int, 
                    interval: str,
                    pattern_params: PatternParams,
                    backtest_params: BacktestParams,
                    patterns: List[Dict[str, Any]],
                    pattern_type: str = 'hammer') -> Dict[str, Any]:
        """
        Run a backtest for the given parameters
        
        Args:
            symbol: Stock symbol
            days: Number of days of historical data
            interval: Data interval (e.g., '5m', '1h')
            pattern_params: Parameters for pattern detection
            backtest_params: Parameters for backtesting
            patterns: List of pattern data to backtest
            pattern_type: Type of pattern to backtest (default: 'hammer')
            
        Returns:
            Dictionary containing backtest results
        """
        # Get historical data
        df = self.stock_service.download_stock_data(symbol, days, interval)
        
        if df.empty:
            raise ValueError('No data available for the specified parameters')
        
        if not patterns:
            raise ValueError('No patterns provided for backtesting')
        
        # Convert patterns to DataFrame format
        patterns_df = pd.DataFrame(patterns)
        if patterns_df.empty:
            raise ValueError('Empty patterns data provided')
        
        # Convert date strings to datetime objects
        patterns_df['date'] = pd.to_datetime(patterns_df['date'])
        
        # Handle timezone conversion for pattern dates
        israel_tz = 'Asia/Jerusalem'
        
        # If pattern dates have timezone info, convert to Israel timezone
        if patterns_df['date'].dt.tz is not None:
            patterns_df['date'] = patterns_df['date'].dt.tz_convert(israel_tz)
        else:
            # If pattern dates are timezone-naive, assume they're in Israel timezone
            patterns_df['date'] = patterns_df['date'].dt.tz_localize(israel_tz)
        
        # Handle timezone for DataFrame index
        if df.index.tz is not None:
            # If index has timezone, convert to Israel timezone
            df.index = df.index.tz_convert(israel_tz)
        else:
            # If index is timezone-naive, assume it's in Israel timezone
            df.index = df.index.tz_localize(israel_tz)
        
        # Create a list of pattern dates for matching
        pattern_dates = patterns_df['date'].tolist()
        
        # Get the appropriate backtester
        backtester = self.get_backtester(pattern_type)
        
        # Mark patterns in the main dataframe
        pattern_column = backtester.pattern_detector.get_pattern_column_name()
        df[pattern_column] = False
        for date in pattern_dates:
            # Find the closest date in the dataframe
            closest_idx = df.index[df.index.get_indexer([date], method='nearest')[0]]
            df.loc[closest_idx, pattern_column] = True
        
        # Filter df to only include data around pattern dates
        # Include data before and after each pattern for backtesting
        lookback = max(backtest_params.entry_delay, backtest_params.max_holding_periods)
        pattern_indices = df[df[pattern_column]].index
        
        # Create a mask for rows to include
        include_mask = pd.Series(False, index=df.index)
        for idx in pattern_indices:
            # Find the position of this index in the dataframe
            pos = df.index.get_loc(idx)
            # Include rows before and after the pattern
            start_pos = max(0, pos - lookback)
            end_pos = min(len(df), pos + lookback + 1)
            include_mask.iloc[start_pos:end_pos] = True
        
        # Apply the mask to filter the dataframe
        df = df[include_mask]
        
        if df.empty:
            raise ValueError('No matching data found for the provided patterns')
        
        # Run backtest
        results = backtester.run_backtest(df, pattern_params.__dict__, backtest_params)
        
        # Ensure all required fields are present in the results
        if not results:
            results = {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'average_profit': 0,
                'total_profit_pct': 0,
                'initial_portfolio_value': backtest_params.initial_portfolio_size,
                'final_portfolio_value': backtest_params.initial_portfolio_size,
                'portfolio_history': [{'date': df.index[0], 'value': backtest_params.initial_portfolio_size}],
                'trades': []
            }
        
        return results
