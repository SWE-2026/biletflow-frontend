import { createMessages } from '@/shared/i18n'

export const useMyTicketsMessages = createMessages({
  en: {
    title: 'My tickets',
    loading: 'Loading your tickets…',
    upcoming: 'Upcoming',
    past: 'Past',
    emptyTitle: 'No tickets yet',
    emptyHint: 'Tickets you register for or buy appear here, ready to show at the entrance.',
    browseEvents: 'Browse events',
    ticketLabel: 'Ticket',
    attendeeLabel: 'Attendee',
    open: 'Open',
    openTicket: (type: string, name: string, event: string) =>
      `${event}: ${type} ticket for ${name}`,
  },
  ru: {
    title: 'Мои билеты',
    loading: 'Загружаем ваши билеты…',
    upcoming: 'Предстоящие',
    past: 'Прошедшие',
    emptyTitle: 'Билетов пока нет',
    emptyHint: 'Здесь появятся билеты, на которые вы зарегистрировались или которые купили. Их можно показать на входе.',
    browseEvents: 'Смотреть афишу',
    ticketLabel: 'Билет',
    attendeeLabel: 'Участник',
    open: 'Открыть',
    openTicket: (type, name, event) => `${event}: билет «${type}» на имя ${name}`,
  },
  kk: {
    title: 'Менің билеттерім',
    loading: 'Билеттеріңіз жүктелуде…',
    upcoming: 'Алдағы',
    past: 'Өткен',
    emptyTitle: 'Әзірге билеттер жоқ',
    emptyHint: 'Тіркелген немесе сатып алған билеттеріңіз осында шығады. Оларды кіре берісте көрсетуге болады.',
    browseEvents: 'Афишаны қарау',
    ticketLabel: 'Билет',
    attendeeLabel: 'Қатысушы',
    open: 'Ашу',
    openTicket: (type, name, event) => `${event}: ${name} атына «${type}» билеті`,
  },
})
