import { createBrowserRouter } from 'react-router'
import { AccountPage } from '@/pages/account'
import { ActivationRecordPage, AdminActivationsPage } from '@/pages/admin/activations'
import { AdminCampaignsPage } from '@/pages/admin/campaigns'
import { AdminDashboardPage } from '@/pages/admin/dashboard'
import { AdminEventDetailsPage, AdminEventsPage } from '@/pages/admin/events'
import { AdminModerationPage } from '@/pages/admin/moderation'
import { AdminOrderDetailsPage, AdminOrdersPage } from '@/pages/admin/orders'
import { AdminPaymentsPage } from '@/pages/admin/payments'
import { AdminRefundsPage } from '@/pages/admin/refunds'
import { AdminReportsPage } from '@/pages/admin/reports'
import { AdminSettingsPage } from '@/pages/admin/settings'
import { AdminUserDetailsPage, AdminUsersPage } from '@/pages/admin/users'
import { BrowseEventsPage } from '@/pages/browse-events'
import { CheckoutPage } from '@/pages/checkout'
import { CreateEventPage } from '@/pages/create-event'
import { EditEventPage } from '@/pages/edit-event'
import { EventDetailsPage } from '@/pages/event-details'
import { HomePage } from '@/pages/home'
import { MyTicketsPage } from '@/pages/my-tickets'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { SeatSelectionPage } from '@/pages/seat-selection'
import { OrganizerDashboardPage } from '@/pages/organizer/dashboard'
import { OrganizerEventPage } from '@/pages/organizer/event'
import { PaidSalesPage } from '@/pages/organizer/paid-sales'
import { OrganizerSeatingPage } from '@/pages/organizer/seating'
import { TicketTypesPage } from '@/pages/organizer/ticket-types'
import { OrganizerStaffPage } from '@/pages/organizer/staff'
import { CampaignsPage } from '@/pages/organizer/campaigns'
import { SupportCasesPage, NewSupportCasePage } from '@/pages/support-cases'
import { SupportCaseDetailPage } from '@/pages/support-case-detail'
import { MyOrdersPage, OrderConfirmationPage, OrderDetailsPage } from '@/pages/orders'
import { OrganizerAnalyticsPage } from '@/pages/organizer/analytics'
import { OrganizerAttendeesPage } from '@/pages/organizer/attendees'
import { OrganizerEventPreviewPage } from '@/pages/organizer/event-preview'
import { OrganizerHistoryPage } from '@/pages/organizer/history'
import { OrganizerOrderDetailsPage, OrganizerOrdersPage } from '@/pages/organizer/orders'
import { OrganizerProfilePage } from '@/pages/organizer/profile'
import { TicketPage } from '@/pages/ticket'
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
          { path: 'events/:eventId/seats', element: <SeatSelectionPage /> },
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
              { index: true, element: <AccountPage /> },
              { path: 'orders', element: <MyOrdersPage /> },
              { path: 'orders/:orderId', element: <OrderDetailsPage /> },
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
                  { path: 'preview', element: <OrganizerEventPreviewPage /> },
                  { path: 'tickets', element: <TicketTypesPage /> },
                  { path: 'seating', element: <OrganizerSeatingPage /> },
                  { path: 'activation', element: <PaidSalesPage /> },
                  { path: 'attendees', element: <OrganizerAttendeesPage /> },
                  { path: 'orders', element: <OrganizerOrdersPage /> },
                  { path: 'orders/:orderId', element: <OrganizerOrderDetailsPage /> },
                  { path: 'campaigns', element: <CampaignsPage /> },
                  { path: 'staff', element: <OrganizerStaffPage /> },
                  { path: 'analytics', element: <OrganizerAnalyticsPage /> },
                  { path: 'history', element: <OrganizerHistoryPage /> },
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
              { index: true, element: <AdminDashboardPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'users/:userId', element: <AdminUserDetailsPage /> },
              { path: 'events', element: <AdminEventsPage /> },
              { path: 'events/:eventId', element: <AdminEventDetailsPage /> },
              { path: 'moderation', element: <AdminModerationPage /> },
              { path: 'orders', element: <AdminOrdersPage /> },
              { path: 'orders/:orderId', element: <AdminOrderDetailsPage /> },
              { path: 'payments', element: <AdminPaymentsPage /> },
              { path: 'activations', element: <AdminActivationsPage /> },
              { path: 'activations/:activationId', element: <ActivationRecordPage /> },
              { path: 'refunds', element: <AdminRefundsPage /> },
              { path: 'campaigns', element: <AdminCampaignsPage /> },
              { path: 'support', element: <SupportCasesPage scope="admin" /> },
              { path: 'support/:caseId', element: <SupportCaseDetailPage /> },
              { path: 'reports', element: <AdminReportsPage /> },
              { path: 'settings', element: <AdminSettingsPage /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
