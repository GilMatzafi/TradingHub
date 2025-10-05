"""
Dark Cloud Cover Pattern Configuration
Configuration for Dark Cloud Cover bearish reversal patterns
"""

from tradinghub.backend.two_candle.patterns.dark_cloud_cover_pattern import DarkCloudCoverPattern
from tradinghub.backend.two_candle.backtest.dark_cloud_cover_backtest import DarkCloudCoverBacktest

# Default parameters for Dark Cloud Cover pattern detection
DEFAULT_DARK_CLOUD_COVER_PARAMS = {
    'body_size_ratio': 0.6,        # Minimum body size as fraction of total range for first candle
    'max_shadow_ratio': 0.3,       # Maximum shadow ratio for both candles
    'penetration_ratio': 0.5,      # Minimum penetration ratio into first candle's body
    'ma_period': 20,               # Moving average period for trend context
    'require_trend': True          # Whether to require uptrend context
}

# Dark Cloud Cover pattern configuration
DARK_CLOUD_COVER_CONFIG = {
    'name': 'Dark Cloud Cover Pattern',
    'description': 'Bearish reversal pattern where a gap up is followed by a bearish candle that penetrates deep into the previous bullish candle\'s body',
    'pattern_class': DarkCloudCoverPattern,
    'backtest_class': DarkCloudCoverBacktest,
    'default_params': DEFAULT_DARK_CLOUD_COVER_PARAMS,
    'insights': [
        'Strong bearish reversal signal when it occurs at the end of an uptrend',
        'First candle: Bullish (green) with substantial body showing continued buying pressure',
        'Second candle: Opens with gap up (bullish sentiment) but closes bearish, penetrating into first candle',
        'The deeper the penetration, the stronger the bearish signal',
        'Works best when combined with volume confirmation and trend context',
        'Often signals a shift from bullish to bearish market sentiment'
    ],
    'template': 'dark_cloud_cover_analyzer/index.html',
    'js_module': 'dark-cloud-cover-strategy/index.js'
}