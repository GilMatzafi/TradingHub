"""
Pattern Registry - Central configuration for all candlestick patterns
"""
from typing import Dict, Any, Type
from ..patterns.base_pattern import BasePattern
from ..patterns.hammer_pattern import HammerPattern
from ..patterns.doji_pattern import DojiPattern
from ..backtest.base_backtest import BaseBacktest
from ..backtest.hammer_backtest import HammerBacktest
from ..backtest.doji_backtest import DojiBacktest


class PatternRegistry:
    """Central registry for all candlestick patterns and their configurations"""
    
    # Pattern definitions with their metadata
    PATTERNS = {
        'hammer': {
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
                'Hammer patterns indicate potential bullish reversals',
                'Look for hammers at support levels for better success rates',
                'Volume confirmation increases pattern reliability'
            ]
        },
        
        'doji': {
            'name': 'Standard Doji',
            'description': 'Indecision pattern with very small body and equal shadows',
            'pattern_class': DojiPattern,
            'backtest_class': DojiBacktest,
            'template': 'doji_analyzer',
            'js_module': 'doji-strategy',
            'default_params': {
                'body_size_ratio': 0.1,
                'ma_period': 20,
                'require_high_volume': False,
                'min_relative_volume': 1.5,
                'volume_lookback': 20
            },
            'param_fields': [
                {'name': 'body_size_ratio', 'type': 'range', 'min': 0.01, 'max': 0.3, 'step': 0.01, 'default': 0.1, 'label': 'Body Size Ratio'},
                {'name': 'ma_period', 'type': 'range', 'min': 5, 'max': 50, 'step': 1, 'default': 20, 'label': 'MA Period'},
                {'name': 'require_high_volume', 'type': 'checkbox', 'default': False, 'label': 'Require High Volume'},
                {'name': 'min_relative_volume', 'type': 'number', 'min': 1.0, 'max': 5.0, 'step': 0.1, 'default': 1.5, 'label': 'Min Relative Volume'},
                {'name': 'volume_lookback', 'type': 'number', 'min': 5, 'max': 50, 'step': 1, 'default': 20, 'label': 'Volume Lookback Period'}
            ],
            'insights': [
                'Doji patterns indicate market indecision',
                'Often found at key support/resistance levels',
                'Volume confirmation helps validate the pattern'
            ]
        },
        
        'shooting_star': {
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
                'Shooting star patterns indicate potential bearish reversals',
                'Look for shooting stars at resistance levels',
                'Volume confirmation increases pattern reliability'
            ]
        }
    }
    
    @classmethod
    def get_pattern_config(cls, pattern_type: str) -> Dict[str, Any]:
        """
        Get configuration for a specific pattern type
        
        Args:
            pattern_type: Type of pattern (e.g., 'hammer', 'doji')
            
        Returns:
            Dictionary containing pattern configuration
            
        Raises:
            ValueError: If pattern type is not supported
        """
        if pattern_type not in cls.PATTERNS:
            available_patterns = list(cls.PATTERNS.keys())
            raise ValueError(f'Unsupported pattern type: {pattern_type}. Available patterns: {available_patterns}')
        
        return cls.PATTERNS[pattern_type]
    
    @classmethod
    def get_pattern_class(cls, pattern_type: str) -> Type[BasePattern]:
        """
        Get the pattern class for a specific pattern type
        
        Args:
            pattern_type: Type of pattern
            
        Returns:
            Pattern class that implements BasePattern
        """
        config = cls.get_pattern_config(pattern_type)
        pattern_class = config['pattern_class']
        
        if pattern_class is None:
            raise ValueError(f'Pattern class not implemented for {pattern_type}')
        
        return pattern_class
    
    @classmethod
    def get_backtest_class(cls, pattern_type: str) -> Type[BaseBacktest]:
        """
        Get the backtest class for a specific pattern type
        
        Args:
            pattern_type: Type of pattern
            
        Returns:
            Backtest class that extends BaseBacktest
        """
        config = cls.get_pattern_config(pattern_type)
        backtest_class = config['backtest_class']
        
        if backtest_class is None:
            raise ValueError(f'Backtest class not implemented for {pattern_type}')
        
        return backtest_class
    
    @classmethod
    def get_available_patterns(cls) -> list:
        """
        Get list of all available pattern types
        
        Returns:
            List of pattern type strings
        """
        return list(cls.PATTERNS.keys())
    
    @classmethod
    def get_implemented_patterns(cls) -> list:
        """
        Get list of fully implemented pattern types
        
        Returns:
            List of implemented pattern type strings
        """
        implemented = []
        for pattern_type, config in cls.PATTERNS.items():
            if config['pattern_class'] is not None and config['backtest_class'] is not None:
                implemented.append(pattern_type)
        return implemented
    
    @classmethod
    def get_pattern_metadata(cls, pattern_type: str) -> Dict[str, Any]:
        """
        Get metadata for a pattern (name, description, insights)
        
        Args:
            pattern_type: Type of pattern
            
        Returns:
            Dictionary containing pattern metadata
        """
        config = cls.get_pattern_config(pattern_type)
        return {
            'name': config['name'],
            'description': config['description'],
            'insights': config['insights'],
            'param_fields': config['param_fields']
        }
    
    @classmethod
    def get_default_params(cls, pattern_type: str) -> Dict[str, Any]:
        """
        Get default parameters for a pattern type
        
        Args:
            pattern_type: Type of pattern
            
        Returns:
            Dictionary containing default parameters
        """
        config = cls.get_pattern_config(pattern_type)
        return config['default_params'].copy()
    
    @classmethod
    def register_pattern(cls, pattern_type: str, pattern_class: Type[BasePattern], 
                        backtest_class: Type[BaseBacktest], **kwargs):
        """
        Register a new pattern type
        
        Args:
            pattern_type: Unique identifier for the pattern
            pattern_class: Pattern detection class
            backtest_class: Backtest class
            **kwargs: Additional configuration options
        """
        cls.PATTERNS[pattern_type] = {
            'pattern_class': pattern_class,
            'backtest_class': backtest_class,
            **kwargs
        }
