#!/usr/bin/env python3
"""
FastAPI server runner for TradingHub
"""
import uvicorn
from main_fastapi import app

if __name__ == "__main__":
    print("🚀 Starting TradingHub FastAPI server...")
    print("📊 Available at: http://localhost:5001")
    print("📚 API docs at: http://localhost:5001/docs")
    print("🔧 ReDoc at: http://localhost:5001/redoc")
    print("=" * 50)
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=5001, 
        reload=True,
        log_level="info"
    )
