import { NavLink, Outlet, useParams } from 'react-router'

const tabs = [
  { to: '', label: 'Overview', end: true },
  { to: 'edit', label: 'Edit' },
  { to: 'tickets', label: 'Tickets' },
  { to: 'seating', label: 'Seating' },
  { to: 'activation', label: 'Paid Sales' },
  { to: 'attendees', label: 'Attendees' },
  { to: 'orders', label: 'Orders' },
  { to: 'campaigns', label: 'Campaigns' },
  { to: 'staff', label: 'Staff' },
  { to: 'analytics', label: 'Analytics' },
  { to: 'history', label: 'History' },
  { to: 'support', label: 'Support' },
]

export default function OrganizerEventLayout() {
  const { eventId } = useParams()

  return (
    <div>
      <nav className="flex flex-wrap gap-3 border-b border-gray-200 px-6 py-2 text-sm">
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={`/organizer/events/${eventId}/${tab.to}`}
            end={tab.end}
            className={({ isActive }) =>
              isActive ? 'font-semibold text-indigo-600' : 'text-gray-600 hover:text-gray-900'
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
