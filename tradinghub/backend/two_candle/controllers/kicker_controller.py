"""
Kicker Pattern Controller
Controller for handling Kicker pattern analysis requests
"""

from typing import Dict, Any, Tuple
import pandas as pd
from flask import jsonify
from tradinghub.backend.shared.controllers.backtest_controller import BacktestController
from tradinghub.backend.two_candle.patterns.kicker_pattern import KickerPattern
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest

class KickerController:
    """Controller for Kicker pattern analysis and backtesting"""
    
    def __init__(self):
        self.backtest_controller = BacktestController()
        self.stock_service = StockService()
        self.pattern_detector = KickerPattern()
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle pattern analysis request for Kicker patterns
        
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
            
            # Build Kicker-specific parameters
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('body_size_ratio', 0.3)),
                lower_shadow_ratio=0.0,  # Not used for Kicker
                upper_shadow_ratio=0.0,  # Not used for Kicker
                ma_period=int(data.get('ma_period', 20)),
                require_green=False,  # Not used for Kicker
                require_high_volume=False  # Not used for Kicker
            )
            
            # Add Kicker-specific parameters
            gap_size_ratio = data.get('gap_size_ratio', 0.5)
            require_trend = data.get('require_trend', True)
            kicker_type = data.get('kicker_type', 'both')
            pattern_params.gap_size_ratio = gap_size_ratio  # Add as custom attribute
            pattern_params.require_trend = require_trend  # Add as custom attribute
            pattern_params.kicker_type = kicker_type  # Add as custom attribute
            
            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=symbol,
                days=days,
                interval=interval,
                pattern_type='kicker',
                pattern_params=pattern_params
            )
            
            # Perform analysis using stock service
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def backtest(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle backtest request for Kicker patterns
        
        Args:
            data: Request data containing backtest parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        # Use the shared backtest controller
        return self.backtest_controller.run_backtest(data)
