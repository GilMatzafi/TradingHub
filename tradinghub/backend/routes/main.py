from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.backend.single_candle.controllers.backtest_controller import BacktestController
from tradinghub.backend.single_candle.controllers.analyze_controller import AnalyzeController
from tradinghub.backend.single_candle.config.pattern_registry import PatternRegistry


# Create blueprint
main_bp = Blueprint('main', __name__)

# Initialize services and controllers
stock_service = StockService()
backtest_controller = BacktestController()
analyze_controller = AnalyzeController()

@main_bp.route('/')
def index():
    """Redirect to hammer pattern analyzer page"""
    return redirect(url_for('main.hammer_analyzer'))

# Dynamically register routes for all available patterns
def register_pattern_routes():
    """Register routes for all available patterns"""
    for pattern_type in PatternRegistry.get_available_patterns():
        config = PatternRegistry.get_pattern_config(pattern_type)
        template = config.get('template')
        
        if template:
            # Create route function dynamically
            def create_route_func(pattern_name, template_name):
                def route_func():
                    return render_template(f'{template_name}/index.html')
                route_func.__name__ = f'{pattern_name}_analyzer'
                return route_func
            
            # Register the route
            route_func = create_route_func(pattern_type, template)
            main_bp.add_url_rule(f'/{pattern_type}', f'{pattern_type}_analyzer', route_func, strict_slashes=False)

# Register all pattern routes (including hammer)
register_pattern_routes()

@main_bp.route('/analyze', methods=['POST'])
def analyze():
    return analyze_controller.analyze(request.json)

@main_bp.route('/backtest', methods=['POST'])
def backtest():
    """Run backtest for hammer pattern strategy"""
    return backtest_controller.run_backtest(request.json)

@main_bp.route('/patterns', methods=['GET'])
def get_patterns():
    """Get list of available patterns"""
    try:
        patterns = []
        for pattern_type in PatternRegistry.get_available_patterns():
            config = PatternRegistry.get_pattern_config(pattern_type)
            patterns.append({
                'type': pattern_type,
                'name': config['name'],
                'description': config['description'],
                'implemented': config['pattern_class'] is not None and config['backtest_class'] is not None
            })
        return jsonify({'patterns': patterns})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/patterns/<pattern_type>', methods=['GET'])
def get_pattern_metadata(pattern_type):
    """Get metadata for a specific pattern"""
    try:
        metadata = PatternRegistry.get_pattern_metadata(pattern_type)
        return jsonify(metadata)
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_bp.route('/debug/clear-cache', methods=['POST'])
def debug_clear_cache():
    """Debug endpoint to clear cache"""
    try:
        stock_service.clear_cache()
        return jsonify({
            'status': 'success',
            'message': 'Cache cleared successfully'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500 