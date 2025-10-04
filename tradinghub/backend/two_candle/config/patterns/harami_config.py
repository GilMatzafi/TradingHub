"""
Harami Pattern Configuration
Configuration for Harami pattern detection and analysis
"""

from ...patterns.harami_pattern import HaramiPattern
from ...backtest.harami_backtest import HaramiBacktest

# Harami Pattern Configuration
HARAMI_CONFIG = {
    'name': 'Harami',
    'description': 'Two-candle reversal pattern where the second candle is contained within the first candle\'s body',
    'pattern_type': 'two_candle',
    'category': 'reversal',
    'difficulty': 'intermediate',
    'reliability': 'medium',
    'timeframe': 'any',
    'market_conditions': ['trending', 'ranging'],
    'template': 'harami_analyzer/index.html',
    'controller': 'HaramiController',
    'pattern_class': HaramiPattern,
    'backtest_class': HaramiBacktest,
    'parameters': {
        'body_size_ratio': {
            'name': 'Body Size Ratio',
            'description': 'Minimum body size ratio for the first candle',
            'type': 'range',
            'min': 0.1,
            'max': 0.8,
            'default': 0.1,
            'step': 0.05
        },
        'harami_type': {
            'name': 'Harami Type',
            'description': 'Type of Harami pattern to detect',
            'type': 'select',
            'options': [
                {'value': 'bullish', 'label': 'Bullish Harami'},
                {'value': 'bearish', 'label': 'Bearish Harami'},
                {'value': 'both', 'label': 'Both Types'}
            ],
            'default': 'both'
        },
        'require_trend': {
            'name': 'Require Trend Context',
            'description': 'Require trend context for pattern validation',
            'type': 'checkbox',
            'default': False
        },
        'ma_period': {
            'name': 'Moving Average Period',
            'description': 'Period for moving average trend calculation',
            'type': 'number',
            'min': 5,
            'max': 50,
            'default': 20
        }
    },
    'features': [
        'Bullish and Bearish variants',
        'Trend context validation',
        'Body containment detection',
        'Color pattern matching',
        'Volume analysis support'
    ],
    'trading_signals': {
        'bullish_harami': {
            'signal': 'buy',
            'strength': 'medium',
            'description': 'Potential bullish reversal after downtrend'
        },
        'bearish_harami': {
            'signal': 'sell',
            'strength': 'medium',
            'description': 'Potential bearish reversal after uptrend'
        }
    },
    'risk_level': 'medium',
    'success_rate': '60-70%',
    'false_positive_rate': '30-40%'
}
