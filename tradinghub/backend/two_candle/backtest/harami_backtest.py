"""
Harami Pattern Backtest
Backtesting implementation for Harami pattern trading strategy
"""
import pandas as pd
from typing import Dict, Any, List
from tradinghub.backend.shared.backtest.base_backtest import BaseBacktest
from tradinghub.backend.two_candle.patterns.harami_pattern import HaramiPattern

class HaramiBacktest(BaseBacktest):
    """Backtest implementation for Harami pattern trading strategy"""
    
    def __init__(self):
        super().__init__()
        self.pattern_detector = HaramiPattern()
        self.pattern_name = "Harami"
    
    def detect_patterns(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Detect Harami patterns in the dataframe
        
        Args:
            df (pd.DataFrame): DataFrame with OHLC data
            params (Dict[str, Any]): Pattern detection parameters
            
        Returns:
            pd.DataFrame: DataFrame with pattern detection results
        """
        return self.pattern_detector.detect(df, params)
    
    def get_entry_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Get entry signals for Harami patterns
        
        Args:
            df (pd.DataFrame): DataFrame with pattern detection results
            params (Dict[str, Any]): Trading parameters
            
        Returns:
            pd.DataFrame: DataFrame with entry signals
        """
        df = df.copy()
        df['entry_signal'] = 0
        df['entry_price'] = 0.0
        df['entry_reason'] = ''
        
        # Get pattern detection results
        df = self.detect_patterns(df, params)
        
        # Generate entry signals for Harami patterns
        for i in range(len(df)):
            if df.iloc[i]['is_harami']:
                harami_type = df.iloc[i].get('harami_type', 'neutral_harami')
                
                if harami_type == 'bullish_harami':
                    # Bullish Harami: Buy signal
                    df.at[i, 'entry_signal'] = 1
                    df.at[i, 'entry_price'] = df.iloc[i]['Close']
                    df.at[i, 'entry_reason'] = 'Bullish Harami Pattern'
                    
                elif harami_type == 'bearish_harami':
                    # Bearish Harami: Sell signal
                    df.at[i, 'entry_signal'] = -1
                    df.at[i, 'entry_price'] = df.iloc[i]['Close']
                    df.at[i, 'entry_reason'] = 'Bearish Harami Pattern'
        
        return df
    
    def get_exit_signals(self, df: pd.DataFrame, params: Dict[str, Any]) -> pd.DataFrame:
        """
        Get exit signals for Harami patterns
        
        Args:
            df (pd.DataFrame): DataFrame with entry signals
            params (Dict[str, Any]): Trading parameters
            
        Returns:
            pd.DataFrame: DataFrame with exit signals
        """
        df = df.copy()
        df['exit_signal'] = 0
        df['exit_price'] = 0.0
        df['exit_reason'] = ''
        
        # Simple exit strategy: Exit after a fixed number of periods
        exit_periods = params.get('exit_periods', 5)
        
        for i in range(len(df)):
            if df.iloc[i]['entry_signal'] != 0:
                # Look for exit after specified periods
                exit_idx = min(i + exit_periods, len(df) - 1)
                df.at[exit_idx, 'exit_signal'] = -df.iloc[i]['entry_signal']
                df.at[exit_idx, 'exit_price'] = df.iloc[exit_idx]['Close']
                df.at[exit_idx, 'exit_reason'] = f'Exit after {exit_periods} periods'
        
        return df
    
    def calculate_performance_metrics(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate performance metrics for Harami pattern trades
        
        Args:
            trades (List[Dict[str, Any]]): List of completed trades
            
        Returns:
            Dict[str, Any]: Performance metrics
        """
        if not trades:
            return {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0.0,
                'total_return': 0.0,
                'average_return': 0.0,
                'max_return': 0.0,
                'min_return': 0.0,
                'sharpe_ratio': 0.0
            }
        
        # Calculate basic metrics
        total_trades = len(trades)
        winning_trades = sum(1 for trade in trades if trade['return'] > 0)
        losing_trades = total_trades - winning_trades
        win_rate = (winning_trades / total_trades) * 100 if total_trades > 0 else 0
        
        # Calculate returns
        returns = [trade['return'] for trade in trades]
        total_return = sum(returns)
        average_return = total_return / total_trades if total_trades > 0 else 0
        max_return = max(returns) if returns else 0
        min_return = min(returns) if returns else 0
        
        # Calculate Sharpe ratio (simplified)
        if len(returns) > 1:
            import numpy as np
            sharpe_ratio = np.mean(returns) / np.std(returns) if np.std(returns) > 0 else 0
        else:
            sharpe_ratio = 0
        
        return {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': round(win_rate, 2),
            'total_return': round(total_return, 4),
            'average_return': round(average_return, 4),
            'max_return': round(max_return, 4),
            'min_return': round(min_return, 4),
            'sharpe_ratio': round(sharpe_ratio, 4)
        }
