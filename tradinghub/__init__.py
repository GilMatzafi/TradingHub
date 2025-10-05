from flask import Flask, send_from_directory, request
from tradinghub.backend.shared.config import Config
import os

def create_app(config_class=Config):
    """
    Application factory function that creates and configures the Flask app
    """
    # Use single_candle as primary template folder, shared as fallback
    app = Flask(__name__, 
                static_folder='frontend/single_candle/static',
                template_folder='frontend/single_candle/templates',
                static_url_path='/static')
    
    # Add shared templates to the template search path
    shared_template_path = os.path.join(app.root_path, 'frontend/shared/templates')
    if os.path.exists(shared_template_path):
        app.jinja_loader.searchpath.insert(0, shared_template_path)
    
    # Add two_candle templates to the template search path
    two_candle_template_path = os.path.join(app.root_path, 'frontend/two_candle/templates')
    if os.path.exists(two_candle_template_path):
        app.jinja_loader.searchpath.insert(0, two_candle_template_path)
    
    # Add three_candle templates to the template search path
    three_candle_template_path = os.path.join(app.root_path, 'frontend/three_candle/templates')
    if os.path.exists(three_candle_template_path):
        app.jinja_loader.searchpath.insert(0, three_candle_template_path)
    
    # Custom static file handler for shared files
    @app.route('/shared/<path:filename>')
    def shared_static(filename):
        return send_from_directory(os.path.join(app.root_path, 'frontend/shared/static'), filename)
    
    # Custom static file handler for two_candle files
    @app.route('/two_candle/<path:filename>')
    def two_candle_static(filename):
        return send_from_directory(os.path.join(app.root_path, 'frontend/two_candle/static'), filename)
    
    # Custom static file handler for three_candle files
    @app.route('/three_candle/<path:filename>')
    def three_candle_static(filename):
        return send_from_directory(os.path.join(app.root_path, 'frontend/three_candle/static'), filename)
    
    # Load configuration
    app.config.from_object(config_class)
    
    # Register blueprints
    from tradinghub.backend.routes.main import main_bp
    app.register_blueprint(main_bp)
    
    return app 