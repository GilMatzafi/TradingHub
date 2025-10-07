from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class AnalyzeRequestModel(BaseModel):
    symbol: str = Field(default='AAPL')
    days: int = Field(default=50, ge=1, le=3650)
    interval: str = Field(default='5m')
    pattern_type: str = Field(default='hammer')

    model_config = ConfigDict(extra='allow')  # allow pattern-specific params


class AnalysisResponseModel(BaseModel):
    count: int
    patterns: List[Dict[str, Any]]

    model_config = ConfigDict(extra='allow')


class BacktestRequestModel(BaseModel):
    symbol: str = Field(default='AAPL')
    days: int = Field(default=50, ge=1, le=3650)
    interval: str = Field(default='5m')
    pattern_type: str = Field(default='hammer')
    position_type: str = Field(default='long')  # 'long' | 'short'

    # patterns found by analyze to backtest
    patterns: List[Dict[str, Any]] = Field(default_factory=list)

    # backtest params
    stop_loss_pct: float = 0.02
    take_profit_pct: float = 0.04
    entry_delay: int = 1
    max_holding_periods: int = 20
    initial_portfolio_size: float = 10000
    commission: float = 0.65
    slippage: float = 0.1

    model_config = ConfigDict(extra='allow')  # allow pattern-specific params


class BacktestResponseModel(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    profit_factor: float
    average_profit: float
    total_profit_pct: float
    initial_portfolio_value: float
    final_portfolio_value: float
    portfolio_history: List[Dict[str, Any]]
    trades: List[Dict[str, Any]]
    stock_data: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(extra='allow')


