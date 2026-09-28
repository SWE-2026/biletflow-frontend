import type { Params } from 'react-router'

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
  subNav: (params: Params) => SubNav
}

export const areas: (NavItem & { area: Area })[] = [
  { area: 'attendee', to: '/events', label: 'Events' },
  { area: 'organizer', to: '/organizer', label: 'Organizer' },
  { area: 'admin', to: '/admin', label: 'Admin' },
]

export const attendeeHandle: RouteHandle = {
  area: 'attendee',
  subNav: () => ({
    items: [
      { to: '/events', label: 'Browse Events' },
      { to: '/account/tickets', label: 'My Tickets' },
      { to: '/account/orders', label: 'My Orders' },
      { to: '/account/support', label: 'Support' },
    ],
  }),
}

export const organizerHandle: RouteHandle = {
  area: 'organizer',
  subNav: () => ({
    items: [
      { to: '/organizer', label: 'Dashboard', end: true },
      { to: '/organizer/events/new', label: 'New Event' },
      { to: '/organizer/support', label: 'Platform Support' },
      { to: '/organizer/profile', label: 'Profile & Payouts' },
    ],
  }),
}

export const organizerEventHandle: RouteHandle = {
  area: 'organizer',
  subNav: ({ eventId }) => {
    const base = `/organizer/events/${eventId}`

    return {
      title: `Event ${eventId}`,
      back: { to: '/organizer', label: 'Dashboard' },
      items: [
        { to: base, label: 'Overview', end: true },
        { to: `${base}/edit`, label: 'Edit' },
        { to: `${base}/tickets`, label: 'Tickets' },
        { to: `${base}/seating`, label: 'Seating' },
        { to: `${base}/activation`, label: 'Paid Sales' },
        { to: `${base}/attendees`, label: 'Attendees' },
        { to: `${base}/orders`, label: 'Orders' },
        { to: `${base}/campaigns`, label: 'Campaigns' },
        { to: `${base}/staff`, label: 'Staff' },
        { to: `${base}/analytics`, label: 'Analytics' },
        { to: `${base}/history`, label: 'History' },
        { to: `${base}/support`, label: 'Support' },
      ],
    }
  },
}

export const adminHandle: RouteHandle = {
  area: 'admin',
  subNav: () => ({
    items: [
      { to: '/admin', label: 'Dashboard', end: true },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/events', label: 'Events' },
      { to: '/admin/moderation', label: 'Reported' },
      { to: '/admin/orders', label: 'Orders' },
      { to: '/admin/payments', label: 'Payments' },
      { to: '/admin/activations', label: 'Activations' },
      { to: '/admin/refunds', label: 'Refunds & Disputes' },
      { to: '/admin/campaigns', label: 'Promo Activity' },
      { to: '/admin/support', label: 'Support' },
      { to: '/admin/reports', label: 'Reports' },
      { to: '/admin/settings', label: 'Settings' },
    ],
  }),
}
