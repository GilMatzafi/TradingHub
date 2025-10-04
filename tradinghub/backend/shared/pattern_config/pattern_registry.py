"""
Pattern Registry - Central configuration for all candlestick patterns
Modular version with separate configuration files
"""
from typing import Dict, Any, Type
from ..patterns.base_pattern import BasePattern
from ..backtest.base_backtest import BaseBacktest

# Import pattern configurations
from tradinghub.backend.single_candle.config.patterns.hammer_config import HAMMER_CONFIG
from tradinghub.backend.single_candle.config.patterns.doji_config import DOJI_CONFIG
from tradinghub.backend.single_candle.config.patterns.elephant_bar_config import ELEPHANT_BAR_CONFIG
from tradinghub.backend.single_candle.config.patterns.marubozu_config import MARUBOZU_CONFIG
from tradinghub.backend.single_candle.config.patterns.shooting_star_config import SHOOTING_STAR_CONFIG
from tradinghub.backend.two_candle.config.patterns.engulfing_config import ENGULFING_CONFIG
from tradinghub.backend.two_candle.config.patterns.harami_config import HARAMI_CONFIG


class PatternRegistry:
    """Central registry for all candlestick patterns and their configurations"""
    
    # Pattern definitions with their metadata
    PATTERNS = {
        'hammer': HAMMER_CONFIG,
        'doji': DOJI_CONFIG,
        'elephant_bar': ELEPHANT_BAR_CONFIG,
        'marubozu': MARUBOZU_CONFIG,
        'shooting_star': SHOOTING_STAR_CONFIG,
        'engulfing': ENGULFING_CONFIG,
        'harami': HARAMI_CONFIG,
    }
    
    @classmethod
    def get_pattern_config(cls, pattern_type: str) -> Dict[str, Any]:
        """
        Get configuration for a specific pattern type
        
        Args:
            pattern_type: The pattern type (e.g., 'hammer', 'doji')
            
        Returns:
            Dictionary containing pattern configuration
            
        Raises:
            KeyError: If pattern type is not found
        """
        if pattern_type not in cls.PATTERNS:
            available_patterns = list(cls.PATTERNS.keys())
            raise KeyError(f"Pattern '{pattern_type}' not found. Available patterns: {available_patterns}")
        
        return cls.PATTERNS[pattern_type]
    
    @classmethod
    def get_pattern_class(cls, pattern_type: str) -> Type[BasePattern]:
        """
        Get the pattern class for a specific pattern type
        
        Args:
            pattern_type: The pattern type
            
        Returns:
            The pattern class
        """
        config = cls.get_pattern_config(pattern_type)
        pattern_class = config.get('pattern_class')
        
        if pattern_class is None:
            raise ValueError(f"Pattern class not implemented for '{pattern_type}'")
        
        return pattern_class
    
    @classmethod
    def get_backtest_class(cls, pattern_type: str) -> Type[BaseBacktest]:
        """
        Get the backtest class for a specific pattern type
        
        Args:
            pattern_type: The pattern type
            
        Returns:
            The backtest class
        """
        config = cls.get_pattern_config(pattern_type)
        backtest_class = config.get('backtest_class')
        
        if backtest_class is None:
            raise ValueError(f"Backtest class not implemented for '{pattern_type}'")
        
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
        Get list of fully implemented pattern types (with both pattern and backtest classes)
        
        Returns:
            List of implemented pattern type strings
        """
        implemented = []
        for pattern_type, config in cls.PATTERNS.items():
            if (config.get('pattern_class') is not None and 
                config.get('backtest_class') is not None):
                implemented.append(pattern_type)
        return implemented
    
    @classmethod
    def get_pattern_metadata(cls, pattern_type: str) -> Dict[str, Any]:
        """
        Get metadata for a specific pattern type
        
        Args:
            pattern_type: The pattern type
            
        Returns:
            Dictionary containing pattern metadata (name, description, insights)
        """
        config = cls.get_pattern_config(pattern_type)
        return {
            'name': config.get('name'),
            'description': config.get('description'),
            'insights': config.get('insights', []),
            'template': config.get('template'),
            'js_module': config.get('js_module')
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