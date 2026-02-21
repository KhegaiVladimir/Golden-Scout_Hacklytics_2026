/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'scout-bg':     '#0a0d12',
        'scout-card':   '#111827',
        'scout-border': '#1e293b',
        'scout-teal':   '#00B4D8',
        'scout-gold':   '#F5A623',
        'scout-amber':  '#F59E0B',
        'scout-text':   '#F1F5F9',
        'scout-muted':  '#64748B',
      },
      fontFamily: {
        mono: ["'DM Mono'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
}