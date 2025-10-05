"""
Tweezer Top Pattern Configuration
Configuration for Tweezer Top bearish reversal patterns
"""

from tradinghub.backend.two_candle.patterns.tweezer_top_pattern import TweezerTopPattern
from tradinghub.backend.two_candle.backtest.tweezer_top_backtest import TweezerTopBacktest

# Default parameters for Tweezer Top pattern detection
DEFAULT_TWEEZER_TOP_PARAMS = {
    'body_size_ratio': 0.3,        # Minimum body size as fraction of total range
    'high_tolerance': 0.2,          # Maximum difference between highs as percentage (0.2%)
    'ma_period': 20,                # Moving average period for trend context
    'require_trend': True          # Whether to require uptrend context
}

# Tweezer Top pattern configuration
TWEEZER_TOP_CONFIG = {
    'name': 'Tweezer Top Pattern',
    'description': 'Bearish reversal pattern with two consecutive candles having nearly identical highs, indicating resistance and potential trend reversal',
    'pattern_class': TweezerTopPattern,
    'backtest_class': TweezerTopBacktest,
    'default_params': DEFAULT_TWEEZER_TOP_PARAMS,
    'insights': [
        'Strong bearish reversal signal when it occurs at the end of an uptrend',
        'First candle: Bullish (green) showing continued buying pressure',
        'Second candle: Bearish (red) indicating selling pressure and momentum loss',
        'Nearly identical highs show strong resistance level',
        'The closer the highs, the stronger the resistance signal',
        'Works best when combined with volume confirmation and trend context',
        'Often signals exhaustion of buying momentum and potential bearish reversal'
    ],
    'template': 'tweezer_top_analyzer/index.html',
    'js_module': 'tweezer-top-strategy/index.js'
}
