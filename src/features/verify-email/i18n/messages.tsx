import type { ReactNode } from 'react'
import { createMessages, plural } from '@/shared/i18n'

export const useVerifyEmailMessages = createMessages({
  en: {
    verifyEmail: 'Verify email',
    sendingCode: 'Sending code…',
    intro: (email: ReactNode) => (
      <>We’ll email a 6-digit code to {email}. You stay signed in.</>
    ),
    codeSent: (email: ReactNode, length: number, minutes: number) => (
      <>
        We sent a {length}-digit code to {email}. It expires in {minutes}{' '}
        {plural('en', minutes, { one: 'minute', other: 'minutes' })}.
      </>
    ),
    earlierCode: (email: ReactNode) => (
      <>We sent a code to {email} moments ago. It still works, so enter it here.</>
    ),
    verificationCode: 'Verification code',
    enterAllDigits: (length: number) => `Enter all ${length} digits of the code.`,
    confirm: 'Verify',
    verifying: 'Verifying…',
    cancel: 'Cancel',
    resendCode: 'Resend code',
    resendIn: (seconds: number) => `Resend code in ${seconds}s`,
    sendingNewCode: 'Sending a new code',
    localMode: (code: ReactNode) => (
      <>
        <span className="font-semibold">Local mode:</span> no email is sent. Your code is {code}
      </>
    ),
    verified: 'Your email is verified.',
    // API error codes (biletflow-api/docs/api.md#errors)
    invalid_code: 'That code is incorrect.',
    code_expired: 'This code has expired or was already used. Request a new one.',
    too_many_attempts: 'Too many attempts. Request a new code.',
    resend_too_soon: 'Wait a little before requesting another code.',
    account_suspended: 'This account is suspended. Contact support.',
  },
  ru: {
    verifyEmail: 'Подтвердить почту',
    sendingCode: 'Отправляем код…',
    intro: (email) => (
      <>Мы отправим 6-значный код на {email}. Выходить из аккаунта не нужно.</>
    ),
    codeSent: (email, length, minutes) => (
      <>
        Мы отправили {length}-значный код на {email}. Он действует {minutes}{' '}
        {plural('ru', minutes, { one: 'минуту', few: 'минуты', other: 'минут' })}.
      </>
    ),
    earlierCode: (email) => (
      <>Мы только что отправили код на {email}. Он ещё действует, введите его здесь.</>
    ),
    verificationCode: 'Код подтверждения',
    enterAllDigits: (length) => `Введите все ${length} цифр кода.`,
    confirm: 'Подтвердить',
    verifying: 'Проверяем…',
    cancel: 'Отмена',
    resendCode: 'Отправить код ещё раз',
    resendIn: (seconds) => `Повторная отправка через ${seconds} с`,
    sendingNewCode: 'Отправляем новый код',
    localMode: (code) => (
      <>
        <span className="font-semibold">Локальный режим:</span> письмо не отправляется. Ваш код:{' '}
        {code}
      </>
    ),
    verified: 'Почта подтверждена.',
    invalid_code: 'Неверный код.',
    code_expired: 'Срок действия кода истёк или он уже использован. Запросите новый.',
    too_many_attempts: 'Слишком много попыток. Запросите новый код.',
    resend_too_soon: 'Подождите немного, прежде чем запрашивать новый код.',
    account_suspended: 'Аккаунт заблокирован. Обратитесь в поддержку.',
  },
  kk: {
    verifyEmail: 'Поштаны растау',
    sendingCode: 'Код жіберілуде…',
    intro: (email) => (
      <>{email} мекенжайына 6 таңбалы код жібереміз. Тіркелгіден шығудың қажеті жоқ.</>
    ),
    codeSent: (email, length, minutes) => (
      <>
        {email} мекенжайына {length} таңбалы код жібердік. Ол {minutes} минут жарамды.
      </>
    ),
    earlierCode: (email) => (
      <>{email} мекенжайына жаңа ғана код жібердік. Ол әлі жарамды, оны осында енгізіңіз.</>
    ),
    verificationCode: 'Растау коды',
    enterAllDigits: (length) => `Кодтың барлық ${length} цифрын енгізіңіз.`,
    confirm: 'Растау',
    verifying: 'Тексерілуде…',
    cancel: 'Бас тарту',
    resendCode: 'Кодты қайта жіберу',
    resendIn: (seconds) => `${seconds} с кейін қайта жіберу`,
    sendingNewCode: 'Жаңа код жіберілуде',
    localMode: (code) => (
      <>
        <span className="font-semibold">Жергілікті режим:</span> хат жіберілмейді. Сіздің кодыңыз:{' '}
        {code}
      </>
    ),
    verified: 'Поштаңыз расталды.',
    invalid_code: 'Код қате.',
    code_expired: 'Кодтың мерзімі өтті немесе ол қолданылған. Жаңасын сұраңыз.',
    too_many_attempts: 'Әрекеттер тым көп. Жаңа код сұраңыз.',
    resend_too_soon: 'Жаңа код сұрамас бұрын біраз күтіңіз.',
    account_suspended: 'Тіркелгі бұғатталған. Қолдау қызметіне хабарласыңыз.',
  },
})

export type VerifyEmailMessages = ReturnType<typeof useVerifyEmailMessages>

/** API error codes this feature translates itself. */
export const verifyEmailErrorMessages = (t: VerifyEmailMessages) => ({
  invalid_code: t.invalid_code,
  code_expired: t.code_expired,
  too_many_attempts: t.too_many_attempts,
  resend_too_soon: t.resend_too_soon,
  account_suspended: t.account_suspended,
})
