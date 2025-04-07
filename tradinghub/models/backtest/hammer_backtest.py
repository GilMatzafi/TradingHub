from dataclasses import dataclass
from typing import Dict, Any, List
import pandas as pd
from ..patterns.hammer_pattern import HammerPattern

@dataclass
class BacktestParams:
    """Parameters for backtesting the hammer pattern strategy"""
    stop_loss_pct: float = 0.02  # Stop loss as percentage of entry price
    take_profit_pct: float = 0.04  # Take profit as percentage of entry price
    entry_delay: int = 1  # Number of candles to wait before entering
    max_holding_periods: int = 20  # Maximum number of periods to hold a trade
    initial_portfolio_size: float = 10000.0  # Initial portfolio size in dollars
    commission: float = 0.65  # Commission per trade in dollars
    slippage: float = 0.1  # Slippage per trade in dollars (fixed dollar amount)

@dataclass
class Trade:
    """Represents a single trade in the backtest"""
    entry_date: pd.Timestamp
    exit_date: pd.Timestamp
    entry_price: float
    exit_price: float
    profit_pct: float
    profit_amount: float  # Added to track actual dollar profit/loss
    commission: float  # Commission paid for this trade
    slippage_cost: float  # Cost of slippage for this trade
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
        portfolio_value = backtest_params.initial_portfolio_size
        portfolio_history = [{'date': df.index[0], 'value': portfolio_value}]
        total_commission = 0
        total_slippage = 0
        
        # Iterate through data
        for i in range(len(df) - backtest_params.entry_delay):
            # Check if this is a hammer pattern and we don't have an open position
            if df.iloc[i]['is_hammer'] and current_position is None:
                # Enter position after entry_delay
                if i + backtest_params.entry_delay < len(df):
                    # Get base entry price
                    base_entry_price = df.iloc[i + backtest_params.entry_delay]['Open']
                    
                    # Calculate position size and shares (use 100% of portfolio for each trade)
                    position_size = portfolio_value
                    shares = position_size / base_entry_price
                    
                    # Apply fixed dollar slippage to entry price
                    slippage_cost = backtest_params.slippage
                    entry_price = base_entry_price + (slippage_cost / shares)
                    
                    # Calculate stop loss and take profit levels
                    stop_loss = entry_price * (1 - backtest_params.stop_loss_pct)
                    take_profit = entry_price * (1 + backtest_params.take_profit_pct)
                    
                    # Pay commission for entry
                    commission = backtest_params.commission
                    total_commission += commission
                    portfolio_value -= commission
                    
                    # Pay slippage for entry
                    total_slippage += slippage_cost
                    portfolio_value -= slippage_cost
                    
                    current_position = {
                        'entry_date': df.index[i + backtest_params.entry_delay],
                        'entry_price': entry_price,
                        'stop_loss': stop_loss,
                        'take_profit': take_profit,
                        'periods_held': 0,
                        'shares': shares,
                        'commission': commission,
                        'slippage_cost': slippage_cost
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
                        # Close the position
                        self._close_position(
                            current_position, 
                            df.index[i + backtest_params.entry_delay], 
                            exit_price, 
                            exit_reason, 
                            trades, 
                            portfolio_history,
                            backtest_params,
                            total_commission,
                            total_slippage
                        )
                        portfolio_value = portfolio_history[-1]['value']
                        current_position = None
                else:
                    # We've reached the end of the data, close the position
                    exit_price = df.iloc[-1]['Close']
                    self._close_position(
                        current_position, 
                        df.index[-1], 
                        exit_price, 
                        'end_of_data', 
                        trades, 
                        portfolio_history,
                        backtest_params,
                        total_commission,
                        total_slippage
                    )
                    portfolio_value = portfolio_history[-1]['value']
                    current_position = None
        
        # Calculate performance metrics
        results = self._calculate_performance_metrics(trades)
        
        # Add portfolio tracking information
        results['initial_portfolio_value'] = backtest_params.initial_portfolio_size
        results['final_portfolio_value'] = portfolio_value
        results['portfolio_history'] = portfolio_history
        results['total_commission'] = total_commission
        results['total_slippage'] = total_slippage
        
        return results
    
    def _close_position(self, position, exit_date, exit_price, exit_reason, trades, portfolio_history, backtest_params, total_commission, total_slippage):
        """
        Close a position and record the trade
        
        Args:
            position: The current position to close
            exit_date: The date when the position is closed
            exit_price: The price at which the position is closed
            exit_reason: The reason for closing the position
            trades: List to append the trade to
            portfolio_history: List to append the portfolio value to
            backtest_params: Backtest parameters
            total_commission: Running total of commission paid
            total_slippage: Running total of slippage cost
        """
        # Apply fixed dollar slippage to exit price
        base_exit_price = exit_price
        slippage_cost = backtest_params.slippage
        exit_price = base_exit_price - (slippage_cost / position['shares'])  # Adjust price by slippage per share
        
        # Calculate profit/loss
        profit_pct = (exit_price - position['entry_price']) / position['entry_price']
        profit_amount = position['shares'] * (exit_price - position['entry_price'])
        
        # Calculate commission
        commission = backtest_params.commission
        
        # Update totals
        total_commission += commission
        total_slippage += slippage_cost
        
        # Get the current portfolio value
        current_portfolio_value = portfolio_history[-1]['value']
        new_portfolio_value = current_portfolio_value + profit_amount - commission - slippage_cost
        
        # Record portfolio value
        portfolio_history.append({
            'date': exit_date,
            'value': new_portfolio_value
        })
        
        # Create and add the trade
        trade = Trade(
            entry_date=position['entry_date'],
            exit_date=exit_date,
            entry_price=position['entry_price'],
            exit_price=exit_price,
            profit_pct=profit_pct,
            profit_amount=profit_amount,
            commission=commission,
            slippage_cost=slippage_cost,
            periods_held=position['periods_held'],
            exit_reason=exit_reason
        )
        trades.append(trade)
    
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
                    'profit_amount': t.profit_amount,
                    'commission': t.commission,
                    'slippage_cost': t.slippage_cost,
                    'periods_held': t.periods_held,
                    'exit_reason': t.exit_reason
                }
                for t in trades
            ]
        } 