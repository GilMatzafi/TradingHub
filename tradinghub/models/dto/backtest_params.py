from dataclasses import dataclass

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
