import { useState } from 'react'
import { updateOrg } from '../firebase.js'

// Keyed by org.id in App.jsx, so this remounts (and re-reads the initial
// state below) whenever the signed-in org changes - no effect needed to
// keep the form in sync with incoming org updates.
export default function Settings({ orgId, org }) {
  const [name, setName] = useState(org.name || '')
  const [gstin, setGstin] = useState(org.gstin || '')
  const [state, setState] = useState(org.state || '')
  const [address, setAddress] = useState(org.address || '')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaved(false)
    if (!name.trim()) { setError('Business name is required.'); return }
    setBusy(true)
    try {
      await updateOrg(orgId, { name: name.trim(), gstin: gstin.trim(), state: state.trim(), address: address.trim() })
      setSaved(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <h2>Business Settings</h2>
      <form className="journal-form" onSubmit={submit} style={{ maxWidth: 460 }}>
        <label>
          Business name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          GSTIN
          <input value={gstin} onChange={(event) => setGstin(event.target.value)} placeholder="22AAAAA0000A1Z5" />
        </label>
        <label>
          State
          <input value={state} onChange={(event) => setState(event.target.value)} placeholder="e.g. Maharashtra" />
        </label>
        <label>
          Address
          <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={3} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save settings'}</button>
        {saved && <p className="auth-info">Saved.</p>}
      </form>
    </div>
  )
}
