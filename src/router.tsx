import { createBrowserRouter } from 'react-router'
import NavLayout, { type NavItem } from './layouts/NavLayout'
import OrganizerEventLayout from './layouts/OrganizerEventLayout'
import Placeholder from './pages/Placeholder'

const page = (title: string) => <Placeholder title={title} />

const publicNav: NavItem[] = [
  { to: '/events', label: 'Events' },
  { to: '/account/tickets', label: 'My Tickets' },
  { to: '/account/orders', label: 'My Orders' },
  { to: '/account/support', label: 'Support' },
  { to: '/organizer', label: 'Organizer' },
  { to: '/login', label: 'Sign In' },
]

const organizerNav: NavItem[] = [
  { to: '/organizer', label: 'Dashboard', end: true },
  { to: '/organizer/events/new', label: 'New Event' },
  { to: '/organizer/support', label: 'Platform Support' },
  { to: '/organizer/profile', label: 'Profile & Payouts' },
]

const adminNav: NavItem[] = [
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
]

export const router = createBrowserRouter([
  // Attendee-facing web app
  {
    element: <NavLayout title="" items={publicNav} />,
    children: [
      { index: true, element: page('Home') },

      // Auth (4.1)
      { path: 'login', element: page('Sign In') },
      { path: 'register', element: page('Register') },
      { path: 'verify-email', element: page('Verify Email') },
      { path: 'forgot-password', element: page('Forgot Password') },
      { path: 'reset-password', element: page('Reset Password') },

      // Discovery, registration, checkout (4.3.1, 4.4, 4.6)
      { path: 'events', element: page('Browse Events') },
      { path: 'events/:eventId', element: page('Event Details') },
      { path: 'events/:eventId/seats', element: page('Seat Selection') },
      { path: 'events/:eventId/checkout', element: page('Checkout') },
      { path: 'orders/:orderId/confirmation', element: page('Order Confirmation') },

      // Campaign QR landing: resolves opaque token, redirects to event with promo applied (4.14)
      { path: 'c/:campaignToken', element: page('Campaign Link') },

      // Attendee account (4.7, 4.9, 4.13)
      {
        path: 'account',
        children: [
          { index: true, element: page('My Account') },
          { path: 'orders', element: page('My Orders') },
          { path: 'orders/:orderId', element: page('Order Details') },
          { path: 'tickets', element: page('My Tickets') },
          { path: 'tickets/:ticketId', element: page('Ticket') },
          { path: 'support', element: page('My Support Cases') },
          { path: 'support/new', element: page('New Support Case') },
          { path: 'support/:caseId', element: page('Support Case') },
        ],
      },
    ],
  },

  // Organizer dashboard
  {
    path: 'organizer',
    element: <NavLayout title="Organizer" items={organizerNav} />,
    children: [
      { index: true, element: page('Organizer Dashboard') }, // Upcoming / Active / Completed / Cancelled (4.16)
      { path: 'events/new', element: page('Create Event') },
      { path: 'profile', element: page('Organizer Profile & Payouts') },
      { path: 'support', element: page('Platform Support Cases') },
      { path: 'support/new', element: page('New Platform Support Case') },
      { path: 'support/:caseId', element: page('Platform Support Case') },
      {
        path: 'events/:eventId',
        element: <OrganizerEventLayout />,
        children: [
          { index: true, element: page('Event Overview') },
          { path: 'edit', element: page('Edit Event') },
          { path: 'preview', element: page('Event Preview') },
          { path: 'tickets', element: page('Ticket Types') },
          { path: 'seating', element: page('Seating Layout') },
          { path: 'activation', element: page('Paid Sales Activation') },
          { path: 'attendees', element: page('Attendees') },
          { path: 'orders', element: page('Orders') },
          { path: 'orders/:orderId', element: page('Order Details') },
          { path: 'campaigns', element: page('Promo Campaigns') },
          { path: 'campaigns/new', element: page('New Campaign') },
          { path: 'campaigns/:campaignId', element: page('Campaign Details') },
          { path: 'staff', element: page('Event Admins') },
          { path: 'analytics', element: page('Analytics') },
          { path: 'history', element: page('Activity Timeline') },
          { path: 'support', element: page('Attendee Support Cases') },
          { path: 'support/:caseId', element: page('Attendee Support Case') },
        ],
      },
    ],
  },

  // Platform admin portal (4.12)
  {
    path: 'admin',
    element: <NavLayout title="Admin" items={adminNav} />,
    children: [
      { index: true, element: page('Admin Dashboard') },
      { path: 'users', element: page('Users') },
      { path: 'users/:userId', element: page('User Details') },
      { path: 'events', element: page('Events') },
      { path: 'events/:eventId', element: page('Event Details') },
      { path: 'moderation', element: page('Reported Events') },
      { path: 'orders', element: page('Orders') },
      { path: 'orders/:orderId', element: page('Order Details') },
      { path: 'payments', element: page('Payments') },
      { path: 'activations', element: page('Paid Sales Activations') },
      { path: 'activations/:activationId', element: page('Activation Record') },
      { path: 'refunds', element: page('Refunds, Disputes & Failures') },
      { path: 'campaigns', element: page('Promo Code Activity') },
      { path: 'support', element: page('Escalated Support Cases') },
      { path: 'support/:caseId', element: page('Support Case') },
      { path: 'reports', element: page('Operational Reports') },
      { path: 'settings', element: page('Platform Settings') },
    ],
  },

  { path: '*', element: page('404 — Page Not Found') },
])
