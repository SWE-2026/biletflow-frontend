import { createMessages } from '@/shared/i18n'

export const useNotFoundMessages = createMessages({
  en: {
    code: 'Error 404',
    title: 'Page not found',
    hint: 'The link may be broken, or the page may have been moved or removed.',
    home: 'Go to the home page',
    browse: 'Browse events',
  },
  ru: {
    code: 'Ошибка 404',
    title: 'Страница не найдена',
    hint: 'Возможно, ссылка неверна, или страницу переместили или удалили.',
    home: 'На главную',
    browse: 'Афиша мероприятий',
  },
  kk: {
    code: '404 қатесі',
    title: 'Бет табылмады',
    hint: 'Сілтеме қате болуы мүмкін немесе бет жылжытылған не жойылған.',
    home: 'Басты бетке өту',
    browse: 'Іс-шаралар афишасы',
  },
})
