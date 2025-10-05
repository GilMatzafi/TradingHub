# TradingHub

TradingHub helps you detect and backtest the Hammer candlestick strategy with a clean, customizable interface.
New candlestick patterns are currently in development and coming soon.

[Website Link](https://tradinghub.onrender.com/)

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


