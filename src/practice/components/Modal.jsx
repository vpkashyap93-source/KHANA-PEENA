import Icon from './Icon'

export default function Modal({ title, children, onClose, footer }) {
  return (
    <div className="pp-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="pp-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="pp-modal-head">
          <div className="pp-modal-title">{title}</div>
          <button type="button" className="pp-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="pp-modal-body">{children}</div>
        {footer && <div className="pp-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
