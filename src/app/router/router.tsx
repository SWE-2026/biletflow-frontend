import { createBrowserRouter } from 'react-router'
import { AdminActivationsPage } from '@/pages/admin-activations'
import { BrowseEventsPage } from '@/pages/browse-events'
import { CheckoutPage } from '@/pages/checkout'
import { CreateEventPage } from '@/pages/create-event'
import { EditEventPage } from '@/pages/edit-event'
import { EventDetailsPage } from '@/pages/event-details'
import { HomePage } from '@/pages/home'
import { MyTicketsPage } from '@/pages/my-tickets'
import { LoginPage } from '@/pages/login'
import { OrganizerDashboardPage } from '@/pages/organizer-dashboard'
import { OrganizerEventPage } from '@/pages/organizer-event'
import { PaidSalesPage } from '@/pages/organizer-paid-sales'
import { TicketTypesPage } from '@/pages/organizer-ticket-types'
import { OrganizerStaffPage } from '@/pages/organizer-staff'
import { CampaignsPage } from '@/pages/organizer-campaigns'
import { SupportCasesPage, NewSupportCasePage } from '@/pages/support-cases'
import { SupportCaseDetailPage } from '@/pages/support-case-detail'
import { OrderConfirmationPage } from '@/pages/order-confirmation'
import { OrganizerProfilePage } from '@/pages/organizer-profile'
import { TicketPage } from '@/pages/ticket'
import { PlaceholderPage } from '@/shared/ui/placeholder-page'
import { AppLayout } from '../layouts/AppLayout'
import { RequireAdmin } from '../layouts/RequireAdmin'
import { RequireOrganizer } from '../layouts/RequireOrganizer'
import { RequireSession } from '../layouts/RequireSession'
import {
  adminHandle,
  attendeeHandle,
  loginHandle,
  organizerEventHandle,
  organizerHandle,
} from '../layouts/navigation'

// TODO: replace each placeholder with a slice from @/pages as it gets implemented
const page = (title: string) => <PlaceholderPage title={title} />

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Auth (4.1): email code (first sign-in creates the account) or password
      { path: 'login', handle: loginHandle, element: <LoginPage /> },

      // Attendee-facing web app
      {
        handle: attendeeHandle,
        children: [
          { index: true, element: <HomePage /> },

          // Discovery, registration, checkout (4.3.1, 4.4, 4.6)
          { path: 'events', element: <BrowseEventsPage /> },
          { path: 'events/:eventId', element: <EventDetailsPage /> },
          { path: 'events/:eventId/seats', element: page('Seat Selection') },
          {
            element: <RequireSession />,
            children: [
              { path: 'events/:eventId/checkout', element: <CheckoutPage /> },
              { path: 'orders/:orderId/confirmation', element: <OrderConfirmationPage /> },
            ],
          },

          // Campaign QR links (4.14) are /events/:eventId?campaign=<token>, built by the API,
          // and handled on the event page: a promo lookup needs the event ID, so there is no
          // token-only landing route.

          // Attendee account (4.7, 4.9, 4.13): signed-in users only
          {
            path: 'account',
            element: <RequireSession />,
            children: [
              { index: true, element: page('My Account') },
              { path: 'orders', element: page('My Orders') },
              { path: 'orders/:orderId', element: page('Order Details') },
              { path: 'tickets', element: <MyTicketsPage /> },
              { path: 'tickets/:ticketId', element: <TicketPage /> },
              { path: 'support', element: <SupportCasesPage scope="attendee" /> },
              { path: 'support/new', element: <NewSupportCasePage scope="attendee" /> },
              { path: 'support/:caseId', element: <SupportCaseDetailPage /> },
            ],
          },
        ],
      },

      // Organizer dashboard
      {
        path: 'organizer',
        handle: organizerHandle,
        element: <RequireSession />,
        children: [
          { path: 'profile', element: <OrganizerProfilePage /> },
          {
            element: <RequireOrganizer />,
            children: [
              { index: true, element: <OrganizerDashboardPage /> },
              { path: 'events/new', element: <CreateEventPage /> },
              { path: 'support', element: <SupportCasesPage scope="organizer_platform" /> },
              { path: 'support/new', element: <NewSupportCasePage scope="organizer_platform" /> },
              { path: 'support/:caseId', element: <SupportCaseDetailPage /> },
              {
                path: 'events/:eventId',
                handle: organizerEventHandle,
                children: [
                  { index: true, element: <OrganizerEventPage /> },
                  { path: 'edit', element: <EditEventPage /> },
                  { path: 'preview', element: page('Event Preview') },
                  { path: 'tickets', element: <TicketTypesPage /> },
                  { path: 'seating', element: page('Seating Layout') },
                  { path: 'activation', element: <PaidSalesPage /> },
                  { path: 'attendees', element: page('Attendees') },
                  { path: 'orders', element: page('Orders') },
                  { path: 'orders/:orderId', element: page('Order Details') },
                  { path: 'campaigns', element: <CampaignsPage /> },
                  { path: 'staff', element: <OrganizerStaffPage /> },
                  { path: 'analytics', element: page('Analytics') },
                  { path: 'history', element: page('Activity Timeline') },
                  { path: 'support', element: <SupportCasesPage scope="organizer_event" /> },
                  { path: 'support/:caseId', element: <SupportCaseDetailPage /> },
                ],
              },
            ],
          },
        ],
      },

      // Platform admin portal (4.12)
      {
        path: 'admin',
        handle: adminHandle,
        element: <RequireSession />,
        children: [
          {
            element: <RequireAdmin />,
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
              { path: 'activations', element: <AdminActivationsPage /> },
              { path: 'activations/:activationId', element: page('Activation Record') },
              { path: 'refunds', element: page('Refunds, Disputes & Failures') },
              { path: 'campaigns', element: page('Promo Code Activity') },
              { path: 'support', element: <SupportCasesPage scope="admin" /> },
              { path: 'support/:caseId', element: <SupportCaseDetailPage /> },
              { path: 'reports', element: page('Operational Reports') },
              { path: 'settings', element: page('Platform Settings') },
            ],
          },
        ],
      },

      { path: '*', element: page('404 — Page Not Found') },
    ],
  },
])
