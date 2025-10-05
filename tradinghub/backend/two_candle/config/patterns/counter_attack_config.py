"""
Counter Attack Candle Pattern Configuration
Configuration for Counter Attack Candle pattern detection and analysis
"""

from tradinghub.backend.two_candle.patterns.counter_attack_pattern import CounterAttackPattern
from tradinghub.backend.two_candle.backtest.counter_attack_backtest import CounterAttackBacktest

# Default parameters for counter attack candle pattern detection
DEFAULT_COUNTER_ATTACK_PARAMS = {
    'body_size_ratio': 0.3,      # Minimum body size as fraction of total range
    'close_tolerance': 0.02,     # Tolerance for close levels (2% of price)
    'counter_attack_type': 'both',  # 'bullish', 'bearish', or 'both'
    'ma_period': 20,             # Moving average period for trend context
    'require_trend': True        # Whether to require trend context
}

# Counter Attack Candle pattern configuration
COUNTER_ATTACK_CONFIG = {
    'name': 'Counter Attack Candle Pattern',
    'description': 'Two-candle reversal pattern where the second candle opens with a gap but closes almost at the same level as the previous candle, indicating a counter-attack',
    'pattern_class': CounterAttackPattern,
    'backtest_class': CounterAttackBacktest,
    'default_params': DEFAULT_COUNTER_ATTACK_PARAMS,
    'insights': [
        'Bullish Counter Attack: Red candle followed by green candle that opens with gap down but closes near previous close',
        'Bearish Counter Attack: Green candle followed by red candle that opens with gap up but closes near previous close',
        'Indicates potential reversal after the counter-attack',
        'The gap shows initial momentum, but closing near previous level shows counter-attack',
        'More reliable when combined with trend context and volume confirmation',
        'Works best in trending markets with clear momentum shifts',
        'The pattern shows buyers/sellers losing control and counter-attack succeeding'
    ],
    'template': 'counter_attack_analyzer/index.html',
    'js_module': 'counter-attack-strategy/index.js'
}
