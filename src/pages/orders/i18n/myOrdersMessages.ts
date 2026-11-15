import { createMessages, plural } from '@/shared/i18n'

export const useMyOrdersMessages = createMessages({
  en: {
    title: 'My orders',
    loading: 'Loading your orders…',
    emptyTitle: 'No orders yet',
    emptyHint: 'Orders and free registrations you make will appear here.',
    browseEvents: 'Browse events',
    orderNumber: (id: string) => `Order ${id}`,
    orderedOn: (date: string) => `Ordered ${date}`,
    tickets: (count: number) => `${count} ${plural('en', count, { one: 'ticket', other: 'tickets' })}`,
    details: 'Details',
    completePayment: 'Complete payment',
    openOrder: (event: string, id: string) => `Order ${id} for ${event}`,
  },
  ru: {
    title: 'Мои заказы',
    loading: 'Загружаем заказы…',
    emptyTitle: 'Заказов пока нет',
    emptyHint: 'Здесь появятся ваши заказы и бесплатные регистрации.',
    browseEvents: 'Смотреть мероприятия',
    orderNumber: (id) => `Заказ ${id}`,
    orderedOn: (date) => `Оформлен ${date}`,
    tickets: (count) =>
      `${count} ${plural('ru', count, { one: 'билет', few: 'билета', many: 'билетов', other: 'билета' })}`,
    details: 'Подробнее',
    completePayment: 'Завершить оплату',
    openOrder: (event, id) => `Заказ ${id} на «${event}»`,
  },
  kk: {
    title: 'Менің тапсырыстарым',
    loading: 'Тапсырыстар жүктелуде…',
    emptyTitle: 'Әзірге тапсырыс жоқ',
    emptyHint: 'Тапсырыстарыңыз бен тегін тіркелулеріңіз осында көрсетіледі.',
    browseEvents: 'Іс-шараларды қарау',
    orderNumber: (id) => `Тапсырыс ${id}`,
    orderedOn: (date) => `Рәсімделді: ${date}`,
    tickets: (count) => `${count} билет`,
    details: 'Толығырақ',
    completePayment: 'Төлемді аяқтау',
    openOrder: (event, id) => `«${event}» іс-шарасына ${id} тапсырысы`,
  },
})
