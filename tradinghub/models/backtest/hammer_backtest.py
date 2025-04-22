from typing import Dict, Any, List, Optional, Tuple, NamedTuple
import pandas as pd
from ..patterns.hammer_pattern import HammerPattern
from .trade import Trade
from .params import BacktestParams

class BacktestState:
    """Tracks the state of a backtest run including costs and portfolio value."""
    def __init__(self, initial_portfolio_value: float):
        self.trades: List[Trade] = []
        self.portfolio_history: List[Dict] = [{'date': None, 'value': initial_portfolio_value}]
        self.total_commission: float = 0.0
        self.total_slippage: float = 0.0
    
    def add_commission(self, commission: float) -> None:
        """Add commission cost to total."""
        self.total_commission += commission
    
    def add_slippage(self, slippage: float) -> None:
        """Add slippage cost to total."""
        self.total_slippage += slippage
    
    def update_portfolio_value(self, date: pd.Timestamp, value: float) -> None:
        """Update portfolio value history."""
        if self.portfolio_history[0]['date'] is None:
            self.portfolio_history[0]['date'] = date
        else:
            self.portfolio_history.append({'date': date, 'value': value})
    
    def add_trade(self, trade: Trade) -> None:
        """Add a completed trade to history."""
        self.trades.append(trade)
    
    @property
    def current_portfolio_value(self) -> float:
        """Get current portfolio value."""
        return self.portfolio_history[-1]['value']

class HammerBacktest:
    """Backtesting engine for hammer pattern trading strategy."""
    
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
        
        # Initialize backtest state
        state = BacktestState(backtest_params.initial_portfolio_size)
        state.update_portfolio_value(df.index[0], backtest_params.initial_portfolio_size)
        current_position = None
        
        # Iterate through data
        for i in range(len(df) - backtest_params.entry_delay):
            current_position = self._process_bar(
                df, i, current_position, state, backtest_params
            )
        
        # Calculate and return results
        return self._compile_results(state, backtest_params)
    
    def _process_bar(
        self, 
        df: pd.DataFrame, 
        i: int, 
        current_position: Optional[Dict], 
        state: BacktestState,
        backtest_params: BacktestParams,
    ) -> Optional[Dict]:
        """Process a single bar of data, managing positions and executing trades."""
        # Check for entry conditions
        if self._should_enter_position(df, i, current_position):
            return self._enter_position(df, i, backtest_params, state)
        
        # Manage existing position
        if current_position is not None:
            return self._manage_position(
                df, i, current_position, state,
                backtest_params
            )
        
        return current_position
    
    def _should_enter_position(self, df: pd.DataFrame, i: int, current_position: Optional[Dict]) -> bool:
        """Determine if we should enter a new position."""
        return df.iloc[i]['is_hammer'] and current_position is None
    
    def _enter_position(
        self,
        df: pd.DataFrame,
        i: int,
        backtest_params: BacktestParams,
        state: BacktestState,
    ) -> Dict:
        """Enter a new position based on hammer pattern."""
        entry_date = df.index[i + backtest_params.entry_delay]
        base_entry_price = df.iloc[i + backtest_params.entry_delay]['Open']
        
        # Calculate position size and shares
        position_size = state.current_portfolio_value
        shares = position_size / base_entry_price
        
        # Apply slippage to entry price
        slippage_cost = backtest_params.slippage
        entry_price = base_entry_price + (slippage_cost / shares)
        
        # Calculate stop loss and take profit levels
        stop_loss = entry_price * (1 - backtest_params.stop_loss_pct)
        take_profit = entry_price * (1 + backtest_params.take_profit_pct)
        
        # Update costs
        commission = backtest_params.commission
        state.add_commission(commission)
        state.add_slippage(slippage_cost)
        
        # Update portfolio value
        new_portfolio_value = state.current_portfolio_value - commission - slippage_cost
        state.update_portfolio_value(entry_date, new_portfolio_value)
        
        return {
            'entry_date': entry_date,
            'entry_price': entry_price,
            'stop_loss': stop_loss,
            'take_profit': take_profit,
            'periods_held': 0,
            'shares': shares,
            'commission': commission,
            'slippage_cost': slippage_cost
        }
    
    def _manage_position(
        self,
        df: pd.DataFrame,
        i: int,
        current_position: Dict,
        state: BacktestState,
        backtest_params: BacktestParams,
    ) -> Optional[Dict]:
        """Manage an existing position, checking for exit conditions."""
        if i + backtest_params.entry_delay >= len(df):
            return self._close_position_at_end(
                df, current_position, state,
                backtest_params
            )
        
        current_bar = df.iloc[i + backtest_params.entry_delay]
        current_position['periods_held'] += 1
        
        # Check exit conditions
        exit_conditions = self._check_exit_conditions(current_bar, current_position, backtest_params)
        if exit_conditions:
            exit_price, exit_reason = exit_conditions
            self._close_position(
                current_position, df.index[i + backtest_params.entry_delay],
                exit_price, exit_reason, state,
                backtest_params
            )
            return None
        
        return current_position
    
    def _check_exit_conditions(
        self,
        current_bar: pd.Series,
        position: Dict,
        backtest_params: BacktestParams
    ) -> Optional[Tuple[float, str]]:
        """Check if any exit conditions are met."""
        if current_bar['Low'] <= position['stop_loss']:
            return position['stop_loss'], 'stop_loss'
        elif current_bar['High'] >= position['take_profit']:
            return position['take_profit'], 'take_profit'
        elif position['periods_held'] >= backtest_params.max_holding_periods:
            return current_bar['Close'], 'max_periods'
        return None
    
    def _close_position_at_end(
        self,
        df: pd.DataFrame,
        position: Dict,
        state: BacktestState,
        backtest_params: BacktestParams,
    ) -> None:
        """Close position at the end of the data."""
        exit_price = df.iloc[-1]['Close']
        self._close_position(
            position, df.index[-1], exit_price, 'end_of_data',
            state, backtest_params
        )
    
    def _close_position(
        self,
        position: Dict,
        exit_date: pd.Timestamp,
        exit_price: float,
        exit_reason: str,
        state: BacktestState,
        backtest_params: BacktestParams,
    ) -> None:
        """Close a position and record the trade."""
        # Apply slippage to exit price
        base_exit_price = exit_price
        slippage_cost = backtest_params.slippage
        exit_price = base_exit_price - (slippage_cost / position['shares'])
        
        # Calculate profit/loss
        profit_pct = (exit_price - position['entry_price']) / position['entry_price']
        profit_amount = position['shares'] * (exit_price - position['entry_price'])
        
        # Update costs
        commission = backtest_params.commission
        state.add_commission(commission)
        state.add_slippage(slippage_cost)
        
        # Update portfolio value
        new_portfolio_value = state.current_portfolio_value + profit_amount - commission - slippage_cost
        state.update_portfolio_value(exit_date, new_portfolio_value)
        
        # Record trade
        state.add_trade(Trade(
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
        ))
    
    def _compile_results(
        self,
        state: BacktestState,
        backtest_params: BacktestParams,
    ) -> Dict[str, Any]:
        """Compile all backtest results into a single dictionary."""
        performance_metrics = self._calculate_performance_metrics(state.trades)
        
        return {
            **performance_metrics,
            'initial_portfolio_value': backtest_params.initial_portfolio_size,
            'final_portfolio_value': state.current_portfolio_value,
            'portfolio_history': state.portfolio_history,
            'total_commission': state.total_commission,
            'total_slippage': state.total_slippage
        }
    
    def _calculate_performance_metrics(self, trades: List[Trade]) -> Dict[str, Any]:
        """Calculate performance metrics from trades."""
        if not trades:
            return self._empty_performance_metrics()
        
        winning_trades = [t for t in trades if t.profit_pct > 0]
        losing_trades = [t for t in trades if t.profit_pct < 0]
        
        total_profit = sum(t.profit_pct for t in trades)
        total_win = sum(t.profit_pct for t in winning_trades)
        total_loss = abs(sum(t.profit_pct for t in losing_trades))
        
        win_rate = len(winning_trades) / len(trades)
        profit_factor = total_win / total_loss if total_loss > 0 else 0
        average_profit = total_profit / len(trades)
        
        return {
            'total_trades': len(trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'average_profit': average_profit,
            'total_profit_pct': total_profit * 100,
            'trades': self._format_trades(trades),
            'hourly_performance': self._calculate_hourly_performance(trades)
        }
    
    def _empty_performance_metrics(self) -> Dict[str, Any]:
        """Return empty performance metrics when there are no trades."""
        return {
            'total_trades': 0,
            'winning_trades': 0,
            'losing_trades': 0,
            'win_rate': 0,
            'profit_factor': 0,
            'average_profit': 0,
            'total_profit_pct': 0,
            'trades': [],
            'hourly_performance': self._calculate_hourly_performance([])
        }
    
    def _format_trades(self, trades: List[Trade]) -> List[Dict]:
        """Format trades for output."""
        return [
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
    
    def _calculate_hourly_performance(self, trades: List[Trade]) -> Dict[str, Any]:
        """Calculate performance metrics by hour of day."""
        if not trades:
            return self._empty_hourly_performance()
        
        hourly_trades = [0] * 24
        hourly_profits = [0] * 24
        hourly_wins = [0] * 24
        
        for trade in trades:
            hour = trade.entry_date.hour
            hourly_trades[hour] += 1
            hourly_profits[hour] += trade.profit_pct
            if trade.profit_pct > 0:
                hourly_wins[hour] += 1
        
        return {
            'hourly_trades': hourly_trades,
            'hourly_profits': hourly_profits,
            'hourly_win_rates': [
                hourly_wins[hour] / hourly_trades[hour] if hourly_trades[hour] > 0 else 0
                for hour in range(24)
            ],
            'hourly_avg_profits': [
                hourly_profits[hour] / hourly_trades[hour] if hourly_trades[hour] > 0 else 0
                for hour in range(24)
            ]
        }
    
    def _empty_hourly_performance(self) -> Dict[str, Any]:
        """Return empty hourly performance metrics."""
        return {
            'hourly_trades': [0] * 24,
            'hourly_profits': [0] * 24,
            'hourly_win_rates': [0] * 24,
            'hourly_avg_profits': [0] * 24
        } 