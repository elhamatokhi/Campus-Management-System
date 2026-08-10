import { NavLink, Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/profile', label: 'Profile' },
  { to: '/admin', label: 'Admin' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-campus-navy text-sm font-bold text-white">
            CE
          </span>
          <span>
            <span className="block text-base font-bold text-campus-navy">Campus Events</span>
            <span className="block text-xs font-medium text-slate-500">University booking portal</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `focus-ring rounded-md px-3 py-2 transition ${
                  isActive ? 'bg-campus-mist text-campus-teal' : 'text-slate-600 hover:text-campus-teal'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `focus-ring rounded-md border px-3 py-2 transition ${
                isActive
                  ? 'border-campus-teal bg-campus-mist text-campus-teal'
                  : 'border-slate-300 text-slate-700 hover:border-campus-teal hover:text-campus-teal'
              }`
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `focus-ring rounded-md px-3 py-2 transition ${
                isActive ? 'bg-campus-teal text-white' : 'bg-campus-navy text-white hover:bg-slate-800'
              }`
            }
          >
            Register
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
