"""
Dark Cloud Cover Pattern Controller
Controller for handling Dark Cloud Cover pattern analysis requests
"""

from typing import Dict, Any, Tuple
import pandas as pd
from flask import jsonify
from tradinghub.backend.shared.controllers.backtest_controller import BacktestController
from tradinghub.backend.two_candle.patterns.dark_cloud_cover_pattern import DarkCloudCoverPattern
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest

class DarkCloudCoverController:
    """Controller for Dark Cloud Cover pattern analysis and backtesting"""
    
    def __init__(self):
        self.backtest_controller = BacktestController()
        self.stock_service = StockService()
        self.pattern_detector = DarkCloudCoverPattern()
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle pattern analysis request for Dark Cloud Cover patterns
        
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
            
            # Build Dark Cloud Cover-specific parameters
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('body_size_ratio', 0.6)),
                lower_shadow_ratio=0.0,  # Not used for Dark Cloud Cover
                upper_shadow_ratio=0.0,  # Not used for Dark Cloud Cover
                ma_period=int(data.get('ma_period', 20)),
                require_green=False,  # Not used for Dark Cloud Cover
                require_high_volume=False  # Not used for Dark Cloud Cover
            )
            
            # Add Dark Cloud Cover-specific parameters
            max_shadow_ratio = data.get('max_shadow_ratio', 0.3)
            penetration_ratio = data.get('penetration_ratio', 0.5)
            require_trend = data.get('require_trend', True)
            pattern_params.max_shadow_ratio = max_shadow_ratio  # Add as custom attribute
            pattern_params.penetration_ratio = penetration_ratio  # Add as custom attribute
            pattern_params.require_trend = require_trend  # Add as custom attribute
            
            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=symbol,
                days=days,
                interval=interval,
                pattern_type='dark_cloud_cover',
                pattern_params=pattern_params
            )
            
            # Perform analysis using stock service
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def backtest(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle backtest request for Dark Cloud Cover patterns
        
        Args:
            data: Request data containing backtest parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        # Use the shared backtest controller
        return self.backtest_controller.run_backtest(data)
