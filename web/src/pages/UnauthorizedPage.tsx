import { NavLink } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export function UnauthorizedPage() {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="No access"
      message="Your role does not have permission to open this page."
      action={
        <NavLink
          to="/"
          className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to dashboard
        </NavLink>
      }
    />
  );
}