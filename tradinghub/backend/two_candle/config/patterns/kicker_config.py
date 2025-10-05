"""
Kicker Pattern Configuration
Configuration for Kicker reversal patterns (both bullish and bearish)
"""

from tradinghub.backend.two_candle.patterns.kicker_pattern import KickerPattern
from tradinghub.backend.two_candle.backtest.kicker_backtest import KickerBacktest

# Default parameters for Kicker pattern detection
DEFAULT_KICKER_PARAMS = {
    'body_size_ratio': 0.3,        # Minimum body size as fraction of total range
    'gap_size_ratio': 0.5,         # Minimum gap size as percentage of price (0.5%)
    'ma_period': 20,               # Moving average period for trend context
    'require_trend': True,         # Whether to require trend context
    'kicker_type': 'both'         # 'bullish', 'bearish', or 'both'
}

# Kicker pattern configuration
KICKER_CONFIG = {
    'name': 'Kicker Pattern',
    'description': 'Powerful reversal pattern with a significant gap between two consecutive candles, signaling a sudden and decisive change in market sentiment',
    'pattern_class': KickerPattern,
    'backtest_class': KickerBacktest,
    'default_params': DEFAULT_KICKER_PARAMS,
    'insights': [
        'One of the most powerful reversal patterns in technical analysis',
        'Bullish Kicker: Gap up after downtrend signals sudden bullish momentum',
        'Bearish Kicker: Gap down after uptrend signals sudden bearish momentum',
        'No overlap between candle bodies indicates complete sentiment reversal',
        'The larger the gap, the stronger the reversal signal',
        'Works best when combined with volume confirmation and trend context',
        'Often marks the beginning of strong new trends',
        'Reflects a complete shift in trader psychology between sessions'
    ],
    'template': 'kicker_analyzer/index.html',
    'js_module': 'kicker-strategy/index.js'
}
