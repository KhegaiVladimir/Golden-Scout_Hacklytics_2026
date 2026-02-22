/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds (near-black scale) ──────────────────
        'gs-0':          '#090909',   // page bg
        'gs-1':          '#111111',   // card bg
        'gs-2':          '#171717',   // elevated card
        'gs-3':          '#1C1C1C',   // input / detail bg
        'gs-hover':      '#1F1F1F',   // hover state

        // ── Text hierarchy ───────────────────────────────────
        'gs-text-0':     '#FAFAFA',   // primary
        'gs-text-1':     '#A1A1A1',   // secondary
        'gs-text-2':     '#666666',   // muted
        'gs-text-3':     '#444444',   // very muted / labels

        // ── Borders ──────────────────────────────────────────
        'gs-border':     'rgba(255,255,255,0.06)',
        'gs-border-h':   'rgba(255,255,255,0.10)',  // hover
        'gs-border-a':   'rgba(255,255,255,0.15)',  // active

        // ── Functional accents (used sparingly) ──────────────
        'gs-green':      '#30D158',
        'gs-amber':      '#FFD60A',
        'gs-red':        '#FF453A',
        'gs-blue':       '#64D2FF',

        // ── Legacy aliases (keeps old components compiling) ──
        // Remove these once every component is migrated.
        'scout-bg':      '#090909',
        'scout-card':    '#111111',
        'scout-card2':   '#171717',
        'scout-border':  'rgba(255,255,255,0.06)',
        'scout-border2': 'rgba(255,255,255,0.10)',
        'scout-teal':    '#A1A1A1',   // remapped → secondary text (no more teal)
        'scout-gold':    '#FAFAFA',   // remapped → primary text  (no more gold)
        'scout-amber':   '#FFD60A',
        'scout-green':   '#30D158',
        'scout-red':     '#FF453A',
        'scout-text':    '#FAFAFA',
        'scout-muted':   '#666666',
        'scout-dim':     '#A1A1A1',
      },

      fontFamily: {
        // Geist Mono is loaded via Google Fonts in index.css
        mono: ["'Geist Mono'", "'SF Mono'", "'Fira Code'", "ui-monospace", "monospace"],
        sans: ["'Inter'",      "-apple-system", "system-ui",  "sans-serif"],
      },

      boxShadow: {
        // No glow shadows — borders do the separation work now.
        // One functional shadow for floating elements (dropdowns, tooltips).
        'gs-float': '0 8px 32px rgba(0,0,0,0.6)',
        'gs-card':  '0 2px 8px  rgba(0,0,0,0.4)',

        // Legacy — kept so old components don't break, but use 'none' visually
        'glow-teal':  'none',
        'glow-gold':  'none',
        'glow-green': '0 0 20px rgba(48,209,88,0.10)',
        'glow-red':   '0 0 20px rgba(255,69,58,0.08)',
        'card':       '0 2px 8px rgba(0,0,0,0.4)',
      },

      borderRadius: {
        'gs-sm': '6px',
        'gs-md': '8px',
        'gs-lg': '12px',
      },

      // 1px gap trick Linear uses for card grids
      gap: {
        'px': '1px',
      },
    },
  },
  plugins: [],
}