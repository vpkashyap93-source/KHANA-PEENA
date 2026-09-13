import { useState } from 'react'
import { addOrgDoc } from '../firebase.js'

const blank = () => ({ name: '', phone: '', email: '', gstin: '', address: '' })

// Shared list+add screen for Customers and Vendors - both are just a
// contact record (name, phone, email, GSTIN, address). Invoicing.jsx reads
// these lists to power its party autocomplete.
function ContactList({ orgId, contacts, config }) {
  const [form, setForm] = useState(blank())
  const [error, setError] = useState('')

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const name = form.name.trim()
    if (!name) { setError(`Enter a ${config.label.toLowerCase()} name.`); return }
    if (contacts.some((contact) => contact.name.toLowerCase() === name.toLowerCase())) {
      setError(`A ${config.label.toLowerCase()} named "${name}" already exists.`)
      return
    }
    await addOrgDoc(orgId, config.collectionName, {
      name,
      phone: form.phone.trim(),
      email: form.email.trim(),
      gstin: form.gstin.trim(),
      address: form.address.trim(),
    })
    setForm(blank())
  }

  return (
    <div className="panel">
      <h2>{config.title}</h2>
      <form className="inline-form" onSubmit={submit}>
        <input placeholder={`${config.label} name`} value={form.name} onChange={(event) => update('name', event.target.value)} />
        <input placeholder="Phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
        <input placeholder="Email" value={form.email} onChange={(event) => update('email', event.target.value)} />
        <input placeholder="GSTIN (optional)" value={form.gstin} onChange={(event) => update('gstin', event.target.value)} />
        <input placeholder="Address" value={form.address} onChange={(event) => update('address', event.target.value)} />
        <button type="submit">Add {config.label.toLowerCase()}</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <table>
        <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>GSTIN</th><th>Address</th></tr></thead>
        <tbody>
          {contacts.length === 0 && (
            <tr><td colSpan={5} className="empty-note">No {config.label.toLowerCase()}s yet - add your first one above.</td></tr>
          )}
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.phone || '-'}</td>
              <td>{contact.email || '-'}</td>
              <td>{contact.gstin || '-'}</td>
              <td>{contact.address || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Customers({ orgId, contacts }) {
  return <ContactList orgId={orgId} contacts={contacts} config={{ title: 'Customers', label: 'Customer', collectionName: 'customers' }} />
}

export function Vendors({ orgId, contacts }) {
  return <ContactList orgId={orgId} contacts={contacts} config={{ title: 'Vendors', label: 'Vendor', collectionName: 'vendors' }} />
}
