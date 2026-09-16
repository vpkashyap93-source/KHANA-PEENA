import PageHeader from '../components/PageHeader'
import { EmptyState } from '../components/States'
import { NAV_ITEMS } from '../navItems'

export default function ComingSoon({ moduleId }) {
  const item = NAV_ITEMS.find((n) => n.id === moduleId)
  const label = item ? item.label : 'This module'

  return (
    <div className="pp-page">
      <PageHeader crumbs={['Home', label]} title={label} subtitle="Built next, on top of the same design system as the Practice Dashboard." />
      <section className="pp-section">
        <EmptyState
          icon={item ? item.icon : 'inbox'}
          title={`${label} is coming soon`}
          detail="This screen will follow once the design system and dashboard are approved."
        />
      </section>
    </div>
  )
}
