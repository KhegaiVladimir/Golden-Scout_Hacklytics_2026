"""
Generate audio narration using ElevenLabs API.
"""
import os
import httpx
import re
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Cache directory
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "audio_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# In-memory cache: player_name -> file path
audio_file_cache = {}

def generate_audio(text: str, player_name: str) -> Optional[bytes]:
    """
    Generate audio narration using ElevenLabs API.
    
    Args:
        text: Text to convert to speech
        player_name: Player name for caching
    
    Returns:
        Audio bytes (MP3 format)
    
    Raises:
        HTTPException(503) on failure
    """
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVENLABS_VOICE_ID")
    
    if not api_key or not voice_id:
        return None  # Frontend will use speechSynthesis fallback
    
    # Sanitize player name for filename
    safe_name = re.sub(r'[^\w\s-]', '', player_name).strip()
    safe_name = re.sub(r'[-\s]+', '_', safe_name)
    cache_path = os.path.join(CACHE_DIR, f"{safe_name}.mp3")
    
    # Check cache
    if os.path.exists(cache_path):
        with open(cache_path, 'rb') as f:
            return f.read()
    
    # Check in-memory cache
    if player_name in audio_file_cache and os.path.exists(audio_file_cache[player_name]):
        with open(audio_file_cache[player_name], 'rb') as f:
            return f.read()
    
    try:
        # Call ElevenLabs API
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "text": text,
            "model_id": "eleven_flash_v2_5",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            audio_bytes = response.content
            
            # Save to cache
            with open(cache_path, 'wb') as f:
                f.write(audio_bytes)
            
            # Update in-memory cache
            audio_file_cache[player_name] = cache_path
            
            return audio_bytes
            
    except Exception as e:
    print(f"ElevenLabs error: {type(e).__name__}: {e}")
    return None
