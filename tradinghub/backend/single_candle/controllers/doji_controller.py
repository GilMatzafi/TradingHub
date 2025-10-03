"""
Doji Pattern Controller
Handles doji-specific analysis requests
"""
from typing import Dict, Any, Tuple
from flask import jsonify
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.backend.shared.services.stock_service import StockService

class DojiController:
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
        Handle doji pattern analysis request

        Args:
            data: Request JSON payload from the client

        Returns:
            Tuple of (JSON response, HTTP status code)
        """
        try:
            # Build doji-specific parameters
            shadow_balance_ratio = float(data.get('shadow_balance_ratio', 0.4))
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('body_size_ratio', 0.1)),
                lower_shadow_ratio=shadow_balance_ratio,
                upper_shadow_ratio=shadow_balance_ratio,
                ma_period=20,  # Fixed value for doji
                require_green=False,  # Not relevant for doji
                shadow_balance_ratio=shadow_balance_ratio,
                require_high_volume=False  # Not relevant for doji
            )

            # Add common parameters
            pattern_params.min_relative_volume = float(data.get('min_relative_volume', 1.0))
            pattern_params.volume_lookback = int(data.get('volume_lookback', 20))

            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=data.get('symbol', 'AAPL'),
                days=int(data.get('days', 50)),
                interval=data.get('interval', '5m'),
                pattern_type='doji',
                pattern_params=pattern_params
            )

            # Perform analysis
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 400
