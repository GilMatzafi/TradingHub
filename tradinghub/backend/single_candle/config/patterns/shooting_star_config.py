"""
Shooting Star Pattern Configuration
"""

SHOOTING_STAR_CONFIG = {
    'name': 'Shooting Star',
    'description': 'Bearish reversal pattern with small body and long upper shadow',
    'pattern_class': None,  # To be implemented
    'backtest_class': None,  # To be implemented
    'template': 'shooting_star_analyzer',
    'js_module': 'shooting-star-strategy',
    'default_params': {
        'body_size_ratio': 0.3,
        'upper_shadow_ratio': 2.0,
        'lower_shadow_ratio': 0.1,
        'ma_period': 5,
        'require_red': True,
        'min_relative_volume': 1.0,
        'volume_lookback': 20
    },
    'param_fields': [
        {'name': 'body_size_ratio', 'type': 'range', 'min': 0.1, 'max': 0.8, 'step': 0.01, 'default': 0.3, 'label': 'Body Size Ratio'},
        {'name': 'upper_shadow_ratio', 'type': 'range', 'min': 1.0, 'max': 5.0, 'step': 0.1, 'default': 2.0, 'label': 'Upper Shadow Ratio'},
        {'name': 'lower_shadow_ratio', 'type': 'range', 'min': 0.01, 'max': 0.5, 'step': 0.01, 'default': 0.1, 'label': 'Lower Shadow Ratio'},
        {'name': 'ma_period', 'type': 'range', 'min': 5, 'max': 50, 'step': 1, 'default': 5, 'label': 'MA Period'},
        {'name': 'require_red', 'type': 'checkbox', 'default': True, 'label': 'Require Red Candle'},
        {'name': 'min_relative_volume', 'type': 'number', 'min': 0.5, 'max': 5.0, 'step': 0.1, 'default': 1.0, 'label': 'Min Relative Volume'},
        {'name': 'volume_lookback', 'type': 'number', 'min': 5, 'max': 50, 'step': 1, 'default': 20, 'label': 'Volume Lookback Period'}
    ],
    'insights': [
        'Shooting star patterns indicate potential bearish reversal',
        'Long upper shadow shows rejection of higher prices',
        'Small lower shadow indicates limited buying pressure',
        'Often found at resistance levels after uptrends'
    ]
}
