import { createMessages } from '@/shared/i18n'

export const useEditEventMessages = createMessages({
  en: {
    title: 'Edit event',
    loading: 'Loading event…',
    notFound: 'Event not found',
    notFoundHint: 'It may have been removed, or it belongs to another organizer.',
    cancelledNotice: 'This event was cancelled, so it can’t be edited.',
    backToEvent: 'Back to the event',
    saveChanges: 'Save changes',
    saving: 'Saving…',
    cancel: 'Cancel',
  },
  ru: {
    title: 'Редактирование мероприятия',
    loading: 'Загружаем мероприятие…',
    notFound: 'Мероприятие не найдено',
    notFoundHint: 'Возможно, оно удалено или принадлежит другому организатору.',
    cancelledNotice: 'Это мероприятие отменено, поэтому его нельзя изменить.',
    backToEvent: 'Вернуться к мероприятию',
    saveChanges: 'Сохранить изменения',
    saving: 'Сохраняем…',
    cancel: 'Отмена',
  },
  kk: {
    title: 'Іс-шараны өңдеу',
    loading: 'Іс-шара жүктелуде…',
    notFound: 'Іс-шара табылмады',
    notFoundHint: 'Ол жойылған немесе басқа ұйымдастырушыға тиесілі болуы мүмкін.',
    cancelledNotice: 'Бұл іс-шара болдырылмаған, сондықтан оны өңдеуге болмайды.',
    backToEvent: 'Іс-шараға оралу',
    saveChanges: 'Өзгерістерді сақтау',
    saving: 'Сақталуда…',
    cancel: 'Бас тарту',
  },
})
