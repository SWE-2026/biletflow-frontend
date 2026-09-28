import { NavLink, Outlet } from 'react-router'

export type NavItem = {
  to: string
  label: string
  end?: boolean
}

type NavLayoutProps = {
  title: string
  items: NavItem[]
}

export default function NavLayout({ title, items }: NavLayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="flex flex-wrap items-center gap-4 border-b border-gray-200 px-6 py-3">
        <NavLink to="/" className="font-bold">
          BiletFlow
        </NavLink>
        <span className="text-sm text-gray-400">{title}</span>
        <nav className="flex flex-wrap gap-3 text-sm">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'font-semibold text-indigo-600' : 'text-gray-600 hover:text-gray-900'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
