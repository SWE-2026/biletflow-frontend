import { createMessages } from '@/shared/i18n'

export const useCampaignMessages = createMessages({
  en: {
    percentOff: (percent: number) => `${percent}% off`,
    amountOff: (amount: string) => `${amount} off`,
    allTickets: 'all tickets',
    onlyTickets: (names: string) => names,
    discountOn: (discount: string, scope: string) => `${discount} ${scope}`,
    oncePerOrder: 'once per order',
    validUntil: (date: string) => `Valid until ${date}`,
    // API error codes (biletflow-api/docs/api.md, Promo lookup)
    promo_not_found: 'This promo code doesn’t exist for this event. Check the spelling.',
    promo_disabled: 'This promo code has been turned off by the organizer.',
    promo_not_started: 'This promo code isn’t active yet.',
    promo_expired: 'This promo code has expired.',
    promo_exhausted: 'This promo code has been used up.',
    promo_not_applicable: 'This promo code doesn’t apply to the tickets you picked.',
  },
  ru: {
    percentOff: (percent) => `Скидка ${percent}%`,
    amountOff: (amount) => `Скидка ${amount}`,
    allTickets: 'на все билеты',
    onlyTickets: (names) => `на билеты: ${names}`,
    discountOn: (discount, scope) => `${discount} ${scope}`,
    oncePerOrder: 'один раз на заказ',
    validUntil: (date) => `Действует до ${date}`,
    promo_not_found: 'Такого промокода для этого мероприятия нет. Проверьте написание.',
    promo_disabled: 'Организатор отключил этот промокод.',
    promo_not_started: 'Этот промокод ещё не действует.',
    promo_expired: 'Срок действия промокода истёк.',
    promo_exhausted: 'Промокод больше нельзя использовать: лимит исчерпан.',
    promo_not_applicable: 'Промокод не действует на выбранные билеты.',
  },
  kk: {
    percentOff: (percent) => `${percent}% жеңілдік`,
    amountOff: (amount) => `${amount} жеңілдік`,
    allTickets: 'Барлық билеттерге',
    onlyTickets: (names) => `${names} билеттеріне`,
    discountOn: (discount, scope) => `${scope} ${discount}`,
    oncePerOrder: 'бір тапсырысқа бір рет',
    validUntil: (date) => `${date} дейін жарамды`,
    promo_not_found: 'Бұл іс-шара үшін мұндай промокод жоқ. Жазылуын тексеріңіз.',
    promo_disabled: 'Ұйымдастырушы бұл промокодты өшірді.',
    promo_not_started: 'Бұл промокод әлі жарамсыз.',
    promo_expired: 'Промокодтың мерзімі өтті.',
    promo_exhausted: 'Промокодтың лимиті таусылды.',
    promo_not_applicable: 'Промокод таңдалған билеттерге қолданылмайды.',
  },
})

export type CampaignMessages = ReturnType<typeof useCampaignMessages>

/** Promo error codes for `getErrorMessage(err, promoErrorMessages(t))`. */
export const promoErrorMessages = (t: CampaignMessages) => ({
  promo_not_found: t.promo_not_found,
  promo_disabled: t.promo_disabled,
  promo_not_started: t.promo_not_started,
  promo_expired: t.promo_expired,
  promo_exhausted: t.promo_exhausted,
  promo_not_applicable: t.promo_not_applicable,
})
