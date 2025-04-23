from dataclasses import dataclass

@dataclass
class TradeParams:
    """Parameters for trade execution"""
    stop_loss_pct: float
    take_profit_pct: float
    max_holding_periods: int
    commission: float
    slippage: float