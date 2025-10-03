from typing import Dict, Any
from flask import jsonify
from tradinghub.backend.shared.models.dto.backtest_params import BacktestParams
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams
from tradinghub.backend.shared.services.backtest_service import BacktestService

class BacktestController:
    """Controller for handling backtest requests"""
    
    def __init__(self):
        self.backtest_service = BacktestService()

    def run_backtest(self, data: Dict[str, Any]) -> tuple[Dict[str, Any], int]:
        """
        Handle backtest request
        
        Args:
            data: Request data containing backtest parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        try:
            # Create pattern parameters
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('body_size_ratio', 0.3)),
                lower_shadow_ratio=float(data.get('lower_shadow_ratio', 2.0)),
                upper_shadow_ratio=float(data.get('upper_shadow_ratio', 0.1)),
                ma_period=int(data.get('ma_period', 5)),
                require_green=data.get('require_green', True)
            )
            
            # Add volume parameters if they exist in the request
            if 'min_relative_volume' in data:
                pattern_params.min_relative_volume = float(data.get('min_relative_volume', 1.0))
                pattern_params.volume_lookback = int(data.get('volume_lookback', 20))
            
            # Create backtest parameters
            backtest_params = BacktestParams(
                stop_loss_pct=float(data.get('stop_loss_pct', 0.02)),
                take_profit_pct=float(data.get('take_profit_pct', 0.04)),
                entry_delay=int(data.get('entry_delay', 1)),
                max_holding_periods=int(data.get('max_holding_periods', 20)),
                initial_portfolio_size=float(data.get('initial_portfolio_size', 10000)),
                commission=float(data.get('commission', 0.65)),
                slippage=float(data.get('slippage', 0.1))
            )
            
            # Get patterns and pattern type from request
            patterns = data.get('patterns', [])
            pattern_type = data.get('pattern_type', 'hammer')
            
            # Run backtest
            results = self.backtest_service.run_backtest(
                symbol=data.get('symbol', 'AAPL'),
                days=int(data.get('days', 50)),
                interval=data.get('interval', '5m'),
                pattern_params=pattern_params,
                backtest_params=backtest_params,
                patterns=patterns,
                pattern_type=pattern_type
            )
            
            return jsonify(results), 200
            
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500
