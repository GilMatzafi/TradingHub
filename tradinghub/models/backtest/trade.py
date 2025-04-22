from dataclasses import dataclass
import pandas as pd

@dataclass
class Trade:
    """Represents a single trade in the backtest.
    
    Attributes:
        entry_date: Timestamp when the trade was entered
        exit_date: Timestamp when the trade was exited
        entry_price: Price at which the trade was entered
        exit_price: Price at which the trade was exited
        profit_pct: Percentage profit/loss of the trade
        profit_amount: Actual dollar profit/loss
        commission: Commission paid for this trade
        slippage_cost: Cost of slippage for this trade
        periods_held: Number of periods the trade was held
        exit_reason: Reason for trade exit ('stop_loss', 'take_profit', or 'max_periods')
    """
    entry_date: pd.Timestamp
    exit_date: pd.Timestamp
    entry_price: float
    exit_price: float
    profit_pct: float
    profit_amount: float
    commission: float
    slippage_cost: float
    periods_held: int
    exit_reason: str 