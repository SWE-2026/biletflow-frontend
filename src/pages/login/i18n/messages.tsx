import type { ReactNode } from 'react'
import { createMessages, plural } from '@/shared/i18n'

export const useLoginMessages = createMessages({
  en: {
    titleSignIn: 'Sign in to BiletFlow',
    titleSignUp: 'Create your account',
    titleReset: 'Reset your password',
    signInMethod: 'Sign-in method',
    methodCode: 'Email code',
    methodPassword: 'Password',
    newHere: 'New here? Signing in with a code creates your account. ',
    backToSignIn: 'Back to sign in',
    createWithPassword: 'Create an account with a password',
    email: 'Email',
    emailPlaceholder: 'name@example.com',
    password: 'Password',
    newPassword: 'New password',
    yourName: 'Your name',
    invalidEmail: 'Enter a valid email address, like name@example.com.',
    enterName: 'Enter your name.',
    enterEmailAndPassword: 'Enter your email and password.',
    passwordTooShort: (min: number) => `Use at least ${min} characters.`,
    passwordHint: (min: number) => `At least ${min} characters.`,
    passwordTooLong: 'This password is too long.',
    enterAllDigits: (length: number) => `Enter all ${length} digits of the code.`,
    // Email code
    codeHint: 'We’ll email you a 6-digit code. No password needed.',
    continue: 'Continue',
    sendingCode: 'Sending code…',
    codeSent: (email: ReactNode, length: number, minutes: number) => (
      <>
        We sent a {length}-digit code to {email}. It expires in {minutes}{' '}
        {plural('en', minutes, { one: 'minute', other: 'minutes' })}.
      </>
    ),
    verificationCode: 'Verification code',
    signInButton: 'Sign in',
    verifying: 'Verifying…',
    signingIn: 'Signing in…',
    useDifferentEmail: 'Use a different email',
    resendCode: 'Resend code',
    resendIn: (seconds: number) => `Resend code in ${seconds}s`,
    sendingNewCode: 'Sending a new code',
    localMode: (code: ReactNode) => (
      <>
        <span className="font-semibold">Local mode:</span> no email is sent. Your code is {code}
      </>
    ),
    // Password
    forgotPassword: 'Forgot password?',
    // Sign up
    createAccount: 'Create account',
    creatingAccount: 'Creating account…',
    verifyNotice: 'We’ll email you a code to verify your address.',
    // Reset
    resetHint: 'We’ll email you a 6-digit code to set a new password.',
    sendResetCode: 'Send reset code',
    resetCodeSent: (email: ReactNode, length: number, minutes: number) => (
      <>
        If an account exists for {email}, we sent it a {length}-digit code. It expires in{' '}
        {minutes} {plural('en', minutes, { one: 'minute', other: 'minutes' })}.
      </>
    ),
    resetCode: 'Reset code',
    setNewPassword: 'Set new password',
    saving: 'Saving…',
    signsOutEverywhere: 'This signs you out on every other device.',
    // API error codes (biletflow-api/docs/api.md#errors)
    invalid_code: 'That code is incorrect.',
    code_expired: 'This code has expired or was already used. Request a new one.',
    too_many_attempts: 'Too many attempts. Request a new code.',
    resend_too_soon: 'Wait a little before requesting another code.',
    invalid_credentials: 'Wrong email or password.',
    email_taken: 'An account with this email already exists. Sign in instead.',
    account_suspended: 'This account is suspended. Contact support.',
  },
  ru: {
    titleSignIn: 'Вход в BiletFlow',
    titleSignUp: 'Создание аккаунта',
    titleReset: 'Сброс пароля',
    signInMethod: 'Способ входа',
    methodCode: 'Код на почту',
    methodPassword: 'Пароль',
    newHere: 'Впервые здесь? Вход по коду создаст аккаунт. ',
    backToSignIn: 'Вернуться ко входу',
    createWithPassword: 'Создать аккаунт с паролем',
    email: 'Эл. почта',
    emailPlaceholder: 'name@example.com',
    password: 'Пароль',
    newPassword: 'Новый пароль',
    yourName: 'Ваше имя',
    invalidEmail: 'Введите корректный адрес почты, например name@example.com.',
    enterName: 'Введите имя.',
    enterEmailAndPassword: 'Введите почту и пароль.',
    passwordTooShort: (min) =>
      `Минимум ${min} ${plural('ru', min, { one: 'символ', few: 'символа', other: 'символов' })}.`,
    passwordHint: (min) =>
      `Не менее ${min} ${plural('ru', min, { one: 'символа', other: 'символов' })}.`,
    passwordTooLong: 'Пароль слишком длинный.',
    enterAllDigits: (length) => `Введите все ${length} цифр кода.`,
    codeHint: 'Мы отправим на почту 6-значный код. Пароль не нужен.',
    continue: 'Продолжить',
    sendingCode: 'Отправляем код…',
    codeSent: (email, length, minutes) => (
      <>
        Мы отправили {length}-значный код на {email}. Он действует {minutes}{' '}
        {plural('ru', minutes, { one: 'минуту', few: 'минуты', other: 'минут' })}.
      </>
    ),
    verificationCode: 'Код подтверждения',
    signInButton: 'Войти',
    verifying: 'Проверяем…',
    signingIn: 'Входим…',
    useDifferentEmail: 'Указать другую почту',
    resendCode: 'Отправить код ещё раз',
    resendIn: (seconds) => `Повторная отправка через ${seconds} с`,
    sendingNewCode: 'Отправляем новый код',
    localMode: (code) => (
      <>
        <span className="font-semibold">Локальный режим:</span> письмо не отправляется. Ваш код:{' '}
        {code}
      </>
    ),
    forgotPassword: 'Забыли пароль?',
    createAccount: 'Создать аккаунт',
    creatingAccount: 'Создаём аккаунт…',
    verifyNotice: 'Мы отправим на почту код для подтверждения адреса.',
    resetHint: 'Мы отправим на почту 6-значный код для смены пароля.',
    sendResetCode: 'Отправить код',
    resetCodeSent: (email, length, minutes) => (
      <>
        Если аккаунт с адресом {email} существует, мы отправили на него {length}-значный код. Он
        действует {minutes}{' '}
        {plural('ru', minutes, { one: 'минуту', few: 'минуты', other: 'минут' })}.
      </>
    ),
    resetCode: 'Код для сброса',
    setNewPassword: 'Сохранить новый пароль',
    saving: 'Сохраняем…',
    signsOutEverywhere: 'Вы выйдете из аккаунта на всех остальных устройствах.',
    invalid_code: 'Неверный код.',
    code_expired: 'Срок действия кода истёк или он уже использован. Запросите новый.',
    too_many_attempts: 'Слишком много попыток. Запросите новый код.',
    resend_too_soon: 'Подождите немного, прежде чем запрашивать новый код.',
    invalid_credentials: 'Неверная почта или пароль.',
    email_taken: 'Аккаунт с этой почтой уже существует. Войдите в него.',
    account_suspended: 'Аккаунт заблокирован. Обратитесь в поддержку.',
  },
  kk: {
    titleSignIn: 'BiletFlow-ға кіру',
    titleSignUp: 'Тіркелгі жасау',
    titleReset: 'Құпиясөзді қалпына келтіру',
    signInMethod: 'Кіру тәсілі',
    methodCode: 'Поштаға код',
    methodPassword: 'Құпиясөз',
    newHere: 'Мұнда алғаш рет пе? Кодпен кірсеңіз, тіркелгі автоматты түрде жасалады. ',
    backToSignIn: 'Кіруге оралу',
    createWithPassword: 'Құпиясөзбен тіркелгі жасау',
    email: 'Эл. пошта',
    emailPlaceholder: 'name@example.com',
    password: 'Құпиясөз',
    newPassword: 'Жаңа құпиясөз',
    yourName: 'Атыңыз',
    invalidEmail: 'Дұрыс пошта мекенжайын енгізіңіз, мысалы name@example.com.',
    enterName: 'Атыңызды енгізіңіз.',
    enterEmailAndPassword: 'Пошта мен құпиясөзді енгізіңіз.',
    passwordTooShort: (min) => `Кемінде ${min} таңба қолданыңыз.`,
    passwordHint: (min) => `Кемінде ${min} таңба.`,
    passwordTooLong: 'Құпиясөз тым ұзын.',
    enterAllDigits: (length) => `Кодтың барлық ${length} цифрын енгізіңіз.`,
    codeHint: 'Поштаңызға 6 таңбалы код жібереміз. Құпиясөз қажет емес.',
    continue: 'Жалғастыру',
    sendingCode: 'Код жіберілуде…',
    codeSent: (email, length, minutes) => (
      <>
        {email} мекенжайына {length} таңбалы код жібердік. Ол {minutes} минут жарамды.
      </>
    ),
    verificationCode: 'Растау коды',
    signInButton: 'Кіру',
    verifying: 'Тексерілуде…',
    signingIn: 'Кіруде…',
    useDifferentEmail: 'Басқа поштаны көрсету',
    resendCode: 'Кодты қайта жіберу',
    resendIn: (seconds) => `${seconds} с кейін қайта жіберу`,
    sendingNewCode: 'Жаңа код жіберілуде',
    localMode: (code) => (
      <>
        <span className="font-semibold">Жергілікті режим:</span> хат жіберілмейді. Сіздің кодыңыз:{' '}
        {code}
      </>
    ),
    forgotPassword: 'Құпиясөзді ұмыттыңыз ба?',
    createAccount: 'Тіркелгі жасау',
    creatingAccount: 'Тіркелгі жасалуда…',
    verifyNotice: 'Мекенжайыңызды растау үшін поштаңызға код жібереміз.',
    resetHint: 'Жаңа құпиясөз орнату үшін поштаңызға 6 таңбалы код жібереміз.',
    sendResetCode: 'Код жіберу',
    resetCodeSent: (email, length, minutes) => (
      <>
        Егер {email} мекенжайымен тіркелгі бар болса, оған {length} таңбалы код жібердік. Ол{' '}
        {minutes} минут жарамды.
      </>
    ),
    resetCode: 'Қалпына келтіру коды',
    setNewPassword: 'Жаңа құпиясөзді сақтау',
    saving: 'Сақталуда…',
    signsOutEverywhere: 'Басқа құрылғылардың барлығында тіркелгіден шығасыз.',
    invalid_code: 'Код қате.',
    code_expired: 'Кодтың мерзімі өтті немесе ол қолданылған. Жаңасын сұраңыз.',
    too_many_attempts: 'Әрекеттер тым көп. Жаңа код сұраңыз.',
    resend_too_soon: 'Жаңа код сұрамас бұрын біраз күтіңіз.',
    invalid_credentials: 'Пошта немесе құпиясөз қате.',
    email_taken: 'Бұл поштамен тіркелгі бар. Соған кіріңіз.',
    account_suspended: 'Тіркелгі бұғатталған. Қолдау қызметіне хабарласыңыз.',
  },
})

export type LoginMessages = ReturnType<typeof useLoginMessages>

/** API error codes the login forms translate themselves. */
export const authErrorMessages = (t: LoginMessages) => ({
  invalid_code: t.invalid_code,
  code_expired: t.code_expired,
  too_many_attempts: t.too_many_attempts,
  resend_too_soon: t.resend_too_soon,
  invalid_credentials: t.invalid_credentials,
  email_taken: t.email_taken,
  account_suspended: t.account_suspended,
})
