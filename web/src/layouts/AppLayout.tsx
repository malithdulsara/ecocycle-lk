import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { MENU_ITEMS, ROLE_LABELS } from '../config/menu';

// Sidebar + header around every logged-in page
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const items = MENU_ITEMS.filter((item) => item.roles.includes(user.role));

  async function handleLogout() {
    await logout();
    await navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">♻ EcoCycle LK</div>
        <nav>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="header">
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
            ☰
          </button>
          <div className="header-user">
            <div>
              <div className="user-name">{user.fullName}</div>
              <div className="user-role">{ROLE_LABELS[user.role]}</div>
            </div>
            <button className="button secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}