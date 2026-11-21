import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Avatar } from '../components/Avatar';
import { Logo } from '../components/Logo';
import { MENU_SECTIONS, ROLE_LABELS, menuForRole } from '../config/menu';

// Sidebar + header around every logged-in page
export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) {
    return null;
  }

  const items = menuForRole(user.role);
  const currentPage = items.find((item) => item.path === location.pathname);

  async function handleLogout() {
    await logout();
    await navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Dark overlay behind the menu on small screens */}
      {menuOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {MENU_SECTIONS.map((section) => {
            const sectionItems = items.filter((item) => item.section === section);
            if (sectionItems.length === 0) {
              return null;
            }
            return (
              <div key={section}>
                <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">{section}</p>
                <div className="space-y-1">
                  {sectionItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`
                      }
                    >
                      <item.icon className="size-5 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Logged-in user at the bottom of the sidebar */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar name={user.fullName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
              <p className="truncate text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Top header */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-8">
        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{currentPage?.label ?? 'EcoCycle LK'}</h1>
        <span className="ml-auto hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 sm:inline">
          {ROLE_LABELS[user.role]}
        </span>
      </header>

      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}