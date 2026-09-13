import { useState } from 'react'
import { round2 } from '../lib/accounting.js'

const money = (value) => Number(value || 0).toFixed(2)

// A party's invoices/bills, oldest first, with a running "amount owed"
// balance. Paid-immediately documents never touched Accounts
// Receivable/Payable, so only the unpaid ones add to the running total -
// that mirrors how buildInvoiceJournalLines/buildBillJournalLines post
// them. Documents saved before invoices carried a partyId (i.e. from
// before party linking existed) won't have one, so they can't appear on
// a statement - there's no data to key them to a party by.
function PartyStatement({ contacts, documents, config }) {
  const [partyId, setPartyId] = useState('')
  const party = contacts.find((contact) => contact.id === partyId)

  const rows = party
    ? documents.filter((doc) => doc.partyId === party.id).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    : []

  const withBalance = rows.reduce((acc, doc) => {
    const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
    const balance = doc.paidNow ? prevBalance : round2(prevBalance + (Number(doc.total) || 0))
    return [...acc, { ...doc, balance }]
  }, [])
  const outstanding = withBalance.length > 0 ? withBalance[withBalance.length - 1].balance : 0

  return (
    <>
      <label>
        {config.partyLabel}
        <select value={partyId} onChange={(event) => setPartyId(event.target.value)}>
          <option value="">Select {config.partyLabel.toLowerCase()}</option>
          {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
        </select>
      </label>

      {!party && <p className="empty-note">Select a {config.partyLabel.toLowerCase()} to see their statement.</p>}

      {party && (
        <>
          <div className="account-group">
            <h3>{party.name}</h3>
            <p className="empty-note">
              {[party.phone, party.email, party.gstin].filter(Boolean).join(' · ') || 'No contact details on file.'}
            </p>
          </div>

          {withBalance.length === 0 && (
            <p className="empty-note">No {config.docLabelPlural} for {party.name} yet.</p>
          )}
          {withBalance.length > 0 && (
            <table>
              <thead><tr><th>Date</th><th>#</th><th>Total</th><th>Status</th><th>Balance Due</th></tr></thead>
              <tbody>
                {withBalance.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.date}</td>
                    <td>{doc.number}</td>
                    <td>{money(doc.total)}</td>
                    <td>{doc.paidNow ? 'Paid' : config.unpaidLabel}</td>
                    <td>{money(doc.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={4}>Total Outstanding</td><td>{money(outstanding)}</td></tr>
              </tfoot>
            </table>
          )}
        </>
      )}
    </>
  )
}

export default function Statements({ customers, vendors, invoices, bills }) {
  const [tab, setTab] = useState('customer')
  return (
    <div className="panel">
      <h2>Statement of Account</h2>
      <div className="tab-row">
        <button className={tab === 'customer' ? 'active' : ''} onClick={() => setTab('customer')}>Customer</button>
        <button className={tab === 'vendor' ? 'active' : ''} onClick={() => setTab('vendor')}>Vendor</button>
      </div>
      {tab === 'customer' && (
        <PartyStatement
          contacts={customers}
          documents={invoices}
          config={{ partyLabel: 'Customer', docLabelPlural: 'invoices', unpaidLabel: 'Receivable' }}
        />
      )}
      {tab === 'vendor' && (
        <PartyStatement
          contacts={vendors}
          documents={bills}
          config={{ partyLabel: 'Vendor', docLabelPlural: 'bills', unpaidLabel: 'Payable' }}
        />
      )}
    </div>
  )
}
