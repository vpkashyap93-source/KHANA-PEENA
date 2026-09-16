import Icon from './Icon'

export default function PageHeader({ crumbs = [], title, subtitle, onPrint, onExport, actions }) {
  return (
    <>
      <div className="pp-breadcrumbs">
        {crumbs.map((crumb, i) => (
          <span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span>/</span>}
            <span className={i === crumbs.length - 1 ? 'is-current' : ''}>{crumb}</span>
          </span>
        ))}
      </div>
      <div className="pp-page-header">
        <div>
          <div className="pp-page-title">{title}</div>
          {subtitle && <div className="pp-page-subtitle">{subtitle}</div>}
        </div>
        <div className="pp-page-actions pp-no-print">
          {actions}
          {onExport && (
            <button type="button" className="pp-btn pp-btn-outline pp-btn-sm" onClick={onExport}>
              <Icon name="download" size={15} /> Export
            </button>
          )}
          {onPrint && (
            <button type="button" className="pp-btn pp-btn-outline pp-btn-sm" onClick={onPrint}>
              <Icon name="print" size={15} /> Print
            </button>
          )}
        </div>
      </div>
    </>
  )
}
