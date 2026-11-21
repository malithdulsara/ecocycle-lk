import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MENU_ITEMS } from './config/menu';
import { AppLayout } from './layouts/AppLayout';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Every menu item except the dashboard gets a "Coming soon" page for now
const placeholderPages = MENU_ITEMS.filter((item) => item.path !== '/');

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Every page inside here needs login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />

              {placeholderPages.map((item) => (
                <Route key={item.path} element={<ProtectedRoute allowedRoles={item.roles} />}>
                  <Route path={item.path} element={<ComingSoonPage title={item.label} />} />
                </Route>
              ))}
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}