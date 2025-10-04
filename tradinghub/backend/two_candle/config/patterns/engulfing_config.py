"""
Engulfing Pattern Configuration
Configuration for Bullish and Bearish Engulfing patterns
"""

from tradinghub.backend.two_candle.patterns.engulfing_pattern import EngulfingPattern
from tradinghub.backend.two_candle.backtest.engulfing_backtest import EngulfingBacktest

# Default parameters for engulfing pattern detection
DEFAULT_ENGULFING_PARAMS = {
    'body_size_ratio': 0.3,      # Minimum body size as fraction of total range
    'engulfing_type': 'both',   # 'bullish', 'bearish', or 'both'
    'ma_period': 20,            # Moving average period for trend context
    'require_trend': True       # Whether to require trend context
}

# Engulfing pattern configuration
ENGULFING_CONFIG = {
    'name': 'Engulfing Pattern',
    'description': 'Two-candle reversal pattern where the second candle completely engulfs the first candle',
    'pattern_class': EngulfingPattern,
    'backtest_class': EngulfingBacktest,
    'default_params': DEFAULT_ENGULFING_PARAMS,
    'insights': [
        'Strong reversal signal when it occurs at key support/resistance levels',
        'Bullish engulfing: Second green candle completely engulfs previous red candle',
        'Bearish engulfing: Second red candle completely engulfs previous green candle',
        'More reliable when combined with trend context and volume confirmation',
        'Works best in trending markets with clear support/resistance levels'
    ],
    'template': 'engulfing_analyzer/index.html',
    'js_module': 'engulfing-strategy/index.js'
}
