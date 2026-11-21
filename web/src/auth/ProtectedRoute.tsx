import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { Role } from '../types/api';
import { PageLoader } from '../components/Spinner';

interface Props {
  // Leave empty to allow every logged-in user
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: Readonly<Props>) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
        return <PageLoader />;
  }
  if (!user) {
    // Not logged in: go to login, and come back here after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}