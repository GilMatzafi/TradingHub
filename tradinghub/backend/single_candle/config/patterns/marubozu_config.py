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
        'max_shadow_ratio': 0.05,  # Shadows should be at most 5% of total range
        'candle_color': 'both'  # Candle color filter: 'red', 'green', or 'both'
    },
    'param_fields': [
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
            'name': 'candle_color',
            'label': 'Candle Color Filter',
            'type': 'select',
            'options': [
                {'value': 'both', 'label': 'Both Red and Green'},
                {'value': 'red', 'label': 'Red (Bearish) Only'},
                {'value': 'green', 'label': 'Green (Bullish) Only'}
            ],
            'default': 'both',
            'description': 'Filter Marubozu patterns by candle color'
        }
    ],
    'insights': [
        'Marubozu patterns indicate strong directional momentum',
        'Bullish Marubozu (green) shows strong buying pressure',
        'Bearish Marubozu (red) shows strong selling pressure',
        'No shadows indicate no hesitation in price movement',
        'Often signals continuation of current trend',
        'Detected by minimal shadow size - body is automatically large'
    ]
}
