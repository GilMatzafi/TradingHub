"""
Tweezer Bottom Pattern Controller
Controller for handling Tweezer Bottom pattern analysis requests
"""

from typing import Dict, Any, Tuple
import pandas as pd
from flask import jsonify
from tradinghub.backend.shared.controllers.backtest_controller import BacktestController
from tradinghub.backend.two_candle.patterns.tweezer_bottom_pattern import TweezerBottomPattern
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest

class TweezerBottomController:
    """Controller for Tweezer Bottom pattern analysis and backtesting"""
    
    def __init__(self):
        self.backtest_controller = BacktestController()
        self.stock_service = StockService()
        self.pattern_detector = TweezerBottomPattern()
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle pattern analysis request for Tweezer Bottom patterns
        
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
            
            # Build Tweezer Bottom-specific parameters
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('body_size_ratio', 0.3)),
                lower_shadow_ratio=0.0,  # Not used for Tweezer Bottom
                upper_shadow_ratio=0.0,  # Not used for Tweezer Bottom
                ma_period=int(data.get('ma_period', 20)),
                require_green=False,  # Not used for Tweezer Bottom
                require_high_volume=False  # Not used for Tweezer Bottom
            )
            
            # Add Tweezer Bottom-specific parameters
            low_tolerance = data.get('low_tolerance', 0.2)
            require_trend = data.get('require_trend', True)
            pattern_params.low_tolerance = low_tolerance  # Add as custom attribute
            pattern_params.require_trend = require_trend  # Add as custom attribute
            
            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=symbol,
                days=days,
                interval=interval,
                pattern_type='tweezer_bottom',
                pattern_params=pattern_params
            )
            
            # Perform analysis using stock service
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def backtest(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle backtest request for Tweezer Bottom patterns
        
        Args:
            data: Request data containing backtest parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        # Use the shared backtest controller
        return self.backtest_controller.run_backtest(data)
