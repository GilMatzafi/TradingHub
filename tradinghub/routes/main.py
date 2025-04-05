from flask import Blueprint, render_template, request, jsonify
from tradinghub.services.stock_service import StockService
from tradinghub.models.dto.pattern_params import PatternParams, AnalysisRequest

# Create blueprint
main_bp = Blueprint('main', __name__)

# Initialize services
stock_service = StockService()

@main_bp.route('/')
def index():
    """Render the strategy introduction page"""
    return render_template('strategy.html')

@main_bp.route('/analyzer')
def analyzer():
    """Render the pattern analyzer page"""
    return render_template('analyzer.html')

@main_bp.route('/analyze', methods=['POST'])
def analyze():
    """Analyze stock data for hammer patterns"""
    try:
        data = request.json
        
        # Create pattern parameters
        pattern_params = PatternParams(
            body_size_ratio=float(data.get('body_size_ratio', 0.3)),
            lower_shadow_ratio=float(data.get('lower_shadow_ratio', 2.0)),
            upper_shadow_ratio=float(data.get('upper_shadow_ratio', 0.1)),
            ma_period=int(data.get('ma_period', 5)),
            require_green=data.get('require_green', True)
        )
        
        # Create analysis request
        request_obj = AnalysisRequest(
            symbol=data.get('symbol', 'AAPL'),
            days=int(data.get('days', 50)),
            interval=data.get('interval', '5m'),
            pattern_params=pattern_params
        )
        
        # Perform analysis
        result = stock_service.analyze_stock(request_obj)
        
        return jsonify(result.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400 