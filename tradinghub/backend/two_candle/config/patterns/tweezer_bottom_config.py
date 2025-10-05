"""
Tweezer Bottom Pattern Configuration
Configuration for Tweezer Bottom bullish reversal patterns
"""

from tradinghub.backend.two_candle.patterns.tweezer_bottom_pattern import TweezerBottomPattern
from tradinghub.backend.two_candle.backtest.tweezer_bottom_backtest import TweezerBottomBacktest

# Default parameters for Tweezer Bottom pattern detection
DEFAULT_TWEEZER_BOTTOM_PARAMS = {
    'body_size_ratio': 0.3,        # Minimum body size as fraction of total range
    'low_tolerance': 0.2,          # Maximum difference between lows as percentage (0.2%)
    'ma_period': 20,               # Moving average period for trend context
    'require_trend': True         # Whether to require downtrend context
}

# Tweezer Bottom pattern configuration
TWEEZER_BOTTOM_CONFIG = {
    'name': 'Tweezer Bottom Pattern',
    'description': 'Bullish reversal pattern with two consecutive candles having nearly identical lows, indicating support and potential trend reversal',
    'pattern_class': TweezerBottomPattern,
    'backtest_class': TweezerBottomBacktest,
    'default_params': DEFAULT_TWEEZER_BOTTOM_PARAMS,
    'insights': [
        'Strong bullish reversal signal when it occurs at the end of a downtrend',
        'First candle: Bearish (red) showing continued selling pressure',
        'Second candle: Bullish (green) indicating buying pressure and momentum shift',
        'Nearly identical lows show strong support level',
        'The closer the lows, the stronger the support signal',
        'Works best when combined with volume confirmation and trend context',
        'Often signals exhaustion of selling momentum and potential bullish reversal'
    ],
    'template': 'tweezer_bottom_analyzer/index.html',
    'js_module': 'tweezer-bottom-strategy/index.js'
}
