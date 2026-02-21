import { useState } from 'react'
import { generateAudio } from '../api/client'

function Waveform() {
  return (
    <div className="flex items-center gap-[3px] h-9">
      {['wave-1','wave-2','wave-3','wave-4','wave-5'].map(cls => (
        <div key={cls} className={`w-[3px] bg-scout-teal rounded-sm ${cls}`} />
      ))}
    </div>
  )
}

export default function VoiceButton({ audioSummary, playerName }) {
  const [status, setStatus] = useState('idle') // idle | loading | playing

  async function handleClick() {
    if (status === 'playing') {
      window.speechSynthesis.cancel()
      setStatus('idle')
      return
    }
    setStatus('loading')
    const blobUrl = await generateAudio(audioSummary, playerName)

    if (blobUrl) {
      const audio = new Audio(blobUrl)
      setStatus('playing')
      audio.play()
      audio.onended = () => setStatus('idle')
    } else {
      // Silent browser TTS fallback
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(audioSummary)
      u.rate = 0.88
      u.pitch = 0.95
      setStatus('playing')
      window.speechSynthesis.speak(u)
      u.onend = () => setStatus('idle')
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-mono text-[10px] text-scout-muted uppercase tracking-widest">
        {status === 'playing' ? 'Playing...' : 'Hear the Verdict'}
      </p>
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-mono font-bold text-sm tracking-widest uppercase transition-all duration-200 active:scale-[0.97] disabled:opacity-50
          ${status === 'playing'
            ? 'bg-scout-teal/10 border-2 border-scout-teal text-scout-teal'
            : 'bg-scout-teal text-scout-bg hover:bg-scout-teal/90'
          }`}
      >
        {status === 'idle'    && '▶ Hear the Verdict'}
        {status === 'loading' && <span className="animate-pulse">Generating audio...</span>}
        {status === 'playing' && <><Waveform /><span>Stop</span></>}
      </button>
      {status === 'playing' && (
        <p className="font-mono text-[10px] text-scout-muted fade-up">Powered by ElevenLabs</p>
      )}
    </div>
  )
}