import { createMessages, pickMessages, type Dictionary } from './createMessages'

const en = {
  loading: 'Loading…',
  somethingWentWrong: 'Something went wrong',
  tryAgain: 'Try again',
  unexpectedError: 'Something went wrong. Check your connection and try again.',
  networkError: 'Cannot reach BiletFlow. Check your connection and try again.',
  requestFailed: (status: number) => `Request failed (${status}).`,
  otpDigit: (index: number, length: number) => `Digit ${index} of ${length}`,
  language: 'Language',
  // Generic API error codes (biletflow-api/docs/api.md#errors)
  invalid_json: 'The request could not be read. Reload the page and try again.',
  validation_failed: 'Some fields are invalid.',
  unauthorized: 'Your session has ended. Sign in again.',
  forbidden: 'You don’t have access to this.',
  not_found: 'Not found.',
  rate_limited: 'Too many requests. Wait a moment and try again.',
  internal: 'Something went wrong on our side. Try again later.',
}

const dictionary: Dictionary<typeof en> = {
  en,
  ru: {
    loading: 'Загрузка…',
    somethingWentWrong: 'Что-то пошло не так',
    tryAgain: 'Повторить',
    unexpectedError: 'Что-то пошло не так. Проверьте подключение и попробуйте ещё раз.',
    networkError: 'Не удаётся связаться с BiletFlow. Проверьте подключение и попробуйте ещё раз.',
    requestFailed: (status) => `Запрос не выполнен (${status}).`,
    otpDigit: (index, length) => `Цифра ${index} из ${length}`,
    language: 'Язык',
    invalid_json: 'Не удалось обработать запрос. Обновите страницу и попробуйте ещё раз.',
    validation_failed: 'Некоторые поля заполнены неверно.',
    unauthorized: 'Сеанс завершён. Войдите снова.',
    forbidden: 'У вас нет доступа.',
    not_found: 'Не найдено.',
    rate_limited: 'Слишком много запросов. Подождите немного и попробуйте снова.',
    internal: 'На нашей стороне произошла ошибка. Попробуйте позже.',
  },
  kk: {
    loading: 'Жүктелуде…',
    somethingWentWrong: 'Бірдеңе дұрыс болмады',
    tryAgain: 'Қайталау',
    unexpectedError: 'Бірдеңе дұрыс болмады. Байланысты тексеріп, қайталап көріңіз.',
    networkError: 'BiletFlow-ға қосылу мүмкін емес. Байланысты тексеріп, қайталап көріңіз.',
    requestFailed: (status) => `Сұраныс орындалмады (${status}).`,
    otpDigit: (index, length) => `${length} цифрдың ${index}-сі`,
    language: 'Тіл',
    invalid_json: 'Сұранысты өңдеу мүмкін болмады. Бетті жаңартып, қайталап көріңіз.',
    validation_failed: 'Кейбір өрістер қате толтырылған.',
    unauthorized: 'Сеанс аяқталды. Қайта кіріңіз.',
    forbidden: 'Сізде бұған рұқсат жоқ.',
    not_found: 'Табылмады.',
    rate_limited: 'Сұраныстар тым көп. Біраз күтіп, қайталап көріңіз.',
    internal: 'Біз жақта қате шықты. Кейінірек қайталап көріңіз.',
  },
}

/** Generic UI strings shared by every layer. */
export const useCommonMessages = createMessages(dictionary)

/** Generic UI strings outside React. */
export const getCommonMessages = () => pickMessages(dictionary)
