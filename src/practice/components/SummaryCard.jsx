import Icon from './Icon'
import { formatCompactINR } from '../format'

export default function SummaryCard({ metric }) {
  const { label, value, currency, delta, deltaLabel, icon, tone } = metric
  const displayValue = currency ? formatCompactINR(value) : Number(value).toLocaleString('en-IN')
  const isUp = delta >= 0

  return (
    <div className="pp-card pp-stat-card">
      <div className="pp-stat-top">
        <div className={`pp-stat-icon tone-${tone}`}>
          <Icon name={icon} size={18} />
        </div>
        {typeof delta === 'number' && (
          <span className={`pp-stat-delta ${isUp ? 'is-up' : 'is-down'}`}>
            <Icon name={isUp ? 'arrowUp' : 'arrowDown'} size={13} strokeWidth={2.2} />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div>
        <div className="pp-stat-value pp-tabular">{displayValue}</div>
        <div className="pp-stat-label">{label}</div>
      </div>
      {deltaLabel && <div className="pp-stat-foot">{deltaLabel}</div>}
    </div>
  )
}
