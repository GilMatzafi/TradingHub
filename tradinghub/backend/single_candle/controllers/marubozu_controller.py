"""
Marubozu Pattern Controller
Handles Marubozu-specific analysis requests
"""
from typing import Dict, Any, Tuple
from flask import jsonify
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.backend.shared.services.stock_service import StockService

class MarubozuController:
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
        Handle Marubozu pattern analysis request

        Args:
            data: Request JSON payload from the client

        Returns:
            Tuple of (JSON response, HTTP status code)
        """
        try:
            # Build Marubozu-specific parameters
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('min_body_ratio', 0.9)),  # Map min_body_ratio to body_size_ratio
                lower_shadow_ratio=float(data.get('max_shadow_ratio', 0.05)),  # Map max_shadow_ratio to lower_shadow_ratio
                upper_shadow_ratio=float(data.get('max_shadow_ratio', 0.05)),  # Map max_shadow_ratio to upper_shadow_ratio
                ma_period=int(data.get('ma_period', 5)),
                require_green=False,  # Not relevant for Marubozu (can be bullish or bearish)
                require_high_volume=self._parse_boolean(data.get('require_high_volume', False))
            )

            # Add common parameters
            pattern_params.min_relative_volume = float(data.get('min_relative_volume', 1.0))
            pattern_params.volume_lookback = int(data.get('volume_lookback', 20))

            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=data.get('symbol', 'AAPL'),
                days=int(data.get('days', 50)),
                interval=data.get('interval', '5m'),
                pattern_type='marubozu',
                pattern_params=pattern_params
            )

            # Perform analysis
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 400
