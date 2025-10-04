from typing import Dict, Any, Tuple
from .controller_factory import ControllerFactory

class AnalyzeController:
    """Main controller that routes requests to pattern-specific controllers"""
    
    def __init__(self):
        self.controller_factory = ControllerFactory()
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Route pattern analysis request to appropriate controller

        Args:
            data: Request JSON payload from the client

        Returns:
            Tuple of (JSON response, HTTP status code)
        """
        return self.controller_factory.analyze(data)
    
    def get_available_patterns(self):
        """Get list of available pattern types"""
        return self.controller_factory.get_available_patterns()
