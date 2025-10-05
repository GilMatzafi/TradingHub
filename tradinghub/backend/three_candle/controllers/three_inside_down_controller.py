"""
Three Inside Down Pattern Controller
Controller for handling Three Inside Down pattern analysis requests
"""

from typing import Dict, Any, Tuple
import pandas as pd
from flask import jsonify
from tradinghub.backend.shared.controllers.backtest_controller import BacktestController
from tradinghub.backend.three_candle.patterns.three_inside_down_pattern import ThreeInsideDownPattern
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest

class ThreeInsideDownController:
    """Controller for Three Inside Down pattern analysis and backtesting"""
    
    def __init__(self):
        self.backtest_controller = BacktestController()
        self.stock_service = StockService()
        self.pattern_detector = ThreeInsideDownPattern()
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle pattern analysis request for Three Inside Down patterns
        
        Args:
            data: Request data containing analysis parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        try:
            # Get stock data
            symbol = data.get('symbol', 'AAPL')
            days = int(data.get('days', 50))
            interval = data.get('interval', '5m')
            
            # Build Three Inside Down-specific parameters
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('body_size_ratio', 0.6)),
                lower_shadow_ratio=0.0,  # Not used for Three Inside Down
                upper_shadow_ratio=0.0,  # Not used for Three Inside Down
                ma_period=int(data.get('ma_period', 20)),
                require_green=False,  # Not used for Three Inside Down
                require_high_volume=False  # Not used for Three Inside Down
            )
            
            # Add Three Inside Down-specific parameters
            harami_body_ratio = data.get('harami_body_ratio', 0.5)
            require_trend = data.get('require_trend', True)
            confirmation_strength = data.get('confirmation_strength', 0.8)
            pattern_params.harami_body_ratio = harami_body_ratio  # Add as custom attribute
            pattern_params.require_trend = require_trend  # Add as custom attribute
            pattern_params.confirmation_strength = confirmation_strength  # Add as custom attribute
            
            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=symbol,
                days=days,
                interval=interval,
                pattern_type='three_inside_down',
                pattern_params=pattern_params
            )
            
            # Perform analysis using stock service
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def backtest(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle backtest request for Three Inside Down patterns
        
        Args:
            data: Request data containing backtest parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        # Use the shared backtest controller
        return self.backtest_controller.run_backtest(data)
