import { useEffect, useState } from 'react'
import { watchAuthState, ensureOrg, getOrg, watchOrgCollection, logOut, isFirebaseConfigured } from './firebase.js'
import Login from './components/Login.jsx'
import ChartOfAccounts from './components/ChartOfAccounts.jsx'
import JournalEntries from './components/JournalEntries.jsx'
import { Invoices, Bills } from './components/Invoicing.jsx'
import Ledger from './components/Ledger.jsx'
import Reports from './components/Reports.jsx'

const TABS = [
  { id: 'accounts', label: 'Chart of Accounts' },
  { id: 'journal', label: 'Journal' },
  { id: 'invoices', label: 'Sales Invoices' },
  { id: 'bills', label: 'Purchase Bills' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'reports', label: 'Reports' },
]

export default function App() {
  const [user, setUser] = useState(undefined)
  const [org, setOrg] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [entries, setEntries] = useState([])
  const [invoices, setInvoices] = useState([])
  const [bills, setBills] = useState([])
  const [tab, setTab] = useState('accounts')

  useEffect(() => watchAuthState((nextUser) => {
    setUser(nextUser)
    if (!nextUser) setOrg(null)
  }), [])

  useEffect(() => {
    if (!user) return
    let active = true
    ensureOrg(user.uid, user.email).then(async (orgId) => {
      const orgData = await getOrg(orgId)
      if (active) setOrg(orgData)
    })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    if (!org) return
    const unsubs = [
      watchOrgCollection(org.id, 'accounts', setAccounts, 'code'),
      watchOrgCollection(org.id, 'journalEntries', setEntries, 'date'),
      watchOrgCollection(org.id, 'invoices', setInvoices, 'date'),
      watchOrgCollection(org.id, 'bills', setBills, 'date'),
    ]
    return () => unsubs.forEach((unsub) => unsub())
  }, [org])

  if (!isFirebaseConfigured) {
    return <div className="auth-screen"><div className="auth-card"><p>Firebase is not configured for Khata Cloud.</p></div></div>
  }

  if (user === undefined) return <div className="loading-screen">Loading...</div>
  if (user === null) return <Login />
  if (!org) return <div className="loading-screen">Setting up your business...</div>

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Khata Cloud</h1>
        <span className="org-name">{org.name}</span>
        <button className="link-button" onClick={logOut}>Log out</button>
      </header>
      <nav className="app-nav">
        {TABS.map((item) => (
          <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>
      <main className="app-main">
        {tab === 'accounts' && <ChartOfAccounts orgId={org.id} accounts={accounts} />}
        {tab === 'journal' && <JournalEntries orgId={org.id} accounts={accounts} entries={entries} />}
        {tab === 'invoices' && <Invoices orgId={org.id} accounts={accounts} invoices={invoices} />}
        {tab === 'bills' && <Bills orgId={org.id} accounts={accounts} bills={bills} />}
        {tab === 'ledger' && <Ledger accounts={accounts} entries={entries} />}
        {tab === 'reports' && <Reports accounts={accounts} entries={entries} />}
      </main>
    </div>
  )
}
