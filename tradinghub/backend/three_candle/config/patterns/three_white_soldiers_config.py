"""
Three White Soldiers Pattern Configuration
Configuration for Three White Soldiers bullish reversal patterns
"""

from tradinghub.backend.three_candle.patterns.three_white_soldiers_pattern import ThreeWhiteSoldiersPattern
from tradinghub.backend.three_candle.backtest.three_white_soldiers_backtest import ThreeWhiteSoldiersBacktest

# Default parameters for Three White Soldiers pattern detection
DEFAULT_THREE_WHITE_SOLDIERS_PARAMS = {
    'body_size_ratio': 0.6,        # Minimum body size as fraction of total range
    'upper_shadow_ratio': 0.2,     # Maximum upper shadow ratio
    'ma_period': 20,               # Moving average period for trend context
    'require_trend': True,         # Whether to require downtrend context
    'progressive_close': True     # Whether to require progressively higher closes
}

# Three White Soldiers pattern configuration
THREE_WHITE_SOLDIERS_CONFIG = {
    'name': 'Three White Soldiers',
    'description': 'Bullish reversal pattern with three consecutive bullish candles showing sustained buying pressure and gradual takeover by bulls',
    'pattern_class': ThreeWhiteSoldiersPattern,
    'backtest_class': ThreeWhiteSoldiersBacktest,
    'default_params': DEFAULT_THREE_WHITE_SOLDIERS_PARAMS,
    'insights': [
        'Strong bullish reversal signal when it appears after a downtrend',
        'First candle: Signals renewed buying interest after downtrend',
        'Second candle: Confirms strength and shows buyers maintaining control',
        'Third candle: Confirms the reversal with sustained demand',
        'Each candle opens within the previous candle\'s body (no gaps)',
        'Progressive closes show increasing confidence and momentum',
        'Short upper shadows indicate strong buying pressure throughout the day',
        'Represents gradual and controlled takeover by the bulls',
        'Often marks the beginning of a new uptrend'
    ],
    'template': 'three_white_soldiers_analyzer/index.html',
    'js_module': 'three-white-soldiers-strategy/index.js'
}
