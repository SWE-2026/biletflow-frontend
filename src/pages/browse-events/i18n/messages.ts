import { createMessages, plural } from '@/shared/i18n'

export const useBrowseMessages = createMessages({
  en: {
    title: 'Browse events',
    loading: 'Loading events…',
    search: 'Search events',
    searchPlaceholder: 'Title, venue or category',
    categories: 'Categories',
    allCategories: 'All',
    found: (count: number) => `${count} ${plural('en', count, { one: 'event', other: 'events' })}`,
    emptyTitle: 'No upcoming events yet',
    emptyHint: 'Check back soon: new events appear here as soon as organizers publish them.',
    noMatches: 'No events match your filters.',
    clearFilters: 'Clear filters',
  },
  ru: {
    title: 'Афиша',
    loading: 'Загружаем мероприятия…',
    search: 'Поиск мероприятий',
    searchPlaceholder: 'Название, площадка или категория',
    categories: 'Категории',
    allCategories: 'Все',
    found: (count) =>
      `${count} ${plural('ru', count, { one: 'мероприятие', few: 'мероприятия', other: 'мероприятий' })}`,
    emptyTitle: 'Предстоящих мероприятий пока нет',
    emptyHint: 'Загляните позже: новые мероприятия появляются здесь сразу после публикации.',
    noMatches: 'По выбранным фильтрам ничего не найдено.',
    clearFilters: 'Сбросить фильтры',
  },
  kk: {
    title: 'Афиша',
    loading: 'Іс-шаралар жүктелуде…',
    search: 'Іс-шараларды іздеу',
    searchPlaceholder: 'Атауы, алаңы немесе санаты',
    categories: 'Санаттар',
    allCategories: 'Барлығы',
    found: (count) => `${count} іс-шара`,
    emptyTitle: 'Әзірге алдағы іс-шаралар жоқ',
    emptyHint: 'Кейінірек кіріңіз: жаңа іс-шаралар жарияланғаннан кейін бірден осында шығады.',
    noMatches: 'Таңдалған сүзгілер бойынша ештеңе табылмады.',
    clearFilters: 'Сүзгілерді тазалау',
  },
})
