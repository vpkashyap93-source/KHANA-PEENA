import { useState } from 'react'
import { addOrgDoc } from '../firebase.js'
import { round2 } from '../lib/accounting.js'

const blank = () => ({ name: '', unit: '', salePrice: '', purchasePrice: '', gstPercent: '' })

// Items/products catalog. Invoicing.jsx matches a line item's description
// against this list to auto-fill the rate, so the catalog pays for itself
// the moment it has a couple of entries in it.
export default function Items({ orgId, items }) {
  const [form, setForm] = useState(blank())
  const [error, setError] = useState('')

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const name = form.name.trim()
    if (!name) { setError('Enter an item name.'); return }
    if (items.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setError(`An item named "${name}" already exists.`)
      return
    }
    await addOrgDoc(orgId, 'items', {
      name,
      unit: form.unit.trim() || 'pcs',
      salePrice: round2(form.salePrice),
      purchasePrice: round2(form.purchasePrice),
      gstPercent: Number(form.gstPercent) || 0,
    })
    setForm(blank())
  }

  return (
    <div className="panel">
      <h2>Items &amp; Products</h2>
      <form className="inline-form" onSubmit={submit}>
        <input placeholder="Item name" value={form.name} onChange={(event) => update('name', event.target.value)} />
        <input placeholder="Unit (pcs, kg...)" value={form.unit} onChange={(event) => update('unit', event.target.value)} />
        <input type="number" min="0" step="0.01" placeholder="Sale price" value={form.salePrice} onChange={(event) => update('salePrice', event.target.value)} />
        <input type="number" min="0" step="0.01" placeholder="Purchase price" value={form.purchasePrice} onChange={(event) => update('purchasePrice', event.target.value)} />
        <input type="number" min="0" max="28" step="0.1" placeholder="GST %" value={form.gstPercent} onChange={(event) => update('gstPercent', event.target.value)} />
        <button type="submit">Add item</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <table>
        <thead><tr><th>Name</th><th>Unit</th><th>Sale Price</th><th>Purchase Price</th><th>GST %</th></tr></thead>
        <tbody>
          {items.length === 0 && <tr><td colSpan={5} className="empty-note">No items yet - add your first one above.</td></tr>}
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.unit}</td>
              <td>{Number(item.salePrice || 0).toFixed(2)}</td>
              <td>{Number(item.purchasePrice || 0).toFixed(2)}</td>
              <td>{item.gstPercent || 0}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
