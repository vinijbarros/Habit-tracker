import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const navigation = [
  { to: '/habits', label: 'Habits' },
  { to: '/today', label: 'Today' },
  { to: '/summary', label: 'Summary' },
];

export function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Habit Tracker</p>
          <h1 className="app-title">Dashboard</h1>
        </div>
        <div className="user-block">
          <span>{user?.name}</span>
          <button className="ghost-button" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
