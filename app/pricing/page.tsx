import { DashboardSidebar } from '@/components/DashboardSidebar'
import { PricingSection } from '@/components/PricingSection'

export default function PricingPage() {
  return (
    <DashboardSidebar>
      <div className="container mx-auto px-4 py-8">
        <div className="py-8">
          <PricingSection />
        </div>
      </div>
    </DashboardSidebar>
  )
}
