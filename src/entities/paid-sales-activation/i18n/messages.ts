import { createMessages } from '@/shared/i18n'

export const usePaidSalesStatusMessages = createMessages({
  en: {
    status_inactive: 'Not activated',
    status_pending: 'Waiting for review',
    status_active: 'Active',
    status_rejected: 'Rejected',
    status_suspended: 'Suspended',
  },
  ru: {
    status_inactive: 'Не активированы',
    status_pending: 'На проверке',
    status_active: 'Активны',
    status_rejected: 'Отклонены',
    status_suspended: 'Приостановлены',
  },
  kk: {
    status_inactive: 'Іске қосылмаған',
    status_pending: 'Тексерілуде',
    status_active: 'Белсенді',
    status_rejected: 'Қабылданбады',
    status_suspended: 'Тоқтатылған',
  },
})
