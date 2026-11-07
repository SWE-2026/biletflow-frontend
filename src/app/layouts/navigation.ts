import type { Params } from 'react-router'
import type { AppMessages } from '../i18n/messages'

export type Area = 'attendee' | 'organizer' | 'admin'

export type NavItem = {
  to: string
  label: string
  end?: boolean
}

export type SubNav = {
  title?: string
  back?: NavItem
  items: NavItem[]
}

export type RouteHandle = {
  area: Area
  /** Builds the second header row; `t` gives the labels in the current language. */
  subNav: (params: Params, t: AppMessages) => SubNav
}

export const areas = (t: AppMessages): (NavItem & { area: Area })[] => [
  { area: 'attendee', to: '/events', label: t.events },
  { area: 'organizer', to: '/organizer', label: t.organizer },
  { area: 'admin', to: '/admin', label: t.admin },
]

export const attendeeHandle: RouteHandle = {
  area: 'attendee',
  subNav: (_params, t) => ({
    items: [
      { to: '/events', label: t.browseEvents },
      { to: '/account/tickets', label: t.myTickets },
      { to: '/account/orders', label: t.myOrders },
      { to: '/account/support', label: t.support },
    ],
  }),
}

export const organizerHandle: RouteHandle = {
  area: 'organizer',
  subNav: (_params, t) => ({
    items: [
      { to: '/organizer', label: t.dashboard, end: true },
      { to: '/organizer/events/new', label: t.newEvent },
      { to: '/organizer/support', label: t.platformSupport },
      { to: '/organizer/profile', label: t.profileAndPayouts },
    ],
  }),
}

export const organizerEventHandle: RouteHandle = {
  area: 'organizer',
  subNav: ({ eventId = '' }, t) => {
    const base = `/organizer/events/${eventId}`

    return {
      title: t.eventTitle(eventId),
      back: { to: '/organizer', label: t.dashboard },
      items: [
        { to: base, label: t.overview, end: true },
        { to: `${base}/edit`, label: t.edit },
        { to: `${base}/tickets`, label: t.tickets },
        { to: `${base}/seating`, label: t.seating },
        { to: `${base}/activation`, label: t.paidSales },
        { to: `${base}/attendees`, label: t.attendees },
        { to: `${base}/orders`, label: t.orders },
        { to: `${base}/campaigns`, label: t.campaigns },
        { to: `${base}/staff`, label: t.staff },
        { to: `${base}/analytics`, label: t.analytics },
        { to: `${base}/history`, label: t.history },
        { to: `${base}/support`, label: t.support },
      ],
    }
  },
}

export const adminHandle: RouteHandle = {
  area: 'admin',
  subNav: (_params, t) => ({
    items: [
      { to: '/admin', label: t.dashboard, end: true },
      { to: '/admin/users', label: t.users },
      { to: '/admin/events', label: t.events },
      { to: '/admin/moderation', label: t.reported },
      { to: '/admin/orders', label: t.orders },
      { to: '/admin/payments', label: t.payments },
      { to: '/admin/activations', label: t.activations },
      { to: '/admin/refunds', label: t.refundsAndDisputes },
      { to: '/admin/campaigns', label: t.promoActivity },
      { to: '/admin/support', label: t.support },
      { to: '/admin/reports', label: t.reports },
      { to: '/admin/settings', label: t.settings },
    ],
  }),
}
