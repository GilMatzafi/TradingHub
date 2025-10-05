"""
Three Inside Up Pattern Configuration
Configuration for Three Inside Up bullish reversal patterns
"""

from tradinghub.backend.three_candle.patterns.three_inside_up_pattern import ThreeInsideUpPattern
from tradinghub.backend.three_candle.backtest.three_inside_up_backtest import ThreeInsideUpBacktest

# Default parameters for Three Inside Up pattern detection
DEFAULT_THREE_INSIDE_UP_PARAMS = {
    'body_size_ratio': 0.6,        # Minimum body size as fraction of total range
    'harami_body_ratio': 0.5,      # Maximum second candle body size relative to first (50%)
    'ma_period': 20,               # Moving average period for trend context
    'require_trend': True,         # Whether to require downtrend context
    'confirmation_strength': 0.8   # Minimum strength of third candle close (80%)
}

# Three Inside Up pattern configuration
THREE_INSIDE_UP_CONFIG = {
    'name': 'Three Inside Up',
    'description': 'Bullish reversal pattern combining Harami with confirmation candle, showing transition from bearish to bullish momentum',
    'pattern_class': ThreeInsideUpPattern,
    'backtest_class': ThreeInsideUpBacktest,
    'default_params': DEFAULT_THREE_INSIDE_UP_PARAMS,
    'insights': [
        'Strong bullish reversal signal when it appears after a downtrend',
        'First candle: Long bearish candle showing strong selling pressure',
        'Second candle: Small bullish candle contained within first candle (Harami)',
        'Third candle: Strong bullish candle closing above first candle\'s high',
        'The Harami pattern indicates weakening bearish momentum',
        'Third candle confirmation shows buyers taking control',
        'Represents transition from bearish sentiment to bullish momentum',
        'Often marks the beginning of a new uptrend',
        'More reliable when combined with volume confirmation'
    ],
    'template': 'three_inside_up_analyzer/index.html',
    'js_module': 'three-inside-up-strategy/index.js'
}
