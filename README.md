# Golden Scout

NBA player scouting and valuation application with AI-powered reports and audio narration.

## Features

- Player search with autocomplete
- Statistical analysis with z-scores and percentiles
- Monte Carlo season simulation
- AI-generated scouting reports (Gemini)
- Audio narration (ElevenLabs)
- Contract valuation recommendations

## Setup

### Backend

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Create `.env` file in the `backend/` directory:
```bash
cd backend
cat > .env << EOF
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
EOF
```

3. Download data files to `backend/data/`:
   - `nba_stats_2324.csv`
   - `nba_salary_2324.csv`

4. Run the server:
```bash
python main.py
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run development server:
```bash
npm run dev
```

## Project Structure

- `backend/` - FastAPI server with data processing and AI integration
- `frontend/` - React + Vite application with Tailwind CSS
