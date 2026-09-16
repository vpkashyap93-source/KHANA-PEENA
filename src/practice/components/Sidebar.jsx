import Icon from './Icon'
import { NAV_ITEMS } from '../navItems'

export default function Sidebar({ active, onNavigate, isOpen, onClose }) {
  return (
    <>
      {isOpen && <div className="pp-sidebar-backdrop" onClick={onClose} />}
      <aside className={`pp-sidebar${isOpen ? ' is-open' : ''}`}>
        <div className="pp-brand">
          <div className="pp-brand-mark">KP</div>
          <div className="pp-brand-text">
            <div className="pp-brand-name">Khana Peena Practice</div>
            <div className="pp-brand-sub">Accounting Suite</div>
          </div>
        </div>
        <nav className="pp-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pp-nav-item${active === item.id ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="pp-sidebar-foot">
          <strong>FY 2025-26</strong>
          Practice data shown here is for design preview only.
        </div>
      </aside>
    </>
  )
}
