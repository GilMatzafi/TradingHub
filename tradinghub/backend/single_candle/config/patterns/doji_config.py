"""
Doji Pattern Configuration
"""

from ...patterns.doji_pattern import DojiPattern
from ...backtest.doji_backtest import DojiBacktest

DOJI_CONFIG = {
    'name': 'Standard Doji',
    'description': 'Indecision pattern with very small body and equal shadows',
    'pattern_class': DojiPattern,
    'backtest_class': DojiBacktest,
    'template': 'doji_analyzer',
    'js_module': 'doji-strategy',
    'default_params': {
        'body_size_ratio': 0.1,
        'shadow_balance_ratio': 0.4
    },
    'param_fields': [
        {'name': 'body_size_ratio', 'type': 'range', 'min': 0.01, 'max': 0.3, 'step': 0.01, 'default': 0.1, 'label': 'Body Size Ratio'},
        {'name': 'shadow_balance_ratio', 'type': 'range', 'min': 0.3, 'max': 0.5, 'step': 0.01, 'default': 0.4, 'label': 'Shadow Balance Ratio'}
    ],
    'insights': [
        'Doji patterns indicate market indecision',
        'Often found at key support/resistance levels',
        'Balanced shadows indicate equal buying and selling pressure'
    ]
}
