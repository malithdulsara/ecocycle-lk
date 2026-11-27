import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MENU_ITEMS } from './config/menu';
import { AppLayout } from './layouts/AppLayout';
import { CouncilWardsPage } from './pages/admin/CouncilWardsPage';
import { CouncilsPage } from './pages/admin/CouncilsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicSchedulePage } from './pages/PublicSchedulePage';
import { ReportComplaintPage } from './pages/ReportComplaintPage';
import { MyAddressesPage } from './pages/addresses/MyAddressesPage';
import { ComplaintsPage } from './pages/complaints/ComplaintsPage';
import { MyComplaintsPage } from './pages/complaints/MyComplaintsPage';
import { MyRoutePage } from './pages/driver/MyRoutePage';
import { FleetMapPage } from './pages/fleet/FleetMapPage';
import { TrucksRoutesPage } from './pages/fleet/TrucksRoutesPage';
import { DriverPickupsPage } from './pages/pickups/DriverPickupsPage';
import { MyPickupRequestsPage } from './pages/pickups/MyPickupRequestsPage';
import { PickupRequestsPage } from './pages/pickups/PickupRequestsPage';
import { MySchedulePage } from './pages/schedules/MySchedulePage';
import { SchedulesPage } from './pages/schedules/SchedulesPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Pages that are already built. Every other menu item gets a "Coming soon" page for now.
const BUILT_PAGES = new Set([
  '/',
  '/admin/councils',
  '/admin/users',
  '/schedules',
  '/my-schedule',
  '/requests',
  '/my-requests',
  '/my-addresses',
  '/my-pickups',
  '/complaints',
  '/my-complaints',
  '/trucks',
  '/fleet',
  '/my-route',
]);
const placeholderPages = MENU_ITEMS.filter((item) => !BUILT_PAGES.has(item.path));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Public: no login needed */}
          <Route path="/collection-schedule" element={<PublicSchedulePage />} />
          <Route path="/report-problem" element={<ReportComplaintPage />} />

          {/* Every page inside here needs login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />

              {/* Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/councils" element={<CouncilsPage />} />
                <Route path="/admin/councils/:councilId" element={<CouncilWardsPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
              </Route>

              {/* Council officer + admin */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'COUNCIL_OFFICER']} />}>
                <Route path="/schedules" element={<SchedulesPage />} />
                <Route path="/requests" element={<PickupRequestsPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="/trucks" element={<TrucksRoutesPage />} />
                <Route path="/fleet" element={<FleetMapPage />} />
              </Route>

              {/* Household */}
              <Route element={<ProtectedRoute allowedRoles={['HOUSEHOLD']} />}>
                <Route path="/my-schedule" element={<MySchedulePage />} />
                <Route path="/my-requests" element={<MyPickupRequestsPage />} />
                <Route path="/my-addresses" element={<MyAddressesPage />} />
                <Route path="/my-complaints" element={<MyComplaintsPage />} />
              </Route>

              {/* Driver */}
              <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
                <Route path="/my-pickups" element={<DriverPickupsPage />} />
                <Route path="/my-route" element={<MyRoutePage />} />
              </Route>

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

      {/* Small pop-up messages like "Council created" */}
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}