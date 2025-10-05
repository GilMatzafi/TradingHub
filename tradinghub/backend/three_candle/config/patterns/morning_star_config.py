"""
Morning Star Pattern Configuration
Configuration for Morning Star bullish reversal patterns
"""

from tradinghub.backend.three_candle.patterns.morning_star_pattern import MorningStarPattern
from tradinghub.backend.three_candle.backtest.morning_star_backtest import MorningStarBacktest

# Default parameters for Morning Star pattern detection
DEFAULT_MORNING_STAR_PARAMS = {
    'body_size_ratio': 0.6,        # Minimum body size as fraction of total range
    'gap_ratio': 0.1,              # Minimum gap size as fraction of first candle body (10%)
    'penetration_ratio': 0.5,      # Minimum third candle penetration into first candle (50%)
    'ma_period': 20,               # Moving average period for trend context
    'require_trend': True,        # Whether to require downtrend context
    'star_body_ratio': 0.3        # Maximum star candle body size relative to first (30%)
}

# Morning Star pattern configuration
MORNING_STAR_CONFIG = {
    'name': 'Morning Star',
    'description': 'Bullish reversal pattern with gap down and strong bullish confirmation, showing transition from bearish to bullish momentum',
    'pattern_class': MorningStarPattern,
    'backtest_class': MorningStarBacktest,
    'default_params': DEFAULT_MORNING_STAR_PARAMS,
    'insights': [
        'One of the most reliable bullish reversal patterns',
        'First candle: Long bearish candle showing strong selling pressure',
        'Second candle: Small-bodied candle with gap down (indecision)',
        'Third candle: Strong bullish candle closing well into first candle\'s body',
        'The gap down visually separates the downtrend from the reversal',
        'Third candle must close above first candle\'s midpoint',
        'Represents transition from fear to optimism',
        'Often marks the beginning of a new uptrend',
        'More reliable when combined with volume confirmation'
    ],
    'template': 'morning_star_analyzer/index.html',
    'js_module': 'morning-star-strategy/index.js'
}
