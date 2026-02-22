export default function LandingPage({ onLaunch, onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.025) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--text-2)', padding: '4px 12px 4px 8px',
          border: '1px solid var(--border)', borderRadius: '999px',
          background: 'var(--bg-1)', marginBottom: '40px',
          letterSpacing: '0.3px',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)' }} />
          Hacklytics 2026 · Georgia Tech · Sports Analytics Track
        </div>

        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(52px, 9vw, 96px)',
          fontWeight: 600, letterSpacing: '-3px',
          lineHeight: 1, color: 'var(--text-0)',
          marginBottom: '20px',
        }}>
          Golden Scout
        </h1>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 'clamp(14px, 2vw, 18px)',
          color: 'var(--text-2)', letterSpacing: '-0.2px',
          marginBottom: '12px',
        }}>
          NBA Contract Decision Engine
        </p>

        <p style={{
          fontSize: '15px', color: 'var(--text-3)',
          maxWidth: '420px', lineHeight: 1.6,
          letterSpacing: '-0.1px', marginBottom: '48px',
        }}>
          Know exactly what a player is worth before you sign them.
        </p>

        <button onClick={onLaunch} style={{
          padding: '12px 32px',
          background: 'var(--text-0)', color: 'var(--bg-0)',
          border: 'none', borderRadius: 'var(--r-md)',
          fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500,
          cursor: 'pointer', letterSpacing: '-0.1px',
          transition: 'opacity 0.15s ease',
          marginBottom: '80px',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onMouseDown={e => e.currentTarget.style.opacity = '0.72'}
          onMouseUp={e => e.currentTarget.style.opacity = '0.88'}
        >
          Launch App →
        </button>

        <div style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-3)', letterSpacing: '0.3px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px',
        }}>
          <span>Scroll to learn more</span>
          <span style={{ animation: 'bounceDown 1.5s ease-in-out infinite' }}>↓</span>
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* ── THE PROBLEM ──────────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: '680px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '20px',
        }}>
          The Problem
        </p>
        <h2 style={{
          fontSize: '28px', fontWeight: 600, letterSpacing: '-0.6px',
          color: 'var(--text-0)', lineHeight: 1.3, marginBottom: '20px',
        }}>
          NBA teams overpay by millions every year.
        </h2>
        <p style={{
          fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.75,
          letterSpacing: '-0.1px',
        }}>
          Contract decisions in the NBA are still largely driven by reputation, agent
          negotiation, and gut feel. Teams commit hundreds of millions of dollars to
          players without a rigorous, data-backed framework for what that player is
          actually worth — measured in wins. Golden Scout changes that.
        </p>
      </section>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* ── APP SECTION ──────────────────────────── */}
      <section id="app" style={{ padding: '80px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '12px',
          }}>
            Core App
          </p>
          <h2 style={{
            fontSize: '28px', fontWeight: 600, letterSpacing: '-0.6px',
            color: 'var(--text-0)', marginBottom: '12px',
          }}>
            Contract Valuation Engine
          </h2>
          <p style={{
            fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.7,
            maxWidth: '520px', letterSpacing: '-0.1px',
          }}>
            Enter any NBA player and a salary ask. Get their statistically fair market
            value, Monte Carlo win projections, injury-adjusted pricing, and an
            AI-generated executive report — in seconds.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px', background: 'var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          marginBottom: '24px',
        }}>
          {[
            { step: '01', title: 'Search',  body: "Type any of 562 current NBA players. Set the team's baseline wins and the salary ask." },
            { step: '02', title: 'Analyze', body: '10,000 simulated seasons. Position-adjusted z-scores. Injury and age-curve durability model.' },
            { step: '03', title: 'Decide',  body: 'SIGN, NEGOTIATE, or AVOID — backed by fair value, efficiency ratio, and an AI scouting report.' },
          ].map(({ step, title, body }) => (
            <div key={step} style={{
              background: 'var(--bg-1)', padding: '32px 28px',
              transition: 'background 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-1)'}
            >
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--text-3)', letterSpacing: '0.3px', marginBottom: '16px',
              }}>
                {step}
              </p>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600,
                color: 'var(--text-0)', letterSpacing: '-0.3px', marginBottom: '12px',
              }}>
                {title}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>
                {body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA into the app */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={onLaunch} style={{
            padding: '9px 20px',
            background: 'var(--text-0)', color: 'var(--bg-0)',
            border: 'none', borderRadius: 'var(--r-md)',
            fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
            cursor: 'pointer', letterSpacing: '-0.1px',
            transition: 'opacity 0.15s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Open App →
          </button>
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* ── COMPARE SECTION ──────────────────────── */}
      <section id="compare" style={{ padding: '80px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '48px', alignItems: 'center',
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '12px',
            }}>
              Compare
            </p>
            <h2 style={{
              fontSize: '28px', fontWeight: 600, letterSpacing: '-0.6px',
              color: 'var(--text-0)', marginBottom: '16px',
            }}>
              Head-to-head at any salary
            </h2>
            <p style={{
              fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.75,
              letterSpacing: '-0.1px', marginBottom: '24px',
            }}>
              Pick two players, set individual salary asks for each, and get a
              complete side-by-side breakdown — wins added, fair value, efficiency
              ratio, durability, risk label, and an AI verdict on who's the better deal.
            </p>
            <button onClick={() => onNavigate('compare')} style={{
              padding: '9px 20px',
              background: 'var(--text-0)', color: 'var(--bg-0)',
              border: 'none', borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', letterSpacing: '-0.1px',
              transition: 'opacity 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Compare Players →
            </button>
          </div>

          {/* Mini preview table */}
          <div style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', overflow: 'hidden',
          }}>
            {[
              { label: 'Fair Value',  v1: '$74.1M', v2: '$28.4M' },
              { label: 'Efficiency',  v1: '7.41×',  v2: '1.42×'  },
              { label: 'Risk',        v1: 'Low',    v2: 'Moderate'},
              { label: 'Verdict',     v1: 'SIGN',   v2: 'NEGOTIATE', bold: true },
            ].map(({ label, v1, v2, bold }, i, arr) => (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 1fr',
                padding: '12px 20px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                background: i % 2 === 0 ? 'var(--bg-1)' : 'var(--bg-0)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '12px',
                  color: 'var(--text-0)', textAlign: 'right',
                  fontWeight: bold ? 600 : 400,
                }}>{v1}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--text-3)', textAlign: 'center', alignSelf: 'center',
                }}>{label}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '12px',
                  color: 'var(--text-2)', textAlign: 'left',
                }}>{v2}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* ── TRADE SIM SECTION ────────────────────── */}
      <section id="trade" style={{ padding: '80px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '48px', alignItems: 'center',
        }}>
          {/* Mini histogram preview */}
          <div style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', padding: '24px',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', letterSpacing: '0.3px', marginBottom: '20px',
            }}>
              Win distribution shift
            </p>
            <div style={{
              display: 'flex', alignItems: 'flex-end',
              gap: '3px', height: '64px', marginBottom: '12px',
            }}>
              {[12,22,38,55,72,88,95,88,72,55,38,22,12].map((h, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: '2px 2px 0 0',
                  background: i >= 5 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                  height: `${h}%`,
                }} />
              ))}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              color: 'var(--text-3)', borderTop: '1px solid var(--border)',
              paddingTop: '8px',
            }}>
              <span>38W baseline</span>
              <span style={{ color: 'var(--green)' }}>+6.3W projected</span>
            </div>
          </div>

          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '12px',
            }}>
              Trade Simulator
            </p>
            <h2 style={{
              fontSize: '28px', fontWeight: 600, letterSpacing: '-0.6px',
              color: 'var(--text-0)', marginBottom: '16px',
            }}>
              See how your win total shifts
            </h2>
            <p style={{
              fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.75,
              letterSpacing: '-0.1px', marginBottom: '24px',
            }}>
              Select the player leaving and the player coming in. Run 10,000 simulated
              seasons and see the win distribution shift in real time — including playoff
              probability delta and salary cap impact.
            </p>
            <button onClick={() => onNavigate('trade')} style={{
              padding: '9px 20px',
              background: 'var(--text-0)', color: 'var(--bg-0)',
              border: 'none', borderRadius: 'var(--r-md)',
              fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', letterSpacing: '-0.1px',
              transition: 'opacity 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Open Trade Simulator →
            </button>
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* ── UNDER THE HOOD ───────────────────────── */}
      <section style={{ padding: '80px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '12px',
        }}>
          Under the Hood
        </p>
        <h2 style={{
          fontSize: '28px', fontWeight: 600, letterSpacing: '-0.6px',
          color: 'var(--text-0)', marginBottom: '40px',
        }}>
          The methodology
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1px', background: 'var(--border)',
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
        }}>
          {[
            {
              title: 'Berri & Schmidt (2010)',
              body: 'One marginal win is worth approximately $3.8M in cap space. Fair value = wins added × $3.8M. This is the foundation every valuation is built on.',
            },
            {
              title: 'Monte Carlo Simulation',
              body: "10,000 seasons simulated per query. Each run draws from a distribution parameterized by the player's impact score, games played, and minutes. Output: expected wins, 90% CI, playoff probability.",
            },
            {
              title: 'Durability Model',
              body: 'Health-adjusted value = fair value × durability score. Durability = (GP/82) × age_factor. Age factor applies a max 0.75× discount for players 37+.',
            },
            {
              title: 'Gemini AI Report',
              body: 'Gemini 2.0 Flash generates a structured executive report — verdict, strengths, concern, and recommendation — grounded entirely in the computed stats, not general knowledge.',
            },
          ].map(({ title, body }) => (
            <div key={title} style={{
              background: 'var(--bg-1)', padding: '28px 32px',
              transition: 'background 0.15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-1)'}
            >
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
                color: 'var(--text-0)', letterSpacing: '-0.2px', marginBottom: '10px',
              }}>
                {title}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* ── TECH STACK ───────────────────────────── */}
      <section style={{ padding: '64px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: 'var(--text-3)', letterSpacing: '0.5px', marginBottom: '24px',
        }}>
          Tech Stack
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            'React', 'FastAPI', 'Python',
            'Gemini 2.0 Flash', 'ElevenLabs',
            'Monte Carlo Simulation', 'Recharts',
            'Berri & Schmidt (2010)', 'Tailwind CSS',
            '562 NBA Players · 2024-25',
          ].map(tech => (
            <span key={tech} style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--text-2)', padding: '5px 12px',
              border: '1px solid var(--border)', borderRadius: '999px',
              background: 'var(--bg-1)', letterSpacing: '0.2px',
              transition: 'all 0.15s ease', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-0)'; e.currentTarget.style.borderColor = 'var(--border-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* ── BOTTOM CTA ───────────────────────────── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '20px',
      }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 600,
          letterSpacing: '-0.6px', color: 'var(--text-0)',
        }}>
          Ready to evaluate a player?
        </h2>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-3)',
        }}>
          562 players · 10,000 simulated seasons · Gemini AI reports
        </p>
        <button onClick={onLaunch} style={{
          padding: '12px 32px',
          background: 'var(--text-0)', color: 'var(--bg-0)',
          border: 'none', borderRadius: 'var(--r-md)',
          fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500,
          cursor: 'pointer', letterSpacing: '-0.1px',
          transition: 'opacity 0.15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onMouseDown={e => e.currentTarget.style.opacity = '0.72'}
          onMouseUp={e => e.currentTarget.style.opacity = '0.88'}
        >
          Launch App →
        </button>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '1080px', margin: '0 auto',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)' }}>
          Golden Scout · Hacklytics 2026 · Georgia Tech
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-3)' }}>
          React · FastAPI · Gemini · ElevenLabs
        </span>
      </footer>

      <style>{`
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(5px); }
        }
      `}</style>
    </div>
  )
}