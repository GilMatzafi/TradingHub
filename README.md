# TradingHub

TradingHub helps you detect and backtest the Hammer candlestick strategy with a clean, customizable interface.

## Features

- **Technical Analysis**: Analyze market data with various technical indicators
- **Pattern Recognition**: Identify and analyze Hammer candlestick
- **Backtesting**: Test trading strategies using historical data
- **Real-time Data**: Fetch and analyze real-time market data from Yahoo Finance
- **Docker Support**: Easy deployment using Docker containers
- **Rate Limiting Protection**: Built-in protection against Yahoo Finance API rate limits

## Rate Limiting

TradingHub uses Yahoo Finance API which has rate limits. The application includes built-in protection:

- **Automatic Retry Logic**: Failed requests are automatically retried with exponential backoff
- **Request Throttling**: Minimum 1-second intervals between API requests
- **Caching**: 5-minute cache to avoid repeated requests for the same data
- **User Guidance**: Clear error messages and tips to avoid rate limiting

### Tips to Avoid Rate Limiting

- Use longer time intervals (1h, 1d) instead of short intervals (1m, 5m)
- Limit analysis to 30-50 days for intraday data
- Wait 1-2 minutes between requests
- The app will automatically retry failed requests

### Configuration

You can adjust rate limiting behavior using environment variables:

```bash
MIN_REQUEST_INTERVAL=1.0    # seconds between requests
CACHE_TTL=300              # cache TTL in seconds
MAX_RETRY_ATTEMPTS=3       # max retry attempts
RETRY_WAIT_MIN=4           # min wait time between retries
RETRY_WAIT_MAX=10          # max wait time between retries
```

## Project Structure

```
tradinghub/
├── config/         # Configuration files
├── models/         # Data models and backtesting logic
├── routes/         # API endpoints and route handlers
├── services/       # Business logic and external service integrations
├── static/         # Static assets (CSS, JavaScript, images)
├── templates/      # HTML templates
├── utils/          # Utility functions and helpers
├── __init__.py     # Application factory
└── main.py         # Main application logic
```

## Prerequisites

- Python 3.11 or higher
- Docker (optional, for containerized deployment)
- pip (Python package manager)

## Installation

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tradinghub.git
   cd tradinghub
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   python run.py
   ```

The application will be available at `http://localhost:5000`.

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t tradinghub .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 tradinghub
   ```

The application will be available at `http://localhost:5000`.

## Dependencies

- Flask: Web framework
- yfinance: Yahoo Finance API client
- pandas: Data manipulation and analysis
- numpy: Numerical computing
- gunicorn: Production WSGI server
- aiohttp: Async HTTP client
- tenacity: Retry logic for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


Developed by me, with the assistance of LLM for ideation, code suggestions, and documentation.


