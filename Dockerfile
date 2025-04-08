# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=run.py \
    FLASK_ENV=production \
    # Add timeout settings for yfinance requests
    YF_TIMEOUT=30 \
    # Add DNS settings
    PYTHONHTTPSVERIFY=1

# Create and set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        python3-dev \
        # Add CA certificates and curl for network debugging
        ca-certificates \
        curl \
        # Add DNS utilities
        dnsutils \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Create a non-root user and switch to it
RUN useradd -m tradinguser && \
    chown -R tradinguser:tradinguser /app
USER tradinguser

# Healthcheck to ensure the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application with network-optimized settings
CMD ["gunicorn", \
    "--bind", "0.0.0.0:5000", \
    "--workers", "4", \
    "--timeout", "120", \
    "--keep-alive", "5", \
    "--worker-class", "gthread", \
    "--threads", "4", \
    "--max-requests", "1000", \
    "--max-requests-jitter", "50", \
    "run:app"] 