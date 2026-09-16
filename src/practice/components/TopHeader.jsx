import { useMemo, useState } from 'react'
import Icon from './Icon'
import { financialYears, globalSearchIndex } from '../data/mockData'

const QUICK_ACTIONS = [
  { id: 'client', label: 'Add Client', icon: 'clients', variant: 'outline' },
  { id: 'invoice', label: 'Create Invoice', icon: 'invoice', variant: 'gold' },
  { id: 'payment', label: 'Payment Received', icon: 'wallet', variant: 'outline' },
  { id: 'journal', label: 'Journal Entry', icon: 'accounting', variant: 'outline' },
]

export default function TopHeader({ onQuickAction, onMenuToggle, financialYear, onFinancialYearChange }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return globalSearchIndex.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 6)
  }, [query])

  return (
    <div className="pp-topbar pp-no-print">
      <div className="pp-topbar-row1">
        <button type="button" className="pp-icon-btn pp-menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <Icon name="menu" size={18} />
        </button>

        <div className="pp-search">
          <Icon name="search" size={16} />
          <input
            type="text"
            placeholder="Search clients, invoices, vouchers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setQuery(''), 150)}
          />
          {results.length > 0 && (
            <div className="pp-search-results">
              {results.map((r) => (
                <button type="button" key={r.type + r.label} onMouseDown={(e) => e.preventDefault()}>
                  {r.label}
                  <span className="pp-tag">{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pp-topbar-right">
          <label className="pp-fy-select">
            <Icon name="overview" size={15} />
            <select value={financialYear} onChange={(e) => onFinancialYearChange(e.target.value)}>
              {financialYears.map((fy) => <option key={fy} value={fy}>{fy}</option>)}
            </select>
          </label>

          <button type="button" className="pp-icon-btn" aria-label="Notifications">
            <Icon name="bell" size={17} />
            <span className="pp-dot" />
          </button>

          <button type="button" className="pp-user-chip">
            <span className="pp-user-avatar">VK</span>
            <span>
              <span className="pp-user-name" style={{ display: 'block' }}>Vaibhav Kashyap</span>
              <span className="pp-user-role" style={{ display: 'block' }}>Practice Admin</span>
            </span>
          </button>
        </div>
      </div>

      <div className="pp-topbar-row2">
        <span className="pp-quick-label">Quick actions</span>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`pp-btn pp-btn-${action.variant} pp-btn-sm`}
            onClick={() => onQuickAction(action.id)}
          >
            <Icon name={action.icon} size={15} /> {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
