import { useState } from 'react'
import { formatCompactINR } from '../format'

const REVENUE = '#2569a6'
const EXPENSE = '#b87f1e'

export default function RevenueExpenseChart({ months, revenue, expense }) {
  const [hover, setHover] = useState(null)
  const width = 560
  const height = 220
  const padTop = 16
  const padBottom = 28
  const padLeft = 8
  const padRight = 8
  const plotH = height - padTop - padBottom
  const maxVal = Math.max(...revenue, ...expense)
  const niceMax = Math.ceil(maxVal / 500000) * 500000
  const yFor = (v) => padTop + plotH - (v / niceMax) * plotH

  const groupW = (width - padLeft - padRight) / months.length
  const barW = Math.min(20, groupW / 3.2)
  const gap = 3

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f))

  return (
    <div className="pp-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Revenue versus expense by month">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padLeft} x2={width - padRight} y1={yFor(t)} y2={yFor(t)} stroke="#e4ddcd" strokeWidth="1" />
            <text x={padLeft} y={yFor(t) - 4} fontSize="9.5" fill="#746c58">{formatCompactINR(t)}</text>
          </g>
        ))}
        {months.map((m, i) => {
          const cx = padLeft + groupW * i + groupW / 2
          const rx = cx - barW - gap / 2
          const ex = cx + gap / 2
          const rTop = yFor(revenue[i])
          const eTop = yFor(expense[i])
          const isHover = hover === i
          return (
            <g
              key={m}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={rx - 6} y={padTop} width={barW * 2 + gap + 12} height={plotH} fill="transparent" />
              <rect x={rx} y={rTop} width={barW} height={yFor(0) - rTop} rx="4" fill={REVENUE} opacity={isHover ? 1 : 0.92} />
              <rect x={ex} y={eTop} width={barW} height={yFor(0) - eTop} rx="4" fill={EXPENSE} opacity={isHover ? 1 : 0.92} />
              <text x={cx} y={height - 8} fontSize="10.5" textAnchor="middle" fill="#56503f" fontWeight={isHover ? 700 : 400}>{m}</text>
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div
          className="pp-chart-tooltip"
          style={{ left: `${((padLeft + groupW * hover + groupW / 2) / width) * 100}%`, top: `${(Math.min(yFor(revenue[hover]), yFor(expense[hover])) / height) * 100}%` }}
        >
          <div className="pp-tt-row"><span className="pp-tt-dot" style={{ background: REVENUE }} />Revenue: {formatCompactINR(revenue[hover])}</div>
          <div className="pp-tt-row"><span className="pp-tt-dot" style={{ background: EXPENSE }} />Expense: {formatCompactINR(expense[hover])}</div>
        </div>
      )}
    </div>
  )
}
