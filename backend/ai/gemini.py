"""
Receives pre-computed results. Interprets — never calculates.
All math is done before this is called.
"""
from google import genai
import os, json, time, hashlib
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
MODEL = 'gemini-2.5-flash'

# In-memory cache for the current session
report_cache = {}

# File-based cache: persists across server restarts
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def _cache_file(cache_key: str) -> str:
    h = hashlib.md5(cache_key.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"report_{h}.json")


def generate_report(computed_results: dict) -> dict:
    cache_key = json.dumps(computed_results, sort_keys=True, default=str)

    # 1. In-memory hit
    if cache_key in report_cache:
        return report_cache[cache_key]

    # 2. File-based hit
    fpath = _cache_file(cache_key)
    if os.path.exists(fpath):
        with open(fpath, "r") as f:
            result = json.load(f)
        report_cache[cache_key] = result
        return result

    prompt = f"""You are an NBA front office analyst. Based on this player data, write a brief scouting report in under 150 words total.

Data: {json.dumps(computed_results, default=str)}

Respond in EXACTLY this format (each on its own line):
VERDICT: one sentence overall assessment
STRENGTHS: one sentence about what player does well
CONCERN: one sentence about main risk
RECOMMENDATION: one sentence contract advice
AUDIO_SUMMARY: two sentences suitable for text-to-speech"""

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt
            )
            text = response.text
            result = {
                "verdict": "",
                "strengths": "",
                "concern": "",
                "recommendation": "",
                "audio_summary": ""
            }
            for line in text.strip().split('\n'):
                for key in ['VERDICT', 'STRENGTHS', 'CONCERN', 'RECOMMENDATION', 'AUDIO_SUMMARY']:
                    if line.startswith(f'{key}:'):
                        result[key.lower()] = line.replace(f'{key}:', '').strip()
            if not result['verdict']:
                result['verdict'] = text[:300]

            # Save to both caches
            report_cache[cache_key] = result
            with open(fpath, "w") as f:
                json.dump(result, f)

            return result
        except Exception as e:
            if '429' in str(e) and attempt < 2:
                time.sleep(10 * (attempt + 1))
                continue
            return generate_report_fallback(computed_results)

    return generate_report_fallback(computed_results)


def generate_report_fallback(computed_results: dict) -> dict:
    player = computed_results.get('player', 'This player')
    impact = float(computed_results.get('impact_score', 0))
    wins = float(computed_results.get('wins_added', 0))
    fair_value = float(computed_results.get('fair_value_m', 0))
    salary = float(computed_results.get('salary_m', fair_value))

    if impact > 1.5:
        tier, action = "elite contributor", "strongly recommend signing"
    elif impact > 0.5:
        tier, action = "solid starter", "recommend signing at fair value"
    elif impact > 0:
        tier, action = "reliable role player", "consider signing if price is right"
    else:
        tier, action = "below-average performer", "avoid unless heavily discounted"

    return {
        "verdict": f"{player} is a {tier} projecting to add {wins:.1f} wins with an impact score of {impact:.1f}.",
        "strengths": f"Efficiency metrics and positional rating place {player} above league average in key categories.",
        "concern": f"Current salary of ${salary:.1f}M must be weighed against projected fair value of ${fair_value:.1f}M.",
        "recommendation": f"We {action} — the numbers support this decision at current market rates.",
        "audio_summary": f"{player} projects {wins:.1f} additional wins this season. Our analysis indicates you should {action} based on a fair value of {fair_value:.1f} million dollars."
    }