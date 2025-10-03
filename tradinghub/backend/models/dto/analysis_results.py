from dataclasses import dataclass
from datetime import datetime
from typing import List

@dataclass
class PatternResult:
    """Data transfer object for a single pattern detection result"""
    date: datetime
    trend: str
    open_price: float
    high_price: float
    low_price: float
    close_price: float

@dataclass
class AnalysisResult:
    """Data transfer object for the complete analysis results"""
    count: int
    patterns: List[PatternResult]
    
    def to_dict(self):
        """Convert the result to a dictionary for JSON serialization"""
        return {
            'count': self.count,
            'patterns': [
                {
                    'date': pattern.date.strftime('%Y-%m-%d %H:%M'),
                    'trend': pattern.trend,
                    'open': pattern.open_price,
                    'high': pattern.high_price,
                    'low': pattern.low_price,
                    'close': pattern.close_price
                }
                for pattern in self.patterns
            ]
        } 