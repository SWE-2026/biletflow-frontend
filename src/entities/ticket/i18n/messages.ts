import { createMessages } from '@/shared/i18n'

export const useTicketMessages = createMessages({
  en: {
    status_valid: 'Valid',
    status_used: 'Checked in',
    status_cancelled: 'Cancelled',
    status_refunded: 'Refunded',
  },
  ru: {
    status_valid: 'Действителен',
    status_used: 'Использован',
    status_cancelled: 'Отменён',
    status_refunded: 'Возвращён',
  },
  kk: {
    status_valid: 'Жарамды',
    status_used: 'Пайдаланылды',
    status_cancelled: 'Болдырылмады',
    status_refunded: 'Қайтарылды',
  },
})
