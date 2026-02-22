// VoiceButton.jsx
import { useState } from 'react'
import { generateAudio } from '../api/client'

function Waveform() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '16px' }}>
      {['wave-1', 'wave-2', 'wave-3', 'wave-4', 'wave-5'].map(cls => (
        <div key={cls} className={cls} style={{
          width: '2px',
          background: 'var(--bg-0)',
          borderRadius: '1px',
        }} />
      ))}
    </div>
  )
}

function speakWithBrowser(text, setStatus) {
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.88; u.pitch = 0.95
  setStatus('playing')
  window.speechSynthesis.speak(u)
  u.onend = () => setStatus('idle')
}

export default function VoiceButton({ audioSummary, playerName }) {
  const [status, setStatus] = useState('idle')

  async function handleClick() {
    if (status === 'playing') {
      window.speechSynthesis.cancel()
      setStatus('idle')
      return
    }
    setStatus('loading')

    try {
      const blobUrl = await generateAudio(audioSummary, playerName)

      if (blobUrl) {
        try {
          const audio = new Audio(blobUrl)
          await audio.play()
          setStatus('playing')
          audio.onended = () => setStatus('idle')
          audio.onerror = () => {
            setStatus('idle')
            speakWithBrowser(audioSummary, setStatus)
          }
        } catch {
          speakWithBrowser(audioSummary, setStatus)
        }
      } else {
        speakWithBrowser(audioSummary, setStatus)
      }
    } catch {
      speakWithBrowser(audioSummary, setStatus)
    }
  }

  const isPlaying = status === 'playing'
  const isLoading = status === 'loading'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        color: 'var(--text-3)', letterSpacing: '0.5px',
      }}>
        {isPlaying ? 'Now playing' : 'Hear the verdict'}
      </p>

      <button
        onClick={handleClick}
        disabled={isLoading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '10px 24px',
          background: isPlaying ? 'var(--bg-3)' : 'var(--text-0)',
          color: isPlaying ? 'var(--text-1)' : 'var(--bg-0)',
          border: isPlaying ? '1px solid var(--border-active)' : 'none',
          borderRadius: 'var(--r-md)',
          fontFamily: isPlaying ? 'var(--font-mono)' : 'var(--font-sans)',
          fontSize: '13px', fontWeight: 500,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.15s ease, background 0.15s ease',
          letterSpacing: isPlaying ? '0.3px' : '-0.1px',
          minWidth: '160px',
        }}
        onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.88' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = isLoading ? '0.5' : '1' }}
        onMouseDown={e => { if (!isLoading) e.currentTarget.style.opacity = '0.72' }}
        onMouseUp={e => { if (!isLoading) e.currentTarget.style.opacity = '0.88' }}
      >
        {status === 'idle' && (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Hear the verdict
          </>
        )}
        {status === 'loading' && (
          <>
            <span style={{
              width: '11px', height: '11px',
              border: '1.5px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }} />
            Generating...
          </>
        )}
        {status === 'playing' && (
          <>
            <Waveform />
            Stop
          </>
        )}
      </button>

      {isPlaying && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-3)', letterSpacing: '0.3px',
        }} className="fade-up">
          Powered by ElevenLabs
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}