# Golden Scout 🏀
### NBA Contract Decision Engine — Hacklytics 2026

> **Should you sign this player?** Golden Scout runs the numbers and tells you: **SIGN**, **NEGOTIATE**, or **AVOID** — with every figure explained.

Built in 36 hours at Hacklytics 2026 (Georgia Tech).

---

## What it does

NBA contracts are worth hundreds of millions. Most decisions still rely on gut instinct. Golden Scout applies quantitative finance logic to basketball — enter any player and a salary ask, and the engine returns a health-adjusted fair value grounded in real economics.

The pipeline:

```
Player stats → Position-adjusted z-scores → Impact score
→ 10,000 Monte Carlo seasons → Wins added
→ Fair value ($3.8M/win) × Durability score
→ SIGN / NEGOTIATE / AVOID
```

The durability model discounts for injury risk using `GP/82 × age curve` — a player worth $25M healthy but with a 40% durability discount is realistically worth $15M. That distinction matters.

---

## Features

- **Player search** — fuzzy-matched across 562 NBA players, handles Unicode names (Jokić, Dončić) automatically
- **Player Profile** — position-adjusted z-scores, 6-axis performance radar, trend signal (last 10 games vs season avg)
- **Monte Carlo Simulation** — 10,000 randomized seasons, 90% confidence interval, playoff probability
- **Contract Decision** — fair value, efficiency ratio, overpay %, health-adjusted verdict
- **Injury Risk Pricing** — GP/82 × age curve durability model with projection handling for partial/injury seasons
- **Trade Simulator** — win distribution shift before vs. after swapping two players
- **Player Comparison** — head-to-head at any salary ask, picks the better value
- **AI Executive Report** — Gemini 2.0 Flash generates a structured scouting summary (Verdict / Strengths / Considerations)
- **AI Compare Verdict** — one sharp Gemini-generated sentence comparing two players, loads async without blocking UI
- **Voice Narration** — ElevenLabs reads the verdict aloud; falls back to browser Speech Synthesis

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS, Recharts, Axios |
| Backend | Python 3.13, FastAPI, Uvicorn |
| Data | Pandas, NumPy, FuzzyWuzzy |
| AI | Google Gemini 2.0 Flash |
| Audio | ElevenLabs TTS |
| Economics | Berri & Schmidt (2010) — $3.8M per marginal win |
| Simulation | Custom Monte Carlo (10,000 iterations) |

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API key ([get one free](https://aistudio.google.com))
- ElevenLabs API key ([get one free](https://elevenlabs.io)) — optional, falls back to browser TTS

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Start the server:

```bash
uvicorn main:app --reload
# API runs at http://localhost:8000
# Auto-generated docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## Project Structure

```
Golden-Scout_Hacklytics_2026/
├── backend/
│   ├── data/
│   │   ├── database_24_25.csv      # 2024-25 NBA game-by-game stats
│   │   ├── position.csv            # Player positions + age + GP
│   │   └── NBA Player Salaries_2024-25_1.csv
│   ├── engine/
│   │   ├── loader.py               # Data loading, position merge, fuzzy salary match
│   │   ├── stats.py                # Z-scores, impact score, player profiles
│   │   ├── simulation.py           # Monte Carlo engine
│   │   ├── valuation.py            # Fair value, durability model, decision logic
│   │   └── trade.py                # Trade impact simulation
│   ├── ai/
│   │   ├── gemini.py               # Executive report + compare verdict generation
│   │   └── elevenlabs.py           # TTS audio
│   ├── cache/                      # Cached Gemini responses (gitignored)
│   └── main.py                     # FastAPI app, all endpoints
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # All API calls
│   │   ├── screens/
│   │   │   ├── SearchScreen.jsx
│   │   │   ├── ProfileScreen.jsx
│   │   │   ├── SimulationScreen.jsx
│   │   │   ├── DecisionScreen.jsx
│   │   │   ├── ReportScreen.jsx
│   │   │   ├── TradeScreen.jsx
│   │   │   └── CompareScreen.jsx
│   │   └── components/
│   └── App.jsx
└── README.md
```

---

## Key Formulas

**Impact Score**
```
offense_z    = 0.5×TS_z + 0.3×USG_z + 0.2×AST_z
defense_z    = 0.4×STL_z + 0.4×BLK_z − 0.2×TOV_z
impact_score = 0.35×positional_z + 0.65×absolute_production
```

**Fair Value & Durability**
```
fair_value       = wins_added × $3.8M
age_factor       = <27→1.00 | 27-30→0.97 | 31-33→0.92 | 34-36→0.85 | 37+→0.75
durability_score = (GP / 82) × age_factor
health_adj_value = fair_value × durability_score
```

**Decision Thresholds**
```
health_efficiency = health_adj_value / salary_ask

≥ 1.0  →  SIGN
≥ 0.5  →  NEGOTIATE
< 0.5  →  AVOID
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/players` | All player names for autocomplete |
| GET | `/player/{name}/profile` | Full profile, z-scores, radar data |
| POST | `/simulate` | Monte Carlo simulation |
| POST | `/value` | Contract valuation + durability |
| POST | `/report` | Gemini AI executive report |
| POST | `/audio` | ElevenLabs TTS |
| POST | `/trade` | Trade impact simulation |
| POST | `/compare` | Head-to-head comparison |
| POST | `/compare-verdict` | AI one-sentence compare verdict |

Full docs available at `/docs` when the server is running.

---

## Known Limitations

- Uses 2024-25 season data only — no mid-season trades or injuries after the data cutoff
- The $3.8M/win figure is from Berri & Schmidt (2010); NBA salaries have risen significantly since
- Negative fair value is intentional — a player with negative wins added costs the team wins, so their contract value is negative
- Render free tier spins down after inactivity; first request may take ~30 seconds to wake up

---

## Built at Hacklytics 2026

Georgia Tech · February 2026 · Sports Analytics Track

**Aditya Chauhan** · **Vladimir Khegai** · **Nudrat Towsif** · **Kareem Elabiad**

---

*Economics model: Berri & Schmidt (2010) — "Stumbling on Wins"*
