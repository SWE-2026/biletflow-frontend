import { createMessages } from '@/shared/i18n'

export const useDisputeMessages = createMessages({
  en: {
    status_open: 'Dispute open',
    status_refunded: 'Dispute refunded',
    status_rejected: 'Dispute rejected',
    reason_not_received: 'Tickets not received',
    reason_event_cancelled: 'Event cancelled',
    reason_not_as_described: 'Not as described',
    reason_duplicate_charge: 'Charged twice',
    reason_other: 'Other',
  },
  ru: {
    status_open: 'Спор открыт',
    status_refunded: 'Спор: возврат',
    status_rejected: 'Спор отклонён',
    reason_not_received: 'Билеты не получены',
    reason_event_cancelled: 'Мероприятие отменено',
    reason_not_as_described: 'Не соответствует описанию',
    reason_duplicate_charge: 'Двойное списание',
    reason_other: 'Другое',
  },
  kk: {
    status_open: 'Дау ашық',
    status_refunded: 'Дау: қайтарылды',
    status_rejected: 'Дау қабылданбады',
    reason_not_received: 'Билеттер алынбады',
    reason_event_cancelled: 'Іс-шара болдырылмады',
    reason_not_as_described: 'Сипаттамаға сәйкес емес',
    reason_duplicate_charge: 'Екі рет төленді',
    reason_other: 'Басқа',
  },
})
