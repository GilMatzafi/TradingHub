from flask import Blueprint, render_template, request, jsonify, redirect, url_for
from tradinghub.services.stock_service import StockService
from tradinghub.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.controllers.backtest_controller import BacktestController
from tradinghub.controllers.analyze_controller import AnalyzeController


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

@main_bp.route('/hammer', strict_slashes=False)
def hammer_analyzer():
    """Render the hammer pattern analyzer page"""
    return render_template('hammer_analyzer/index.html')

@main_bp.route('/analyze', methods=['POST'])
def analyze():
    return analyze_controller.analyze(request.json)

@main_bp.route('/backtest', methods=['POST'])
def backtest():
    """Run backtest for hammer pattern strategy"""
    return backtest_controller.run_backtest(request.json) 