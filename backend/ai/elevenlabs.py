import os
from elevenlabs import generate, save, set_api_key
from typing import Optional
import hashlib

# Cache directory
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "audio_cache")

def generate_audio(text: str, player_name: str) -> str:
    """Generate audio narration using ElevenLabs"""
    
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        # Fallback to browser speech synthesis
        return None
    
    try:
        set_api_key(api_key)
        
        # Create cache directory if it doesn't exist
        os.makedirs(CACHE_DIR, exist_ok=True)
        
        # Generate cache key
        cache_key = hashlib.md5(f"{player_name}_{text}".encode()).hexdigest()
        cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
        
        # Check if cached
        if os.path.exists(cache_path):
            return f"/audio/{cache_key}.mp3"
        
        # Generate audio
        audio = generate(
            text=text,
            voice="Rachel",  # Default voice, can be customized
            model="eleven_monolingual_v1"
        )
        
        # Save to cache
        save(audio, cache_path)
        
        return f"/audio/{cache_key}.mp3"
        
    except Exception as e:
        print(f"Error generating audio: {str(e)}")
        return None
