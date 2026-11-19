import { createMessages } from '@/shared/i18n'

export const useStaffMessages = createMessages({
  en: {
    title: 'Event staff',
    intro: 'Assign staff who can scan tickets or supervise check-in for this event.',
    loading: 'Loading staff…',
    notFound: 'Event not found',
    notFoundHint: 'It may have been removed, or it belongs to another organizer.',
    // Table headers
    email: 'Email',
    displayName: 'Name',
    role: 'Role',
    assignedAt: 'Assigned',
    actions: 'Actions',
    // Role labels
    scanner: 'Scanner',
    supervisor: 'Supervisor',
    // Add staff form
    addStaff: 'Add staff member',
    emailPlaceholder: 'staff@example.com',
    rolePlaceholder: 'Select role',
    addButton: 'Add',
    adding: 'Adding…',
    // Remove
    remove: 'Remove',
    confirmRemove: (email: string) =>
      `Remove ${email} from this event's staff?`,
    // Empty state
    noStaff: 'No staff assigned',
    noStaffHint:
      'Add staff members to let them scan tickets or supervise check-in with the mobile app.',
    // Errors
    errorLoad: 'Could not load staff list.',
    errorAdd: 'Could not add staff member.',
    errorRemove: 'Could not remove staff member.',
    // API errors
    user_not_found: 'No account found with that email. The person must sign in to BiletFlow once to create an account.',
    invalid_event_state: "The event can't be changed in its current status.",
    role_conflict: 'That user already has a conflicting role.',
  },
  ru: {
    title: 'Персонал мероприятия',
    intro: 'Назначьте персонал для сканирования билетов или надзора за регистрацией на это мероприятие.',
    loading: 'Загружаем персонал…',
    notFound: 'Мероприятие не найдено',
    notFoundHint: 'Возможно, оно удалено или принадлежит другому организатору.',
    email: 'Email',
    displayName: 'Имя',
    role: 'Роль',
    assignedAt: 'Добавлен',
    actions: 'Действия',
    scanner: 'Сканер',
    supervisor: 'Супервайзер',
    addStaff: 'Добавить сотрудника',
    emailPlaceholder: 'staff@example.com',
    rolePlaceholder: 'Выберите роль',
    addButton: 'Добавить',
    adding: 'Добавляем…',
    remove: 'Удалить',
    confirmRemove: (email: string) =>
      `Удалить ${email} из персонала мероприятия?`,
    noStaff: 'Персонал не назначен',
    noStaffHint:
      'Добавьте сотрудников, чтобы они могли сканировать билеты или supervise регистрацию через мобильное приложение.',
    errorLoad: 'Не удалось загрузить список персонала.',
    errorAdd: 'Не удалось добавить сотрудника.',
    errorRemove: 'Не удалось удалить сотрудника.',
    user_not_found: 'Аккаунт с таким email не найден. Этот человек должен войти в BiletFlow хотя бы раз, чтобы создать аккаунт.',
    invalid_event_state: 'В текущем статусе мероприятие изменить нельзя.',
    role_conflict: 'У этого пользователя уже есть конфликтующая роль.',
  },
  kk: {
    title: 'Іс-шара персоналы',
    intro: 'Осы іс-шарада билеттерді сканерлеу немесе тіркелуді қадағалау үшін персоналды тағайындаңыз.',
    loading: 'Персонал жүктелуде…',
    notFound: 'Іс-шара табылмады',
    notFoundHint: 'Ол жойылған болуы немесе басқа ұйымдастырушыға тиесілі болуы мүмкін.',
    email: 'Email',
    displayName: 'Аты',
    role: 'Рөлі',
    assignedAt: 'Тағайындалды',
    actions: 'Әрекеттер',
    scanner: 'Сканер',
    supervisor: 'Супервайзер',
    addStaff: 'Қызметкер қосу',
    emailPlaceholder: 'staff@example.com',
    rolePlaceholder: 'Рөлді таңдаңыз',
    addButton: 'Қосу',
    adding: 'Қосылуда…',
    remove: 'Жою',
    confirmRemove: (email: string) =>
      `${email} пайдаланушысын іс-шара персоналынан шығару керек пе?`,
    noStaff: 'Персонал тағайындалмаған',
    noStaffHint:
      'Қызметкерлерді қосыңыз, олар мобильді қосымша арқылы билеттерді сканерлей немесе тіркелуді қадағалай алады.',
    errorLoad: 'Персонал тізімін жүктеу мүмкін болмады.',
    errorAdd: 'Қызметкерді қосу мүмкін болмады.',
    errorRemove: 'Қызметкерді жою мүмкін болмады.',
    user_not_found: 'Бұл email-мен аккаунт табылмады. Бұл адам BiletFlow-ға бір рет кіруі керек.',
    invalid_event_state: 'Іс-шараны қазіргі мәртебесінде өзгертуге болмайды.',
    role_conflict: 'Бұл пайдаланушының қайшылықты рөлі бар.',
  },
})
