// Skeleton.jsx
export default function Skeleton({ style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        borderRadius: 'var(--r-sm)',
        background: 'var(--bg-2)',
        ...style,
      }}
    />
  )
}

export function SkeletonBlock({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[...Array(rows)].map((_, i) => (
        <Skeleton
          key={i}
          style={{
            height: '16px',
            width: i % 3 === 2 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  )
}