import { createMessages } from '@/shared/i18n'

export const useCalendarMessages = createMessages({
  en: {
    title: 'Add to calendar',
    hint: 'Download an .ics file for Apple Calendar, Outlook and others, or open Google or Outlook online. BiletFlow never asks for access to your calendar.',
    downloadIcs: 'Download .ics',
    google: 'Google Calendar',
    outlook: 'Outlook.com',
    cancelledTitle: 'Remove from calendar',
    cancelledHint: 'This event was cancelled. Open this file to mark the entry you added earlier as cancelled.',
    downloadCancellation: 'Download cancellation (.ics)',
    opensInNewTab: '(opens in a new tab)',
  },
  ru: {
    title: 'Добавить в календарь',
    hint: 'Скачайте файл .ics для Apple Calendar, Outlook и других приложений или откройте Google или Outlook в браузере. BiletFlow не запрашивает доступ к вашему календарю.',
    downloadIcs: 'Скачать .ics',
    google: 'Google Календарь',
    outlook: 'Outlook.com',
    cancelledTitle: 'Убрать из календаря',
    cancelledHint: 'Мероприятие отменено. Откройте этот файл, чтобы отметить добавленную ранее запись как отменённую.',
    downloadCancellation: 'Скачать отмену (.ics)',
    opensInNewTab: '(откроется в новой вкладке)',
  },
  kk: {
    title: 'Күнтізбеге қосу',
    hint: 'Apple Calendar, Outlook және басқа қолданбалар үшін .ics файлын жүктеңіз немесе Google не Outlook-ты браузерде ашыңыз. BiletFlow күнтізбеңізге рұқсат сұрамайды.',
    downloadIcs: '.ics жүктеу',
    google: 'Google Күнтізбе',
    outlook: 'Outlook.com',
    cancelledTitle: 'Күнтізбеден алып тастау',
    cancelledHint: 'Іс-шара тоқтатылды. Бұрын қосылған жазбаны тоқтатылды деп белгілеу үшін осы файлды ашыңыз.',
    downloadCancellation: 'Тоқтатуды жүктеу (.ics)',
    opensInNewTab: '(жаңа қойындыда ашылады)',
  },
})
