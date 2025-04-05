from dataclasses import dataclass
from typing import Optional

@dataclass
class PatternParams:
    """Data transfer object for pattern detection parameters"""
    body_size_ratio: float = 0.3
    lower_shadow_ratio: float = 2.0
    upper_shadow_ratio: float = 0.1
    ma_period: int = 5
    require_green: bool = True

@dataclass
class AnalysisRequest:
    """Data transfer object for analysis request parameters"""
    symbol: str
    days: int
    interval: str
    pattern_params: Optional[PatternParams] = None
    
    def __post_init__(self):
        if self.pattern_params is None:
            self.pattern_params = PatternParams() 