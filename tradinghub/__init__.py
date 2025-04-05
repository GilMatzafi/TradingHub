from flask import Flask
from tradinghub.config.config import Config

def create_app(config_class=Config):
    """
    Application factory function that creates and configures the Flask app
    """
    app = Flask(__name__, 
                static_folder='static',
                template_folder='templates')
    
    # Load configuration
    app.config.from_object(config_class)
    
    # Register blueprints
    from tradinghub.routes.main import main_bp
    app.register_blueprint(main_bp)
    
    return app 