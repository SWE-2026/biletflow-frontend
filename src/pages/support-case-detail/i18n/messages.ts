import { createMessages } from '@/shared/i18n'

export const useSupportDetailMessages = createMessages({
  en: {
    back: 'Back to support cases',
    loading: 'Loading support conversation…',
    notFound: 'Support case not found',
    notFoundHint: 'This case may not exist or you do not have permission to view it.',
    errorLoad: 'Could not load support case.',
    errorSend: 'Could not send message.',
    errorStatus: 'Could not update case status.',
    errorAssign: 'Could not update assignment.',

    requester: 'Requester',
    category: 'Category',
    event: 'Event',
    order: 'Order',
    ticket: 'Ticket',
    assignee: 'Assigned to',
    unassigned: 'Unassigned',
    assignToMe: 'Assign to me',
    status: 'Status',
    changeStatus: 'Change status',

    statusChangeNotice: (status: string) => `Status changed to ${status}`,
    assignmentNotice: (email: string) => `Assigned to ${email}`,
    unassignmentNotice: 'Case unassigned',

    replyTitle: 'Send a reply',
    replyPlaceholder: 'Type your message…',
    sendButton: 'Send message',
    sending: 'Sending…',

    handlerBadge: 'Support staff',
    requesterBadge: 'Requester',
  },
  ru: {
    back: 'Назад к обращениям',
    loading: 'Загружаем переписку…',
    notFound: 'Обращение не найдено',
    notFoundHint: 'Обращение не существует или у вас нет доступа к нему.',
    errorLoad: 'Не удалось загрузить обращение.',
    errorSend: 'Не удалось отправить сообщение.',
    errorStatus: 'Не удалось изменить статус обращения.',
    errorAssign: 'Не удалось назначить сотрудника.',

    requester: 'Автор',
    category: 'Категория',
    event: 'Событие',
    order: 'Заказ',
    ticket: 'Билет',
    assignee: 'Назначено',
    unassigned: 'Не назначено',
    assignToMe: 'Назначить мне',
    status: 'Статус',
    changeStatus: 'Изменить статус',

    statusChangeNotice: (status: string) => `Статус изменен на ${status}`,
    assignmentNotice: (email: string) => `Назначено на ${email}`,
    unassignmentNotice: 'Назначение снято',

    replyTitle: 'Ответить',
    replyPlaceholder: 'Введите сообщение…',
    sendButton: 'Отправить сообщение',
    sending: 'Отправка…',

    handlerBadge: 'Поддержка',
    requesterBadge: 'Автор',
  },
  kk: {
    back: 'Сұрауларға оралу',
    loading: 'Хабарламалар жүктелуде…',
    notFound: 'Қолдау сұрауы табылмады',
    notFoundHint: 'Сұрау табылмады немесе оны көруге рұқсатыңыз жоқ.',
    errorLoad: 'Сұрауды жүктеу мүмкін болмады.',
    errorSend: 'Хабарламаны жіберу мүмкін болмады.',
    errorStatus: 'Сұрау күйін өзгерту мүмкін болмады.',
    errorAssign: 'Қызметкерді тағайындау мүмкін болмады.',

    requester: 'Жіберуші',
    category: 'Санаты',
    event: 'Іс-шара',
    order: 'Тапсырыс',
    ticket: 'Билет',
    assignee: 'Тағайындалған',
    unassigned: 'Тағайындалмаған',
    assignToMe: 'Маған тағайындау',
    status: 'Күйі',
    changeStatus: 'Күйді өзгерту',

    statusChangeNotice: (status: string) => `Күйі ${status} деп өзгертілді`,
    assignmentNotice: (email: string) => `${email} қызметкеріне тағайындалды`,
    unassignmentNotice: 'Тағайындау алынып тасталды',

    replyTitle: 'Жауап беру',
    replyPlaceholder: 'Хабарламаңызды жазыңыз…',
    sendButton: 'Хабарлама жіберу',
    sending: 'Жіберілуде…',

    handlerBadge: 'Қолдау қызметі',
    requesterBadge: 'Жіберуші',
  },
})

