// Sample data for the Practice Dashboard. Replace with live data once the
// Clients / Billing / Accounting modules are wired to a backend.

export const financialYears = ['FY 2023-24', 'FY 2024-25', 'FY 2025-26']

export const summaryMetrics = [
  { id: 'clients', label: 'Total Active Clients', value: 186, delta: 8, deltaLabel: 'this month', icon: 'clients', tone: 'navy' },
  { id: 'billing', label: 'Monthly Billing', value: 1842500, currency: true, delta: 6.4, deltaLabel: 'vs last month', icon: 'invoice', tone: 'gold' },
  { id: 'outstanding', label: 'Total Outstanding', value: 986400, currency: true, delta: -3.1, deltaLabel: 'vs last month', icon: 'wallet', tone: 'warning' },
  { id: 'collection', label: 'Monthly Collection', value: 1420300, currency: true, delta: 11.2, deltaLabel: 'vs last month', icon: 'trending', tone: 'success' },
  { id: 'profit', label: 'Office Profit', value: 615800, currency: true, delta: 4.8, deltaLabel: 'vs last month', icon: 'profit', tone: 'navy' },
  { id: 'cashbank', label: 'Cash & Bank Balance', value: 3248900, currency: true, delta: 2.2, deltaLabel: 'vs last week', icon: 'bank', tone: 'gold' },
]

export const revenueExpenseSeries = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  revenue: [1362000, 1489000, 1408000, 1561000, 1697000, 1842500],
  expense: [842000, 918000, 869000, 940000, 986000, 1041000],
}

export const collectionTrend = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  values: [1085000, 1162000, 1094000, 1258000, 1301000, 1420300],
}

export const upcomingRecurringInvoices = [
  { id: 'RI-2041', client: 'Sharma & Associates', service: 'Monthly Bookkeeping Retainer', amount: 18500, dueDate: '22 Sep 2026' },
  { id: 'RI-2042', client: 'Vasant Textiles Pvt Ltd', service: 'Payroll Processing', amount: 24000, dueDate: '24 Sep 2026' },
  { id: 'RI-2043', client: 'Mehta Trading Co.', service: 'Monthly Compliance Retainer', amount: 12000, dueDate: '25 Sep 2026' },
  { id: 'RI-2044', client: 'Greenfield Exports LLP', service: 'Bookkeeping + MIS Reporting', amount: 32000, dueDate: '28 Sep 2026' },
  { id: 'RI-2045', client: 'Patel Diagnostics', service: 'Monthly Bookkeeping Retainer', amount: 15000, dueDate: '30 Sep 2026' },
]

export const pendingFollowUps = [
  { id: 'INV-1187', client: 'Om Sai Constructions', amount: 84200, daysOverdue: 46, lastContacted: '02 Sep 2026' },
  { id: 'INV-1195', client: 'Nova Interiors', amount: 32800, daysOverdue: 31, lastContacted: '08 Sep 2026' },
  { id: 'INV-1201', client: 'Kedia Auto Spares', amount: 21500, daysOverdue: 18, lastContacted: '12 Sep 2026' },
  { id: 'INV-1204', client: 'Bright Future School', amount: 46000, daysOverdue: 9, lastContacted: '14 Sep 2026' },
]

export const recentTransactions = [
  { date: '15 Sep 2026', particulars: 'Sharma & Associates — Retainer fee received', voucher: 'Receipt', ref: 'RV-0412', amount: 18500, type: 'credit' },
  { date: '15 Sep 2026', particulars: 'Office rent — September', voucher: 'Payment', ref: 'PV-0388', amount: 45000, type: 'debit' },
  { date: '14 Sep 2026', particulars: 'Greenfield Exports LLP — Invoice #INV-1214', voucher: 'Journal', ref: 'JV-0561', amount: 32000, type: 'credit' },
  { date: '13 Sep 2026', particulars: 'Staff salary — Assistant Accountant', voucher: 'Payment', ref: 'PV-0387', amount: 28000, type: 'debit' },
  { date: '12 Sep 2026', particulars: 'Mehta Trading Co. — Payment received', voucher: 'Receipt', ref: 'RV-0411', amount: 12000, type: 'credit' },
  { date: '11 Sep 2026', particulars: 'Software subscription — Practice management tool', voucher: 'Payment', ref: 'PV-0386', amount: 6200, type: 'debit' },
]

export const clientOutstanding = [
  { client: 'Om Sai Constructions', billed: 284200, received: 200000, outstanding: 84200, lastInvoice: '30 Jul 2026', status: 'Overdue' },
  { client: 'Nova Interiors', billed: 132800, received: 100000, outstanding: 32800, lastInvoice: '14 Aug 2026', status: 'Overdue' },
  { client: 'Kedia Auto Spares', billed: 96500, received: 75000, outstanding: 21500, lastInvoice: '28 Aug 2026', status: 'Due soon' },
  { client: 'Bright Future School', billed: 146000, received: 100000, outstanding: 46000, lastInvoice: '05 Sep 2026', status: 'Due soon' },
  { client: 'Vasant Textiles Pvt Ltd', billed: 288000, received: 288000, outstanding: 0, lastInvoice: '10 Sep 2026', status: 'Current' },
  { client: 'Greenfield Exports LLP', billed: 384000, received: 352000, outstanding: 32000, lastInvoice: '14 Sep 2026', status: 'Due soon' },
]

export const practiceSuggestions = [
  { id: 1, tone: 'warning', title: '4 invoices are overdue by more than 15 days', detail: 'Om Sai Constructions and 3 others owe ₹1,84,500 in total. Sending a reminder now keeps this month’s collection on track.' },
  { id: 2, tone: 'navy', title: 'Bookkeeping retainer renewal due — Sharma & Associates', detail: 'The engagement letter expires on 30 Sep 2026. Renew early to avoid a service gap next month.' },
  { id: 3, tone: 'success', title: 'Collection is up 11.2% this month', detail: 'Cash inflow has improved for the third month in a row — outstanding balance is trending down.' },
  { id: 4, tone: 'warning', title: '3 clients have no active engagement letter on file', detail: 'Kedia Auto Spares, Nova Interiors and Patel Diagnostics need a signed letter before the next billing cycle.' },
]

export const globalSearchIndex = [
  { type: 'Client', label: 'Sharma & Associates' },
  { type: 'Client', label: 'Vasant Textiles Pvt Ltd' },
  { type: 'Client', label: 'Mehta Trading Co.' },
  { type: 'Client', label: 'Greenfield Exports LLP' },
  { type: 'Client', label: 'Om Sai Constructions' },
  { type: 'Client', label: 'Nova Interiors' },
  { type: 'Client', label: 'Kedia Auto Spares' },
  { type: 'Client', label: 'Bright Future School' },
  { type: 'Invoice', label: 'INV-1187' },
  { type: 'Invoice', label: 'INV-1204' },
  { type: 'Voucher', label: 'RV-0412' },
  { type: 'Voucher', label: 'PV-0388' },
]
