import { createMessages } from '@/shared/i18n'

export const usePreviewMessages = createMessages({
  en: {
    title: 'Event preview',
    intro: 'This is how attendees see the event page. Ticket types and prices appear on the live page.',
    loading: 'Loading preview…',
    openLive: 'Open the live page',
    notLive: 'Attendees can’t see this event until it is published.',
    refundPolicy: 'Refund policy',
    gallery: 'Gallery',
  },
  ru: {
    title: 'Предпросмотр',
    intro: 'Так участники видят страницу мероприятия. Типы билетов и цены показаны на опубликованной странице.',
    loading: 'Загружаем предпросмотр…',
    openLive: 'Открыть опубликованную страницу',
    notLive: 'Участники не увидят мероприятие, пока оно не опубликовано.',
    refundPolicy: 'Условия возврата',
    gallery: 'Галерея',
  },
  kk: {
    title: 'Алдын ала қарау',
    intro: 'Қатысушылар іс-шара бетін осылай көреді. Билет түрлері мен бағалары жарияланған бетте көрсетіледі.',
    loading: 'Алдын ала қарау жүктелуде…',
    openLive: 'Жарияланған бетті ашу',
    notLive: 'Іс-шара жарияланбайынша қатысушылар оны көрмейді.',
    refundPolicy: 'Қайтару шарттары',
    gallery: 'Галерея',
  },
})
