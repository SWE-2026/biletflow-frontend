import { createMessages } from '@/shared/i18n'

export const useRegisterMessages = createMessages({
  en: {
    quantity: 'Tickets',
    register: 'Register',
    registering: 'Registering…',
    signInToRegister: 'Sign in to register',
    verifyEmail:
      'Verify your email to register: sign out, then sign in with an email code. That confirms your address.',
    // API error codes (biletflow-api/docs/api.md, Registration)
    payment_required: 'This ticket isn’t free. Buy it through checkout.',
    registration_closed: 'Registration for this ticket is closed.',
    ticket_limit_reached: 'That’s more tickets than one registration allows.',
    sold_out: 'Not enough tickets left. Try a smaller number.',
    email_unverified:
      'Verify your email to register: sign out, then sign in with an email code. That confirms your address.',
    not_found: 'This ticket is no longer available.',
  },
  ru: {
    quantity: 'Билеты',
    register: 'Зарегистрироваться',
    registering: 'Регистрируем…',
    signInToRegister: 'Войдите, чтобы зарегистрироваться',
    verifyEmail:
      'Чтобы зарегистрироваться, подтвердите почту: выйдите и войдите снова по коду из письма.',
    payment_required: 'Этот билет платный. Купите его через оформление заказа.',
    registration_closed: 'Регистрация на этот билет закрыта.',
    ticket_limit_reached: 'Столько билетов за одну регистрацию взять нельзя.',
    sold_out: 'Осталось меньше билетов. Попробуйте выбрать меньше.',
    email_unverified:
      'Чтобы зарегистрироваться, подтвердите почту: выйдите и войдите снова по коду из письма.',
    not_found: 'Этот билет больше недоступен.',
  },
  kk: {
    quantity: 'Билеттер',
    register: 'Тіркелу',
    registering: 'Тіркелуде…',
    signInToRegister: 'Тіркелу үшін кіріңіз',
    verifyEmail:
      'Тіркелу үшін поштаңызды растаңыз: шығып, хаттағы кодпен қайта кіріңіз.',
    payment_required: 'Бұл билет ақылы. Оны тапсырыс беру арқылы сатып алыңыз.',
    registration_closed: 'Бұл билетке тіркеу жабық.',
    ticket_limit_reached: 'Бір тіркеуде мұнша билет алуға болмайды.',
    sold_out: 'Билеттер жеткіліксіз. Азырақ санды таңдаңыз.',
    email_unverified:
      'Тіркелу үшін поштаңызды растаңыз: шығып, хаттағы кодпен қайта кіріңіз.',
    not_found: 'Бұл билет енді қолжетімсіз.',
  },
})
