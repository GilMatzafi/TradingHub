from dataclasses import dataclass
import pandas as pd

@dataclass
class Trade:
    """Represents a single trade in the backtest"""
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
