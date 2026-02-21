"""
Complete FastAPI app for GoldenScout — NBA contract decision engine.
"""
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, List, Optional, Union
import os
import io
import json
from dotenv import load_dotenv

from engine.loader import df_players, player_list, get_player
from engine.stats import build_full_profile, compute_position_stats
from engine.simulation import simulate_season
from engine.valuation import calculate_value
from ai.gemini import generate_report
from ai.elevenlabs import generate_audio
from engine.trade import simulate_trade

load_dotenv()

app = FastAPI(title="Golden Scout API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio cache
audio_cache_dir = os.path.join(os.path.dirname(__file__), "audio_cache")
os.makedirs(audio_cache_dir, exist_ok=True)
app.mount("/audio-files", StaticFiles(directory=audio_cache_dir), name="audio_files")

# Pydantic models
class SimulateRequest(BaseModel):
    impact_score: float
    current_team_wins: int = 38
    games_played: int = 82
    mpg: float = 30.0

class ValueRequest(BaseModel):
    wins_added: float
    requested_salary_m: float
    value_per_win: float = 3.8
    age: Optional[Union[float, str]] = None
    gp: int = 82

class ReportRequest(BaseModel):
    computed_results: Dict

class AudioRequest(BaseModel):
    text: str
    player_name: str

class CompareRequest(BaseModel):
    player1: str
    player2: str
    current_team_wins: int = 38
    requested_salary_m: float = 20.0

class TradeRequest(BaseModel):
    player_out: str
    player_in: str
    current_team_wins: int = 38


# Startup event
@app.on_event("startup")
async def startup():
    print(f"✅ GoldenScout ready — {len(player_list)} players loaded")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "players_loaded": len(player_list)}


@app.get("/players")
async def get_players():
    return player_list


@app.get("/player/{name}/profile")
async def get_player_profile(name: str):
    try:
        profile = build_full_profile(name)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulate")
async def simulate(request: SimulateRequest):
    try:
        result = simulate_season(
            impact_score=request.impact_score,
            current_team_wins=request.current_team_wins,
            games_played=request.games_played,
            mpg=request.mpg,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/value")
async def value(request: ValueRequest):
    try:
        result = calculate_value(
            wins_added=request.wins_added,
            requested_salary_m=request.requested_salary_m,
            value_per_win=request.value_per_win,
            age=request.age if request.age else 0,
            gp=request.gp,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/report")
async def report(request: ReportRequest):
    try:
        result = generate_report(request.computed_results)
        return result
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.post("/audio")
async def audio(req: AudioRequest):
    try:
        result = generate_audio(req.text, req.player_name)
        if result is None:
            return {"fallback": True, "text": req.text}
        return StreamingResponse(io.BytesIO(result), media_type="audio/mpeg")
    except Exception:
        return {"fallback": True, "text": req.text}


@app.get("/compare")
async def compare(
    player1: str,
    player2: str,
    current_team_wins: int = 38,
    requested_salary_m: float = 20.0,
):
    try:
        profile1 = build_full_profile(player1)
        profile2 = build_full_profile(player2)

        sim1 = simulate_season(
            profile1["impact_score"], current_team_wins,
            games_played=profile1["gp"], mpg=profile1["stats"]["mp"]
        )
        sim2 = simulate_season(
            profile2["impact_score"], current_team_wins,
            games_played=profile2["gp"], mpg=profile2["stats"]["mp"]
        )

        # ── Pass age + gp so durability discount is applied ──
        val1 = calculate_value(
            wins_added=sim1["wins_added"],
            requested_salary_m=requested_salary_m,
            age=profile1.get("age", 0),
            gp=profile1["gp"],
        )
        val2 = calculate_value(
            wins_added=sim2["wins_added"],
            requested_salary_m=requested_salary_m,
            age=profile2.get("age", 0),
            gp=profile2["gp"],
        )

        comparison = {
            "player1": {
                "name": profile1["player"],
                "impact_score": profile1["impact_score"],
                "wins_added": sim1["wins_added"],
                "efficiency_ratio": val1["efficiency_ratio"],
                "decision": val1["decision"],
            },
            "player2": {
                "name": profile2["player"],
                "impact_score": profile2["impact_score"],
                "wins_added": sim2["wins_added"],
                "efficiency_ratio": val2["efficiency_ratio"],
                "decision": val2["decision"],
            },
            "requested_salary_m": requested_salary_m,
        }

        h2h_report = generate_report(comparison)

        return {
            "player1_profile": profile1,
            "player2_profile": profile2,
            "player1_simulation": sim1,
            "player2_simulation": sim2,
            "player1_valuation": val1,
            "player2_valuation": val2,
            "head_to_head_report": h2h_report,
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/trade")
async def trade(request: TradeRequest):
    try:
        result = simulate_trade(
            player_out=request.player_out,
            player_in=request.player_in,
            current_team_wins=request.current_team_wins,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)