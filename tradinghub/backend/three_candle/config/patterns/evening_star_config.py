"""
Evening Star Pattern Configuration
Configuration for Evening Star bearish reversal patterns
"""

from tradinghub.backend.three_candle.patterns.evening_star_pattern import EveningStarPattern
from tradinghub.backend.three_candle.backtest.evening_star_backtest import EveningStarBacktest

# Default parameters for Evening Star pattern detection
DEFAULT_EVENING_STAR_PARAMS = {
    'body_size_ratio': 0.6,        # Minimum body size as fraction of total range
    'gap_ratio': 0.1,                # Minimum gap size as fraction of first candle body (10%)
    'penetration_ratio': 0.5,        # Minimum third candle penetration into first candle (50%)
    'ma_period': 20,                 # Moving average period for trend context
    'require_trend': True,           # Whether to require uptrend context
    'star_body_ratio': 0.3          # Maximum star candle body size relative to first (30%)
}

# Evening Star pattern configuration
EVENING_STAR_CONFIG = {
    'name': 'Evening Star',
    'description': 'Bearish reversal pattern with gap up and strong bearish confirmation, showing transition from bullish to bearish momentum',
    'pattern_class': EveningStarPattern,
    'backtest_class': EveningStarBacktest,
    'default_params': DEFAULT_EVENING_STAR_PARAMS,
    'insights': [
        'One of the most reliable bearish reversal patterns',
        'First candle: Long bullish candle showing strong buying pressure',
        'Second candle: Small-bodied candle with gap up (indecision)',
        'Third candle: Strong bearish candle closing well into first candle\'s body',
        'The gap up visually separates the uptrend from the reversal',
        'Third candle must close below first candle\'s midpoint',
        'Represents transition from optimism to fear',
        'Often marks the beginning of a new downtrend',
        'More reliable when combined with volume confirmation'
    ],
    'template': 'evening_star_analyzer/index.html',
    'js_module': 'evening-star-strategy/index.js'
}
