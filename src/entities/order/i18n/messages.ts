import { createMessages } from '@/shared/i18n'

export const useOrderMessages = createMessages({
  en: {
    status_pending: 'Awaiting payment',
    status_paid: 'Confirmed',
    status_cancelled: 'Cancelled',
    status_refunded: 'Refunded',
    status_expired: 'Expired',
  },
  ru: {
    status_pending: 'Ожидает оплаты',
    status_paid: 'Подтверждён',
    status_cancelled: 'Отменён',
    status_refunded: 'Возвращён',
    status_expired: 'Истёк',
  },
  kk: {
    status_pending: 'Төлемді күтуде',
    status_paid: 'Расталды',
    status_cancelled: 'Болдырылмады',
    status_refunded: 'Қайтарылды',
    status_expired: 'Мерзімі өтті',
  },
})
