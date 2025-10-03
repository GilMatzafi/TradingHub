from typing import Dict, Any, Tuple
from flask import jsonify
from tradinghub.backend.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.backend.services.stock_service import StockService

class AnalyzeController:
    def __init__(self):
        self.stock_service = StockService()
    
    def _parse_boolean(self, value):
        """Parse boolean value from string or boolean"""
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() == 'true'
        return False

    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle pattern analysis request

        Args:
            data: Request JSON payload from the client

        Returns:
            Tuple of (JSON response, HTTP status code)
        """
        try:
            pattern_type = data.get('pattern_type', 'hammer')
            
            # Build pattern parameters from request based on pattern type
            if pattern_type == 'doji':
                # Doji-specific parameters
                pattern_params = PatternParams(
                    body_size_ratio=float(data.get('body_size_ratio', 0.1)),
                    lower_shadow_ratio=float(data.get('shadow_balance_ratio', 0.3)),  # Use shadow_balance_ratio for doji
                    upper_shadow_ratio=float(data.get('shadow_balance_ratio', 0.3)),  # Use shadow_balance_ratio for doji
                    ma_period=int(data.get('ma_period', 20)),
                    require_green=not data.get('require_high_volume', False),  # Convert require_high_volume to require_green
                    shadow_balance_ratio=float(data.get('shadow_balance_ratio', 0.3)),  # Doji-specific parameter
                    require_high_volume=self._parse_boolean(data.get('require_high_volume', False))  # Doji-specific parameter
                )
            else:
                # Hammer-specific parameters (default)
                pattern_params = PatternParams(
                    body_size_ratio=float(data.get('body_size_ratio', 0.3)),
                    lower_shadow_ratio=float(data.get('lower_shadow_ratio', 2.0)),
                    upper_shadow_ratio=float(data.get('upper_shadow_ratio', 0.1)),
                    ma_period=int(data.get('ma_period', 5)),
                    require_green=data.get('require_green', True)
                )

            # Add optional volume-based filters (always set defaults)
            pattern_params.min_relative_volume = float(data.get('min_relative_volume', 1.0))
            pattern_params.volume_lookback = int(data.get('volume_lookback', 20))

            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=data.get('symbol', 'AAPL'),
                days=int(data.get('days', 50)),
                interval=data.get('interval', '5m'),
                pattern_type=pattern_type,
                pattern_params=pattern_params
            )

            # Perform analysis
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 400
