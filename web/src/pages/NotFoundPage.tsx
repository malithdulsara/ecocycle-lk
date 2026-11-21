import { NavLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="login-page">
      <div className="card">
        <h1>404</h1>
        <p>Page not found.</p>
        <NavLink to="/">Go home</NavLink>
      </div>
    </div>
  );
}