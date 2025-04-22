from dataclasses import dataclass

@dataclass
class BacktestParams:
    """Parameters for backtesting trading strategies.
    
    Attributes:
        stop_loss_pct: Stop loss as percentage of entry price
        take_profit_pct: Take profit as percentage of entry price
        entry_delay: Number of candles to wait before entering
        max_holding_periods: Maximum number of periods to hold a trade
        initial_portfolio_size: Initial portfolio size in dollars
        commission: Commission per trade in dollars
        slippage: Slippage per trade in dollars (fixed dollar amount)
    """
    stop_loss_pct: float = 0.02
    take_profit_pct: float = 0.04
    entry_delay: int = 1
    max_holding_periods: int = 20
    initial_portfolio_size: float = 10000.0
    commission: float = 0.65
    slippage: float = 0.1 