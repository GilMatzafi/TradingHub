"""
Controller Factory
Manages pattern-specific controllers
"""
from typing import Dict, Any, Tuple
from tradinghub.backend.single_candle.controllers.hammer_controller import HammerController
from tradinghub.backend.single_candle.controllers.doji_controller import DojiController
from tradinghub.backend.single_candle.controllers.elephant_bar_controller import ElephantBarController
from tradinghub.backend.single_candle.controllers.marubozu_controller import MarubozuController
from tradinghub.backend.two_candle.controllers.engulfing_controller import EngulfingController
from tradinghub.backend.two_candle.controllers.harami_controller import HaramiController

class ControllerFactory:
    """Factory for creating pattern-specific controllers"""
    
    def __init__(self):
        self._controllers = {
            'hammer': HammerController(),
            'doji': DojiController(),
            'elephant_bar': ElephantBarController(),
            'marubozu': MarubozuController(),
            'engulfing': EngulfingController(),
            'harami': HaramiController(),
        }
    
    def get_controller(self, pattern_type: str):
        """Get controller for specific pattern type"""
        return self._controllers.get(pattern_type, self._controllers['hammer'])  # Default to hammer
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Route analysis request to appropriate controller
        
        Args:
            data: Request JSON payload from the client
            
        Returns:
            Tuple of (JSON response, HTTP status code)
        """
        pattern_type = data.get('pattern_type', 'hammer')
        controller = self.get_controller(pattern_type)
        return controller.analyze(data)
    
    def add_pattern_controller(self, pattern_type: str, controller):
        """Add a new pattern controller"""
        self._controllers[pattern_type] = controller
    
    def get_available_patterns(self):
        """Get list of available pattern types"""
        return list(self._controllers.keys())
