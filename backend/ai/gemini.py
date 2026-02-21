import os
import google.generativeai as genai
from typing import Dict

# Cache for reports
report_cache = {}

def generate_report(
    player: Dict,
    analysis: Dict,
    contract_value: float,
    contract_years: int
) -> str:
    """Generate AI scouting report using Gemini"""
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Error: GEMINI_API_KEY not set"
    
    # Check cache
    player_name = player.get('name') or player.get('Player', 'unknown')
    cache_key = f"{player_name}_{contract_value}_{contract_years}"
    if cache_key in report_cache:
        return report_cache[cache_key]
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Build prompt
        player_name = player.get('name') or player.get('Player', 'Player')
        prompt = f"""
        Generate a comprehensive NBA scouting report for {player_name}.
        
        Player Stats:
        - Points: {player.get('PTS', 'N/A')}
        - Rebounds: {player.get('TRB', 'N/A')}
        - Assists: {player.get('AST', 'N/A')}
        - Steals: {player.get('STL', 'N/A')}
        - Blocks: {player.get('BLK', 'N/A')}
        
        Analysis:
        - Impact Score: {analysis.get('impact_score', 0):.2f}
        - Trend: {analysis.get('trend', 'N/A')}
        - Simulation Mean Wins: {analysis.get('simulation', {}).get('mean_wins', 0):.1f}
        
        Proposed Contract:
        - Total Value: ${contract_value:,.0f}
        - Years: {contract_years}
        - Annual Value: ${contract_value / contract_years:,.0f}
        
        Valuation: {analysis.get('valuation', {}).get('recommendation', 'N/A')}
        
        Please provide a detailed scouting report covering:
        1. Player strengths and weaknesses
        2. Statistical analysis and context
        3. Contract evaluation
        4. Risk assessment
        5. Final recommendation
        
        Format the report in clear sections with headers.
        """
        
        response = model.generate_content(prompt)
        report = response.text
        
        # Cache the report
        report_cache[cache_key] = report
        
        return report
        
    except Exception as e:
        return f"Error generating report: {str(e)}"
