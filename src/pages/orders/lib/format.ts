/** A short, readable order or ticket reference; the full ID is in the tooltip and on the printed ticket. */
export const shortId = (id: string) => id.slice(0, 8).toUpperCase()

/** Orders carry no event time zone, so ordering and payment times use the viewer's own. */
export const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
