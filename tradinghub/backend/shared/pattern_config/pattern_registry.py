"""
Pattern Registry - Central configuration for all candlestick patterns
Modular version with separate configuration files
"""
from typing import Dict, Any, Type
import pkgutil
import importlib
from ..patterns.base_pattern import BasePattern
from ..backtest.base_backtest import BaseBacktest

# Auto-registration now discovers pattern configs dynamically. Manual imports removed.


class PatternRegistry:
    """Central registry for all candlestick patterns and their configurations"""
    
    # Pattern definitions with their metadata
    PATTERNS = {}

    @classmethod
    def auto_register_patterns(cls) -> None:
        """
        Discover and register pattern configs dynamically from config packages.

        This scans known pattern config packages and, for each module, if a
        top-level CONFIG (or *_CONFIG) dict exists, it registers it.
        """
        packages_to_scan = [
            'tradinghub.backend.single_candle.config.patterns',
            'tradinghub.backend.two_candle.config.patterns',
            'tradinghub.backend.three_candle.config.patterns',
        ]

        for package_path in packages_to_scan:
            try:
                module = importlib.import_module(package_path)
            except Exception:
                continue
            for _, name, is_pkg in pkgutil.iter_modules(module.__path__):
                if is_pkg:
                    continue
                full_mod = f"{package_path}.{name}"
                try:
                    config_module = importlib.import_module(full_mod)
                except Exception:
                    continue

                # Prefer a conventional CONFIG dict; fallback to any *CONFIG symbol
                candidate = getattr(config_module, 'CONFIG', None)
                if candidate is None:
                    # search for any ALL_CAPS ending with _CONFIG
                    for attr_name in dir(config_module):
                        if attr_name.endswith('_CONFIG') and attr_name.isupper():
                            candidate = getattr(config_module, attr_name)
                            break

                if not isinstance(candidate, dict):
                    continue

                # Determine stable registry key (pattern_type)
                # Prefer explicit 'pattern_type' in config; otherwise derive from module name
                key = candidate.get('pattern_type')
                if not key or not isinstance(key, str):
                    mod_name = full_mod.rsplit('.', 1)[-1]
                    key = mod_name[:-7] if mod_name.endswith('_config') else mod_name

                # Merge without overwriting explicit, pre-declared entries
                if key not in cls.PATTERNS:
                    cls.PATTERNS[key] = candidate
    
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