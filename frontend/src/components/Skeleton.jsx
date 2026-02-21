export default function Skeleton({ className = '' }) {
  return (
    <div className={`bg-scout-border rounded relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 shimmer" />
    </div>
  )
}

export function SkeletonBlock({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className={`h-5 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}