"""
Receives pre-computed results. Interprets — never calculates.
All math is done before this is called.
"""
from google import genai
import os, json, time, hashlib
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
MODEL = 'gemini-2.0-flash'

report_cache = {}

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def _cache_file(cache_key: str) -> str:
    h = hashlib.md5(cache_key.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"report_{h}.json")


def generate_report(computed_results: dict) -> dict:
    cache_key = json.dumps(computed_results, sort_keys=True, default=str)

    if cache_key in report_cache:
        return report_cache[cache_key]

    fpath = _cache_file(cache_key)
    if os.path.exists(fpath):
        with open(fpath, "r") as f:
            result = json.load(f)
        report_cache[cache_key] = result
        return result

    d = computed_results
    player        = d.get('player', 'This player')
    position      = d.get('position', 'N/A')
    impact        = d.get('impact_score', 0)
    percentile    = d.get('percentile', 'N/A')
    trend         = d.get('trend_signal', 'N/A')
    wins_added    = d.get('wins_added', 0)
    proj_wins     = d.get('projected_wins', wins_added)
    is_projected  = d.get('is_projected', False)
    fair_value    = d.get('fair_value_m', 0)
    salary        = d.get('requested_salary_m', fair_value)
    efficiency    = d.get('efficiency_ratio', None)
    overpay       = d.get('overpay_pct', None)
    decision      = d.get('decision', 'NEGOTIATE')
    absence       = d.get('absence_reason', 'full')
    playoff_prob  = d.get('playoff_prob', None)
    expected_wins = d.get('expected_wins', None)

    wins_line = (
        f"{proj_wins:.1f} projected wins (extrapolated from {wins_added:.1f} raw)"
        if is_projected else f"{wins_added:.1f} wins added"
    )
    value_line = (
        f"fair value ${fair_value:.1f}M vs ${salary:.1f}M ask "
        f"(efficiency {efficiency:.2f}x, overpay {overpay:.1f}%)"
        if efficiency is not None and overpay is not None
        else f"fair value ${fair_value:.1f}M vs ${salary:.1f}M ask"
    )
    absence_line = {
        'injury':  "missed significant time due to injury this season — do not extrapolate stats",
        'partial': "partial season data, stats were extrapolated to 82 games",
        'full':    "played a full season",
    }.get(absence, '')

    prompt = f"""You are a sharp NBA front office analyst. Write a concise scouting report for a contract decision.

Player: {player} ({position})
Impact score: {impact:.2f} (percentile: {percentile}, trend: {trend})
Wins: {wins_line}
Value: {value_line}
Decision: {decision}
Season note: {absence_line}
{"Playoff probability: " + str(round(playoff_prob, 1)) + "%" if playoff_prob else ""}
{"Team expected wins with player: " + str(round(expected_wins, 1)) if expected_wins else ""}

Rules:
- Be specific — use the actual numbers provided
- STRENGTHS must list 2-3 concrete positives separated by | (pipe character)
- CONCERN must name the single biggest real risk (injury history, age regression, small sample, role dependency, etc.)
- RECOMMENDATION must start with exactly one word: SIGN, NEGOTIATE, or AVOID
- Never say "above league average in key categories" or other vague filler
- If overpay_pct is negative, it means the player is UNDERVALUED (good deal), not overpriced — phrase accordingly
- Under 160 words total

Respond in EXACTLY this format:
VERDICT: one sentence
STRENGTHS: strength one | strength two | strength three
CONCERN: one sentence
RECOMMENDATION: SIGN/NEGOTIATE/AVOID followed by specific advice
AUDIO_SUMMARY: two sentences for text-to-speech"""

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


def generate_compare_verdict(p1: dict, p2: dict) -> str:
    """
    Generate a one-sentence AI verdict comparing two players.
    Returns a plain string — not a full report.
    """
    cache_key = "compare:" + json.dumps({"p1": p1, "p2": p2}, sort_keys=True, default=str)
    fpath = _cache_file(cache_key)

    if cache_key in report_cache:
        return report_cache[cache_key]

    if os.path.exists(fpath):
        with open(fpath, "r") as f:
            result = json.load(f)
        report_cache[cache_key] = result.get("verdict", "")
        return result.get("verdict", "")

    prompt = f"""You are an NBA front office analyst. Compare these two players for a contract decision.

Player 1: {p1['name']}
- Wins added: {p1['wins_added']:.1f} | Fair value: ${p1['fair_value_m']:.1f}M | Salary ask: ${p1['salary_m']:.1f}M
- Efficiency: {p1['efficiency_ratio']:.2f}x | Health-adj value: ${p1['health_adj_m']:.1f}M | Decision: {p1['decision']}

Player 2: {p2['name']}
- Wins added: {p2['wins_added']:.1f} | Fair value: ${p2['fair_value_m']:.1f}M | Salary ask: ${p2['salary_m']:.1f}M
- Efficiency: {p2['efficiency_ratio']:.2f}x | Health-adj value: ${p2['health_adj_m']:.1f}M | Decision: {p2['decision']}

Write ONE sentence that clearly states which player is the better value and why, using the specific numbers above.
Be direct. Start with the winner's name. No fluff. Max 30 words."""

    for attempt in range(3):
        try:
            response = client.models.generate_content(model=MODEL, contents=prompt)
            verdict = response.text.strip().split('\n')[0].strip()

            report_cache[cache_key] = verdict
            with open(fpath, "w") as f:
                json.dump({"verdict": verdict}, f)

            return verdict

        except Exception as e:
            if '429' in str(e) and attempt < 2:
                time.sleep(10 * (attempt + 1))
                continue
            # Fallback — generate without AI
            winner = p1 if p1['health_adj_m'] >= p2['health_adj_m'] else p2
            loser  = p2 if winner == p1 else p1
            return (
                f"{winner['name']} is the clear choice — "
                f"{winner['efficiency_ratio']:.2f}x efficiency and ${winner['health_adj_m']:.1f}M "
                f"health-adjusted value vs {loser['name']}'s {loser['efficiency_ratio']:.2f}x."
            )

    winner = p1 if p1['health_adj_m'] >= p2['health_adj_m'] else p2
    loser  = p2 if winner == p1 else p1
    return (
        f"{winner['name']} is the clear choice — "
        f"{winner['efficiency_ratio']:.2f}x efficiency vs {loser['name']}'s {loser['efficiency_ratio']:.2f}x."
    )


def generate_report_fallback(computed_results: dict) -> dict:
    """Fallback when Gemini is unavailable — still uses real numbers."""
    d = computed_results
    player       = d.get('player', 'This player')
    impact       = float(d.get('impact_score', 0))
    wins_added   = float(d.get('wins_added', 0))
    proj_wins    = float(d.get('projected_wins', wins_added))
    fair_value   = float(d.get('fair_value_m', 0))
    salary       = float(d.get('requested_salary_m', fair_value))
    efficiency   = d.get('efficiency_ratio')
    overpay      = d.get('overpay_pct')
    decision     = d.get('decision', 'NEGOTIATE')
    absence      = d.get('absence_reason', 'full')
    is_projected = d.get('is_projected', False)

    wins_str = f"{proj_wins:.1f} projected" if is_projected else f"{wins_added:.1f}"

    if decision == 'SIGN':
        action = "sign at the asking price"
        tier = "high-value" if impact > 1.5 else "solid"
    elif decision == 'NEGOTIATE':
        action = f"negotiate down from ${salary:.1f}M toward fair value ${fair_value:.1f}M"
        tier = "moderate-value"
    else:
        action = f"avoid — fair value ${fair_value:.1f}M does not justify ${salary:.1f}M ask"
        tier = "below-value"

    eff_str = f"{efficiency:.2f}x efficiency" if efficiency is not None else "limited efficiency data"
    overpay_str = f"{overpay:.1f}% overpay" if overpay is not None else ""

    concern_map = {
        'injury': f"Injury history is a major red flag — played just {d.get('gp', '?')} games this season",
        'partial': f"Small sample ({d.get('gp', '?')} GP) adds projection uncertainty to the {wins_str}-win estimate",
        'full': "Performance must sustain over a full season to justify long-term commitment",
    }

    return {
        "verdict": f"{player} is a {tier} addition projecting {wins_str} wins at {eff_str}.",
        "strengths": f"Projects {wins_str} wins this season | {eff_str} relative to ${salary:.1f}M ask | {overpay_str or 'contract fits market rate'}",
        "concern": concern_map.get(absence, "Sustainability of current production level is uncertain."),
        "recommendation": f"{decision} — {action}.",
        "audio_summary": f"{player} projects {wins_str} wins with a fair value of {fair_value:.1f} million dollars against a {salary:.1f} million ask. Our recommendation is to {action}."
    }