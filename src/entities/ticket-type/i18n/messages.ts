import { createMessages } from '@/shared/i18n'

export const useTicketTypeMessages = createMessages({
  en: {
    free: 'Free',
    onSale: 'On sale',
    notStarted: (opensAt: string) => `On sale from ${opensAt}`,
    ended: 'Sales have ended',
    eventStarted: 'The event has started',
  },
  ru: {
    free: 'Бесплатно',
    onSale: 'В продаже',
    notStarted: (opensAt) => `В продаже с ${opensAt}`,
    ended: 'Продажи завершены',
    eventStarted: 'Мероприятие уже началось',
  },
  kk: {
    free: 'Тегін',
    onSale: 'Сатылымда',
    notStarted: (opensAt) => `${opensAt} бастап сатылымда`,
    ended: 'Сату аяқталды',
    eventStarted: 'Іс-шара басталып кетті',
  },
})
