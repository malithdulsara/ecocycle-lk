import { NavLink } from 'react-router-dom';
import { ArrowRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ROLE_LABELS, menuForRole } from '../config/menu';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function DashboardPage() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  // Every page this user can open, except the dashboard itself
  const shortcuts = menuForRole(user.role).filter((item) => item.path !== '/');
  const firstName = user.fullName.split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 to-brand-800 p-8 text-white shadow-xl shadow-brand-700/20">
        <div className="absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-medium text-brand-100">{greeting()} 👋</p>
          <h2 className="mt-1 text-3xl font-bold">Welcome back, {firstName}</h2>
          <p className="mt-2 max-w-xl text-brand-100">
            You are signed in as <span className="font-semibold text-white">{ROLE_LABELS[user.role]}</span>. Pick a
            section below to get started.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick links */}
        <section className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-slate-500 uppercase">Quick access</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {shortcuts.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <item.icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600" />
                </div>
                <p className="mt-4 font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </NavLink>
            ))}
          </div>
        </section>

        {/* Profile card */}
        <section>
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-slate-500 uppercase">Your account</h3>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="size-4 text-slate-400" />
              <span className="truncate text-slate-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="size-4 text-slate-400" />
              <span className="text-slate-700">{user.phone ?? 'No phone number'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="size-4 text-slate-400" />
              <span className="text-slate-700">{ROLE_LABELS[user.role]}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}