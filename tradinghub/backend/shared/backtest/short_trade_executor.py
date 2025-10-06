from typing import Dict, Any, List
import pandas as pd
from tradinghub.backend.shared.models.dto.trade_results import Trade
from tradinghub.backend.shared.models.dto.trade_params import TradeParams

class ShortTradeExecutor:
    """Trade executor specifically for short positions"""
    
    def __init__(self, trade_params: TradeParams):
        self.trade_params = trade_params
        self.current_position = None
        self.trades: List[Trade] = []
        self.portfolio_history = []
        self.total_commission = 0
        self.total_slippage = 0

    def initialize_portfolio(self, initial_value: float, start_date: pd.Timestamp):
        """Initialize the portfolio with starting value"""
        self.portfolio_history = [{'date': start_date, 'value': initial_value}]
        return initial_value

    def enter_position(self, entry_date: pd.Timestamp, entry_price: float, portfolio_value: float) -> bool:
        """
        Enter a new SHORT position if no position is currently open
        
        Args:
            entry_date: Date to enter the position
            entry_price: Price to enter at (we sell at this price)
            portfolio_value: Current portfolio value
            
        Returns:
            bool: True if position was entered, False otherwise
        """
        if self.current_position is not None:
            return False

        # Calculate position size and shares (use 100% of portfolio for each trade)
        shares = portfolio_value / entry_price
        
        # Apply fixed dollar slippage to entry price (for short: sell at lower price)
        slippage_cost = self.trade_params.slippage
        entry_price = entry_price - (slippage_cost / shares)
        
        # Calculate stop loss and take profit levels for SHORT positions
        # Stop loss: price goes UP (bad for short)
        stop_loss = entry_price * (1 + self.trade_params.stop_loss_pct)
        # Take profit: price goes DOWN (good for short)
        take_profit = entry_price * (1 - self.trade_params.take_profit_pct)
        
        # Pay commission for entry
        commission = self.trade_params.commission
        self.total_commission += commission
        portfolio_value -= commission
        
        # Pay slippage for entry
        self.total_slippage += slippage_cost
        portfolio_value -= slippage_cost
        
        self.current_position = {
            'entry_date': entry_date,
            'entry_price': entry_price,
            'stop_loss': stop_loss,
            'take_profit': take_profit,
            'periods_held': 0,
            'shares': shares,
            'commission': commission,
            'slippage_cost': slippage_cost
        }
        
        return True

    def manage_position(self, current_date: pd.Timestamp, current_bar: pd.Series) -> bool:
        """
        Manage the current SHORT position and check for exit conditions
        
        Args:
            current_date: Current date
            current_bar: Current price bar with OHLC data
            
        Returns:
            bool: True if position was closed, False otherwise
        """
        if self.current_position is None:
            return False

        self.current_position['periods_held'] += 1
        
        # Check for exit conditions for SHORT positions
        exit_reason = None
        # Stop loss: price goes UP (bad for short) - check if high touches stop loss
        if current_bar['High'] >= self.current_position['stop_loss']:
            exit_reason = 'stop_loss'
            exit_price = self.current_position['stop_loss']
        # Take profit: price goes DOWN (good for short) - check if low touches take profit
        elif current_bar['Low'] <= self.current_position['take_profit']:
            exit_reason = 'take_profit'
            exit_price = self.current_position['take_profit']
        elif self.current_position['periods_held'] >= self.trade_params.max_holding_periods:
            exit_reason = 'max_periods'
            exit_price = current_bar['Close']
        
        if exit_reason:
            self._close_position(current_date, exit_price, exit_reason)
            return True
            
        return False

    def _close_position(self, exit_date: pd.Timestamp, exit_price: float, exit_reason: str):
        """
        Close the current SHORT position and record the trade
        
        Args:
            exit_date: Date to close the position
            exit_price: Price to close at (we buy back at this price)
            exit_reason: Reason for closing the position
        """
        # Apply fixed dollar slippage to exit price (for short: buy back at higher price)
        base_exit_price = exit_price
        slippage_cost = self.trade_params.slippage
        exit_price = base_exit_price + (slippage_cost / self.current_position['shares'])
        
        # Calculate profit/loss for SHORT position
        # Profit = (entry_price - exit_price) / entry_price
        # If exit_price < entry_price, we profit (price went down)
        profit_pct = (self.current_position['entry_price'] - exit_price) / self.current_position['entry_price']
        profit_amount = self.current_position['shares'] * (self.current_position['entry_price'] - exit_price)
        
        # Calculate commission
        commission = self.trade_params.commission
        
        # Update totals
        self.total_commission += commission
        self.total_slippage += slippage_cost
        
        # Get the current portfolio value
        current_portfolio_value = self.portfolio_history[-1]['value']
        new_portfolio_value = current_portfolio_value + profit_amount - commission - slippage_cost
        
        # Record portfolio value
        self.portfolio_history.append({
            'date': exit_date,
            'value': new_portfolio_value
        })
        
        # Create and add the trade
        trade = Trade(
            entry_date=self.current_position['entry_date'],
            exit_date=exit_date,
            entry_price=self.current_position['entry_price'],
            exit_price=exit_price,
            profit_pct=profit_pct,
            profit_amount=profit_amount,
            commission=commission,
            slippage_cost=slippage_cost,
            periods_held=self.current_position['periods_held'],
            exit_reason=exit_reason
        )
        self.trades.append(trade)
        
        # Clear current position
        self.current_position = None

    def get_trades(self) -> List[Trade]:
        """Get the list of executed trades"""
        return self.trades

    def get_portfolio_history(self) -> List[Dict[str, Any]]:
        """Get the portfolio value history"""
        return self.portfolio_history

    def get_total_commission(self) -> float:
        """Get the total commission paid"""
        return self.total_commission

    def get_total_slippage(self) -> float:
        """Get the total slippage cost"""
        return self.total_slippage
