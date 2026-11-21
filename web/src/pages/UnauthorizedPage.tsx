import { NavLink } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div>
      <h1>No access</h1>
      <div className="card">
        <p>You do not have permission to open this page.</p>
        <NavLink to="/">Back to dashboard</NavLink>
      </div>
    </div>
  );
}