from typing import Dict, Any, Tuple
import logging
from tradinghub.backend.shared.models.dto.backtest_params import BacktestParams
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams
from tradinghub.backend.shared.services.backtest_service import BacktestService
from tradinghub.backend.shared.utils.data_utils import (
    parse_pattern_params,
    parse_backtest_params,
    normalize_patterns_payload,
    normalize_request_params,
)

class BacktestController:
    """Controller for handling backtest requests"""
    
    def __init__(self):
        self.backtest_service = BacktestService()

    def run_backtest(self, data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        """
        Handle backtest request
        
        Args:
            data: Request data containing backtest parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        try:
            logging.info("BacktestController: incoming data keys=%s", list(data.keys()))
            # Create params
            pattern_params = parse_pattern_params(data)
            backtest_params = parse_backtest_params(data)

            # Normalize request basics
            symbol, days, interval = normalize_request_params(data)

            # Normalize pattern payload
            incoming_patterns = data.get('patterns', [])
            logging.info(
                "BacktestController: patterns count=%d pattern_type=%s position_type=%s",
                len(incoming_patterns), data.get('pattern_type'), data.get('position_type')
            )
            patterns = normalize_patterns_payload(incoming_patterns)
            if patterns:
                sample = {k: patterns[0].get(k) for k in list(patterns[0].keys())[:6]}
                logging.info("BacktestController: first pattern sample=%s", sample)

            pattern_type = data.get('pattern_type', 'hammer')
            position_type = data.get('position_type', 'long')
            
            # Run backtest
            results = self.backtest_service.run_backtest(
                symbol=symbol,
                days=days,
                interval=interval,
                pattern_params=pattern_params,
                backtest_params=backtest_params,
                patterns=patterns,
                pattern_type=pattern_type,
                position_type=position_type
            )
            return results, 200
            
        except ValueError as e:
            logging.exception("BacktestController ValueError: %s", e)
            return {'error': str(e)}, 400
        except Exception as e:
            logging.exception("BacktestController Exception: %s", e)
            return {'error': str(e)}, 500
