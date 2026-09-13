import { useEffect, useState } from 'react'
import { watchAuthState, ensureOrg, watchOrg, watchOrgCollection, logOut, isFirebaseConfigured } from './firebase.js'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import ChartOfAccounts from './components/ChartOfAccounts.jsx'
import JournalEntries from './components/JournalEntries.jsx'
import { Invoices, Bills } from './components/Invoicing.jsx'
import { Customers, Vendors } from './components/Contacts.jsx'
import Items from './components/Items.jsx'
import Ledger from './components/Ledger.jsx'
import Reports from './components/Reports.jsx'
import Settings from './components/Settings.jsx'
import Icon from './components/icons.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'accounts', label: 'Chart of Accounts', icon: 'accounts' },
  { id: 'customers', label: 'Customers', icon: 'customers' },
  { id: 'vendors', label: 'Vendors', icon: 'vendors' },
  { id: 'items', label: 'Items', icon: 'items' },
  { id: 'journal', label: 'Journal', icon: 'journal' },
  { id: 'invoices', label: 'Sales Invoices', icon: 'invoices' },
  { id: 'bills', label: 'Purchase Bills', icon: 'bills' },
  { id: 'ledger', label: 'Ledger', icon: 'ledger' },
  { id: 'reports', label: 'Reports', icon: 'reports' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export default function App() {
  const [user, setUser] = useState(undefined)
  const [org, setOrg] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [entries, setEntries] = useState([])
  const [invoices, setInvoices] = useState([])
  const [bills, setBills] = useState([])
  const [customers, setCustomers] = useState([])
  const [vendors, setVendors] = useState([])
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => watchAuthState((nextUser) => {
    setUser(nextUser)
    if (!nextUser) setOrg(null)
  }), [])

  useEffect(() => {
    if (!user) return
    let active = true
    let unsubOrg = () => {}
    ensureOrg(user.uid, user.email).then((orgId) => {
      if (!active) return
      unsubOrg = watchOrg(orgId, (orgData) => { if (active) setOrg(orgData) })
    })
    return () => { active = false; unsubOrg() }
  }, [user])

  useEffect(() => {
    if (!org) return
    const unsubs = [
      watchOrgCollection(org.id, 'accounts', setAccounts, 'code'),
      watchOrgCollection(org.id, 'journalEntries', setEntries, 'date'),
      watchOrgCollection(org.id, 'invoices', setInvoices, 'date'),
      watchOrgCollection(org.id, 'bills', setBills, 'date'),
      watchOrgCollection(org.id, 'customers', setCustomers),
      watchOrgCollection(org.id, 'vendors', setVendors),
      watchOrgCollection(org.id, 'items', setItems),
    ]
    return () => unsubs.forEach((unsub) => unsub())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only resubscribe when the org id changes, not on every profile-field edit
  }, [org?.id])

  if (!isFirebaseConfigured) {
    return <div className="auth-screen"><div className="auth-card"><p>Firebase is not configured for Khata Cloud.</p></div></div>
  }

  if (user === undefined) return <div className="loading-screen">Loading...</div>
  if (user === null) return <Login />
  if (!org) return <div className="loading-screen">Setting up your business...</div>

  const currentLabel = NAV.find((item) => item.id === tab)?.label || ''

  const selectTab = (id) => { setTab(id); setNavOpen(false) }

  return (
    <div className={`app-shell ${navOpen ? 'nav-open' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">K</span>
          <span className="brand-name">Khata Cloud</span>
        </div>
        <nav className="side-nav">
          {NAV.map((item) => (
            <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => selectTab(item.id)}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="link-button" onClick={logOut}>Log out</button>
        </div>
      </aside>

      <div className="app-body">
        <header className="topbar">
          <button className="nav-toggle" onClick={() => setNavOpen((open) => !open)} aria-label="Toggle menu">☰</button>
          <h1>{currentLabel}</h1>
          <span className="org-name">{org.name}</span>
        </header>
        <main className="app-main">
          {tab === 'dashboard' && <Dashboard accounts={accounts} entries={entries} invoices={invoices} bills={bills} />}
          {tab === 'accounts' && <ChartOfAccounts orgId={org.id} accounts={accounts} />}
          {tab === 'customers' && <Customers orgId={org.id} contacts={customers} />}
          {tab === 'vendors' && <Vendors orgId={org.id} contacts={vendors} />}
          {tab === 'items' && <Items orgId={org.id} items={items} />}
          {tab === 'journal' && <JournalEntries orgId={org.id} accounts={accounts} entries={entries} />}
          {tab === 'invoices' && <Invoices orgId={org.id} accounts={accounts} invoices={invoices} contacts={customers} items={items} />}
          {tab === 'bills' && <Bills orgId={org.id} accounts={accounts} bills={bills} contacts={vendors} items={items} />}
          {tab === 'ledger' && <Ledger accounts={accounts} entries={entries} />}
          {tab === 'reports' && <Reports accounts={accounts} entries={entries} />}
          {tab === 'settings' && <Settings key={org.id} orgId={org.id} org={org} />}
        </main>
      </div>
    </div>
  )
}
