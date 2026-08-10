import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
];

const studentLinks = [
  { to: '/events', label: 'Events' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/profile', label: 'Profile' },
];

const adminLinks = [
  { to: '/events', label: 'Events' },
  { to: '/admin', label: 'Admin Dashboard' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const links = isAuthenticated ? (isAdmin ? adminLinks : studentLinks) : publicLinks;

  const handleLogout = () => {
    logout();
    navigate('/login', {
      replace: true,
      state: { message: 'You have been logged out successfully.' },
    });
  };

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
          {isAuthenticated ? (
            <>
              <span className="rounded-md bg-slate-100 px-3 py-2 text-slate-600">
                {user?.name}
              </span>
              <button
                className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:border-campus-teal hover:text-campus-teal"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
