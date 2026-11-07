/**
 * What a promo code or campaign link gives, as the server describes it. Display only: the server
 * computes and enforces every discount at checkout (SRS 4.14).
 */
export type Promo = {
  code: string
  name: string
  discountType: 'percent' | 'fixed'
  /** 1–100 for `percent`, whole KZT for `fixed` (taken once per order). */
  discountValue: number
  /** Empty means every ticket type of the event. */
  ticketTypeIds: string[]
  endsAt: string | null
}

/** Look a promo up by the code a buyer typed, or by the opaque token in a campaign link. */
export type PromoQuery = { code: string } | { campaign: string }
