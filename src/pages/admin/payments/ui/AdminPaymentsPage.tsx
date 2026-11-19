import { Page } from '@/shared/ui/page'
import { useAdminPaymentsMessages } from '../i18n/messages'
import { PaymentsSection } from './PaymentsSection'
import { PayoutsSection } from './PayoutsSection'

export function AdminPaymentsPage() {
  const t = useAdminPaymentsMessages()
  return (
    <Page title={t.title} intro={t.intro} width="xl">
      <PayoutsSection />
      <PaymentsSection />
    </Page>
  )
}
