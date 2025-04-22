from dataclasses import dataclass
from typing import Optional

@dataclass
class ElephantBarParams:
    """Parameters for elephant bar pattern detection"""
    body_size_ratio: float = 0.7  # Ratio of body size to total candle size
    shadow_ratio: float = 0.1     # Maximum ratio of shadow to total candle size
    ma_period: int = 20           # Moving average period
    require_green: bool = True    # Whether to require a green candle
    min_relative_volume: Optional[float] = None  # Minimum relative volume
    volume_lookback: Optional[int] = None        # Number of periods to look back for volume comparison

@dataclass
class ElephantBarAnalysisRequest:
    """Request object for elephant bar pattern analysis"""
    symbol: str
    days: int
    interval: str
    pattern_params: ElephantBarParams 