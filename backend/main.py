from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

from engine.loader import load_data, get_player, search_players
from engine.stats import calculate_z_scores, calculate_impact_score, calculate_percentile, calculate_cv, calculate_trend
from engine.simulation import simulate_season
from engine.valuation import calculate_value
from ai.gemini import generate_report
from ai.elevenlabs import generate_audio

load_dotenv()

app = FastAPI(title="Golden Scout API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio cache
audio_cache_dir = os.path.join(os.path.dirname(__file__), "audio_cache")
os.makedirs(audio_cache_dir, exist_ok=True)
app.mount("/audio", StaticFiles(directory=audio_cache_dir), name="audio")

# Initialize data on startup
stats_df = None
salary_df = None

@app.on_event("startup")
async def startup_event():
    global stats_df, salary_df
    stats_df, salary_df = load_data()

class PlayerSearchRequest(BaseModel):
    query: str

class PlayerAnalysisRequest(BaseModel):
    player_name: str
    contract_value: float
    contract_years: int

@app.get("/")
async def root():
    return {"message": "Golden Scout API"}

@app.post("/api/search")
async def search(request: PlayerSearchRequest):
    """Search for players with fuzzy matching"""
    try:
        results = search_players(request.query, stats_df)
        return {"players": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/player/{player_name}")
async def get_player_data(player_name: str):
    """Get player data by name"""
    try:
        player = get_player(player_name, stats_df, salary_df)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return player
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze_player(request: PlayerAnalysisRequest):
    """Analyze player with stats, simulation, and valuation"""
    try:
        player = get_player(request.player_name, stats_df, salary_df)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Calculate z-scores
        z_scores = calculate_z_scores(player, stats_df)
        
        # Calculate impact score
        impact_score = calculate_impact_score(player, stats_df)
        
        # Calculate percentiles
        percentiles = calculate_percentile(player, stats_df)
        
        # Calculate CV
        cv = calculate_cv(player, stats_df)
        
        # Calculate trend
        trend = calculate_trend(player, stats_df)
        
        # Run simulation
        simulation_results = simulate_season(player, stats_df, n_simulations=1000)
        
        # Calculate valuation
        valuation = calculate_value(
            player, 
            stats_df, 
            request.contract_value, 
            request.contract_years
        )
        
        return {
            "player": player,
            "z_scores": z_scores,
            "impact_score": impact_score,
            "percentiles": percentiles,
            "cv": cv,
            "trend": trend,
            "simulation": simulation_results,
            "valuation": valuation
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/report")
async def generate_player_report(request: PlayerAnalysisRequest):
    """Generate AI report for player"""
    try:
        player = get_player(request.player_name, stats_df, salary_df)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Get analysis data
        analysis = await analyze_player(request)
        
        # Generate report
        report = generate_report(player, analysis, request.contract_value, request.contract_years)
        
        return {"report": report}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/audio")
async def generate_audio_report(request: PlayerAnalysisRequest):
    """Generate audio narration for report"""
    try:
        player = get_player(request.player_name, stats_df, salary_df)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Get report
        report_response = await generate_player_report(request)
        report_text = report_response["report"]
        
        # Generate audio
        player_name = player.get("name") or player.get("Player", "Player")
        audio_url = generate_audio(report_text, player_name)
        
        return {"audio_url": audio_url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
