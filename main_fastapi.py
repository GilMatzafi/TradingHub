from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import os

# Create FastAPI app
app = FastAPI(title="TradingHub", description="Advanced Pattern Detection for Smart Trading")

# Get the base directory
BASE_DIR = Path(__file__).parent

# Mount static files
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "tradinghub/frontend/single_candle/static")), name="static")
app.mount("/shared", StaticFiles(directory=str(BASE_DIR / "tradinghub/frontend/shared/static")), name="shared")
app.mount("/two_candle", StaticFiles(directory=str(BASE_DIR / "tradinghub/frontend/two_candle/static")), name="two_candle")
app.mount("/three_candle", StaticFiles(directory=str(BASE_DIR / "tradinghub/frontend/three_candle/static")), name="three_candle")

# Configure templates
templates = Jinja2Templates(directory=str(BASE_DIR / "tradinghub/frontend/shared/templates"))

# Add additional template directories to the loader
from jinja2 import FileSystemLoader
loader = templates.env.loader
if isinstance(loader, FileSystemLoader):
    loader.searchpath.insert(0, str(BASE_DIR / "tradinghub/frontend/single_candle/templates"))
    loader.searchpath.insert(0, str(BASE_DIR / "tradinghub/frontend/two_candle/templates"))
    loader.searchpath.insert(0, str(BASE_DIR / "tradinghub/frontend/three_candle/templates"))

# Import services and controllers
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.backend.shared.controllers.backtest_controller import BacktestController
from tradinghub.backend.shared.controllers.analyze_controller import AnalyzeController
from tradinghub.backend.shared.pattern_config.pattern_registry import PatternRegistry
from tradinghub.backend.shared.models.api_schemas import (
    AnalyzeRequestModel,
    AnalysisResponseModel,
    BacktestRequestModel,
    BacktestResponseModel,
)

# Initialize services and controllers
stock_service = StockService()
backtest_controller = BacktestController()
analyze_controller = AnalyzeController()

# Auto-register patterns early so routes reflect all configs
try:
    PatternRegistry.auto_register_patterns()
except Exception:
    pass

@app.get("/", response_class=RedirectResponse)
async def root():
    """Redirect to landing page"""
    return RedirectResponse(url="/landing", status_code=302)

@app.get("/landing", response_class=HTMLResponse)
async def landing(request: Request):
    """Landing page route"""
    try:
        return templates.TemplateResponse("landing.html", {"request": request})
    except Exception as e:
        print(f"Template error: {e}")
        return HTMLResponse(f"<h1>Error loading template: {e}</h1>", status_code=500)

@app.get("/home", response_class=HTMLResponse)
async def home(request: Request):
    """Alternative home page route"""
    return templates.TemplateResponse("landing.html", {"request": request})

# Dynamically register routes for all available patterns
def register_pattern_routes():
    """Register routes for all available patterns"""
    for pattern_type in PatternRegistry.get_available_patterns():
        config = PatternRegistry.get_pattern_config(pattern_type)
        template = config.get('template')
        
        if template:
            # Create route function dynamically
            def create_route_func(pattern_name, template_name):
                async def route_func(request: Request):
                    try:
                        # Handle both single-candle (hammer_analyzer) and two-candle (engulfing_analyzer/index.html) formats
                        if template_name.endswith('.html'):
                            return templates.TemplateResponse(template_name, {"request": request})
                        else:
                            return templates.TemplateResponse(f'{template_name}/index.html', {"request": request})
                    except Exception as e:
                        print(f"Template error for {pattern_name}: {e}")
                        return HTMLResponse(f"<h1>Error loading template for {pattern_name}: {e}</h1>", status_code=500)
                route_func.__name__ = f'{pattern_name}_analyzer'
                return route_func
            
            # Register the route
            route_func = create_route_func(pattern_type, template)
            app.add_api_route(f'/{pattern_type}', route_func, methods=["GET"], response_class=HTMLResponse)

# Register all pattern routes
register_pattern_routes()

@app.post("/analyze", response_model=AnalysisResponseModel)
async def analyze(request_data: AnalyzeRequestModel):
    """Analyze patterns endpoint"""
    try:
        result = analyze_controller.analyze(request_data.model_dump())
        if isinstance(result, tuple) and len(result) == 2:
            body, status = result
            return JSONResponse(content=body, status_code=status)
        if isinstance(result, dict):
            return JSONResponse(content=result, status_code=200)
        return JSONResponse(content={"error": "Unexpected analyze response type"}, status_code=500)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/backtest", response_model=BacktestResponseModel)
async def backtest(request_data: BacktestRequestModel):
    """Run backtest for pattern strategy (supports both long and short positions)"""
    try:
        result = backtest_controller.run_backtest(request_data.model_dump())
        if isinstance(result, tuple) and len(result) == 2:
            body, status = result
            return JSONResponse(content=body, status_code=status)
        if isinstance(result, dict):
            return JSONResponse(content=result, status_code=200)
        return JSONResponse(content={"error": "Unexpected backtest response type"}, status_code=500)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/backtest-short", response_model=BacktestResponseModel)
async def backtest_short(request_data: BacktestRequestModel):
    """Run SHORT position backtest for pattern strategy (legacy endpoint)"""
    try:
        # Add position_type to the data for short backtests
        data = request_data.model_dump()
        data['position_type'] = 'short'
        result = backtest_controller.run_backtest(data)
        if isinstance(result, tuple) and len(result) == 2:
            body, status = result
            return JSONResponse(content=body, status_code=status)
        if isinstance(result, dict):
            return JSONResponse(content=result, status_code=200)
        return JSONResponse(content={"error": "Unexpected backtest response type"}, status_code=500)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/patterns")
async def get_patterns():
    """Get list of available patterns"""
    try:
        patterns = []
        for pattern_type in PatternRegistry.get_available_patterns():
            config = PatternRegistry.get_pattern_config(pattern_type)
            patterns.append({
                'type': pattern_type,
                'name': config['name'],
                'description': config['description'],
                'implemented': config['pattern_class'] is not None and config['backtest_class'] is not None
            })
        return {"patterns": patterns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/patterns/{pattern_type}")
async def get_pattern_metadata(pattern_type: str):
    """Get metadata for a specific pattern"""
    try:
        metadata = PatternRegistry.get_pattern_metadata(pattern_type)
        return metadata
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/debug/clear-cache")
async def debug_clear_cache():
    """Debug endpoint to clear cache"""
    try:
        stock_service.clear_cache()
        return {
            'status': 'success',
            'message': 'Cache cleared successfully'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)
