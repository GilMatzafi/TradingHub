from dataclasses import dataclass
from typing import Dict, Any, List
import pandas as pd
from ..patterns.hammer_pattern import HammerPattern

@dataclass
class BacktestParams:
    """Parameters for backtesting the hammer pattern strategy"""
    stop_loss_pct: float  # Stop loss as percentage of entry price
    take_profit_pct: float  # Take profit as percentage of entry price
    entry_delay: int  # Number of candles to wait before entering
    max_holding_periods: int  # Maximum number of periods to hold a trade
    position_size: float  # Position size as percentage of capital

@dataclass
class Trade:
    """Represents a single trade in the backtest"""
    entry_date: pd.Timestamp
    exit_date: pd.Timestamp
    entry_price: float
    exit_price: float
    profit_pct: float
    periods_held: int
    exit_reason: str  # 'stop_loss', 'take_profit', or 'max_periods'

class HammerBacktest:
    def __init__(self):
        self.hammer_detector = HammerPattern()
    
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
        
        # Initialize backtest results
        trades: List[Trade] = []
        current_position = None
        
        # Iterate through data
        for i in range(len(df) - backtest_params.entry_delay):
            # Check if this is a hammer pattern and we don't have an open position
            if df.iloc[i]['is_hammer'] and current_position is None:
                # Enter position after entry_delay
                if i + backtest_params.entry_delay < len(df):
                    entry_price = df.iloc[i + backtest_params.entry_delay]['Open']
                    stop_loss = entry_price * (1 - backtest_params.stop_loss_pct)
                    take_profit = entry_price * (1 + backtest_params.take_profit_pct)
                    
                    current_position = {
                        'entry_date': df.index[i + backtest_params.entry_delay],
                        'entry_price': entry_price,
                        'stop_loss': stop_loss,
                        'take_profit': take_profit,
                        'periods_held': 0
                    }
            
            # Manage open position
            if current_position is not None:
                # Make sure we don't go out of bounds
                if i + backtest_params.entry_delay < len(df):
                    current_bar = df.iloc[i + backtest_params.entry_delay]
                    current_position['periods_held'] += 1
                    
                    # Check for exit conditions
                    exit_reason = None
                    if current_bar['Low'] <= current_position['stop_loss']:
                        exit_reason = 'stop_loss'
                        exit_price = current_position['stop_loss']
                    elif current_bar['High'] >= current_position['take_profit']:
                        exit_reason = 'take_profit'
                        exit_price = current_position['take_profit']
                    elif current_position['periods_held'] >= backtest_params.max_holding_periods:
                        exit_reason = 'max_periods'
                        exit_price = current_bar['Close']
                    
                    if exit_reason:
                        profit_pct = (exit_price - current_position['entry_price']) / current_position['entry_price']
                        
                        trade = Trade(
                            entry_date=current_position['entry_date'],
                            exit_date=df.index[i + backtest_params.entry_delay],
                            entry_price=current_position['entry_price'],
                            exit_price=exit_price,
                            profit_pct=profit_pct,
                            periods_held=current_position['periods_held'],
                            exit_reason=exit_reason
                        )
                        trades.append(trade)
                        current_position = None
                else:
                    # We've reached the end of the data, close the position
                    exit_price = df.iloc[-1]['Close']
                    profit_pct = (exit_price - current_position['entry_price']) / current_position['entry_price']
                    
                    trade = Trade(
                        entry_date=current_position['entry_date'],
                        exit_date=df.index[-1],
                        entry_price=current_position['entry_price'],
                        exit_price=exit_price,
                        profit_pct=profit_pct,
                        periods_held=current_position['periods_held'],
                        exit_reason='end_of_data'
                    )
                    trades.append(trade)
                    current_position = None
        
        # Calculate performance metrics
        return self._calculate_performance_metrics(trades)
    
    def _calculate_performance_metrics(self, trades: List[Trade]) -> Dict[str, Any]:
        """Calculate performance metrics from trades"""
        if not trades:
            return {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'average_profit': 0,
                'total_profit_pct': 0,
                'trades': []
            }
        
        winning_trades = [t for t in trades if t.profit_pct > 0]
        losing_trades = [t for t in trades if t.profit_pct < 0]
        
        total_profit = sum(t.profit_pct for t in trades)
        total_win = sum(t.profit_pct for t in winning_trades)
        total_loss = abs(sum(t.profit_pct for t in losing_trades))
        
        # Ensure we don't divide by zero
        win_rate = len(winning_trades) / len(trades) if trades else 0
        profit_factor = total_win / total_loss if total_loss > 0 else 0
        average_profit = total_profit / len(trades) if trades else 0
        
        return {
            'total_trades': len(trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'average_profit': average_profit,
            'total_profit_pct': total_profit * 100,
            'trades': [
                {
                    'entry_date': t.entry_date.strftime('%Y-%m-%d %H:%M'),
                    'exit_date': t.exit_date.strftime('%Y-%m-%d %H:%M'),
                    'entry_price': t.entry_price,
                    'exit_price': t.exit_price,
                    'profit_pct': t.profit_pct * 100,
                    'periods_held': t.periods_held,
                    'exit_reason': t.exit_reason
                }
                for t in trades
            ]
        } 