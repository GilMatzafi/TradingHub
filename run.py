from tradinghub import create_app
from tradinghub.config.config import DevelopmentConfig

app = create_app(DevelopmentConfig)

if __name__ == '__main__':
    app.run(debug=True, port=5001) 