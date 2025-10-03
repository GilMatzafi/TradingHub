"""
Hammer Pattern Configuration
"""

from ...patterns.hammer_pattern import HammerPattern
from ...backtest.hammer_backtest import HammerBacktest

HAMMER_CONFIG = {
    'name': 'Hammer Pattern',
    'description': 'Bullish reversal pattern with small body and long lower shadow',
    'pattern_class': HammerPattern,
    'backtest_class': HammerBacktest,
    'template': 'hammer_analyzer',
    'js_module': 'hammer-strategy',
    'default_params': {
        'body_size_ratio': 0.3,
        'lower_shadow_ratio': 2.0,
        'upper_shadow_ratio': 0.1,
        'ma_period': 5,
        'require_green': True,
        'min_relative_volume': 1.0,
        'volume_lookback': 20
    },
    'param_fields': [
        {'name': 'body_size_ratio', 'type': 'range', 'min': 0.1, 'max': 0.8, 'step': 0.01, 'default': 0.3, 'label': 'Body Size Ratio'},
        {'name': 'lower_shadow_ratio', 'type': 'range', 'min': 1.0, 'max': 5.0, 'step': 0.1, 'default': 2.0, 'label': 'Lower Shadow Ratio'},
        {'name': 'upper_shadow_ratio', 'type': 'range', 'min': 0.01, 'max': 0.5, 'step': 0.01, 'default': 0.1, 'label': 'Upper Shadow Ratio'},
        {'name': 'ma_period', 'type': 'range', 'min': 5, 'max': 50, 'step': 1, 'default': 5, 'label': 'MA Period'},
        {'name': 'require_green', 'type': 'checkbox', 'default': True, 'label': 'Require Green Candle'},
        {'name': 'min_relative_volume', 'type': 'number', 'min': 0.5, 'max': 5.0, 'step': 0.1, 'default': 1.0, 'label': 'Min Relative Volume'},
        {'name': 'volume_lookback', 'type': 'number', 'min': 5, 'max': 50, 'step': 1, 'default': 20, 'label': 'Volume Lookback Period'}
    ],
    'insights': [
        'Hammer patterns indicate potential bullish reversal',
        'Long lower shadow shows rejection of lower prices',
        'Small upper shadow indicates limited selling pressure',
        'Often found at support levels after downtrends'
    ]
}
