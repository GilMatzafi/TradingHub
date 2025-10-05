"""
Three Black Crows Pattern Configuration
Configuration for Three Black Crows bearish reversal patterns
"""

from tradinghub.backend.three_candle.patterns.three_black_crows_pattern import ThreeBlackCrowsPattern
from tradinghub.backend.three_candle.backtest.three_black_crows_backtest import ThreeBlackCrowsBacktest

# Default parameters for Three Black Crows pattern detection
DEFAULT_THREE_BLACK_CROWS_PARAMS = {
    'body_size_ratio': 0.6,        # Minimum body size as fraction of total range
    'lower_shadow_ratio': 0.2,     # Maximum lower shadow ratio
    'ma_period': 20,               # Moving average period for trend context
    'require_trend': True,         # Whether to require uptrend context
    'progressive_close': True     # Whether to require progressively lower closes
}

# Three Black Crows pattern configuration
THREE_BLACK_CROWS_CONFIG = {
    'name': 'Three Black Crows',
    'description': 'Bearish reversal pattern with three consecutive bearish candles showing sustained selling pressure and gradual takeover by bears',
    'pattern_class': ThreeBlackCrowsPattern,
    'backtest_class': ThreeBlackCrowsBacktest,
    'default_params': DEFAULT_THREE_BLACK_CROWS_PARAMS,
    'insights': [
        'Strong bearish reversal signal when it appears after an uptrend',
        'First candle: Shows sellers beginning to take control after uptrend',
        'Second candle: Confirms the shift in sentiment and seller dominance',
        'Third candle: Seals the reversal with sustained selling pressure',
        'Each candle opens within the previous candle\'s body (no gaps)',
        'Progressive closes show increasing bearish momentum',
        'Short lower shadows indicate strong selling pressure throughout the day',
        'Represents gradual and decisive change from optimism to pessimism',
        'Often marks the beginning of a new downtrend'
    ],
    'template': 'three_black_crows_analyzer/index.html',
    'js_module': 'three-black-crows-strategy/index.js'
}
