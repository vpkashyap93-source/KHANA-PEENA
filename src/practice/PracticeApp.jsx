import { useState } from 'react'
import './theme.css'
import './practice.css'
import Sidebar from './components/Sidebar'
import TopHeader from './components/TopHeader'
import Modal from './components/Modal'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import { financialYears } from './data/mockData'

const QUICK_ACTION_COPY = {
  client: { title: 'Add Client', detail: 'The client intake form (KYC, contact details, services opted) will open here once the Clients module ships.' },
  invoice: { title: 'Create Invoice', detail: 'Invoice creation will open here once the Billing module ships, using the fee structure from Services & Fees.' },
  payment: { title: 'Payment Received', detail: 'Recording a receipt against an outstanding invoice will open here once the Billing module ships.' },
  journal: { title: 'Journal Entry', detail: 'The journal voucher screen (multi-row ledger entries with debit/credit totals) will open here once the Accounting module ships.' },
}

export default function PracticeApp() {
  const [active, setActive] = useState('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [financialYear, setFinancialYear] = useState(financialYears[financialYears.length - 1])
  const [quickAction, setQuickAction] = useState(null)

  const handleNavigate = (id) => {
    setActive(id)
    setMenuOpen(false)
  }

  return (
    <div className="pp-root pp-shell">
      <Sidebar active={active} onNavigate={handleNavigate} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="pp-main">
        <TopHeader
          onQuickAction={setQuickAction}
          onMenuToggle={() => setMenuOpen((v) => !v)}
          financialYear={financialYear}
          onFinancialYearChange={setFinancialYear}
        />
        {active === 'overview' ? (
          <Dashboard key={financialYear} financialYear={financialYear} />
        ) : (
          <ComingSoon moduleId={active} />
        )}
      </div>

      {quickAction && (
        <Modal
          title={QUICK_ACTION_COPY[quickAction].title}
          onClose={() => setQuickAction(null)}
          footer={<button type="button" className="pp-btn pp-btn-primary pp-btn-sm" onClick={() => setQuickAction(null)}>Got it</button>}
        >
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--pp-text-secondary)', lineHeight: 1.6 }}>
            {QUICK_ACTION_COPY[quickAction].detail}
          </p>
        </Modal>
      )}
    </div>
  )
}
