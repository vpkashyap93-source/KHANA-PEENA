import { useState } from 'react'
import { formatCompactINR } from '../format'

const LINE = '#2569a6'

export default function CollectionTrendChart({ months, values }) {
  const [hover, setHover] = useState(null)
  const width = 400
  const height = 220
  const padTop = 16
  const padBottom = 28
  const padLeft = 8
  const padRight = 14
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom
  const maxVal = Math.max(...values)
  const niceMax = Math.ceil(maxVal / 200000) * 200000
  const niceMin = 0

  const xFor = (i) => padLeft + (plotW / (months.length - 1)) * i
  const yFor = (v) => padTop + plotH - ((v - niceMin) / (niceMax - niceMin)) * plotH

  const linePoints = values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ')
  const areaPoints = `${padLeft},${yFor(0)} ${linePoints} ${xFor(values.length - 1)},${yFor(0)}`

  return (
    <div className="pp-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Collection trend over recent months">
        <polygon points={areaPoints} fill={LINE} opacity="0.1" />
        <polyline points={linePoints} fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {values.map((v, i) => {
          const isHover = hover === i
          const isLast = i === values.length - 1
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <rect x={xFor(i) - plotW / (values.length - 1) / 2} y={padTop} width={plotW / (values.length - 1)} height={plotH} fill="transparent" />
              <circle cx={xFor(i)} cy={yFor(v)} r={isHover || isLast ? 4.5 : 3} fill={LINE} stroke="#fff" strokeWidth="2" />
              {isLast && (
                <text x={xFor(i)} y={yFor(v) - 12} fontSize="10.5" fontWeight="700" textAnchor="end" fill="#102a4a">{formatCompactINR(v)}</text>
              )}
              <text x={xFor(i)} y={height - 8} fontSize="10.5" textAnchor="middle" fill="#56503f" fontWeight={isHover ? 700 : 400}>{months[i]}</text>
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div
          className="pp-chart-tooltip"
          style={{ left: `${(xFor(hover) / width) * 100}%`, top: `${(yFor(values[hover]) / height) * 100}%` }}
        >
          <div className="pp-tt-row"><span className="pp-tt-dot" style={{ background: LINE }} />Collection: {formatCompactINR(values[hover])}</div>
        </div>
      )}
    </div>
  )
}
