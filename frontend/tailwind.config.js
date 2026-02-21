/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'scout-bg':      '#050810',
        'scout-card':    '#0d1117',
        'scout-card2':   '#111820',
        'scout-border':  '#1c2333',
        'scout-border2': '#243044',
        'scout-teal':    '#00C9E0',
        'scout-gold':    '#F5A623',
        'scout-amber':   '#F59E0B',
        'scout-green':   '#10B981',
        'scout-red':     '#EF4444',
        'scout-text':    '#E2E8F0',
        'scout-muted':   '#4B5C6B',
        'scout-dim':     '#8899AA',
      },
      fontFamily: {
        mono: ["'DM Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        'glow-teal':  '0 0 24px rgba(0,201,224,0.12)',
        'glow-gold':  '0 0 24px rgba(245,166,35,0.12)',
        'glow-green': '0 0 24px rgba(16,185,129,0.12)',
        'glow-red':   '0 0 24px rgba(239,68,68,0.10)',
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}