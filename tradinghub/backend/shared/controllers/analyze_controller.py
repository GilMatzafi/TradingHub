from typing import Dict, Any, Tuple
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.utils.data_utils import parse_pattern_params, normalize_request_params


class AnalyzeController:
    """Main controller that runs analysis for ANY pattern via StockService"""

    def __init__(self):
        self.stock_service = StockService()

    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Run pattern analysis through a single, unified path.

        Args:
            data: Request JSON payload from the client

        Returns:
            Tuple of (JSON response as dict, HTTP status code)
        """
        try:
            # Normalize common request parameters (symbol, days, interval)
            symbol, days, interval = normalize_request_params(data)
            pattern_type = data.get('pattern_type', 'hammer')

            # Build generic PatternParams from provided fields (fallback to defaults)
            params = parse_pattern_params(data)

            # Create unified analysis request
            request_obj = AnalysisRequest(
                symbol=symbol,
                days=days,
                interval=interval,
                pattern_type=pattern_type,
                pattern_params=params,
            )

            # Delegate detection to StockService/PatternRegistry
            result = self.stock_service.analyze_stock(request_obj)
            return result.to_dict(), 200

        except Exception as exc:
            return {"error": str(exc)}, 400

    def get_available_patterns(self):
        """Kept for compatibility; StockService/PatternRegistry defines capabilities."""
        # Could be enhanced to reflect registry dynamically if needed
        return [
            'hammer', 'doji', 'elephant_bar', 'marubozu',
            'engulfing', 'harami', 'piercing_line', 'counter_attack',
            'three_white_soldiers', 'three_black_crows', 'morning_star',
            'evening_star', 'three_inside_up', 'three_inside_down',
        ]
