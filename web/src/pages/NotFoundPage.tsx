import { NavLink } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <EmptyState
          icon={Compass}
          title="Page not found"
          message="The page you are looking for does not exist or was moved."
          action={
            <NavLink
              to="/"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Go home
            </NavLink>
          }
        />
      </div>
    </div>
  );
}