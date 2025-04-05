# TradingHub - Hammer Pattern Detector

A web application for detecting hammer candlestick patterns in stock data. This tool allows users to customize their strategy parameters and visualize the patterns in real-time.

## Features

- Download historical stock data using Yahoo Finance API
- Detect hammer candlestick patterns with customizable parameters
- Interactive candlestick visualization
- Results displayed in a clean, organized table
- Timezone conversion to Israel time

## Project Structure

```
tradinghub/
├── __init__.py              # Application factory
├── config/                  # Configuration files
│   └── config.py            # App configuration classes
├── models/                  # Data models
├── routes/                  # Route blueprints
│   └── main.py              # Main routes
├── services/                # Business logic
│   └── stock_service.py     # Stock data service
├── static/                  # Static files
│   ├── css/                 # CSS stylesheets
│   │   └── styles.css       # Main stylesheet
│   ├── js/                  # JavaScript files
│   │   └── main.js          # Main JavaScript
│   └── img/                 # Images
├── templates/               # HTML templates
│   └── index.html           # Main template
└── utils/                   # Utility functions
    └── time_utils.py        # Time conversion utilities
```

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/tradinghub.git
   cd tradinghub
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python run.py
   ```

5. Open your browser and navigate to `http://127.0.0.1:5000`

## Usage

1. Enter a stock symbol (e.g., AAPL, MSFT, GOOGL)
2. Select the number of days to analyze
3. Choose the time interval for the data
4. Adjust the strategy parameters:
   - Body Size Ratio: Maximum body size as a fraction of total range
   - Lower Shadow Ratio: Minimum lower shadow size relative to body
   - Upper Shadow Ratio: Maximum upper shadow size as a fraction of total range
   - Moving Average Period: Period for trend determination
   - Require Green Candle: Whether to only detect bullish hammers
5. Click "Analyze" to run the detection
6. View the results in the table below

## Customization

You can customize the application by modifying the configuration in `tradinghub/config/config.py`. Different configuration classes are available for development, testing, and production environments.

## License

MIT
