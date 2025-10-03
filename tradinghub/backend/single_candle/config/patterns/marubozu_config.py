"""
Marubozu Pattern Configuration
Configuration for the Marubozu candlestick pattern
"""

from tradinghub.backend.single_candle.patterns.marubozu_pattern import MarubozuPattern
from tradinghub.backend.single_candle.backtest.marubozu_backtest import MarubozuBacktest

# Marubozu pattern configuration
MARUBOZU_CONFIG = {
    'name': 'Marubozu Pattern',
    'description': 'Strong directional momentum pattern with long body and no shadows',
    'pattern_class': MarubozuPattern,
    'backtest_class': MarubozuBacktest,
    'template': 'marubozu_analyzer',
    'js_module': 'marubozu-strategy',
    'default_params': {
        'min_body_ratio': 0.9,  # Body should be at least 90% of total range
        'max_shadow_ratio': 0.05,  # Shadows should be at most 5% of total range
        'ma_period': 5,  # Moving average period for trend context
        'require_high_volume': False,  # Whether to require high volume
        'min_relative_volume': 1.0,  # Minimum relative volume (1.0 = average)
        'volume_lookback': 20  # Number of periods to look back for volume average
    },
    'param_fields': [
        {
            'name': 'min_body_ratio',
            'label': 'Minimum Body Ratio',
            'type': 'range',
            'min': 0.7,
            'max': 0.95,
            'step': 0.01,
            'default': 0.9,
            'description': 'Minimum body size as fraction of total range (0.9 = 90%)'
        },
        {
            'name': 'max_shadow_ratio',
            'label': 'Maximum Shadow Ratio',
            'type': 'range',
            'min': 0.01,
            'max': 0.1,
            'step': 0.01,
            'default': 0.05,
            'description': 'Maximum shadow size as fraction of total range (0.05 = 5%)'
        },
        {
            'name': 'ma_period',
            'label': 'Moving Average Period',
            'type': 'range',
            'min': 3,
            'max': 20,
            'step': 1,
            'default': 5,
            'description': 'Period for moving average calculation'
        },
        {
            'name': 'require_high_volume',
            'label': 'Require High Volume',
            'type': 'checkbox',
            'default': False,
            'description': 'Only detect patterns with above-average volume'
        },
        {
            'name': 'min_relative_volume',
            'label': 'Minimum Relative Volume',
            'type': 'range',
            'min': 0.5,
            'max': 3.0,
            'step': 0.1,
            'default': 1.0,
            'description': 'Minimum volume relative to average (1.0 = average volume)'
        },
        {
            'name': 'volume_lookback',
            'label': 'Volume Lookback Period',
            'type': 'range',
            'min': 10,
            'max': 50,
            'step': 5,
            'default': 20,
            'description': 'Number of periods to calculate volume average'
        }
    ],
    'insights': [
        'Marubozu patterns indicate strong directional momentum',
        'Bullish Marubozu (green) shows strong buying pressure',
        'Bearish Marubozu (red) shows strong selling pressure',
        'No shadows indicate no hesitation in price movement',
        'Often signals continuation of current trend',
        'High volume confirms the strength of the pattern'
    ]
}
