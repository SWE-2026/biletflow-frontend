import { createBrowserRouter } from 'react-router'
import { PlaceholderPage } from '@/shared/ui/placeholder-page'
import { AppLayout } from '../layouts/AppLayout'
import {
  adminHandle,
  attendeeHandle,
  organizerEventHandle,
  organizerHandle,
} from '../layouts/navigation'

// TODO: replace each placeholder with a slice from @/pages as it gets implemented
const page = (title: string) => <PlaceholderPage title={title} />

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Attendee-facing web app
      {
        handle: attendeeHandle,
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
        handle: organizerHandle,
        children: [
          { index: true, element: page('Organizer Dashboard') }, // Upcoming / Active / Completed / Cancelled (4.16)
          { path: 'events/new', element: page('Create Event') },
          { path: 'profile', element: page('Organizer Profile & Payouts') },
          { path: 'support', element: page('Platform Support Cases') },
          { path: 'support/new', element: page('New Platform Support Case') },
          { path: 'support/:caseId', element: page('Platform Support Case') },
          {
            path: 'events/:eventId',
            handle: organizerEventHandle,
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
        handle: adminHandle,
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
    ],
  },
])
