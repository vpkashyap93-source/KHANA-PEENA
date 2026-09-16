import Icon from './Icon'

export function SkeletonBlock({ height = 16, width = '100%', style }) {
  return <div className="pp-skeleton" style={{ height, width, ...style }} />
}

export function CardSkeleton() {
  return (
    <div className="pp-card pp-stat-card">
      <div className="pp-stat-top">
        <SkeletonBlock height={34} width={34} style={{ borderRadius: 8 }} />
        <SkeletonBlock height={14} width={40} />
      </div>
      <SkeletonBlock height={22} width="70%" />
      <SkeletonBlock height={12} width="50%" />
    </div>
  )
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} height={16} />
      ))}
    </div>
  )
}

export function EmptyState({ icon = 'inbox', title, detail }) {
  return (
    <div className="pp-state">
      <div className="pp-state-icon"><Icon name={icon} size={22} /></div>
      <div className="pp-state-title">{title}</div>
      {detail && <div className="pp-state-detail">{detail}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', detail, onRetry }) {
  return (
    <div className="pp-state is-error">
      <div className="pp-state-icon"><Icon name="alert" size={22} /></div>
      <div className="pp-state-title">{title}</div>
      {detail && <div className="pp-state-detail">{detail}</div>}
      {onRetry && (
        <button type="button" className="pp-btn pp-btn-outline pp-btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
