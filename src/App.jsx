/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { isFirebaseConfigured, getRestaurantId, pushCloudBackup, pullCloudBackup, watchAuthState, signUp, logIn, logOut, resetPassword, changeUserPassword } from './firebase'

const menuItems = [
  { id: 1, name: 'Paneer Tikka', category: 'Starters', price: 280, type: 'Veg', color: 'coral' },
  { id: 2, name: 'Butter Chicken', category: 'Main Course', price: 420, type: 'Non-veg', color: 'gold' },
  { id: 3, name: 'Dal Makhani', category: 'Main Course', price: 260, type: 'Veg', color: 'green' },
  { id: 4, name: 'Margherita Pizza', category: 'Pizza', price: 360, type: 'Veg', color: 'cream' },
  { id: 5, name: 'Smoky Chicken Pizza', category: 'Pizza', price: 480, type: 'Non-veg', color: 'orange' },
  { id: 6, name: 'Classic Aloo Burger', category: 'Burger', price: 220, type: 'Veg', color: 'yellow' },
  { id: 7, name: 'Crispy Chicken Burger', category: 'Burger', price: 320, type: 'Non-veg', color: 'brown' },
  { id: 8, name: 'Hakka Noodles', category: 'Chinese', price: 280, type: 'Veg', color: 'green' },
  { id: 9, name: 'Chilli Chicken', category: 'Chinese', price: 360, type: 'Non-veg', color: 'coral' },
  { id: 10, name: 'Masala Chai', category: 'Beverages', price: 80, type: 'Veg', color: 'brown' },
  { id: 11, name: 'Mango Lassi', category: 'Beverages', price: 140, type: 'Veg', color: 'yellow' },
  { id: 12, name: 'Gulab Jamun', category: 'Desserts', price: 150, type: 'Veg', color: 'pink' },
  { id: 13, name: 'Garlic Naan', category: 'Main Course', price: 90, type: 'Veg', color: 'cream' },
]
const menuCatalog = menuItems.map((item, index) => ({ ...item, gstRate: [5, 12, 5, 12, 18, 5, 18, 12, 18, 5, 12, 5, 5][index] }))
const initialOrders = [
  { id: '#1048', customer: 'Aarav Mehta', table: 'T-04', amount: 1280, payment: 'Paid', status: 'Completed', time: '12:42 PM' },
  { id: '#1047', customer: 'Walk-in guest', table: 'T-12', amount: 860, payment: 'UPI', status: 'Preparing', time: '12:28 PM' },
  { id: '#1046', customer: 'Riya Sharma', table: 'T-02', amount: 2140, payment: 'Paid', status: 'Completed', time: '12:12 PM' },
  { id: '#1045', customer: 'Kabir Singh', table: 'T-08', amount: 540, payment: 'Pending', status: 'Pending', time: '11:56 AM' },
]
const navItems = [['Dashboard', 'grid'], ['POS / Billing', 'receipt'], ['Tables', 'table'], ['Orders', 'bag'], ['Menu / Items', 'utensils'], ['Inventory', 'box'], ['Purchases', 'wallet'], ['Suppliers', 'users'], ['Recipes', 'chef'], ['Stock Adjustments', 'chart'], ['Customers', 'users'], ['Party Ledger', 'wallet'], ['Kitchen', 'chef'], ['Staff', 'staff'], ['Expenses', 'wallet'], ['Payments', 'card'], ['Reports', 'chart'], ['Settings', 'settings']]
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
function flyItemToCart(sourceEl, item, targetPoint) {
  if (!sourceEl || !targetPoint) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const rect = sourceEl.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height, 52)
  const clone = document.createElement('div')
  clone.className = `fly-clone mini-art ${item.image ? '' : (item.color || 'coral')}`
  clone.style.left = `${rect.left + rect.width / 2 - size / 2}px`
  clone.style.top = `${rect.top + rect.height / 2 - size / 2}px`
  clone.style.width = `${size}px`
  clone.style.height = `${size}px`
  if (item.image) {
    const img = document.createElement('img')
    img.src = item.image
    img.alt = ''
    clone.appendChild(img)
  } else {
    clone.textContent = item.name.slice(0, 1)
  }
  document.body.appendChild(clone)
  const dx = targetPoint.x - (rect.left + rect.width / 2)
  const dy = targetPoint.y - (rect.top + rect.height / 2)
  requestAnimationFrame(() => {
    clone.style.transform = `translate(${dx}px, ${dy}px) scale(.35)`
    clone.style.opacity = '0.4'
  })
  const cleanup = () => clone.remove()
  clone.addEventListener('transitionend', cleanup, { once: true })
  setTimeout(cleanup, 1500)
}
const PAPER_PAGE_RULES = {
  A4: '@page { size: A4; margin: 10mm; }',
  A5: '@page { size: A5; margin: 8mm; }',
  // Chromium's print engine (and most printer drivers) can't size a page to
  // "auto" height for continuous thermal roll paper - it silently falls back
  // to the default page size (Letter/A4) instead of the requested width.
  // Use a fixed, generously tall page instead: correct width (what matters
  // for the paper roll), with enough height that real bills fit on one page.
  '80mm': '@page { size: 80mm 1000mm; margin: 0; }',
  '58mm': '@page { size: 58mm 1000mm; margin: 0; }',
}
function printDocument(paperSize) {
  const styleTag = document.createElement('style')
  styleTag.textContent = PAPER_PAGE_RULES[paperSize] || PAPER_PAGE_RULES.A4
  document.head.appendChild(styleTag)
  document.body.dataset.printSize = paperSize
  const cleanup = () => { styleTag.remove(); delete document.body.dataset.printSize }
  window.addEventListener('afterprint', cleanup, { once: true })
  window.print()
  setTimeout(cleanup, 2000)
}
const icon = (name) => ({ grid: '▦', receipt: '▤', table: '⌗', bag: '◫', utensils: '♨', users: '♧', chef: '♨', staff: '♙', wallet: '▱', card: '▭', chart: '◒', settings: '⚙', search: '⌕', bell: '♢', arrow: '↗', plus: '+', menu: '☰', close: '×', down: '⌄' }[name] || '•')
const formatDate = (date) => date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
const formatTime = (date) => date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const FESTIVALS = [
  { key: 'new-year', test: (d) => d.getMonth() === 0 && d.getDate() === 1, message: 'Happy New Year!', emoji: '🎉', theme: 'confetti' },
  { key: 'republic-day', test: (d) => d.getMonth() === 0 && d.getDate() === 26, message: 'Happy Republic Day!', emoji: '🇮🇳', theme: 'flag' },
  { key: 'holi', test: (d) => d.getFullYear() === 2026 && d.getMonth() === 2 && d.getDate() === 4, message: 'Happy Holi!', emoji: '🎨', theme: 'holi' },
  { key: 'independence-day', test: (d) => d.getMonth() === 7 && d.getDate() === 15, message: 'Happy Independence Day!', emoji: '🇮🇳', theme: 'flag' },
  { key: 'raksha-bandhan', test: (d) => d.getFullYear() === 2026 && d.getMonth() === 7 && d.getDate() === 28, message: 'Happy Raksha Bandhan!', emoji: '🧵', theme: 'rakhi' },
  { key: 'janmashtami', test: (d) => d.getFullYear() === 2026 && d.getMonth() === 8 && d.getDate() === 4, message: 'Happy Janmashtami!', emoji: '🪈', theme: 'matki' },
  { key: 'ganesh-chaturthi', test: (d) => d.getFullYear() === 2026 && d.getMonth() === 8 && d.getDate() === 14, message: 'Ganpati Bappa Morya!', emoji: '🐘', theme: 'ganesh' },
  { key: 'gandhi-jayanti', test: (d) => d.getMonth() === 9 && d.getDate() === 2, message: 'Gandhi Jayanti', emoji: '🕊️', theme: 'flag' },
  { key: 'navratri', test: (d) => d.getFullYear() === 2026 && d.getMonth() === 9 && d.getDate() >= 11 && d.getDate() <= 19, message: 'Happy Navratri!', emoji: '🪔', theme: 'navratri' },
  { key: 'dussehra', test: (d) => d.getFullYear() === 2026 && d.getMonth() === 9 && d.getDate() === 20, message: 'Happy Dussehra!', emoji: '🏹', theme: 'dussehra' },
  { key: 'diwali', test: (d) => d.getFullYear() === 2026 && d.getMonth() === 10 && d.getDate() === 8, message: 'Happy Diwali!', emoji: '🪔', theme: 'diya' },
  { key: 'christmas', test: (d) => d.getMonth() === 11 && d.getDate() === 25, message: 'Merry Christmas!', emoji: '🎄', theme: 'christmas' },
]
const getTodayFestival = (date) => FESTIVALS.find((festival) => festival.test(date)) || null
function FestivalBanner({ festival, restaurantName }) { if (!festival) return null; return <div className={`festival-banner festival-${festival.theme}`}><span className="festival-emoji">{festival.emoji}</span><div><strong>{festival.message}</strong><small>From all of us at {restaurantName || 'Shahi Bhoj'}</small></div></div> }
function Picker({ value, onChange, options, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = () => setTimeout(() => setOpen(false), 0)
  useEffect(() => {
    if (!open) return
    const onOutside = (event) => { if (ref.current && !ref.current.contains(event.target)) close() }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside)
    return () => { document.removeEventListener('mousedown', onOutside); document.removeEventListener('touchstart', onOutside) }
  }, [open])
  const normalized = options.map((opt) => (typeof opt === 'string' || typeof opt === 'number') ? { value: opt, label: String(opt) } : opt)
  const current = normalized.find((opt) => String(opt.value) === String(value))
  const isEmpty = normalized.length === 0
  return (
    <div className="picker" ref={ref}>
      <button type="button" className="picker-trigger" disabled={isEmpty} onClick={() => !isEmpty && setOpen((current) => !current)}>
        <span>{current ? current.label : placeholder}</span>
        <b>⌄</b>
      </button>
      {open && !isEmpty && (
        <>
          <div className="picker-backdrop" onClick={close} onTouchEnd={close} />
          <div className="picker-panel">
            {normalized.map((opt) => (
              <button type="button" key={opt.value} className={`picker-option ${String(opt.value) === String(value) ? 'selected' : ''}`} onClick={() => { onChange(opt.value); close() }}>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
function PromptDialog({ title, fields, confirmLabel = 'Save', onConfirm, onCancel }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.key, field.default ?? ''])))
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  return (
    <div className="prompt-modal-backdrop" onClick={onCancel}>
      <div className="prompt-modal" onClick={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        {fields.map((field, index) => (
          <label key={field.key}>
            {field.label}
            {field.type === 'select' ? (
              <Picker value={values[field.key]} onChange={(value) => update(field.key, value)} options={field.options} />
            ) : (
              <input
                type={field.type || 'text'}
                value={values[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                placeholder={field.placeholder}
                autoFocus={index === 0}
              />
            )}
          </label>
        ))}
        <div className="cart-actions">
          <button className="button secondary" onClick={onCancel}>Cancel</button>
          <button className="button primary" onClick={() => onConfirm(values)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
const resizeImage = (file, maxSize, callback) => {
  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      callback(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}
const BACKUP_PREFIX = 'basil-'
const exportBackup = () => {
  const backup = {}
  for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && key.startsWith(BACKUP_PREFIX)) backup[key] = localStorage.getItem(key) }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `shahi-bhoj-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}
const importBackup = (file, onDone) => {
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result)
      Object.entries(data).forEach(([key, value]) => { if (key.startsWith(BACKUP_PREFIX)) localStorage.setItem(key, value) })
      onDone(true)
    } catch {
      onDone(false)
    }
  }
  reader.readAsText(file)
}
function KotPreview({ kot, profile, onClose }) {
  if (!kot) return null
  const printKot = () => printDocument('80mm')
  return (
    <div className="bill-modal bill-size-80">
      <div className="bill-actions no-print">
        <button className="button quiet" onClick={onClose}>Close</button>
        <button className="button primary" onClick={printKot}>Print KOT</button>
      </div>
      <div className="print-bill">
        <header className="bill-header">
          <h1>{profile?.restaurantName || 'YOUR RESTAURANT'}</h1>
          <p>KITCHEN ORDER TICKET</p>
        </header>
        <div className="bill-meta">
          <div><strong>KOT No.</strong><span>{kot.id}</span></div>
          <div><strong>Order</strong><span>{kot.orderNumber}</span></div>
          <div><strong>Table / Type</strong><span>{kot.table} · {kot.orderType}</span></div>
          <div><strong>Time</strong><span>{kot.time}</span></div>
        </div>
        <table className="bill-items">
          <thead><tr><th>Item</th><th>Qty</th></tr></thead>
          <tbody>{(kot.items || []).map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.quantity}</td></tr>)}</tbody>
        </table>
        {kot.specialInstructions && <p style={{ fontSize: 12, marginTop: 10 }}>Note: {kot.specialInstructions}</p>}
      </div>
    </div>
  )
}

function BillPreview({ order, profile, onClose }) {
  const [paperSize, setPaperSize] = useState(() => localStorage.getItem('basil-default-paper-size') || '80mm')

  if (!order) return null

  const changePaperSize = (value) => { setPaperSize(value); localStorage.setItem('basil-default-paper-size', value) }

  const printBill = () => printDocument(paperSize)

  return (
    <div className={`bill-modal bill-size-${paperSize.replace('mm', '')}`}>
      <div className="bill-actions no-print">
        <label className="paper-selector">
          Bill size
          <Picker value={paperSize} onChange={changePaperSize} options={[{ value: '80mm', label: 'Thermal 80mm (small)' }, { value: '58mm', label: 'Thermal 58mm (small)' }, { value: 'A5', label: 'A5' }, { value: 'A4', label: 'A4 (full page)' }]} />
        </label>
        <button className="button quiet" onClick={onClose}>Close</button>
        <button className="button primary" onClick={printBill}>Print Bill</button>
      </div>

      <div className="print-bill">
        <header className="bill-header">
          <p>{profile?.address || ''}</p>
          <p>
            {[profile?.city, profile?.state, profile?.pincode].filter(Boolean).join(', ')}
          </p>
          <h1>{profile?.restaurantName || 'YOUR RESTAURANT'}</h1>
          {profile?.mobile && <p>Mob: {profile.mobile}</p>}
          {profile?.gstApplicable && profile?.gstin && <p>GSTIN: {profile.gstin}</p>}
        </header>

        <div className="bill-meta">
          <div>
            <strong>Bill No.</strong>
            <span>{order.id}</span>
          </div>
          <div>
            <strong>Date / Time</strong>
            <span>{order.time || 'Just now'}</span>
          </div>
          <div>
            <strong>Customer</strong>
            <span>{order.customer || 'Walk-in guest'}</span>
          </div>
          <div>
            <strong>Table</strong>
            <span>{order.table || order.orderType || '-'}</span>
          </div>
        </div>

        <table className="bill-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{money(item.price)}</td>
                <td>{money(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bill-total">
          <div><span>Subtotal</span><strong>{money(order.subtotal ?? order.amount)}</strong></div>
          <div><span>Discount</span><strong>{money(order.discount || 0)}</strong></div>
          {profile?.gstApplicable && (
            <div><span>GST</span><strong>{money(order.gst || 0)}</strong></div>
          )}
          <div className="bill-grand-total">
            <span>Grand Total</span>
            <strong>{money(order.amount)}</strong>
          </div>
          <div><span>Paid</span><strong>{money(order.paidAmount ?? order.amount)}</strong></div>
          <div><span>Payment</span><strong>{order.paymentMethod || order.payment || '-'}</strong></div>
        </div>

        <footer className="bill-footer">
          <strong>Thank you for visiting!</strong>
          <span>We hope to see you again.</span>
          <small className="bill-powered-by">Powered by Shahi Bhoj</small>
        </footer>
      </div>
    </div>
  )
}
function App() {
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('basil-profile')) || null)
  const [authUser, setAuthUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  useEffect(() => {
    const unsubscribe = watchAuthState((firebaseUser) => { setAuthUser(firebaseUser); setAuthChecked(true) })
    return unsubscribe
  }, [])
  const operations = { kitchenWorkflow: false, tableManagement: false, kotSystem: false, customerManagement: false, deliveryOrders: false, inventoryManagement: false, ...(profile || {}) }
  const [active, setActive] = useState('Dashboard')
  const [cart, setCart] = useState([]) 
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('basil-orders')) || initialOrders
    } catch {
      return initialOrders
    }
  })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All items')
  const [mobileNav, setMobileNav] = useState(false)
  const [payment, setPayment] = useState('UPI')
  const [orderType, setOrderType] = useState('Dine-in')
  const [selectedTable, setSelectedTable] = useState('T-07')
  const [customer, setCustomer] = useState('Walk-in guest')
  const [customers, setCustomers] = useState(() => JSON.parse(localStorage.getItem('basil-customers')) || ['Walk-in guest', 'Aarav Mehta', 'Riya Sharma', 'Kabir Singh'])
  const [tables, setTables] = useState(() => JSON.parse(localStorage.getItem('basil-tables')) || Array.from({ length: 12 }, (_, index) => ({ number: index + 1, capacity: index % 3 === 0 ? 6 : 4, status: index < 6 ? 'Occupied' : index === 8 ? 'Reserved' : 'Available', amount: index < 6 ? [1280, 860, 2140, 540, 760, 420][index] : 0 })))
  const [kots, setKotsState] = useState(() => JSON.parse(localStorage.getItem('basil-kots')) || [])
  const setKots = (updater) => { if (operations.kitchenWorkflow !== true) return; setKotsState(updater) }
    const [heldOrders, setHeldOrders] = useState(() => JSON.parse(localStorage.getItem('basil-held-orders')) || [])
  const [paymentAmount, setPaymentAmount] = useState('')
  const [billOrder, setBillOrder] = useState(null)
  const [paymentTransactions, setPaymentTransactions] = useState(() => JSON.parse(localStorage.getItem('basil-payment-transactions')) || [])
  const [inventory, setInventory] = useState(() => JSON.parse(localStorage.getItem('basil-inventory')) || [])
  const [suppliers, setSuppliers] = useState(() => JSON.parse(localStorage.getItem('basil-suppliers')) || [])
  const [purchases, setPurchases] = useState(() => JSON.parse(localStorage.getItem('basil-purchases')) || [])
  const [recipes, setRecipes] = useState(() => JSON.parse(localStorage.getItem('basil-recipes')) || {})
  const [adjustments, setAdjustments] = useState(() => JSON.parse(localStorage.getItem('basil-adjustments')) || [])
  const [consumption, setConsumption] = useState(() => JSON.parse(localStorage.getItem('basil-consumption')) || [])
  const [menu, setMenu] = useState(() => JSON.parse(localStorage.getItem('basil-menu')) || menuCatalog)
  const [staff, setStaff] = useState(() => JSON.parse(localStorage.getItem('basil-staff')) || [])
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('basil-expenses')) || [])
  const [parties, setParties] = useState(() => JSON.parse(localStorage.getItem('basil-parties')) || [])
  const [partyTransactions, setPartyTransactions] = useState(() => JSON.parse(localStorage.getItem('basil-party-transactions')) || [])
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id) }, [])
  const todaysFestival = getTodayFestival(now)
  const [cloudStatus, setCloudStatus] = useState({ ok: null, time: null })
  const syncToCloud = async () => { const result = await pushCloudBackup(); setCloudStatus({ ok: result.ok, time: new Date() }); return result }
  useEffect(() => {
    if (!isFirebaseConfigured) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncToCloud()
    const id = setInterval(syncToCloud, 60000)
    return () => clearInterval(id)
  }, [])
  const [kotPreview, setKotPreview] = useState(null)
  const [paymentPrompt, setPaymentPrompt] = useState(null)
  const [customerPrompt, setCustomerPrompt] = useState(false)
  const ownerName = profile?.ownerName?.trim() || profile?.restaurantName?.trim() || 'Owner'
  const ownerInitials = ownerName.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join('') || 'BB'
  useEffect(() => { localStorage.setItem('basil-orders', JSON.stringify(orders)) }, [orders])
  useEffect(() => { localStorage.setItem('basil-tables', JSON.stringify(tables)) }, [tables])
  useEffect(() => { localStorage.setItem('basil-kots', JSON.stringify(kots)) }, [kots])
  useEffect(() => { localStorage.setItem('basil-held-orders', JSON.stringify(heldOrders)) }, [heldOrders])
  useEffect(() => { localStorage.setItem('basil-customers', JSON.stringify(customers)) }, [customers])
  useEffect(() => { localStorage.setItem('basil-payment-transactions', JSON.stringify(paymentTransactions)) }, [paymentTransactions])
  useEffect(() => { localStorage.setItem('basil-inventory', JSON.stringify(inventory)) }, [inventory])
  useEffect(() => { localStorage.setItem('basil-suppliers', JSON.stringify(suppliers)) }, [suppliers])
  useEffect(() => { localStorage.setItem('basil-purchases', JSON.stringify(purchases)) }, [purchases])
  useEffect(() => { localStorage.setItem('basil-recipes', JSON.stringify(recipes)) }, [recipes])
  useEffect(() => { localStorage.setItem('basil-adjustments', JSON.stringify(adjustments)) }, [adjustments])
  useEffect(() => { localStorage.setItem('basil-consumption', JSON.stringify(consumption)) }, [consumption])
  useEffect(() => { localStorage.setItem('basil-menu', JSON.stringify(menu)) }, [menu])
  useEffect(() => { localStorage.setItem('basil-staff', JSON.stringify(staff)) }, [staff])
  useEffect(() => { localStorage.setItem('basil-expenses', JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { localStorage.setItem('basil-parties', JSON.stringify(parties)) }, [parties])
  useEffect(() => { localStorage.setItem('basil-party-transactions', JSON.stringify(partyTransactions)) }, [partyTransactions])
  const categories = ['All items', ...new Set(menu.filter((item) => item.available !== false).map((item) => item.category))]
  const filteredItems = menu.filter((item) => item.available !== false && (category === 'All items' || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase()))
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])
  const discountPercent = profile?.discountEnabled ? Number(profile.discountPercent) || 0 : 0
  const discount = Math.round(subtotal * discountPercent / 100)
  const gst = profile?.gstApplicable ? Math.round(cart.reduce((sum, item) => sum + item.price * item.quantity * (1 - discountPercent / 100) * item.gstRate / 100, 0)) : 0
  const total = subtotal - discount + gst
  useEffect(() => {
  document.body.dataset.gst = profile?.gstApplicable ? 'on' : 'off';
  document.body.style.setProperty(
    '--taxable-amount',
    money(subtotal - discount)
  );
  document.body.style.setProperty(
    '--gst-amount',
    money(gst)
  );
}, [profile, subtotal, discount, gst]);
  const addToCart = (item) => setCart((current) => current.some((cartItem) => cartItem.id === item.id) ? current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem) : [...current, { ...item, quantity: 1 }])
  const updateQuantity = (id, amount) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200) }
  const navigate = (screen) => { setActive(screen); setMobileNav(false) }
  const nextOrderNumber = () => '#' + (Math.max(1048, ...orders.map((order) => Number(String(order.id).replace('#', ''))), ...heldOrders.map((held) => Number(String(held.id).replace('#', '')))) + 1);
  const finalizeOrder = (status, enteredAmount) => {
  if (
    orderType === 'Dine-in' &&
    tables.some(
      (table) =>
        ('T-' + String(table.number).padStart(2, '0')) === selectedTable &&
        table.status === 'Occupied'
    )
  ) {
    return notify('That table already has an active order');
  }

  const orderNumber = nextOrderNumber();

  const kitchenEnabled = operations.kitchenWorkflow === true;
  const kotEnabled = operations.kotSystem === true;

  const kotNumber =
    kitchenEnabled && kotEnabled
      ? 'KOT-' + String(kots.length + 1).padStart(3, '0')
      : '';

  const paidAmount = Math.min(
    Math.max(Number(enteredAmount) || 0, 0),
    total
  );

  const order = {
    id: orderNumber,
    kotNumber,
    customer,
    table: orderType === 'Dine-in' ? selectedTable : orderType,
    amount: total,
    subtotal,
    discount,
    gst,
    paymentStatus:
      paidAmount === total && total > 0
        ? 'Paid'
        : paidAmount > 0
          ? 'Partially Paid'
          : 'Unpaid',
    paidAmount,
    outstandingAmount: total - paidAmount,
    paymentMethod: paidAmount > 0 ? payment : '',
    status,
    kitchenStatus: kitchenEnabled ? 'New' : 'Not Required',
    orderType,
    items: cart,
    specialInstructions: '',
    time: 'Just now',
    transactions: []
  };

  const kot = {
    id: kotNumber,
    orderNumber,
    table: order.table,
    orderType,
    customer,
    items: cart,
    specialInstructions: '',
    time: 'Just now',
    status: 'New'
  };

  setOrders((current) => [order, ...current]);
  setBillOrder(order);

  if (kitchenEnabled && kotEnabled) {
    setKots((current) => [kot, ...current]);
  }

  if (paidAmount > 0) {
    setPaymentTransactions((current) => [
      ...current,
      {
        orderNumber,
        amount: paidAmount,
        method: payment,
        time: 'Just now'
      }
    ]);
  }

  if (orderType === 'Dine-in') {
    setTables((current) =>
      current.map((table) =>
        ('T-' + String(table.number).padStart(2, '0')) === selectedTable
          ? {
              ...table,
              status: 'Occupied',
              amount: total,
              currentOrder: orderNumber
            }
          : table
      )
    );
  }

  setCart([]);
  setPaymentAmount('');

  if (kitchenEnabled && kotEnabled) {
    notify(
      paidAmount > 0
        ? 'Payment recorded · Order sent to kitchen'
        : 'Order saved · Sent to kitchen'
    );
  } else {
    notify(
      paidAmount > 0
        ? 'Payment recorded'
        : 'Order saved'
    );
  }

  setActive('Orders');
};
  const saveOrderInternal = (status = 'New', receivedAmount = 0) => {
    if (!cart.length) return notify('Add an item before saving');
    if (status === 'Pending') status = 'New';
    if (receivedAmount === 'Paid') { setPaymentPrompt({ status }); return; }
    finalizeOrder(status, receivedAmount);
  };
  const saveOrderForPOS = (status = 'New', receivedAmount = 0) => saveOrderInternal(receivedAmount === 'Paid' ? 'New' : status, receivedAmount)
  const clearCart = () => { setCart([]); notify('Cart cleared') }
  const holdOrder = () => { if (!cart.length) return notify('Add an item before holding'); setHeldOrders((current) => [...current, { id: nextOrderNumber(), cart, total, orderType, selectedTable, customer }]); setCart([]); notify('Order held for later') }
  const createCustomer = () => setCustomerPrompt(true)
  const saveProfile = (nextProfile) => { const saved = { ...operations, ...nextProfile }; setProfile(saved); localStorage.setItem('basil-profile', JSON.stringify(saved)); notify('Business profile saved') }
  const changePassword = async (currentPassword, newPassword) => {
    await changeUserPassword(currentPassword, newPassword)
    notify('Login password updated')
  }
  const consumeForOrder = (order) => { if (operations.inventoryManagement !== true || order.inventoryConsumed) return; const used = {}; const missingRecipe = order.items.filter((sold) => !(recipes[sold.id] || []).length); order.items.forEach((sold) => (recipes[sold.id] || []).forEach((ingredient) => { used[ingredient.inventoryId] = (used[ingredient.inventoryId] || 0) + ingredient.quantity * sold.quantity })); setInventory((current) => current.map((item) => used[item.id] ? { ...item, currentStock: item.currentStock - used[item.id] } : item)); setConsumption((current) => [...current, { orderNumber: order.id, items: used, time: 'Just now' }]); setOrders((current) => current.map((item) => item.id === order.id ? { ...item, inventoryConsumed: true } : item)); if (missingRecipe.length) notify(`No recipe set for ${missingRecipe.map((item) => item.name).join(', ')} - inventory not deducted for it. Set it up in Recipes.`) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { orders.filter((order) => order.paymentStatus === 'Paid' && !order.inventoryConsumed && order.items).forEach(consumeForOrder) }, [orders, recipes])
  const savePurchase = (purchase) => { const existing = purchases.find((item) => item.id === purchase.id); const paidAmount = purchase.paymentStatus === 'Paid' ? purchase.total : Number(purchase.paidAmount) || 0; const normalized = { ...purchase, paidAmount, outstandingAmount: purchase.total - paidAmount }; setPurchases((current) => existing ? current.map((item) => item.id === purchase.id ? normalized : item) : [normalized, ...current]); setInventory((current) => current.map((item) => item.id === purchase.inventoryId ? { ...item, currentStock: item.currentStock + Number(purchase.quantity) - (existing ? Number(existing.quantity) : 0) } : item)); notify(existing ? 'Purchase updated' : 'Purchase saved') }
  const deletePurchase = (purchase) => { setPurchases((current) => current.filter((item) => item.id !== purchase.id)); setInventory((current) => current.map((item) => item.id === purchase.inventoryId ? { ...item, currentStock: item.currentStock - Number(purchase.quantity) } : item)); notify('Purchase deleted and stock reversed') }
  const paySupplier = (purchase, amount, method) => { const received = Number(amount) || 0; const outstanding = purchase.outstandingAmount ?? (purchase.total - (purchase.paidAmount || 0)); if (received <= 0 || received > outstanding) return notify('Enter an amount up to ' + money(outstanding)); const updatedPaid = (purchase.paidAmount || 0) + received; const updated = { ...purchase, paidAmount: updatedPaid, outstandingAmount: purchase.total - updatedPaid, paymentStatus: purchase.total - updatedPaid <= 0 ? 'Paid' : 'Partially Paid', paymentMethod: method }; setPurchases((current) => current.map((item) => item.id === purchase.id ? updated : item)); notify('Payment recorded to ' + purchase.supplier) }
  const adjustStock = (adjustment) => { setAdjustments((current) => [adjustment, ...current]); setInventory((current) => current.map((item) => item.id === adjustment.inventoryId ? { ...item, currentStock: item.currentStock + Number(adjustment.quantity) } : item)); notify('Stock adjusted') }
  const collectPayment = (order, amount, method) => { const received = Number(amount) || 0; if (received <= 0 || received > order.outstandingAmount) return notify('Enter an amount up to ' + money(order.outstandingAmount)); const updated = { ...order, paidAmount: order.paidAmount + received, outstandingAmount: order.outstandingAmount - received, paymentStatus: order.outstandingAmount - received === 0 ? 'Paid' : 'Partially Paid', paymentMethod: method }; setOrders((current) => current.map((item) => item.id === order.id ? updated : item)); setPaymentTransactions((current) => [...current, { orderNumber: order.id, amount: received, method, time: 'Just now' }]); if (updated.paymentStatus === 'Paid') { consumeForOrder(updated); if (updated.orderType === 'Dine-in' && updated.table) { setTables((current) => current.map((table) => ('T-' + String(table.number).padStart(2, '0')) === updated.table ? { ...table, status: 'Available', amount: 0, currentOrder: null } : table)); } } notify('Payment collected') }
  const updateOrderStatus = (orderId, status) => { setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status, kitchenStatus: status === 'Preparing' || status === 'Ready' || status === 'Served' ? status : order.kitchenStatus } : order)); setKots((current) => current.map((kot) => kot.orderNumber === orderId ? { ...kot, status: status === 'Preparing' || status === 'Ready' || status === 'Served' ? status : kot.status } : kot)); notify('Order ' + orderId + ' marked ' + status) }
  useEffect(() => { window.basilUpdateOrderStatus = updateOrderStatus; return () => { delete window.basilUpdateOrderStatus } }, [])
  // Keep the callback available to the existing Orders view.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { window.basilCollectPayment = collectPayment; return () => { delete window.basilCollectPayment } }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { window.basilDeletePurchase = deletePurchase; return () => { delete window.basilDeletePurchase } }, [purchases])
  useEffect(() => { setOrders((current) => current.map((order) => { const kot = kots.find((item) => item.orderNumber === order.id); return kot && ['Preparing', 'Ready', 'Served'].includes(kot.status) && order.status !== kot.status ? { ...order, status: kot.status, kitchenStatus: kot.status } : order })) }, [kots])
  useEffect(() => { if (profile?.kitchenWorkflow !== true) return; setOrders((current) => current.map((order) => kots.some((kot) => kot.orderNumber === order.id) && (!order.status || order.status === 'New') ? { ...order, status: 'Received', kitchenStatus: 'New' } : order)) }, [kots, profile])
  useEffect(() => { if (active === 'Kitchen' && operations.kitchenWorkflow !== true) setActive('Orders'); if (active === 'Tables' && operations.tableManagement !== true) setActive('Dashboard'); if (
  ['Inventory', 'Purchases', 'Suppliers', 'Recipes', 'Stock Adjustments', 'Stock Reports'].includes(active) &&
  operations.inventoryManagement !== true
) {
  setActive('Dashboard')
}; if (active === 'Customers' && operations.customerManagement !== true) setActive('Dashboard') }, [active, operations])

  if (!isFirebaseConfigured) return <FirebaseNotConfigured />
  if (!authChecked) return <AuthLoading />
  if (!authUser) return <AuthScreen />
  if (!profile) return <Registration onSave={saveProfile} />
  void paymentAmount
  void SharedTables

  return (
    <>
      {billOrder && <BillPreview order={billOrder} profile={profile} onClose={() => setBillOrder(null)} />}
      {kotPreview && <KotPreview kot={kotPreview} profile={profile} onClose={() => setKotPreview(null)} />}
      {paymentPrompt && <PromptDialog title="Amount received" fields={[{ key: 'amount', label: `Amount received (maximum ${money(total)})`, type: 'number', default: String(total) }]} confirmLabel="Complete" onConfirm={(values) => { finalizeOrder(paymentPrompt.status, values.amount); setPaymentPrompt(null) }} onCancel={() => setPaymentPrompt(null)} />}
      {customerPrompt && <PromptDialog title="New customer" fields={[{ key: 'name', label: 'Customer name', placeholder: 'e.g. Rohit Sharma' }]} onConfirm={(values) => { if (values.name?.trim()) { setCustomers((current) => [...current, values.name.trim()]); setCustomer(values.name.trim()); notify('Customer added') } setCustomerPrompt(false) }} onCancel={() => setCustomerPrompt(false)} />}
      <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}><div className="brand"><span className="brand-mark">{profile.restaurantName?.trim()?.[0]?.toUpperCase() || 'S'}</span><span><strong>{profile.restaurantName || 'SHAHI BHOJ'}</strong><small>RESTAURANT OS</small></span><button className="icon-button sidebar-close" onClick={() => setMobileNav(false)}>×</button></div><div className="workspace-label">WORKSPACE</div><nav>
  {navItems
    .filter(([label]) => {
      if (label === 'Kitchen') return operations.kitchenWorkflow === true
      if (label === 'Tables') return operations.tableManagement === true
      if (label === 'Customers') return operations.customerManagement === true
      if (label === 'Delivery Orders') return operations.deliveryOrders === true

      if (
        ['Inventory', 'Purchases', 'Suppliers', 'Recipes', 'Stock Adjustments', 'Stock Reports'].includes(label)
      ) {
        return operations.inventoryManagement === true
      }

      return true
    })
    .map(([label, glyph]) => (
      <button
        className={active === label ? 'active' : ''}
        key={label}
        onClick={() => navigate(label)}
      >
        <span className="nav-icon">{icon(glyph)}</span>
        {label}
        {label === 'Kitchen' && kots.filter((kot) => kot.status !== 'Served').length > 0 && <b className="nav-count">{kots.filter((kot) => kot.status !== 'Served').length}</b>}
      </button>
    ))}
</nav> <div className="sidebar-bottom"><div className="help-card"><span>?</span><div><strong>Need a hand?</strong><small>Visit our help center</small></div></div><div className="profile"><div className="avatar">{ownerInitials}</div><div><strong>{ownerName}</strong><small>Administrator</small></div><button className="icon-button logout-button" onClick={logOut} title="Log out">⎋</button></div></div></aside>
      <main className="main"><header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)}>☰</button><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="header-actions"><div className="search-top">⌕<input placeholder="Search anything..." /></div><button className="icon-button notification">♢<i /></button><div className="date-label live-clock"><span>{formatDate(now)}</span><b>{formatTime(now)}</b>{todaysFestival && <span className={`festival-chip festival-${todaysFestival.theme}`} title={todaysFestival.message}>{todaysFestival.emoji}</span>}</div></div></header>
        <section className="content">{active === 'Dashboard' && <Dashboard navigate={navigate} orders={orders} tables={tables} customers={customers} now={now} festival={todaysFestival} ownerName={ownerName.split(' ')[0]} restaurantName={profile.restaurantName} />}{active === 'POS / Billing' && <FunctionalPOS categories={categories} category={category} setCategory={setCategory} query={query} setQuery={setQuery} items={filteredItems} addToCart={addToCart} cart={cart} updateQuantity={updateQuantity} removeItem={(id) => setCart((current) => current.filter((item) => item.id !== id))} subtotal={subtotal} discount={discount} discountPercent={discountPercent} gst={gst} gstApplicable={profile.gstApplicable} total={total} payment={payment} setPayment={setPayment} orderType={orderType} setOrderType={setOrderType} selectedTable={selectedTable} setSelectedTable={setSelectedTable} customer={customer} setCustomer={setCustomer} customers={customers} createCustomer={createCustomer} tables={tables} saveOrder={saveOrderInternal} holdOrder={holdOrder} clearCart={clearCart} heldOrders={heldOrders} setCart={setCart} notify={notify} />}{active === 'Orders' && <OrderDetailViewActive orders={orders} />}{active === 'Tables' && <ManagedTables tables={tables} setTables={setTables} orders={orders} notify={notify} />}{active === 'Kitchen' && <LegacyKitchen kots={kots} setKots={setKots} orders={orders} setOrders={setOrders} tables={tables} setTables={setTables} notify={notify} onPrintKot={setKotPreview} />}{active === 'Settings' && <Settings profile={profile} onSave={saveProfile} notify={notify} cloudStatus={cloudStatus} syncToCloud={syncToCloud} changePassword={changePassword} />}{active === 'Customers' && <CustomerLedger customers={customers} orders={orders} paymentTransactions={paymentTransactions} notify={notify} />}{active === 'Menu / Items' && <MenuPage menu={menu} setMenu={setMenu} notify={notify} />}{active === 'Staff' && <StaffPage staff={staff} setStaff={setStaff} notify={notify} />}{active === 'Expenses' && <ExpensePage expenses={expenses} setExpenses={setExpenses} notify={notify} />}{active === 'Payments' && <PaymentsPage paymentTransactions={paymentTransactions} orders={orders} />}{active === 'Reports' && <ReportsPage orders={orders} inventory={inventory} expenses={expenses} parties={parties} partyTransactions={partyTransactions} />}{active === 'Party Ledger' && <PartyLedgerPage parties={parties} setParties={setParties} transactions={partyTransactions} setTransactions={setPartyTransactions} notify={notify} />}{active === 'Inventory' && <InventoryPage inventory={inventory} setInventory={setInventory} notify={notify} />}{active === 'Purchases' && <PurchasePage inventory={inventory} suppliers={suppliers} purchases={purchases} savePurchase={savePurchase} setInventory={setInventory} setSuppliers={setSuppliers} notify={notify} />}{active === 'Suppliers' && <SupplierPage suppliers={suppliers} setSuppliers={setSuppliers} purchases={purchases} paySupplier={paySupplier} inventory={inventory} notify={notify} />}{active === 'Recipes' && <RecipePage menu={menu} inventory={inventory} recipes={recipes} setRecipes={setRecipes} setInventory={setInventory} notify={notify} />}{active === 'Stock Adjustments' && <AdjustmentPage inventory={inventory} adjustments={adjustments} adjustStock={adjustStock} notify={notify} />}</section>
          {active === 'Dashboard' && <AccountingSummary orders={orders} />}{active === 'Dashboard' && inventory.some((item) => item.currentStock <= item.minimumStock) && <div className="low-stock-banner">LOW STOCK · Review Inventory for items at or below minimum level</div>}
      </main>{toast && <div className="toast">✓ {toast}</div>}
      </div>
    </>
  )
}

function AuthLoading() {
  return <div className="registration-shell"><div className="registration-card">
    <div className="brand registration-brand"><span className="brand-mark">S</span><span><strong>SHAHI BHOJ</strong><small>RESTAURANT OS</small></span></div>
    <p className="registration-copy">Loading…</p>
  </div></div>
}
function FirebaseNotConfigured() {
  return <div className="registration-shell"><div className="registration-card">
    <div className="brand registration-brand"><span className="brand-mark">S</span><span><strong>SHAHI BHOJ</strong><small>RESTAURANT OS</small></span></div>
    <div className="eyebrow">SETUP NEEDED</div>
    <h1>Connect Firebase to enable login</h1>
    <p className="registration-copy">Login (and the forgot-password email) needs a Firebase project - there's no other backend to send mail from. Ask your developer to add the Firebase config in src/firebase.js, and to turn on the Email/Password sign-in provider under Authentication → Sign-in method in the Firebase console.</p>
  </div></div>
}
const AUTH_ERROR_MESSAGES = {
  'auth/operation-not-allowed': 'Email/password sign-in is not turned on for this project yet. Ask your developer to enable it in Firebase Console → Authentication → Sign-in method.',
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a bit and try again.',
  'auth/network-request-failed': 'Network error - check your internet connection and try again.',
  'auth/timeout': 'That took too long - check your internet connection and try again.',
}
function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((resolve, reject) => setTimeout(() => reject({ code: 'auth/timeout' }), ms)),
  ])
}
const authErrorMessage = (error) => AUTH_ERROR_MESSAGES[error?.code] || error?.message || 'Something went wrong. Please try again.'
function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const switchMode = (nextMode) => { setMode(nextMode); setError(''); setInfo('') }
  const submit = async () => {
    setError('')
    setInfo('')
    if (!email.trim()) return setError('Enter your email')
    if (mode === 'forgot') {
      setBusy(true)
      try {
        await withTimeout(resetPassword(email.trim()))
        setInfo('Password reset email sent - check your inbox.')
      } catch (error) {
        setError(authErrorMessage(error))
      }
      setBusy(false)
      return
    }
    if (!password) return setError('Enter your password')
    if (mode === 'signup') {
      if (password.length < 6) return setError('Password must be at least 6 characters')
      if (password !== confirm) return setError('Passwords do not match')
    }
    setBusy(true)
    try {
      if (mode === 'signup') await withTimeout(signUp(email.trim(), password))
      else await withTimeout(logIn(email.trim(), password))
    } catch (error) {
      setError(authErrorMessage(error))
    }
    setBusy(false)
  }
  return <div className="registration-shell"><div className="registration-card">
    <div className="brand registration-brand"><span className="brand-mark">S</span><span><strong>SHAHI BHOJ</strong><small>RESTAURANT OS</small></span></div>
    <div className="eyebrow">{mode === 'signup' ? 'CREATE YOUR LOGIN' : mode === 'forgot' ? 'RESET PASSWORD' : 'RESTRICTED ACCESS'}</div>
    <h1>{mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Forgot password' : 'Log in'}</h1>
    <p className="registration-copy">{mode === 'signup' ? 'Set up your login with your email so only authorised staff can open this app.' : mode === 'forgot' ? 'Enter your email and we will send you a link to reset your password.' : 'Enter your email and password to continue.'}</p>
    <div className="settings-form-grid">
      <label className="full-field">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@restaurant.com" autoFocus onKeyDown={(event) => event.key === 'Enter' && submit()} /></label>
      {mode !== 'forgot' && <label className={mode === 'signup' ? '' : 'full-field'}>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'signup' ? 'At least 6 characters' : ''} onKeyDown={(event) => event.key === 'Enter' && submit()} /></label>}
      {mode === 'signup' && <label>Confirm password<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} /></label>}
    </div>
    {error && <p className="gst-note login-error">{error}</p>}
    {info && <p className="gst-note login-info">{info}</p>}
    <button className="button primary registration-submit" disabled={busy} onClick={submit}>{mode === 'signup' ? 'Create account & continue' : mode === 'forgot' ? 'Send reset email' : 'Log in'} ↗</button>
    <div className="auth-switch">
      {mode === 'login' && <><button type="button" className="text-button" onClick={() => switchMode('forgot')}>Forgot password?</button><button type="button" className="text-button" onClick={() => switchMode('signup')}>New here? Create an account</button></>}
      {mode === 'signup' && <button type="button" className="text-button" onClick={() => switchMode('login')}>Already have an account? Log in</button>}
      {mode === 'forgot' && <button type="button" className="text-button" onClick={() => switchMode('login')}>Back to log in</button>}
    </div>
  </div></div>
}
const blankProfile = { restaurantName: '', ownerName: '', mobile: '', email: '', address: '', city: '', state: '', pincode: '', gstApplicable: true, gstin: '', registrationType: 'Regular', discountEnabled: true, discountPercent: 5, kitchenWorkflow: false, tableManagement: false, kotSystem: false, customerManagement: false, deliveryOrders: false, inventoryManagement: false }
function Registration({ onSave }) { const [form, setForm] = useState(blankProfile); const update = (key, value) => setForm((current) => ({ ...current, [key]: value })); return <div className="registration-shell"><div className="registration-card"><div className="brand registration-brand"><span className="brand-mark">S</span><span><strong>SHAHI BHOJ</strong><small>RESTAURANT OS</small></span></div><div className="eyebrow">WELCOME TO SHAHI BHOJ</div><h1>Register your restaurant</h1><p className="registration-copy">Set up your business profile and tax preferences before you start billing.</p><BusinessFields form={form} update={update} /><GstFields form={form} update={update} /><DiscountFields form={form} update={update} /><OperationsFields form={form} update={update} /><button className="button primary registration-submit" disabled={!form.restaurantName.trim() || !form.ownerName.trim()} onClick={() => onSave(form)}>Save and enter dashboard ↗</button></div></div> }
function BusinessFields({ form, update }) { return <div className="settings-section"><div className="settings-section-title"><h2>Business details</h2><p>These details appear on your restaurant bills.</p></div><div className="settings-form-grid"><label>Restaurant name<input value={form.restaurantName} onChange={(event) => update('restaurantName', event.target.value)} placeholder="Shahi Bhoj" /></label><label>Owner name<input value={form.ownerName} onChange={(event) => update('ownerName', event.target.value)} placeholder="Owner name" /></label><label>Mobile number<input value={form.mobile} onChange={(event) => update('mobile', event.target.value)} placeholder="+91 98765 43210" /></label><label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="hello@restaurant.com" /></label><label className="full-field">Address<input value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Street and building" /></label><label>City<input value={form.city} onChange={(event) => update('city', event.target.value)} placeholder="Mumbai" /></label><label>State<input value={form.state} onChange={(event) => update('state', event.target.value)} placeholder="Maharashtra" /></label><label>Pincode<input value={form.pincode} onChange={(event) => update('pincode', event.target.value)} placeholder="400001" /></label></div></div> }
function GstFields({ form, update }) { return <div className="settings-section gst-settings"><div className="settings-section-title"><div><h2>GST configuration</h2><p>GST is controlled at restaurant level for every bill.</p></div><button className={`gst-toggle ${form.gstApplicable ? 'on' : ''}`} onClick={() => update('gstApplicable', !form.gstApplicable)}><span />GST {form.gstApplicable ? 'ON' : 'OFF'}</button></div>{form.gstApplicable && <div className="settings-form-grid"><label>GSTIN<input value={form.gstin} onChange={(event) => update('gstin', event.target.value.toUpperCase())} placeholder="27ABCDE1234F1Z5" /></label><label>GST registration type<Picker value={form.registrationType} onChange={(value) => update('registrationType', value)} options={['Regular', 'Composition', 'Unregistered']} /></label></div>}</div> }
function DiscountFields({ form, update }) { return <div className="settings-section gst-settings"><div className="settings-section-title"><div><h2>Discount configuration</h2><p>Automatic discount applied to every bill in POS.</p></div><button className={`gst-toggle ${form.discountEnabled ? 'on' : ''}`} onClick={() => update('discountEnabled', !form.discountEnabled)}><span />Discount {form.discountEnabled ? 'ON' : 'OFF'}</button></div>{form.discountEnabled && <div className="settings-form-grid"><label>Discount percentage (%)<input type="number" min="0" max="100" value={form.discountPercent} onChange={(event) => update('discountPercent', event.target.value)} placeholder="5" /></label></div>}</div> }
function OperationsFields({ form, update }) { const fields = [['kitchenWorkflow', 'Kitchen Workflow'], ['tableManagement', 'Table Management'], ['kotSystem', 'KOT System'], ['customerManagement', 'Customer Management'], ['deliveryOrders', 'Delivery Orders'], ['inventoryManagement', 'Inventory Management']]; return <div className="settings-section operations-settings"><div className="settings-section-title"><div><h2>Restaurant operations</h2><p>{form.kitchenWorkflow ? 'Full kitchen workflow for restaurants with kitchen staff and KOT management.' : 'Simple mode for small restaurants. Orders can be billed without kitchen status management.'}</p></div></div><div className="operations-grid">{fields.map(([key, label]) => <button className={`gst-toggle ${form[key] ? 'on' : ''}`} onClick={() => update(key, !form[key])} key={key}><span />{label} {form[key] ? 'ON' : 'OFF'}</button>)}</div></div> }
function Settings({ profile, onSave, notify, cloudStatus, syncToCloud, changePassword }) { const [form, setForm] = useState({ ...blankProfile, ...profile }); const update = (key, value) => setForm((current) => ({ ...current, [key]: value })); const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' }); const updatePasswordField = (key, value) => setPasswordForm((current) => ({ ...current, [key]: value })); const submitPasswordChange = async () => { if (!passwordForm.current || !passwordForm.next) return notify('Enter current and new password'); if (passwordForm.next.length < 6) return notify('New password must be at least 6 characters'); if (passwordForm.next !== passwordForm.confirm) return notify('New passwords do not match'); try { await changePassword(passwordForm.current, passwordForm.next); setPasswordForm({ current: '', next: '', confirm: '' }) } catch (error) { notify(authErrorMessage(error)) } }; const handleImport = (event) => { const file = event.target.files[0]; if (!file) return; if (!window.confirm('Importing will overwrite all current data with the backup file. Continue?')) { event.target.value = ''; return }; importBackup(file, (success) => { if (success) { notify('Backup restored, reloading...'); setTimeout(() => window.location.reload(), 800) } else { notify('Invalid backup file') } }) }; const restoreFromCloud = async () => { if (!window.confirm('This will overwrite local data with your last cloud backup. Continue?')) return; const result = await pullCloudBackup(); if (result.ok) { notify('Restored from cloud, reloading...'); setTimeout(() => window.location.reload(), 800) } else { notify('No cloud backup found') } }; return <><PageTitle eyebrow="SETTINGS" title="Restaurant settings" action="Save changes" onAction={() => onSave(form)} /><div className="settings-layout"><section className="panel settings-panel"><BusinessFields form={form} update={update} /><GstFields form={form} update={update} /><DiscountFields form={form} update={update} /><OperationsFields form={form} update={update} /><div className="settings-section"><div className="settings-section-title"><div><h2>Login &amp; security</h2><p>Change the password used to open this app on this device.</p></div></div><div className="settings-form-grid"><label>Current password<input type="password" value={passwordForm.current} onChange={(event) => updatePasswordField('current', event.target.value)} /></label><label>New password<input type="password" value={passwordForm.next} onChange={(event) => updatePasswordField('next', event.target.value)} placeholder="At least 6 characters" /></label><label>Confirm new password<input type="password" value={passwordForm.confirm} onChange={(event) => updatePasswordField('confirm', event.target.value)} /></label></div><button className="button secondary" style={{ marginTop: 12 }} onClick={submitPasswordChange}>Update password</button></div><div className="settings-section"><div className="settings-section-title"><div><h2>Data backup</h2><p>Download all your data as a file, or restore it on another device.</p></div></div><div className="cart-actions" style={{ justifyContent: 'flex-start', gap: 14 }}><button className="button secondary" onClick={exportBackup}>⬇ Export backup</button><label className="button secondary" htmlFor="backup-import-input" style={{ cursor: 'pointer' }}>⬆ Import backup</label><input id="backup-import-input" type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} /></div></div><div className="settings-section"><div className="settings-section-title"><div><h2>Cloud backup (Firebase)</h2><p>{isFirebaseConfigured ? 'Your data auto-syncs to the cloud every minute as a safety backup.' : 'Not connected yet — cloud backup will turn on automatically once this is set up.'}</p></div></div><div className="gst-note">Restaurant ID: <strong>{getRestaurantId()}</strong><br />Save this ID somewhere safe — it is needed to restore your data on a new device.{isFirebaseConfigured && <><br />Status: {cloudStatus?.ok === null ? 'Syncing…' : cloudStatus?.ok ? `Last synced at ${cloudStatus.time?.toLocaleTimeString()}` : 'Sync failed, will retry'}</>}</div>{isFirebaseConfigured && <div className="cart-actions" style={{ justifyContent: 'flex-start', gap: 14 }}><button className="button secondary" onClick={async () => { const result = await syncToCloud(); notify(result.ok ? 'Synced to cloud' : 'Cloud sync failed') }}>☁ Sync now</button><button className="button secondary" onClick={restoreFromCloud}>⬇ Restore from cloud</button></div>}</div><div className="gst-note">{form.gstApplicable ? 'GST is enabled. POS bills calculate tax using each menu item rate.' : 'GST Not Applicable. POS bills will not calculate or display GST.'}</div><button className="button primary" onClick={() => onSave(form)}>Save business profile</button></section><aside className="panel settings-summary"><div className="empty-icon">⚙</div><h2>{form.restaurantName || 'Your restaurant'}</h2><p>{form.city || 'Business profile'} · {form.gstApplicable ? 'GST enabled' : 'GST not applicable'}</p><button className="text-button" onClick={() => notify('Profile is editable below')}>Edit business profile ↓</button></aside></div></> }
function TiltCard({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null)
  const [style, setStyle] = useState(undefined)
  const handleMove = (event) => {
    const rect = ref.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    setStyle({ transform: `perspective(800px) translateY(-4px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)` })
  }
  const handleLeave = () => setStyle({ transform: 'perspective(800px) translateY(0) rotateY(0deg) rotateX(0deg)' })
  return <Tag ref={ref} className={`tilt-card ${className}`} style={style} onMouseMove={handleMove} onMouseLeave={handleLeave} {...rest}>{children}</Tag>
}
function PageTitle({ eyebrow, title, action, onAction }) { return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>Here is what is happening at your restaurant today.</p></div>{action && <button className="button primary" onClick={onAction}>+ {action}</button>}</div> }
function Stat({ label, value, change, iconName, tone }) { return <TiltCard className={`stat-card tone-${tone} spatial`}><div className={`stat-icon ${tone}`}>{iconName === 'chart' ? '◒' : iconName === 'receipt' ? '▤' : iconName === 'bag' ? '◫' : '♧'}</div><span className="stat-label">{label}</span><strong>{value}</strong>{change ? <small className={change[0] === '+' ? 'up' : 'down'}>{change} <em>vs yesterday</em></small> : <small className="up">● <em>Live</em></small>}</TiltCard> }
function AccountingSummary({ orders }) { const sales = orders.reduce((sum, order) => sum + order.amount, 0); const paid = orders.reduce((sum, order) => sum + (order.paidAmount || (order.paymentStatus === 'Paid' ? order.amount : 0)), 0); const outstanding = orders.reduce((sum, order) => sum + (order.outstandingAmount ?? (order.amount - (order.paidAmount || 0))), 0); const unpaid = orders.filter((order) => (order.paymentStatus || 'Unpaid') !== 'Paid').length; return <div className="accounting-summary"><div><span>Total sales</span><strong>{money(sales)}</strong></div><div><span>Paid amount</span><strong className="accounting-paid">{money(paid)}</strong></div><div><span>Outstanding</span><strong className="accounting-due">{money(outstanding)}</strong></div><div><span>Unpaid orders</span><strong>{unpaid}</strong></div></div> }
function Dashboard({ navigate, orders, tables, customers, now, festival, ownerName, restaurantName }) {
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const totalSales = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0)
  const pendingOrders = orders.filter((order) => !['Completed', 'Cancelled'].includes(order.status || 'New')).length
  const occupied = tables.filter((table) => table.status === 'Occupied').length
  const available = tables.filter((table) => table.status === 'Available').length
  const reserved = tables.filter((table) => table.status === 'Reserved').length
  const occupancyRate = tables.length ? Math.round((occupied / tables.length) * 100) : 0
  const occupiedPct = tables.length ? (occupied / tables.length) * 100 : 0
  const availablePct = tables.length ? (available / tables.length) * 100 : 0
  const itemSales = {}
  orders.forEach((order) => (order.items || []).forEach((line) => { itemSales[line.id] = itemSales[line.id] || { ...line, sold: 0, revenue: 0 }; itemSales[line.id].sold += line.quantity; itemSales[line.id].revenue += line.price * line.quantity }))
  const topItems = Object.values(itemSales).sort((a, b) => b.sold - a.sold).slice(0, 4)
  return <><TiltCard className="dashboard-hero spatial"><span className="spatial-blob spatial-blob-a" aria-hidden="true" /><span className="spatial-blob spatial-blob-b" aria-hidden="true" /><div><span className="eyebrow">OVERVIEW</span><h1>{greeting}, {ownerName}</h1><p className="hero-clock">{formatDate(now)} <b>{formatTime(now)}</b></p></div><button className="button primary" onClick={() => navigate('POS / Billing')}>+ New order</button></TiltCard>{festival && <FestivalBanner festival={festival} restaurantName={restaurantName} />}<div className="stats-grid"><Stat label="Total sales" value={money(totalSales)} iconName="chart" tone="orange" /><Stat label="Total orders" value={orders.length} iconName="receipt" tone="blue" /><Stat label="Pending orders" value={pendingOrders} iconName="bag" tone="yellow" /><Stat label="Total customers" value={customers.length} iconName="users" tone="green" /></div><div className="dashboard-grid"><TiltCard as="section" className="panel sales-panel spatial-panel"><div className="panel-head"><div><h2>Sales overview</h2><p>Revenue trend</p></div><button className="select">This week ⌄</button></div><div className="chart"><div className="chart-y"><span>₹60k</span><span>₹40k</span><span>₹20k</span><span>₹0</span></div><div className="chart-area"><div className="grid-lines" /><svg viewBox="0 0 640 190" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7c3aed" stopOpacity=".35" /><stop offset="1" stopColor="#ec4899" stopOpacity="0" /></linearGradient></defs><path d="M0 142 C55 128, 56 95, 112 115 S165 139, 218 91 S274 128, 325 76 S375 94, 430 64 S480 116, 535 82 S590 44, 640 32 L640 190 L0 190Z" fill="url(#area)" /><path d="M0 142 C55 128, 56 95, 112 115 S165 139, 218 91 S274 128, 325 76 S375 94, 430 64 S480 116, 535 82 S590 44, 640 32" fill="none" stroke="#7c3aed" strokeWidth="3" /></svg><div className="chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div></TiltCard><TiltCard as="section" className="panel occupancy spatial-panel"><div className="panel-head"><div><h2>Table occupancy</h2><p>{occupied} of {tables.length} tables occupied</p></div><span className="occupancy-rate">{occupancyRate}%</span></div><div className="donut" style={{ background: `conic-gradient(var(--orange) 0 ${occupiedPct}%, #dce8df ${occupiedPct}% ${occupiedPct + availablePct}%, #f4e9c8 ${occupiedPct + availablePct}% 100%)` }}><div><strong>{occupied}</strong><small>occupied</small></div></div><div className="legend"><span><i className="dot occupied" />Occupied <b>{occupied}</b></span><span><i className="dot available" />Available <b>{available}</b></span><span><i className="dot reserved" />Reserved <b>{reserved}</b></span></div><button className="text-button" onClick={() => navigate('Tables')}>Manage tables ↗</button></TiltCard></div><div className="lower-grid"><TiltCard as="section" className="panel recent spatial-panel"><div className="panel-head"><div><h2>Recent orders</h2><p>Latest transactions</p></div><button className="text-button" onClick={() => navigate('Orders')}>View all ↗</button></div><div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>TABLE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{orders.slice(0, 4).map((order) => <tr key={order.id}><td><strong>{order.id}</strong><small>{order.time}</small></td><td>{order.customer}</td><td>{order.table}</td><td><strong>{money(order.amount)}</strong></td><td><span className={`badge ${order.status.toLowerCase()}`}>{order.status}</span></td></tr>)}</tbody></table></div></TiltCard><TiltCard as="section" className="panel top-items spatial-panel"><div className="panel-head"><div><h2>Top selling items</h2><p>All-time</p></div></div>{topItems.length ? topItems.map((item) => <div className="top-item" key={item.id}><span className={`item-thumb ${item.image ? '' : (item.color || 'coral')}`}>{item.image ? <img src={item.image} alt={item.name} /> : item.name.slice(0, 1)}</span><div><strong>{item.name}</strong><small>{item.sold} sold</small></div><b>{money(item.revenue)}</b></div>) : <p className="module-empty">No sales yet — items will appear here once orders come in.</p>}</TiltCard></div></> }
function FunctionalPOS({ categories, category, setCategory, query, setQuery, items, addToCart, cart, updateQuantity, removeItem, subtotal, discount, discountPercent, gst, gstApplicable, total, payment, setPayment, orderType, setOrderType, selectedTable, setSelectedTable, customer, setCustomer, customers, createCustomer, tables, saveOrder, holdOrder, clearCart, heldOrders, setCart, notify, operations = {} }) {
  const availableTables = tables.filter((table) => table.status === 'Available')

  useEffect(() => {
    if (orderType !== 'Dine-in') return
    const currentAvailable = availableTables.some((table) => 'T-' + String(table.number).padStart(2, '0') === selectedTable)
    if (!currentAvailable) {
      const firstAvailable = availableTables[0]
      setSelectedTable(firstAvailable ? 'T-' + String(firstAvailable.number).padStart(2, '0') : '')
    }
  }, [tables, orderType, selectedTable, availableTables, setSelectedTable])
  const restoreHeld = (held) => { setCart(held.cart); setOrderType(held.orderType); setSelectedTable(held.selectedTable); setCustomer(held.customer); notify('Held order restored') }
  const cartPanelRef = useRef(null)
  const mobileCartBarRef = useRef(null)
  const getCartTargetPoint = () => {
    if (window.innerWidth <= 1100) {
      if (mobileCartBarRef.current) {
        const r = mobileCartBarRef.current.getBoundingClientRect()
        return { x: r.left + 26, y: r.top + r.height / 2 }
      }
      return { x: window.innerWidth / 2, y: window.innerHeight - 30 }
    }
    if (cartPanelRef.current) {
      const r = cartPanelRef.current.getBoundingClientRect()
      return { x: r.left + 34, y: r.top + 34 }
    }
    return { x: window.innerWidth - 40, y: 40 }
  }
  const addCardItem = (item, event) => {
    addToCart(item)
    const cardEl = event?.currentTarget?.closest?.('.menu-card')
    const sourceEl = cardEl?.querySelector('.food-art')
    flyItemToCart(sourceEl, item, getCartTargetPoint())
  }
  void gstApplicable
  const orderTypes = ['Dine-in', 'Takeaway', ...(operations.deliveryOrders ? ['Delivery'] : [])]
  const [mobileCartOpen, setMobileCartOpen] = useState(false)
  const cartDrawerOpen = mobileCartOpen && cart.length > 0
  return <><PageTitle eyebrow="POINT OF SALE" title="Create a new bill" action="New bill" onAction={clearCart} /><div className="pos-layout functional-pos"><section className="pos-menu"><div className="pos-toolbar"><div className="search-field">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search menu items" /></div><button className="filter-button">Filter ⌄</button></div><div className="category-row">{categories.map((item) => <button className={category === item ? 'selected' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><div className="menu-grid">{items.map((item) => <article className="menu-card" key={item.id} onClick={(event) => addCardItem(item, event)} onKeyDown={(event) => event.key === 'Enter' && addCardItem(item, event)} role="button" tabIndex={0}><div className={`food-art ${item.image ? '' : item.color}`}>{item.image && <img src={item.image} alt={item.name} />}<span>{item.type === 'Veg' ? '●' : '◆'}</span></div><div className="menu-card-body"><span className={`food-type ${item.type === 'Veg' ? 'veg' : 'nonveg'}`}>{item.type}</span><h3>{item.name}</h3><small>{item.category}</small><div><strong>{money(item.price)}</strong><button className="add-button" onClick={(event) => { event.stopPropagation(); addCardItem(item, event) }}>+ Add</button></div></div></article>)}</div></section>{cartDrawerOpen && <div className="mobile-cart-backdrop" onClick={() => setMobileCartOpen(false)} />}<aside ref={cartPanelRef} className={`cart-panel ${cartDrawerOpen ? 'mobile-open' : ''}`}><div className="cart-head"><div><span className="eyebrow">CURRENT ORDER</span><h2>New order</h2></div><button className="icon-button mobile-close-cart" onClick={() => setMobileCartOpen(false)}>×</button><button className="button quiet" onClick={clearCart}>Clear</button></div><div className="order-type"><span>ORDER TYPE</span><div>{['Dine-in', 'Takeaway', 'Delivery'].map((type) => <button className={orderType === type ? 'selected' : ''} onClick={() => setOrderType(type)} key={type}>{type}</button>)}</div></div><div className="pos-fields"><label>Customer<Picker value={customer} onChange={setCustomer} options={customers} /></label><button className="text-button add-customer" onClick={createCustomer}>+ New customer</button>{orderType === 'Dine-in' && <label>Table<Picker value={selectedTable} onChange={setSelectedTable} options={availableTables.map((table) => { const code = 'T-' + String(table.number).padStart(2, '0'); return { value: code, label: code + ' · Available' } })} /></label>}</div><div className="cart-items">{cart.length ? cart.map((item) => <div className="cart-item" key={item.id}><div className={`mini-art ${item.image ? '' : item.color}`}>{item.image ? <img src={item.image} alt={item.name} /> : item.name.slice(0, 1)}</div><div className="cart-item-info"><strong>{item.name}</strong><small>{money(item.price)} each</small></div><div className="quantity"><button onClick={() => updateQuantity(item.id, -1)}>−</button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.id, 1)}>+</button></div><strong>{money(item.price * item.quantity)}</strong><button className="remove-item" onClick={() => removeItem(item.id)}>×</button></div>) : <div className="cart-empty">Your cart is empty<br /><small>Add menu items to begin</small></div>}</div><div className="bill-summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div>{discountPercent > 0 && <div><span>Discount <small>({discountPercent}%)</small></span><b className="discount">− {money(discount)}</b></div>}<div><span>GST <small>(5%)</small></span><b>{money(gst)}</b></div><div className="grand-total"><span>Total</span><strong>{money(total)}</strong></div></div><div className="payment-select"><span>PAYMENT METHOD</span><div>{['Cash', 'UPI', 'Card'].map((method) => <button className={payment === method ? 'selected' : ''} onClick={() => setPayment(method)} key={method}>{method}</button>)}</div></div><div className="pos-actions"><button className="button secondary" onClick={holdOrder}>Hold order</button><button className="button secondary" onClick={() => saveOrder('Pending')}>Save order</button></div><button className="button primary wide" onClick={() => saveOrder('Completed', 'Paid')}>Complete payment · {money(total)}</button>{heldOrders.length > 0 && <div className="held-orders"><span>HELD ORDERS</span>{heldOrders.map((held, index) => <button key={`${held.id}-${index}`} onClick={() => restoreHeld(held)}>{held.id} · {money(held.total)}</button>)}</div>}</aside>{cart.length > 0 && !cartDrawerOpen && <button ref={mobileCartBarRef} className="mobile-cart-bar" onClick={() => setMobileCartOpen(true)}><span>🛒 {cart.reduce((sum, item) => sum + item.quantity, 0)} items</span><strong>{money(total)}</strong><b>View bill ▲</b></button>}</div></>
}
function LegacyOrdersBase({ orders }) { const [filter, setFilter] = useState('All orders'); const [collecting, setCollecting] = useState(null); const [amount, setAmount] = useState(''); const [method, setMethod] = useState('Cash'); const collect = () => { if (window.basilCollectPayment) window.basilCollectPayment(collecting, amount, method); setCollecting(null); setAmount('') }; return <><PageTitle eyebrow="ORDER MANAGEMENT" title="Orders" action="New order" /><div className="filter-tabs">{['All orders', 'New', 'Preparing', 'Ready', 'Served'].map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><section className="panel order-table"><div className="table-wrap"><table><thead><tr><th>ORDER / KOT</th><th>DATE / TIME</th><th>TABLE / TYPE</th><th>CUSTOMER</th><th>TOTAL</th><th>PAID</th><th>OUTSTANDING</th><th>PAYMENT</th><th>KITCHEN</th><th /></tr></thead><tbody>{orders.filter((order) => filter === 'All orders' || (order.kitchenStatus || 'New') === filter).map((order) => <tr key={order.id}><td><strong>{order.id}</strong><small>{order.kotNumber || 'KOT pending'}</small></td><td>{order.time}</td><td>{order.table}<small>{order.orderType || 'Dine-in'}</small></td><td>{order.customer}</td><td><strong>{money(order.amount)}</strong></td><td>{money(order.paidAmount || 0)}</td><td>{money(order.outstandingAmount ?? order.amount)}</td><td><span className={`badge ${(order.paymentStatus || 'Unpaid').toLowerCase().replace(' ', '-')}`}>{order.paymentStatus || 'Unpaid'}</span>{order.paymentMethod && <small>{order.paymentMethod}</small>}</td><td><span className={`badge ${(order.kitchenStatus || 'New').toLowerCase()}`}>{order.kitchenStatus || 'New'}</span></td><td>{(order.outstandingAmount ?? order.amount) > 0 && <button className="text-button" onClick={() => { setCollecting(order); setAmount(String(order.outstandingAmount ?? order.amount)) }}>Collect</button>}</td></tr>)}</tbody></table></div></section>{collecting && <div className="payment-dialog"><div className="panel"><h2>Collect payment</h2><p>Outstanding: <strong>{money(collecting.outstandingAmount ?? collecting.amount)}</strong></p><label>Amount received<input type="number" min="1" max={collecting.outstandingAmount ?? collecting.amount} value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label>Payment method<select value={method} onChange={(event) => setMethod(event.target.value)}><option>Cash</option><option>UPI</option><option>Card</option></select></label><div className="cart-actions"><button className="button secondary" onClick={() => setCollecting(null)}>Cancel</button><button className="button primary" onClick={collect}>Record payment</button></div></div></div>}</> }
function ManagedTables({ tables, setTables, orders, notify }) { const [search, setSearch] = useState(''); const [editing, setEditing] = useState(null); const [form, setForm] = useState({ number: '', name: '', capacity: 4, status: 'Available' }); const openForm = (table = null) => { setEditing(table?.number || 'new'); setForm(table ? { number: table.number, name: table.name || `Table ${table.number}`, capacity: table.capacity, status: table.status } : { number: Math.max(0, ...tables.map((item) => item.number)) + 1, name: '', capacity: 4, status: 'Available' }) }; const save = () => { const next = { ...form, number: Number(form.number), capacity: Number(form.capacity), amount: editing === 'new' ? 0 : (tables.find((table) => table.number === Number(form.number))?.amount || 0) }; setTables((current) => editing === 'new' ? [...current, next] : current.map((table) => table.number === next.number ? next : table)); setEditing(null); notify('Table saved') }; const remove = (number) => { if (orders.some((order) => order.table === `T-${String(number).padStart(2, '0')}` && order.kitchenStatus !== 'Served')) return notify('Active table orders cannot be deleted'); setTables((current) => current.filter((table) => table.number !== number)); notify('Table deleted') }; const shown = tables.filter((table) => `${table.number} ${table.name || ''} ${table.status}`.toLowerCase().includes(search.toLowerCase())); return <><PageTitle eyebrow="FLOOR PLAN" title="Tables" action="Add table" onAction={() => openForm()} /><div className="table-toolbar"><div className="search-field">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tables" /></div><div className="table-status-legend"><span><i className="dot occupied" />Occupied</span><span><i className="dot available" />Available</span><span><i className="dot reserved" />Reserved</span></div></div>{editing && <div className="panel table-editor"><h2>{editing === 'new' ? 'Add table' : 'Edit table'}</h2><div className="settings-form-grid"><label>Table number<input type="number" value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} /></label><label>Table name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Window table" /></label><label>Capacity<input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></label><label>Status<Picker value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={['Available', 'Reserved', 'Occupied']} /></label></div><div className="cart-actions"><button className="button secondary" onClick={() => setEditing(null)}>Cancel</button><button className="button primary" onClick={save}>Save table</button></div></div>}<div className="floor-grid">{shown.map((table) => <div className={`floor-table-wrap ${table.status.toLowerCase()}`} key={table.number}><button className={`floor-table ${table.status.toLowerCase()}`} onClick={() => table.status === 'Available' ? (setTables(tables.map((item) => item.number === table.number ? { ...item, status: 'Occupied' } : item)), notify(`Table T-${String(table.number).padStart(2, '0')} is now occupied`)) : notify(`Table is ${table.status.toLowerCase()}`)}><span className="table-number">T-{String(table.number).padStart(2, '0')}</span><strong>{table.name || `Table ${table.number}`}</strong><small>{table.capacity} seats · {table.status} {table.amount ? `· ${money(table.amount)}` : ''}</small></button><div className="table-actions"><button onClick={() => openForm(table)}>Edit</button>{table.status !== 'Occupied' && <button onClick={() => setTables(tables.map((item) => item.number === table.number ? { ...item, status: item.status === 'Reserved' ? 'Available' : 'Reserved' } : item))}>{table.status === 'Reserved' ? 'Available' : 'Reserve'}</button>}<button onClick={() => remove(table.number)}>Delete</button></div></div>)}</div></> }
function LegacyKitchen({ kots, setKots, orders, setOrders, tables, setTables, notify, onPrintKot }) { const updateKitchen = (kot, status) => { setKots((current) => current.map((item) => item.id === kot.id ? { ...item, status } : item)); setOrders((current) => current.map((order) => order.id === kot.orderNumber ? { ...order, kitchenStatus: status } : order)); if (status === 'Served' && kot.orderType === 'Dine-in') setTables((current) => current.map((table) => `T-${String(table.number).padStart(2, '0')}` === kot.table ? { ...table, status: 'Available', amount: 0, currentOrder: null } : table)); notify(`${kot.id} marked ${status.toLowerCase()}`) }; return <><PageTitle eyebrow="KITCHEN DISPLAY" title="Kitchen orders" action="Refresh orders" onAction={() => notify('Kitchen queue refreshed')} /><div className="kitchen-grid">{kots.length ? kots.map((kot) => <article className="panel kitchen-card" key={kot.id}><div className="kitchen-card-head"><div><span className="eyebrow">{kot.id}</span><h2>{kot.orderNumber}</h2></div><span className={`badge ${(kot.status || 'New').toLowerCase()}`}>{kot.status}</span></div><div className="kitchen-meta"><span>{kot.table}</span><span>{kot.orderType}</span><span>{kot.customer}</span><span>{kot.time}</span></div><div className="kitchen-items">{kot.items.map((item) => <div key={item.id}><span>{item.quantity} ×</span><strong>{item.name}</strong></div>)}</div><div className="kitchen-controls">{kot.status === 'New' && <button className="button primary" onClick={() => updateKitchen(kot, 'Preparing')}>Start preparing</button>}{kot.status === 'Preparing' && <button className="button primary" onClick={() => updateKitchen(kot, 'Ready')}>Mark ready</button>}{kot.status === 'Ready' && <button className="button primary" onClick={() => updateKitchen(kot, 'Served')}>Mark served</button>}{kot.status === 'Served' && <span className="served-label">✓ Served</span>}<button className="button secondary" onClick={() => onPrintKot(kot)}>Print KOT</button></div></article>) : <section className="panel empty-state"><div className="empty-icon">♨</div><h2>No kitchen tickets yet</h2><p>Save an order from POS to send it to the kitchen.</p></section>}</div></> }
function SharedTables({ tables, setTables, notify }) { return <><PageTitle eyebrow="FLOOR PLAN" title="Tables" action="Refresh floor" onAction={() => notify('Floor plan is up to date')} /><div className="table-status-legend"><span><i className="dot occupied" />Occupied</span><span><i className="dot available" />Available</span><span><i className="dot reserved" />Reserved</span></div><div className="floor-grid">{tables.map((table) => <button className={`floor-table ${table.status.toLowerCase()}`} key={table.number} onClick={() => table.status === 'Available' ? (setTables(tables.map((item) => item.number === table.number ? { ...item, status: 'Occupied' } : item)), notify(`Table T-${String(table.number).padStart(2, '0')} is now occupied`)) : notify(`Table is ${table.status.toLowerCase()}`)}><span className="table-number">T-{String(table.number).padStart(2, '0')}</span><strong>{table.status}</strong><small>{table.capacity} seats {table.amount ? `· ${money(table.amount)}` : ''}</small></button>)}</div></> }
function CustomerLedger({ customers, orders, paymentTransactions, notify }) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [collectPaymentFor, setCollectPaymentFor] = useState(null);

  const customerRows = customers.map((name) => {
    const customerOrders = orders.filter(
      (order) => order.customer === name
    );

    const totalSales = customerOrders.reduce(
      (sum, order) => sum + Number(order.amount || 0),
      0
    );

    const totalPaid = customerOrders.reduce(
      (sum, order) =>
        sum + Number(
          order.paidAmount ??
          (order.paymentStatus === 'Paid' ? order.amount : 0)
        ),
      0
    );

    return {
      name,
      orders: customerOrders,
      totalSales,
      totalPaid,
      outstanding: Math.max(0, totalSales - totalPaid)
    };
  });

  const totalSales = customerRows.reduce(
    (sum, customer) => sum + customer.totalSales,
    0
  );

  const totalPaid = customerRows.reduce(
    (sum, customer) => sum + customer.totalPaid,
    0
  );

  const totalOutstanding = customerRows.reduce(
    (sum, customer) => sum + customer.outstanding,
    0
  );

  if (selectedCustomer) {
    const customer = customerRows.find(
      (item) => item.name === selectedCustomer
    );

    return (
      <>
        <PageTitle
          eyebrow="CUSTOMER LEDGER"
          title={customer.name}
          action="Back to customers"
          onAction={() => setSelectedCustomer(null)}
        />

        {collectPaymentFor && (
          <PromptDialog
            title={`Collect payment - outstanding ${money(collectPaymentFor.outstanding)}`}
            fields={[
              { key: 'amount', label: 'Payment amount', type: 'number', default: String(collectPaymentFor.outstanding) },
              { key: 'method', label: 'Payment method', type: 'select', default: 'Cash', options: ['Cash', 'UPI', 'Card'] }
            ]}
            confirmLabel="Collect"
            onCancel={() => setCollectPaymentFor(null)}
            onConfirm={(values) => {
              const paymentAmount = Number(values.amount);
              if (!paymentAmount || paymentAmount <= 0) { notify('Enter a valid payment amount'); return; }
              if (paymentAmount > collectPaymentFor.outstanding) { notify('Payment cannot exceed outstanding amount'); return; }
              const unpaidOrder = collectPaymentFor.orders.find(
                (order) => Number(order.amount || 0) - Number(order.paidAmount || 0) > 0
              );
              if (!unpaidOrder) { notify('No outstanding order found'); setCollectPaymentFor(null); return; }
              if (typeof window.basilCollectPayment === 'function') {
                window.basilCollectPayment(unpaidOrder, paymentAmount, values.method || 'Cash');
                notify('Payment recorded successfully');
              } else {
                notify('Payment system is unavailable');
              }
              setCollectPaymentFor(null);
            }}
          />
        )}

        <div className="summary-grid">
          <article className="summary-card">
            <span>Total Sales</span>
            <strong>{money(customer.totalSales)}</strong>
          </article>

          <article className="summary-card">
            <span>Total Paid</span>
            <strong>{money(customer.totalPaid)}</strong>
          </article>

          <article className="summary-card">
  <span>Outstanding</span>
  <strong>{money(customer.outstanding)}</strong>

  {customer.outstanding > 0 && (
    <button
      className="button primary"
      style={{ marginTop: 12 }}
      onClick={() => setCollectPaymentFor(customer)}
    >
      Collect Payment
    </button>
  )}
</article>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">ORDER HISTORY</span>
              <h2>{customer.name}</h2>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date / Time</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {customer.orders.length ? (
                  customer.orders.map((order) => {
                    const paid = Number(
                      order.paidAmount ??
                      (order.paymentStatus === 'Paid'
                        ? order.amount
                        : 0)
                    );

                    const due = Math.max(
                      0,
                      Number(order.amount || 0) - paid
                    );

                    return (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong></td>
                        <td>{order.time || '—'}</td>
                        <td>{money(order.amount || 0)}</td>
                        <td>{money(paid)}</td>
                        <td>{money(due)}</td>
                        <td>
                          <span className={`badge ${(order.paymentStatus || 'Unpaid').toLowerCase().replace(' ', '-')}`}>
                            {order.paymentStatus || 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6">
                      No orders found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PAYMENT HISTORY</span>
              <h2>Transactions</h2>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {paymentTransactions.filter((transaction) =>
                  customer.orders.some(
                    (order) => order.id === transaction.orderNumber
                  )
                ).map((transaction, index) => (
                  <tr key={`${transaction.orderNumber}-${index}`}>
                    <td>{transaction.orderNumber}</td>
                    <td>{money(transaction.amount || 0)}</td>
                    <td>{transaction.method || '—'}</td>
                    <td>{transaction.time || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageTitle
        eyebrow="CUSTOMER MANAGEMENT"
        title="Customer Ledger"
        action="Refresh"
        onAction={() => notify('Customer ledger refreshed')}
      />

      <div className="summary-grid">
        <article className="summary-card">
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </article>

        <article className="summary-card">
          <span>Total Sales</span>
          <strong>{money(totalSales)}</strong>
        </article>

        <article className="summary-card">
          <span>Total Paid</span>
          <strong>{money(totalPaid)}</strong>
        </article>

        <article className="summary-card">
          <span>Total Outstanding</span>
          <strong>{money(totalOutstanding)}</strong>
        </article>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">CUSTOMERS</span>
            <h2>Customer-wise Balance</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Orders</th>
                <th>Total Sales</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>View</th>
              </tr>
            </thead>

            <tbody>
              {customerRows.map((customer) => (
                <tr key={customer.name}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.orders.length}</td>
                  <td>{money(customer.totalSales)}</td>
                  <td>{money(customer.totalPaid)}</td>
                  <td>
                    <strong>{money(customer.outstanding)}</strong>
                  </td>
                  <td>
                    <button
                      className="button secondary"
                      onClick={() => setSelectedCustomer(customer.name)}
                    >
                      View Ledger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function PartyLedgerPage({ parties, setParties, transactions, setTransactions, notify }) {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [txnForm, setTxnForm] = useState(null);

  const balanceOf = (partyId) => {
    const party = parties.find((item) => item.id === partyId);
    const opening = Number(party?.openingBalance) || 0;
    return transactions.filter((item) => item.partyId === partyId).reduce((sum, item) => sum + (item.type === 'You Gave' ? Number(item.amount) : -Number(item.amount)), opening);
  };

  const saveParty = () => {
    const item = { ...form, id: form.id || `party-${Date.now()}`, openingBalance: Number(form.openingBalance) || 0 };
    setParties((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? item : entry) : [...current, item]);
    setForm(null);
    notify('Party saved');
  };

  const deleteParty = (id) => {
    setParties((current) => current.filter((entry) => entry.id !== id));
    setTransactions((current) => current.filter((entry) => entry.partyId !== id));
    setSelectedParty(null);
    notify('Party deleted');
  };

  const saveTxn = () => {
    const txn = { id: `txn-${Date.now()}`, partyId: selectedParty, type: txnForm.type, amount: Number(txnForm.amount) || 0, note: txnForm.note || '', date: new Date().toISOString().slice(0, 10) };
    setTransactions((current) => [txn, ...current]);
    setTxnForm(null);
    notify('Entry added');
  };

  const totalReceivable = parties.reduce((sum, item) => sum + Math.max(0, balanceOf(item.id)), 0);
  const totalPayable = parties.reduce((sum, item) => sum + Math.max(0, -balanceOf(item.id)), 0);

  if (selectedParty) {
    const party = parties.find((item) => item.id === selectedParty);
    const balance = balanceOf(selectedParty);
    const rows = transactions.filter((item) => item.partyId === selectedParty).sort((a, b) => (a.id < b.id ? 1 : -1));

    return (
      <>
        <PageTitle eyebrow="PARTY LEDGER" title={party.name} action="Back to parties" onAction={() => setSelectedParty(null)} />

        <div className="summary-grid">
          <article className="summary-card"><span>{balance >= 0 ? "You'll Get" : "You'll Give"}</span><strong className={balance >= 0 ? 'accounting-paid' : 'accounting-due'}>{money(Math.abs(balance))}</strong></article>
          <article className="summary-card"><span>Mobile</span><strong>{party.mobile || '—'}</strong></article>
          <article className="summary-card"><span>Total entries</span><strong>{rows.length}</strong></article>
        </div>

        <div className="cart-actions" style={{ justifyContent: 'flex-start', gap: 12, marginBottom: 18 }}>
          <button className="button secondary" onClick={() => setTxnForm({ type: 'You Gave', amount: '', note: '' })}>+ You Gave</button>
          <button className="button secondary" onClick={() => setTxnForm({ type: 'You Got', amount: '', note: '' })}>+ You Got</button>
          <button className="text-button" onClick={() => setForm(party)}>Edit party</button>
          <button className="text-button" onClick={() => deleteParty(party.id)}>Delete party</button>
        </div>

        {txnForm && (
          <div className="panel module-editor">
            <h2>{txnForm.type}</h2>
            <div className="settings-form-grid">
              <label>Amount<input type="number" value={txnForm.amount} onChange={(event) => setTxnForm({ ...txnForm, amount: event.target.value })} /></label>
              <label>Note<input value={txnForm.note} onChange={(event) => setTxnForm({ ...txnForm, note: event.target.value })} placeholder="Optional" /></label>
            </div>
            <div className="cart-actions">
              <button className="button secondary" onClick={() => setTxnForm(null)}>Cancel</button>
              <button className="button primary" onClick={saveTxn}>Save entry</button>
            </div>
          </div>
        )}

        {form && (
          <div className="panel module-editor">
            <h2>Edit party</h2>
            <div className="settings-form-grid">
              <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Mobile<input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></label>
              <label>Opening balance<input type="number" value={form.openingBalance} onChange={(event) => setForm({ ...form, openingBalance: event.target.value })} /></label>
            </div>
            <div className="cart-actions">
              <button className="button secondary" onClick={() => setForm(null)}>Cancel</button>
              <button className="button primary" onClick={saveParty}>Save party</button>
            </div>
          </div>
        )}

        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">ENTRIES</span><h2>Transaction history</h2></div></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Type</th><th>Note</th><th>Amount</th></tr></thead>
              <tbody>
                {rows.length ? rows.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td><span className={`badge ${item.type === 'You Gave' ? 'unpaid' : 'paid'}`}>{item.type}</span></td>
                    <td>{item.note || '—'}</td>
                    <td>{money(item.amount)}</td>
                  </tr>
                )) : <tr><td colSpan="4">No entries yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageTitle eyebrow="PARTY LEDGER" title="Party Ledger" action="Add party" onAction={() => setForm({ name: '', mobile: '', openingBalance: 0 })} />

      <div className="summary-grid">
        <article className="summary-card"><span>Total Parties</span><strong>{parties.length}</strong></article>
        <article className="summary-card"><span>You'll Get</span><strong className="accounting-paid">{money(totalReceivable)}</strong></article>
        <article className="summary-card"><span>You'll Give</span><strong className="accounting-due">{money(totalPayable)}</strong></article>
      </div>

      {form && (
        <div className="panel module-editor">
          <h2>{form.id ? 'Edit party' : 'New party'}</h2>
          <div className="settings-form-grid">
            <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Mobile<input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></label>
            <label>Opening balance<input type="number" value={form.openingBalance} onChange={(event) => setForm({ ...form, openingBalance: event.target.value })} /></label>
          </div>
          <div className="cart-actions">
            <button className="button secondary" onClick={() => setForm(null)}>Cancel</button>
            <button className="button primary" onClick={saveParty}>Save party</button>
          </div>
        </div>
      )}

      <section className="panel">
        <div className="module-toolbar"><div className="search-field">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search parties" /></div></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Party</th><th>Mobile</th><th>Balance</th><th>View</th></tr></thead>
            <tbody>
              {parties.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).map((item) => {
                const balance = balanceOf(item.id);
                return (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.mobile || '—'}</td>
                    <td><strong className={balance >= 0 ? 'accounting-paid' : 'accounting-due'}>{money(Math.abs(balance))} {balance >= 0 ? '(Get)' : '(Give)'}</strong></td>
                    <td><button className="button secondary" onClick={() => setSelectedParty(item.id)}>View Ledger</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!parties.length && <p className="module-empty">No parties added yet.</p>}
      </section>
    </>
  );
}
function MenuPage({ menu, setMenu, notify }) { const [search, setSearch] = useState(''); const [form, setForm] = useState(null); const colors = ['coral', 'gold', 'green', 'cream', 'orange', 'yellow', 'brown', 'pink']; const save = () => { const item = { ...form, id: form.id || Date.now(), price: Number(form.price) || 0, gstRate: Number(form.gstRate) || 0, available: form.available !== false }; setMenu((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? item : entry) : [...current, item]); setForm(null); notify('Menu item saved') }; const pickImage = (event) => { const file = event.target.files[0]; if (!file) return; resizeImage(file, 480, (dataUrl) => setForm((current) => ({ ...current, image: dataUrl }))) }; return <ModuleFrame title="Menu / Items" action="Add menu item" onAction={() => setForm({ name: '', category: 'Starters', price: 0, type: 'Veg', gstRate: 5, color: 'coral', available: true, image: '' })}><div className="module-toolbar"><div className="search-field">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu items" /></div></div>{form && <div className="panel module-editor"><h2>{form.id ? 'Edit menu item' : 'New menu item'}</h2><div className="settings-form-grid"><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label>Price<input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label>GST rate (%)<input type="number" value={form.gstRate} onChange={(event) => setForm({ ...form, gstRate: event.target.value })} /></label><label>Type<Picker value={form.type} onChange={(value) => setForm({ ...form, type: value })} options={['Veg', 'Non-veg']} /></label><label>Card color<Picker value={form.color} onChange={(value) => setForm({ ...form, color: value })} options={colors} /></label><label className="full-field">Item photo<input type="file" accept="image/*" onChange={pickImage} />{form.image && <div className="photo-preview"><img src={form.image} alt="Preview" /><button type="button" className="text-button" onClick={() => setForm({ ...form, image: '' })}>Remove photo</button></div>}</label></div><div className="cart-actions"><button className="button secondary" onClick={() => setForm(null)}>Cancel</button><button className="button primary" onClick={save}>Save item</button></div></div>}{menu.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())).map((item) => <div className="module-row" key={item.id}><div className="module-row-title">{item.image ? <img src={item.image} alt={item.name} className="module-thumb" /> : <span className={`item-thumb ${item.color}`}>{item.name.slice(0, 1)}</span>}<div><strong>{item.name}</strong><small>{item.category} · {item.type} · GST {item.gstRate}%</small></div></div><b>{money(item.price)}</b><span className={item.available === false ? 'low-stock' : ''}>{item.available === false ? 'Unavailable' : 'Available'}</span><button className="text-button" onClick={() => setForm(item)}>Edit</button><button className="text-button" onClick={() => setMenu((current) => current.map((entry) => entry.id === item.id ? { ...entry, available: entry.available === false } : entry))}>{item.available === false ? 'Enable' : 'Disable'}</button><button className="text-button" onClick={() => setMenu((current) => current.filter((entry) => entry.id !== item.id))}>Delete</button></div>)}</ModuleFrame> }
function StaffPage({ staff, setStaff, notify }) { const [form, setForm] = useState(null); const roles = ['Manager', 'Cashier', 'Waiter', 'Chef', 'Delivery']; const save = () => { const item = { ...form, id: form.id || `staff-${Date.now()}` }; setStaff((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? item : entry) : [...current, item]); setForm(null); notify('Staff member saved') }; return <ModuleFrame title="Staff" action="Add staff" onAction={() => setForm({ name: '', role: 'Waiter', mobile: '', pin: '', active: true })}>{form && <div className="panel module-editor"><h2>{form.id ? 'Edit staff' : 'New staff'}</h2><div className="settings-form-grid"><label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Role<Picker value={form.role} onChange={(value) => setForm({ ...form, role: value })} options={roles} /></label><label>Mobile<input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></label><label>Login PIN<input value={form.pin} onChange={(event) => setForm({ ...form, pin: event.target.value })} placeholder="4-digit PIN" /></label></div><div className="cart-actions"><button className="button secondary" onClick={() => setForm(null)}>Cancel</button><button className="button primary" onClick={save}>Save staff</button></div></div>}{staff.length ? staff.map((item) => <div className="module-row" key={item.id}><div><strong>{item.name}</strong><small>{item.role} · {item.mobile || 'No mobile'}</small></div><span className={item.active === false ? 'low-stock' : ''}>{item.active === false ? 'Inactive' : 'Active'}</span><button className="text-button" onClick={() => setForm(item)}>Edit</button><button className="text-button" onClick={() => setStaff((current) => current.map((entry) => entry.id === item.id ? { ...entry, active: entry.active === false } : entry))}>{item.active === false ? 'Activate' : 'Deactivate'}</button><button className="text-button" onClick={() => setStaff((current) => current.filter((entry) => entry.id !== item.id))}>Delete</button></div>) : <p className="module-empty">No staff added yet.</p>}</ModuleFrame> }
function ExpensePage({ expenses, setExpenses, notify }) { const [form, setForm] = useState(null); const categories = ['Rent', 'Salaries', 'Utilities', 'Maintenance', 'Marketing', 'Supplies', 'Other']; const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0); const save = () => { const item = { ...form, id: form.id || `exp-${Date.now()}`, amount: Number(form.amount) || 0 }; setExpenses((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? item : entry) : [item, ...current]); setForm(null); notify('Expense saved') }; return <ModuleFrame title="Expenses" action="Add expense" onAction={() => setForm({ date: new Date().toISOString().slice(0, 10), category: 'Other', description: '', amount: 0, paymentMethod: 'Cash' })}><div className="accounting-summary"><div><span>Total expenses</span><strong>{money(total)}</strong></div></div>{form && <div className="panel module-editor"><h2>{form.id ? 'Edit expense' : 'New expense'}</h2><div className="settings-form-grid"><label>Date<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label>Category<Picker value={form.category} onChange={(value) => setForm({ ...form, category: value })} options={categories} /></label><label>Description<input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label>Amount<input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label><label>Payment method<Picker value={form.paymentMethod} onChange={(value) => setForm({ ...form, paymentMethod: value })} options={['Cash', 'UPI', 'Card', 'Bank Transfer']} /></label></div><div className="cart-actions"><button className="button secondary" onClick={() => setForm(null)}>Cancel</button><button className="button primary" onClick={save}>Save expense</button></div></div>}{expenses.length ? expenses.map((item) => <div className="module-row" key={item.id}><div><strong>{item.description || item.category}</strong><small>{item.category} · {item.date}</small></div><b>{money(item.amount)}</b><span>{item.paymentMethod}</span><button className="text-button" onClick={() => setForm(item)}>Edit</button><button className="text-button" onClick={() => setExpenses((current) => current.filter((entry) => entry.id !== item.id))}>Delete</button></div>) : <p className="module-empty">No expenses recorded yet.</p>}</ModuleFrame> }
function PaymentsPage({ paymentTransactions, orders }) { const [filter, setFilter] = useState('All methods'); const methods = ['All methods', 'Cash', 'UPI', 'Card']; const rows = paymentTransactions.filter((transaction) => filter === 'All methods' || transaction.method === filter); const totals = ['Cash', 'UPI', 'Card'].map((method) => ({ method, total: paymentTransactions.filter((transaction) => transaction.method === method).reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0) })); const grandTotal = paymentTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0); return <><PageTitle eyebrow="PAYMENTS" title="Payment reconciliation" /><div className="summary-grid">{totals.map((entry) => <article className="summary-card" key={entry.method}><span>{entry.method}</span><strong>{money(entry.total)}</strong></article>)}<article className="summary-card"><span>Total collected</span><strong>{money(grandTotal)}</strong></article></div><div className="filter-tabs">{methods.map((method) => <button className={filter === method ? 'active' : ''} onClick={() => setFilter(method)} key={method}>{method}</button>)}</div><section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Method</th><th>Time</th></tr></thead><tbody>{rows.length ? rows.map((transaction, index) => <tr key={`${transaction.orderNumber}-${index}`}><td>{transaction.orderNumber}</td><td>{orders.find((order) => order.id === transaction.orderNumber)?.customer || '—'}</td><td>{money(transaction.amount)}</td><td>{transaction.method}</td><td>{transaction.time}</td></tr>) : <tr><td colSpan="5">No payments recorded yet.</td></tr>}</tbody></table></div></section></> }
function ReportsPage({ orders, inventory, expenses = [], parties = [], partyTransactions = [] }) {
  const totalSales = orders.reduce((sum, order) => sum + Number(order.amount || 0), 0)
  const totalDiscount = orders.reduce((sum, order) => sum + Number(order.discount || 0), 0)
  const totalGst = orders.reduce((sum, order) => sum + Number(order.gst || 0), 0)
  const totalCollected = orders.reduce((sum, order) => sum + Number(order.paidAmount || 0), 0)
  const totalOutstanding = orders.reduce((sum, order) => sum + Number(order.outstandingAmount ?? (order.amount - (order.paidAmount || 0))), 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const netProfit = totalCollected - totalExpenses
  const avgOrderValue = orders.length ? totalSales / orders.length : 0

  const paymentBreakup = ['Cash', 'UPI', 'Card'].map((method) => ({ method, total: orders.filter((order) => order.paymentMethod === method).reduce((sum, order) => sum + Number(order.paidAmount || 0), 0) }))

  const expenseByCategory = {}
  expenses.forEach((item) => { const key = item.category || 'Other'; expenseByCategory[key] = (expenseByCategory[key] || 0) + Number(item.amount || 0) })
  const expenseRows = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])

  const balanceOf = (partyId) => {
    const party = parties.find((item) => item.id === partyId)
    const opening = Number(party?.openingBalance) || 0
    return partyTransactions.filter((item) => item.partyId === partyId).reduce((sum, item) => sum + (item.type === 'You Gave' ? Number(item.amount) : -Number(item.amount)), opening)
  }
  const totalReceivable = parties.reduce((sum, item) => sum + Math.max(0, balanceOf(item.id)), 0)
  const totalPayable = parties.reduce((sum, item) => sum + Math.max(0, -balanceOf(item.id)), 0)

  const itemSales = {}
  orders.forEach((order) => (order.items || []).forEach((line) => { const key = line.name; itemSales[key] = itemSales[key] || { name: line.name, category: line.category, sold: 0, revenue: 0 }; itemSales[key].sold += line.quantity; itemSales[key].revenue += Number(line.price || 0) * line.quantity }))
  const topItems = Object.values(itemSales).sort((a, b) => b.sold - a.sold)

  const lowStock = inventory.filter((item) => item.currentStock <= item.minimumStock)

  return <>
    <PageTitle eyebrow="REPORTS" title="Financial report" />
    <div className="summary-grid">
      <article className="summary-card"><span>Total revenue</span><strong>{money(totalSales)}</strong></article>
      <article className="summary-card"><span>Amount collected</span><strong className="accounting-paid">{money(totalCollected)}</strong></article>
      <article className="summary-card"><span>Outstanding receivable</span><strong className="accounting-due">{money(totalOutstanding)}</strong></article>
      <article className="summary-card"><span>Total expenses</span><strong className="accounting-due">{money(totalExpenses)}</strong></article>
      <article className="summary-card"><span>Net profit</span><strong className={netProfit >= 0 ? 'accounting-paid' : 'accounting-due'}>{money(netProfit)}</strong></article>
      <article className="summary-card"><span>GST collected</span><strong>{money(totalGst)}</strong></article>
      <article className="summary-card"><span>Discount given</span><strong>{money(totalDiscount)}</strong></article>
      <article className="summary-card"><span>Average order value</span><strong>{money(avgOrderValue)}</strong></article>
      <article className="summary-card"><span>Total orders</span><strong>{orders.length}</strong></article>
      <article className="summary-card"><span>Low stock items</span><strong>{lowStock.length}</strong></article>
    </div>
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">SALES BY PAYMENT METHOD</span><h2>Collections</h2></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Method</th><th>Amount</th></tr></thead><tbody>{paymentBreakup.map((row) => <tr key={row.method}><td>{row.method}</td><td>{money(row.total)}</td></tr>)}</tbody></table></div></section>
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">EXPENSE BREAKDOWN</span><h2>Expenses by category</h2></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Category</th><th>Amount</th></tr></thead><tbody>{expenseRows.length ? expenseRows.map(([category, amount]) => <tr key={category}><td>{category}</td><td>{money(amount)}</td></tr>) : <tr><td colSpan="2">No expenses recorded yet.</td></tr>}</tbody></table></div></section>
    {parties.length > 0 && <section className="panel"><div className="panel-heading"><div><span className="eyebrow">PARTY LEDGER</span><h2>Receivables &amp; payables</h2></div></div><div className="summary-grid" style={{ marginBottom: 0 }}><article className="summary-card"><span>You'll get</span><strong className="accounting-paid">{money(totalReceivable)}</strong></article><article className="summary-card"><span>You'll give</span><strong className="accounting-due">{money(totalPayable)}</strong></article></div></section>}
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">ITEM-WISE SALES</span><h2>Top selling items</h2></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Item</th><th>Qty sold</th><th>Revenue</th></tr></thead><tbody>{topItems.length ? topItems.map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.sold}</td><td>{money(row.revenue)}</td></tr>) : <tr><td colSpan="3">No sales recorded yet.</td></tr>}</tbody></table></div></section>
    {lowStock.length > 0 && <section className="panel"><div className="panel-heading"><div><span className="eyebrow">STOCK ALERT</span><h2>Low stock items</h2></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Item</th><th>Current stock</th><th>Minimum</th></tr></thead><tbody>{lowStock.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.currentStock} {item.unit}</td><td>{item.minimumStock} {item.unit}</td></tr>)}</tbody></table></div></section>}
  </>
}

function ModuleFrame({ title, action, onAction, children }) { return <><PageTitle eyebrow={title.toUpperCase()} title={title} action={action} onAction={onAction} /><section className="panel module-panel">{children}</section></> }
const SIMPLE_FORM_LABELS = { inventoryId: 'Raw material', gstRate: 'GST %', gstin: 'GSTIN', id: 'ID' }
const SIMPLE_FORM_NUMBER_FIELDS = new Set(['openingStock', 'currentStock', 'minimumStock', 'costPrice', 'quantity', 'rate', 'gstRate', 'discount', 'openingBalance'])
const SIMPLE_FORM_DATE_FIELDS = new Set(['date'])
function SimpleForm({ title, fields, form, setForm, onSave, onCancel, selects = {} }) { return <div className="panel module-editor"><h2>{title}</h2><div className="settings-form-grid">{fields.map((field) => <label key={field}>{SIMPLE_FORM_LABELS[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())}{selects[field] ? <Picker value={form[field]} onChange={(value) => setForm({ ...form, [field]: value })} options={selects[field]} /> : <input type={SIMPLE_FORM_NUMBER_FIELDS.has(field) ? 'number' : SIMPLE_FORM_DATE_FIELDS.has(field) ? 'date' : 'text'} value={form[field] ?? ''} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />}</label>)}</div><div className="cart-actions"><button className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" onClick={onSave}>Save</button></div></div> }
function InventoryPage({ inventory, setInventory, notify }) { const [search, setSearch] = useState(''); const [form, setForm] = useState(null); const isNew = form && !inventory.some((entry) => entry.id === form.id); const save = () => { const opening = Number(form.openingStock) || 0; const existing = inventory.find((entry) => entry.id === form.id); const item = { ...form, id: form.id || `raw-${Date.now()}`, openingStock: existing ? existing.openingStock : opening, currentStock: existing ? existing.currentStock : opening, minimumStock: Number(form.minimumStock) || 0, costPrice: Number(form.costPrice) || 0 }; setInventory((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? item : entry) : [...current, item]); setForm(null); notify('Raw material saved') }; return <ModuleFrame title="Inventory" action="Add raw material" onAction={() => setForm({ name: '', category: 'General', unit: 'Piece', openingStock: 0, currentStock: 0, minimumStock: 0, costPrice: 0, supplier: '', active: true })}><div className="module-toolbar"><div className="search-field">⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search raw materials" /></div></div>{form && <SimpleForm title="Raw material" fields={isNew ? ['name', 'category', 'unit', 'openingStock', 'minimumStock', 'costPrice', 'supplier'] : ['name', 'category', 'unit', 'minimumStock', 'costPrice', 'supplier']} form={form} setForm={setForm} onSave={save} onCancel={() => setForm(null)} />}{form && !isNew && <p className="module-empty">To correct the current stock number, use Stock Adjustments instead of this form - it keeps a record of why the stock changed.</p>}{inventory.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())).map((item) => <div className="module-row" key={item.id}><div><strong>{item.name}</strong><small>{item.category} · {item.unit} · {item.supplier || 'No supplier'}</small></div><span className={item.currentStock <= item.minimumStock ? 'low-stock' : ''}>{item.currentStock} {item.unit}{item.currentStock <= item.minimumStock && ' · LOW STOCK'}</span><b>{money(item.costPrice)}</b><button className="text-button" onClick={() => setForm(item)}>Edit</button><button className="text-button" onClick={() => setInventory((current) => current.filter((entry) => entry.id !== item.id))}>Delete</button></div>)}</ModuleFrame> }
function PurchasePage({ inventory, suppliers, purchases, savePurchase, setInventory, setSuppliers, notify }) { const [form, setForm] = useState(null); const [quickAdd, setQuickAdd] = useState(null); const open = () => setForm({ id: `PUR-${Date.now()}`, date: new Date().toISOString().slice(0, 10), supplier: suppliers[0]?.name || '', inventoryId: inventory[0]?.id || '', quantity: 1, rate: 0, gstRate: 0, discount: 0, paymentStatus: 'Unpaid' }); const saveSupplierInline = (values) => { if (!values.name?.trim()) return; const supplier = { id: `sup-${Date.now()}`, name: values.name.trim(), mobile: '', address: '', gstin: '', openingBalance: 0 }; setSuppliers((current) => [...current, supplier]); setForm((current) => current && { ...current, supplier: supplier.name }); setQuickAdd(null); notify('Supplier added') }; const saveRawMaterialInline = (values) => { if (!values.name?.trim()) return; const item = { id: `raw-${Date.now()}`, name: values.name.trim(), category: 'General', unit: values.unit?.trim() || 'Piece', openingStock: 0, currentStock: 0, minimumStock: 0, costPrice: 0, supplier: '', active: true }; setInventory((current) => [...current, item]); setForm((current) => current && { ...current, inventoryId: item.id }); setQuickAdd(null); notify('Raw material added') }; return <ModuleFrame title="Purchases" action="Add purchase" onAction={open}>{form && <><div className="module-quick-add"><button type="button" className="text-button" onClick={() => setQuickAdd('supplier')}>+ New supplier</button><button type="button" className="text-button" onClick={() => setQuickAdd('material')}>+ New raw material</button></div><SimpleForm title="New purchase" fields={['id', 'date', 'supplier', 'inventoryId', 'quantity', 'rate', 'gstRate', 'discount', 'paymentStatus']} form={form} setForm={setForm} onSave={() => { savePurchase({ ...form, total: Number(form.quantity) * Number(form.rate) - Number(form.discount) }); setForm(null) }} onCancel={() => setForm(null)} selects={{ inventoryId: inventory.map((item) => ({ value: item.id, label: `${item.name} (${item.unit})` })), supplier: suppliers.map((item) => ({ value: item.name, label: item.name })), paymentStatus: [{ value: 'Unpaid', label: 'Unpaid' }, { value: 'Paid', label: 'Paid' }] }} /></>}{quickAdd === 'supplier' && <PromptDialog title="New supplier" fields={[{ key: 'name', label: 'Supplier name', placeholder: 'e.g. Fresh Farms' }]} onConfirm={saveSupplierInline} onCancel={() => setQuickAdd(null)} />}{quickAdd === 'material' && <PromptDialog title="New raw material" fields={[{ key: 'name', label: 'Raw material name', placeholder: 'e.g. Chicken Breast' }, { key: 'unit', label: 'Unit', default: 'Piece', placeholder: 'Piece / Kg / Litre / Gram' }]} onConfirm={saveRawMaterialInline} onCancel={() => setQuickAdd(null)} />}{purchases.map((purchase) => <div className="module-row" key={purchase.id}><strong>{purchase.id}</strong><span>{purchase.date}</span><span>{purchase.supplier}</span><span>{money(purchase.total || 0)}</span><span>{purchase.paymentStatus}</span></div>)}</ModuleFrame> }
function SupplierPage({ suppliers, setSuppliers, purchases, paySupplier, inventory, notify }) {
  const [form, setForm] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [payFor, setPayFor] = useState(null)

  const save = () => {
    const item = { ...form, id: form.id || `sup-${Date.now()}` }
    setSuppliers((current) => current.some((entry) => entry.id === item.id) ? current.map((entry) => entry.id === item.id ? item : entry) : [...current, item])
    setForm(null)
    notify('Supplier saved')
  }

  const supplierRows = suppliers.map((supplier) => {
    const supplierPurchases = purchases.filter((purchase) => purchase.supplier === supplier.name)
    const totalPurchased = supplierPurchases.reduce((sum, purchase) => sum + Number(purchase.total || 0), 0)
    const totalPaid = supplierPurchases.reduce((sum, purchase) => sum + Number(purchase.paidAmount ?? (purchase.paymentStatus === 'Paid' ? purchase.total : 0)), 0)
    return { ...supplier, purchases: supplierPurchases, totalPurchased, totalPaid, outstanding: Math.max(0, totalPurchased - totalPaid) }
  })

  if (selectedSupplier) {
    const supplier = supplierRows.find((item) => item.name === selectedSupplier)
    return (
      <>
        <PageTitle eyebrow="SUPPLIER LEDGER" title={supplier.name} action="Back to suppliers" onAction={() => setSelectedSupplier(null)} />

        {payFor && (
          <PromptDialog
            title={`Pay ${supplier.name} - outstanding ${money(payFor.outstandingAmount ?? (payFor.total - (payFor.paidAmount || 0)))}`}
            fields={[
              { key: 'amount', label: 'Payment amount', type: 'number', default: String(payFor.outstandingAmount ?? (payFor.total - (payFor.paidAmount || 0))) },
              { key: 'method', label: 'Payment method', type: 'select', default: 'Cash', options: ['Cash', 'UPI', 'Card'] }
            ]}
            confirmLabel="Pay"
            onCancel={() => setPayFor(null)}
            onConfirm={(values) => { paySupplier(payFor, values.amount, values.method || 'Cash'); setPayFor(null) }}
          />
        )}

        <div className="summary-grid">
          <article className="summary-card"><span>Total Purchased</span><strong>{money(supplier.totalPurchased)}</strong></article>
          <article className="summary-card"><span>Total Paid</span><strong>{money(supplier.totalPaid)}</strong></article>
          <article className="summary-card">
            <span>Outstanding</span>
            <strong>{money(supplier.outstanding)}</strong>
          </article>
        </div>

        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">PURCHASE HISTORY</span><h2>{supplier.name}</h2></div></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Purchase</th><th>Date</th><th>Item</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {supplier.purchases.length ? supplier.purchases.map((purchase) => {
                  const paid = Number(purchase.paidAmount ?? (purchase.paymentStatus === 'Paid' ? purchase.total : 0))
                  const due = Math.max(0, Number(purchase.total || 0) - paid)
                  return (
                    <tr key={purchase.id}>
                      <td><strong>{purchase.id}</strong></td>
                      <td>{purchase.date}</td>
                      <td>{inventory.find((item) => item.id === purchase.inventoryId)?.name || 'Unknown item'}</td>
                      <td>{money(purchase.total || 0)}</td>
                      <td>{money(paid)}</td>
                      <td>{money(due)}</td>
                      <td><span className={`badge ${(purchase.paymentStatus || 'Unpaid').toLowerCase().replace(' ', '-')}`}>{purchase.paymentStatus || 'Unpaid'}</span></td>
                      <td>{due > 0 && <button className="text-button" onClick={() => setPayFor(purchase)}>Pay</button>}</td>
                    </tr>
                  )
                }) : <tr><td colSpan="8">No purchases recorded from this supplier yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </>
    )
  }

  return (
    <ModuleFrame title="Suppliers" action="Add supplier" onAction={() => setForm({ name: '', mobile: '', address: '', gstin: '', openingBalance: 0 })}>
      {form && <SimpleForm title="Supplier" fields={['name', 'mobile', 'address', 'gstin', 'openingBalance']} form={form} setForm={setForm} onSave={save} onCancel={() => setForm(null)} />}
      {supplierRows.map((item) => (
        <div className="module-row" key={item.id}>
          <div><strong>{item.name}</strong>{(item.mobile || item.address) && <small>{[item.mobile, item.address].filter(Boolean).join(' · ')}</small>}</div>
          <span>{item.purchases.length} purchase{item.purchases.length === 1 ? '' : 's'}</span>
          <b className={item.outstanding > 0 ? 'low-stock' : ''}>{money(item.outstanding)} due</b>
          <button className="text-button" onClick={() => setSelectedSupplier(item.name)}>View Ledger</button>
          <span className="module-row-actions"><button className="text-button" onClick={() => setForm(item)}>Edit</button><button className="text-button" onClick={() => setSuppliers((current) => current.filter((entry) => entry.id !== item.id))}>Delete</button></span>
        </div>
      ))}
    </ModuleFrame>
  )
}
function RecipePage({ menu, inventory, recipes, setRecipes, setInventory, notify }) { const [menuId, setMenuId] = useState(menu[0]?.id); const [ingredient, setIngredient] = useState({ inventoryId: inventory[0]?.id || '', quantity: 1 }); const [quickAdd, setQuickAdd] = useState(false); const list = recipes[menuId] || []; const missingRecipe = menu.filter((item) => !(recipes[item.id] || []).length); const save = () => { if (!ingredient.inventoryId) return notify('Add a raw material first'); setRecipes((current) => ({ ...current, [menuId]: [...(current[menuId] || []), { ...ingredient, quantity: Number(ingredient.quantity) }] })); notify('Ingredient added to recipe') }; const saveRawMaterialInline = (values) => { if (!values.name?.trim()) return; const item = { id: `raw-${Date.now()}`, name: values.name.trim(), category: 'General', unit: values.unit?.trim() || 'Piece', openingStock: 0, currentStock: 0, minimumStock: 0, costPrice: 0, supplier: '', active: true }; setInventory((current) => [...current, item]); setIngredient((current) => ({ ...current, inventoryId: item.id })); setQuickAdd(false); notify('Raw material added') }; return <ModuleFrame title="Recipes"><label className="recipe-select">Menu item<Picker value={menuId} onChange={(value) => setMenuId(Number(value))} options={menu.map((item) => ({ value: item.id, label: item.name }))} /></label><div className="module-quick-add"><button type="button" className="text-button" onClick={() => setQuickAdd(true)}>+ New raw material</button></div>{quickAdd && <PromptDialog title="New raw material" fields={[{ key: 'name', label: 'Raw material name', placeholder: 'e.g. Lettuce' }, { key: 'unit', label: 'Unit', default: 'Piece', placeholder: 'Piece / Kg / Litre / Gram' }]} onConfirm={saveRawMaterialInline} onCancel={() => setQuickAdd(false)} />}<div className="recipe-add"><Picker value={ingredient.inventoryId} onChange={(value) => setIngredient({ ...ingredient, inventoryId: value })} options={inventory.map((item) => ({ value: item.id, label: `${item.name} (${item.unit})` }))} placeholder={inventory.length ? 'Select' : 'Add a raw material first'} /><input type="number" value={ingredient.quantity} onChange={(event) => setIngredient({ ...ingredient, quantity: event.target.value })} /><button className="button primary" onClick={save}>Add ingredient</button></div>{!list.length && <p className="module-empty">This item has no ingredients yet - its stock will not reduce when sold until you add some above.</p>}{list.map((item, index) => <div className="module-row" key={`${item.inventoryId}-${index}`}><strong>{inventory.find((entry) => entry.id === item.inventoryId)?.name || 'Unknown item'}</strong><span>{item.quantity}</span><button className="text-button" onClick={() => setRecipes((current) => ({ ...current, [menuId]: current[menuId].filter((_, position) => position !== index) }))}>Remove</button></div>)}{missingRecipe.length > 0 && <div className="recipe-missing"><h3>Menu items with no recipe yet ({missingRecipe.length})</h3><p>Their stock will not reduce automatically when sold.</p><div className="recipe-missing-list">{missingRecipe.map((item) => <button type="button" key={item.id} className="text-button" onClick={() => setMenuId(item.id)}>{item.name}</button>)}</div></div>}</ModuleFrame> }
function AdjustmentPage({ inventory, adjustments, adjustStock }) { const [form, setForm] = useState({ inventoryId: inventory[0]?.id || '', quantity: -1, reason: 'Wastage', notes: '' }); return <ModuleFrame title="Stock adjustments" action="Save adjustment" onAction={() => adjustStock({ ...form, id: `adj-${Date.now()}`, quantity: Number(form.quantity), date: new Date().toISOString().slice(0, 10) })}><div className="settings-form-grid"><label>Raw material<Picker value={form.inventoryId} onChange={(value) => setForm({ ...form, inventoryId: value })} options={inventory.map((item) => ({ value: item.id, label: item.name }))} /></label><label>Quantity (+/-)<input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label><label>Reason<Picker value={form.reason} onChange={(value) => setForm({ ...form, reason: value })} options={['Wastage', 'Damage', 'Manual Adjustment', 'Stock Correction', 'Expired', 'Complimentary usage']} /></label><label>Notes<input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label></div>{adjustments.map((item) => <div className="module-row" key={item.id}><strong>{inventory.find((entry) => entry.id === item.inventoryId)?.name}</strong><span>{item.quantity > 0 ? '+' : ''}{item.quantity}</span><span>{item.reason}</span><small>{item.date}</small></div>)}</ModuleFrame> }

function OrderDetailViewActive({ orders }) { const [filter, setFilter] = useState('All'); const [selected, setSelected] = useState(null); const [amount, setAmount] = useState(''); const [method, setMethod] = useState('Cash'); const orderStatuses = ['New', 'Confirmed', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled']; const changeStatus = (order, status) => { window.basilUpdateOrderStatus?.(order.id, status); setSelected({ ...order, status }) }; const collect = () => { if (selected) window.basilCollectPayment?.(selected, amount, method); setAmount(''); setSelected(null) }; const rows = orders.filter((order) => filter === 'All' || (order.status || 'New') === filter); return <><PageTitle eyebrow="ORDER MANAGEMENT" title="Orders" action="New order" /><div className="filter-tabs">{['All', ...orderStatuses].map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><section className="panel order-table"><div className="table-wrap"><table><thead><tr><th>ORDER</th><th>DATE / TIME</th><th>CUSTOMER</th><th>TABLE / TYPE</th><th>ORDER STATUS</th><th>PAYMENT</th><th>TOTAL</th><th>PAID</th><th>OUTSTANDING</th><th /></tr></thead><tbody>{rows.map((order) => <tr key={order.id}><td><strong>{order.id}</strong><small>{order.kotNumber || 'KOT pending'}</small></td><td>{order.time}</td><td>{order.customer}</td><td>{order.table}<small>{order.orderType || 'Dine-in'}</small></td><td><span className={`badge ${(order.status || 'New').toLowerCase()}`}>{order.status || 'New'}</span></td><td><span className={`badge ${(order.paymentStatus || 'Unpaid').toLowerCase().replace(' ', '-')}`}>{order.paymentStatus || 'Unpaid'}</span></td><td><strong>{money(order.amount)}</strong></td><td>{money(order.paidAmount || 0)}</td><td>{money(order.outstandingAmount ?? order.amount)}</td><td><button className="text-button" onClick={() => { setSelected(order); setAmount(String(order.outstandingAmount ?? order.amount)) }}>Open / View</button></td></tr>)}</tbody></table></div></section>{selected && <div className="payment-dialog order-detail-overlay"><div className="panel order-detail"><div className="panel-head"><div><span className="eyebrow">ORDER DETAIL</span><h2>{selected.id}</h2></div><button className="icon-button" onClick={() => setSelected(null)}>×</button></div><div className="detail-grid"><span>Customer <b>{selected.customer}</b></span><span>Date/time <b>{selected.time}</b></span><span>Table <b>{selected.table}</b></span><span>Order type <b>{selected.orderType}</b></span><span>Order status <b>{selected.status || 'New'}</b></span><span>Kitchen/KOT <b>{selected.kotNumber || 'Pending'}</b></span></div><div className="detail-items">{selected.items?.map((item) => <div key={item.id}><span>{item.quantity} × {item.name}</span><span>{money(item.price)} · {money(item.price * item.quantity)}</span></div>)}</div><div className="detail-totals"><span>Subtotal <b>{money(selected.subtotal ?? selected.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? selected.amount)}</b></span><span>Discount <b>{money(selected.discount || 0)}</b></span><span>GST <b>{money(selected.gst || 0)}</b></span><strong>Grand total <b>{money(selected.amount)}</b></strong><span>Paid amount <b>{money(selected.paidAmount || 0)}</b></span><span>Outstanding <b>{money(selected.outstandingAmount ?? selected.amount)}</b></span></div><h3>Order actions</h3><div className="detail-actions">{orderStatuses.map((status) => <button className="button secondary" disabled={selected.status === status} onClick={() => changeStatus(selected, status)} key={status}>{status === 'Confirmed' ? 'Send to Kitchen' : status === 'Preparing' ? 'Start Preparing' : status === 'Ready' ? 'Mark Ready' : status === 'Served' ? 'Mark Served' : status === 'Completed' ? 'Complete Order' : status === 'Cancelled' ? 'Cancel Order' : 'Open Order'}</button>)}</div>{(selected.outstandingAmount ?? selected.amount) > 0 && <div className="collect-box"><h3>Collect Payment</h3><small>Outstanding: {money(selected.outstandingAmount ?? selected.amount)}</small><input type="number" min="1" max={selected.outstandingAmount ?? selected.amount} value={amount} onChange={(event) => setAmount(event.target.value)} /><Picker value={method} onChange={setMethod} options={['Cash', 'UPI', 'Card']} /><button className="button primary" onClick={collect}>Record Payment</button></div>}</div></div>}</> }

export default App









