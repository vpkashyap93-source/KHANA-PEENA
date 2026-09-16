import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import SummaryCard from '../components/SummaryCard'
import RevenueExpenseChart from '../components/RevenueExpenseChart'
import CollectionTrendChart from '../components/CollectionTrendChart'
import { CardSkeleton, TableSkeleton, EmptyState } from '../components/States'
import { formatINR } from '../format'
import {
  summaryMetrics,
  revenueExpenseSeries,
  collectionTrend,
  upcomingRecurringInvoices,
  pendingFollowUps,
  recentTransactions,
  clientOutstanding,
  practiceSuggestions,
} from '../data/mockData'

const STATUS_TONE = { Overdue: 'danger', 'Due soon': 'warning', Current: 'success' }

function downloadCSV(rows, headers, filename) {
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function Dashboard({ financialYear }) {
  const [status, setStatus] = useState('loading')
  const [clientFilter, setClientFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // financialYear changes remount this component (see key={financialYear}
  // in PracticeApp), which re-runs this effect from the fresh 'loading' state.
  useEffect(() => {
    const t = setTimeout(() => setStatus('ready'), 550)
    return () => clearTimeout(t)
  }, [])

  const filteredClients = useMemo(() => {
    return clientOutstanding.filter((c) => {
      const matchesName = c.client.toLowerCase().includes(clientFilter.toLowerCase())
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter
      return matchesName && matchesStatus
    })
  }, [clientFilter, statusFilter])

  const handleExport = () => {
    downloadCSV(
      clientOutstanding.map((c) => [c.client, c.billed, c.received, c.outstanding, c.lastInvoice, c.status]),
      ['Client', 'Billed', 'Received', 'Outstanding', 'Last Invoice', 'Status'],
      'client-wise-outstanding.csv'
    )
  }

  return (
    <div className="pp-page">
      <PageHeader
        crumbs={['Home', 'Overview']}
        title="Practice Overview"
        subtitle={`Snapshot of clients, billing and collections for ${financialYear}.`}
        onPrint={() => window.print()}
        onExport={handleExport}
      />

      {status === 'loading' ? (
        <div className="pp-summary-grid">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="pp-summary-grid">
          {summaryMetrics.map((metric) => <SummaryCard key={metric.id} metric={metric} />)}
        </div>
      )}

      <div className="pp-grid-2">
        <section className="pp-section">
          <div className="pp-section-head">
            <div>
              <div className="pp-section-title">Revenue vs Expense</div>
              <div className="pp-section-sub">Monthly totals for {financialYear}</div>
            </div>
          </div>
          <div className="pp-chart-legend">
            <span className="pp-legend-item"><span className="pp-legend-swatch" style={{ background: '#2569a6' }} />Revenue</span>
            <span className="pp-legend-item"><span className="pp-legend-swatch" style={{ background: '#b87f1e' }} />Expense</span>
          </div>
          {status === 'loading' ? (
            <div className="pp-section-body"><TableSkeleton rows={5} /></div>
          ) : (
            <RevenueExpenseChart months={revenueExpenseSeries.months} revenue={revenueExpenseSeries.revenue} expense={revenueExpenseSeries.expense} />
          )}
        </section>

        <section className="pp-section">
          <div className="pp-section-head">
            <div>
              <div className="pp-section-title">Collection Trend</div>
              <div className="pp-section-sub">Total collected per month</div>
            </div>
          </div>
          {status === 'loading' ? (
            <div className="pp-section-body"><TableSkeleton rows={5} /></div>
          ) : (
            <CollectionTrendChart months={collectionTrend.months} values={collectionTrend.values} />
          )}
        </section>
      </div>

      <div className="pp-grid-2-even">
        <section className="pp-section">
          <div className="pp-section-head">
            <div>
              <div className="pp-section-title">Upcoming Recurring Invoices</div>
              <div className="pp-section-sub">Next 15 days</div>
            </div>
            <button type="button" className="pp-link">View all</button>
          </div>
          <div className="pp-section-body">
            {status === 'loading' ? (
              <TableSkeleton />
            ) : upcomingRecurringInvoices.length === 0 ? (
              <EmptyState title="No recurring invoices due" detail="Scheduled retainer invoices will show up here." />
            ) : (
              <div className="pp-list">
                {upcomingRecurringInvoices.map((inv) => (
                  <div className="pp-list-row" key={inv.id}>
                    <div className="pp-list-main">
                      <div className="pp-list-title">{inv.client}</div>
                      <div className="pp-list-sub">{inv.service}</div>
                    </div>
                    <div>
                      <div className="pp-list-amount pp-tabular">{formatINR(inv.amount)}</div>
                      <div className="pp-list-meta">Due {inv.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pp-section">
          <div className="pp-section-head">
            <div>
              <div className="pp-section-title">Pending Payment Follow-ups</div>
              <div className="pp-section-sub">Sorted by days overdue</div>
            </div>
            <button type="button" className="pp-link">View all</button>
          </div>
          <div className="pp-section-body">
            {status === 'loading' ? (
              <TableSkeleton />
            ) : pendingFollowUps.length === 0 ? (
              <EmptyState icon="check" title="No pending follow-ups" detail="All client payments are on track." />
            ) : (
              <div className="pp-list">
                {pendingFollowUps.map((f) => (
                  <div className="pp-list-row" key={f.id}>
                    <div className="pp-list-main">
                      <div className="pp-list-title">{f.client}</div>
                      <div className="pp-list-sub">Invoice {f.id} · Last contacted {f.lastContacted}</div>
                    </div>
                    <div>
                      <div className="pp-list-amount pp-tabular">{formatINR(f.amount)}</div>
                      <div className="pp-list-meta">
                        <span className={`pp-badge tone-${f.daysOverdue > 30 ? 'danger' : 'warning'}`}>{f.daysOverdue}d overdue</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="pp-section">
        <div className="pp-section-head">
          <div>
            <div className="pp-section-title">Recent Transactions</div>
            <div className="pp-section-sub">Latest vouchers across the practice</div>
          </div>
          <button type="button" className="pp-link">Open Accounting</button>
        </div>
        {status === 'loading' ? (
          <div className="pp-section-body"><TableSkeleton rows={6} /></div>
        ) : (
          <div className="pp-table-scroll">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Particulars</th>
                  <th>Voucher</th>
                  <th>Ref No.</th>
                  <th className="is-num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t.ref}>
                    <td className="pp-cell-muted">{t.date}</td>
                    <td className="pp-cell-strong">{t.particulars}</td>
                    <td><span className="pp-badge tone-navy">{t.voucher}</span></td>
                    <td className="pp-cell-muted">{t.ref}</td>
                    <td className={`is-num pp-tabular ${t.type === 'credit' ? '' : ''}`} style={{ color: t.type === 'credit' ? '#1e7a4c' : '#b23b3b', fontWeight: 700 }}>
                      {t.type === 'credit' ? '+' : '−'}{formatINR(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="pp-section">
        <div className="pp-section-head">
          <div>
            <div className="pp-section-title">Client-wise Outstanding</div>
            <div className="pp-section-sub">{filteredClients.length} of {clientOutstanding.length} clients</div>
          </div>
          <div className="pp-table-toolbar pp-no-print">
            <input
              className="pp-filter-input"
              placeholder="Search client…"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
            <select className="pp-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {['All', 'Overdue', 'Due soon', 'Current'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {status === 'loading' ? (
          <div className="pp-section-body"><TableSkeleton rows={6} /></div>
        ) : filteredClients.length === 0 ? (
          <EmptyState title="No clients match this filter" detail="Try clearing the search or status filter." />
        ) : (
          <div className="pp-table-scroll">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th className="is-num">Billed</th>
                  <th className="is-num">Received</th>
                  <th className="is-num">Outstanding</th>
                  <th>Last Invoice</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => (
                  <tr key={c.client}>
                    <td className="pp-cell-strong">{c.client}</td>
                    <td className="is-num pp-tabular">{formatINR(c.billed)}</td>
                    <td className="is-num pp-tabular">{formatINR(c.received)}</td>
                    <td className="is-num pp-tabular pp-cell-strong">{formatINR(c.outstanding)}</td>
                    <td className="pp-cell-muted">{c.lastInvoice}</td>
                    <td><span className={`pp-badge tone-${STATUS_TONE[c.status]}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="pp-section">
        <div className="pp-section-head">
          <div>
            <div className="pp-section-title">Practice Assistant Suggestions</div>
            <div className="pp-section-sub">Actionable nudges based on your practice data</div>
          </div>
        </div>
        <div className="pp-section-body">
          {status === 'loading' ? (
            <TableSkeleton rows={4} />
          ) : (
            practiceSuggestions.map((s) => (
              <div className="pp-suggestion" key={s.id}>
                <div className={`pp-suggestion-icon tone-${s.tone}`}>
                  <Icon name={s.tone === 'warning' ? 'warning' : s.tone === 'success' ? 'trending' : 'alert'} size={15} />
                </div>
                <div>
                  <div className="pp-suggestion-title">{s.title}</div>
                  <div className="pp-suggestion-detail">{s.detail}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
