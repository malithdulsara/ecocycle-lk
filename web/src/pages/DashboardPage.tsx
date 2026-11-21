import { useAuth } from '../auth/useAuth';
import { ROLE_LABELS } from '../config/menu';

export function DashboardPage() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {user.fullName} 👋</h1>
      <div className="card">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {ROLE_LABELS[user.role]}
        </p>
        <p className="muted">Use the menu on the left to open the pages for your role.</p>
      </div>
    </div>
  );
}