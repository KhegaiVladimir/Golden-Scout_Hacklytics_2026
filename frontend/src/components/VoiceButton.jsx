import { useState } from 'react'
import { generateAudio } from '../api/client'

const VoiceButton = ({ report, playerName, contractValue, contractYears }) => {
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [error, setError] = useState(null)

  const handlePlay = async () => {
    if (audioUrl) {
      // If audio already generated, just play it
      const audio = new Audio(audioUrl)
      audio.play()
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try ElevenLabs API first
      const data = await generateAudio(playerName, contractValue, contractYears)
      if (data.audio_url) {
        setAudioUrl(data.audio_url)
        const audio = new Audio(data.audio_url)
        audio.play()
      } else {
        // Fallback to browser speech synthesis
        fallbackSpeechSynthesis()
      }
    } catch (err) {
      console.error('Audio generation error:', err)
      // Fallback to browser speech synthesis
      fallbackSpeechSynthesis()
    } finally {
      setLoading(false)
    }
  }

  const fallbackSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(report)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      window.speechSynthesis.speak(utterance)
    } else {
      setError('Speech synthesis not supported in this browser')
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handlePlay}
        disabled={loading || !report}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span>Play Audio</span>
          </>
        )}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}

export default VoiceButton
