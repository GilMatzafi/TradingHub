"""
Three Inside Down Pattern Configuration
Configuration for Three Inside Down bearish reversal patterns
"""

from tradinghub.backend.three_candle.patterns.three_inside_down_pattern import ThreeInsideDownPattern
from tradinghub.backend.three_candle.backtest.three_inside_down_backtest import ThreeInsideDownBacktest

# Default parameters for Three Inside Down pattern detection
DEFAULT_THREE_INSIDE_DOWN_PARAMS = {
    'body_size_ratio': 0.6,        # Minimum body size as fraction of total range
    'harami_body_ratio': 0.5,      # Maximum second candle body size relative to first (50%)
    'ma_period': 20,               # Moving average period for trend context
    'require_trend': True,         # Whether to require uptrend context
    'confirmation_strength': 0.8   # Minimum strength of third candle close (80%)
}

# Three Inside Down pattern configuration
THREE_INSIDE_DOWN_CONFIG = {
    'name': 'Three Inside Down',
    'description': 'Bearish reversal pattern combining Harami with confirmation candle, showing transition from bullish to bearish momentum',
    'pattern_class': ThreeInsideDownPattern,
    'backtest_class': ThreeInsideDownBacktest,
    'default_params': DEFAULT_THREE_INSIDE_DOWN_PARAMS,
    'insights': [
        'Strong bearish reversal signal when it appears after an uptrend',
        'First candle: Long bullish candle showing strong buying pressure',
        'Second candle: Small bearish candle contained within first candle (Harami)',
        'Third candle: Strong bearish candle closing below first candle\'s low',
        'The Harami pattern indicates weakening bullish momentum',
        'Third candle confirmation shows sellers taking control',
        'Represents transition from bullish sentiment to bearish momentum',
        'Often marks the beginning of a new downtrend',
        'More reliable when combined with volume confirmation'
    ],
    'template': 'three_inside_down_analyzer/index.html',
    'js_module': 'three-inside-down-strategy/index.js'
}
