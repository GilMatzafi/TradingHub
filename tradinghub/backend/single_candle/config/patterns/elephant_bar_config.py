"""
Elephant Bar Pattern Configuration
"""

from ...patterns.elephant_bar_pattern import ElephantBarPattern
from ...backtest.elephant_bar_backtest import ElephantBarBacktest

ELEPHANT_BAR_CONFIG = {
    'name': 'Elephant Bar',
    'description': 'Strong directional momentum pattern with very large body and small shadows',
    'pattern_class': ElephantBarPattern,
    'backtest_class': ElephantBarBacktest,
    'template': 'elephant_bar_analyzer',
    'js_module': 'elephant-bar-strategy',
    'default_params': {
        'min_body_ratio': 0.8,
        'max_shadow_ratio': 0.1,
        'ma_period': 5,
        'require_high_volume': False,
        'min_relative_volume': 1.0,
        'volume_lookback': 20
    },
    'param_fields': [
        {'name': 'min_body_ratio', 'type': 'range', 'min': 0.6, 'max': 0.95, 'step': 0.01, 'default': 0.8, 'label': 'Min Body Ratio'},
        {'name': 'max_shadow_ratio', 'type': 'range', 'min': 0.01, 'max': 0.2, 'step': 0.01, 'default': 0.1, 'label': 'Max Shadow Ratio'},
        {'name': 'ma_period', 'type': 'range', 'min': 5, 'max': 50, 'step': 1, 'default': 5, 'label': 'MA Period'},
        {'name': 'require_high_volume', 'type': 'checkbox', 'default': False, 'label': 'Require High Volume'},
        {'name': 'min_relative_volume', 'type': 'number', 'min': 0.5, 'max': 5.0, 'step': 0.1, 'default': 1.0, 'label': 'Min Relative Volume'},
        {'name': 'volume_lookback', 'type': 'number', 'min': 5, 'max': 50, 'step': 1, 'default': 20, 'label': 'Volume Lookback Period'}
    ],
    'insights': [
        'Elephant bars indicate strong directional momentum',
        'Large body shows decisive price movement',
        'Small shadows indicate minimal price rejection',
        'Often found at trend continuations or breakouts'
    ]
}
