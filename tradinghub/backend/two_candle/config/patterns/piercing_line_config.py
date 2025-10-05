"""
Piercing Line Pattern Configuration
Configuration for Piercing Line patterns
"""

from tradinghub.backend.two_candle.patterns.piercing_line_pattern import PiercingLinePattern
from tradinghub.backend.two_candle.backtest.piercing_line_backtest import PiercingLineBacktest

# Default parameters for piercing line pattern detection
DEFAULT_PIERCING_LINE_PARAMS = {
    'body_size_ratio': 0.3,      # Minimum body size as fraction of total range
    'piercing_ratio': 0.5,        # Minimum piercing ratio (how much of first candle's body is pierced)
    'ma_period': 20,              # Moving average period for trend context
    'require_trend': True         # Whether to require trend context
}

# Piercing Line pattern configuration
PIERCING_LINE_CONFIG = {
    'name': 'Piercing Line Pattern',
    'description': 'Two-candle bullish reversal pattern where the second candle opens below the first candle\'s low but closes above the midpoint of the first candle\'s body',
    'pattern_class': PiercingLinePattern,
    'backtest_class': PiercingLineBacktest,
    'default_params': DEFAULT_PIERCING_LINE_PARAMS,
    'insights': [
        'Strong bullish reversal signal when it occurs at key support levels',
        'First candle is bearish (red) with a significant body',
        'Second candle opens below the first candle\'s low but closes above the midpoint of the first candle\'s body',
        'More reliable when combined with trend context and volume confirmation',
        'Works best in downtrending markets with clear support levels',
        'The piercing should be at least 50% of the first candle\'s body for strong signal'
    ],
    'template': 'piercing_line_analyzer/index.html',
    'js_module': 'piercing-line-strategy/index.js'
}
