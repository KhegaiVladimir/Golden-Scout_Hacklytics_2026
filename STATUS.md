# Golden Scout — Project Status

**Last updated:** 2026-02-21
**Stack:** FastAPI (Python 3.13) + React/Vite + Tailwind CSS + Recharts

---

## What Works

### Backend

| Feature | Status | Notes |
|---|---|---|
| Data loading | ✅ | 562 players from `database_24_25.csv`, aggregated on startup |
| Fuzzy player search | ✅ | Exact match first, then fuzzywuzzy (score cutoff 70) |
| Position mapping | ✅ | 80+ named players mapped by exact CSV name; heuristic fallback for the rest |
| TS% calculation | ✅ | `PTS / (2 * (FGA + 0.44 * FTA))`, clipped 0–1 |
| USG% proxy | ✅ | `(FGA + 0.44*FTA + TOV) / (MP*0.2 + 1)` |
| Position z-scores | ✅ | Per-position mean/std, clipped to ±3 |
| Impact score | ✅ | 35% positional z-score + 65% absolute production |
| Small sample guard | ✅ | GP < 15 or MPG < 10 → positional z only (no absolute component) |
| Monte Carlo simulation | ✅ | 10,000 binomial trials, logit model with coefficient 0.65 |
| Small sample discount | ✅ | `sample_ratio = min(GP/15, MPG/10)` applied to impact before simulation |
| Contract valuation | ✅ | Fair value = `wins_added × $3.8M` (Berri & Schmidt 2010) |
| Verdict thresholds | ✅ | SIGN ≥ 1.0×, NEGOTIATE ≥ 0.50×, AVOID < 0.50× or wins ≤ 0 |
| efficiency_ratio = N/A | ✅ | Returns `null` (not `0.0`) when wins_added ≤ 0 |
| Gemini AI report | ✅ | `gemini-2.5-flash`, file-based JSON cache, 3-retry backoff on 429 |
| ElevenLabs audio | ✅ | `eleven_flash_v2_5` model, file-based MP3 cache |
| Player compare endpoint | ✅ | `GET /compare?player1=...&player2=...` |
| CORS | ✅ | Allows all origins |
| Team (Tm) field | ✅ | Uses last game entry (handles mid-season trades) |

### API Endpoints

| Endpoint | Method | Status |
|---|---|---|
| `/` | GET | ✅ Health check |
| `/players` | GET | ✅ Returns sorted list of 562 player names |
| `/player/{name}/profile` | GET | ✅ Full profile with z-scores, radar, trend, warnings |
| `/simulate` | POST | ✅ Monte Carlo simulation result |
| `/value` | POST | ✅ Fair value + verdict |
| `/report` | POST | ✅ Gemini AI scouting report |
| `/audio` | POST | ✅ ElevenLabs TTS, falls back gracefully |
| `/compare` | GET | ✅ Head-to-head comparison |

### Frontend Screens

| Screen | Status | Notes |
|---|---|---|
| Search | ✅ | Autocomplete dropdown, fuzzy filtering, salary/wins inputs |
| Profile | ✅ | Stats table, radar chart, z-scores, trend badge, small sample warning |
| Simulation | ✅ | Monte Carlo histogram, win range, playoff probability |
| Decision | ✅ | Fair value, efficiency ratio (N/A when no value), verdict card |
| Report | ✅ | AI scouting report sections + ElevenLabs audio playback |

---

## Verified Player Results

Tested with `team_wins=38`, salary as noted:

| Player | Impact | Percentile | Wins+ | Fair Value | Efficiency | Verdict |
|---|---|---|---|---|---|---|
| LeBron James ($45M) | 1.300 | 99.2 | +16.7 | $63.5M | 1.41× | SIGN |
| Jayson Tatum ($32M) | 1.291 | 99.0 | +16.1 | $61.2M | 1.91× | SIGN |
| Stephen Curry ($53M) | 0.926 | 92.8 | +12.1 | $46.0M | 0.87× | NEGOTIATE |
| Alex Ducas ($10M) | -0.444 | 11.4 | — | $0.0M | N/A | AVOID |
| Caleb Houstan ($5M) | -0.092 | 24.6 | — | $0.0M | N/A | AVOID |

---

## Known Issues / Limitations

### Medium Priority

| Issue | Details |
|---|---|
| **Position heuristic not perfect** | ~435 players still default to SF after named map + heuristic. Players like combo guards or stretch bigs may be misclassified. No position column in the CSV — positions are inferred from stats. |
| **Turnover z-score color (frontend)** | Backend returns correct `z_scores.tov` (negative z = good). Frontend applies `colorZ: -(z_scores.tov)` to flip the color. If this appears green instead of red in the browser, it's a browser cache issue — hard refresh (Cmd+Shift+R). |
| **USG% is a proxy** | Not the official NBA formula (requires team-level data). Used only for z-score ranking so relative values are still meaningful. |

### Low Priority

| Issue | Details |
|---|---|
| **Salary data missing for 118 players** | `Salary_M = 0.0` for players not in the salary CSV. The salary ask is always user-input so this only affects the stored profile salary display. |
| **Small sample TS% outliers** | 7 players have TS% > 80% (e.g., 1-game wonders). All are GP < 15, so the small sample guard excludes their absolute component. Correctly flagged with `small_sample: true`. |
| **`@app.on_event("startup")` deprecated** | FastAPI >= 0.95 recommends `lifespan` context manager instead. Works fine, just a deprecation warning in logs. |
| **Gemini report uses cached decision** | If a player's verdict changes (e.g., after salary renegotiation), the cached Gemini report still references the old decision until the cache is cleared. Clear with `rm backend/cache/*.json`. |
| **Audio cached per player name** | If the same player is searched with a different salary/team wins, the audio report text will be the same cached version from the first search. Clear with `rm backend/audio_cache/*.mp3`. |

---

## How to Run

```bash
# Backend
cd backend
pip install -r requirements.txt
cp env.example .env   # add your API keys
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

### Required environment variables (`.env`)
```
GEMINI_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

---

## Architecture

```
CSV (database_24_25.csv)
    ↓ loader.py — aggregate per-player, assign positions, compute TS%/USG%
    ↓ stats.py  — position z-scores, impact score, build_full_profile()
    ↓ simulation.py — Monte Carlo 10k trials, logit model
    ↓ valuation.py  — fair_value = wins × $3.8M, verdict thresholds
    ↓ gemini.py / elevenlabs.py — AI report + audio (cached)
    ↓ main.py (FastAPI) — REST API
    ↓ React frontend — Search → Profile → Simulation → Decision → Report
```
