import { useCallback, useState } from 'react';
import { CalendarPlus, Pencil, Plus, Route, Trash2, Truck as TruckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/useAuth';
import { getErrorMessage } from '../../api/client';
import { councilApi } from '../../api/councilApi';
import { truckApi } from '../../api/truckApi';
import { userApi } from '../../api/userApi';
import { EmptyState } from '../../components/EmptyState';
import { RouteStatusBadge } from '../../components/tracking/RouteStatusBadge';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { TextInput } from '../../components/ui/form';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { CollectionRoute, Truck } from '../../types/tracking';
import { todayIso } from '../../utils/schedule';
import { formatLastSeen } from '../../utils/tracking';
import { RouteFormModal } from './RouteFormModal';
import { TruckFormModal } from './TruckFormModal';

// Officer / admin: plan daily routes. Admin also adds and edits trucks.
export function TrucksRoutesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [date, setDate] = useState(todayIso());
  const loadRoutes = useCallback(() => truckApi.getRoutes(date), [date]);
  const { data: routes, loading: loadingRoutes, reload: reloadRoutes } = useApiData(loadRoutes, []);
  const { data: trucks, loading: loadingTrucks, reload: reloadTrucks } = useApiData(truckApi.getAll, []);
  const { data: drivers } = useApiData(userApi.getDrivers, []);
  const { data: councils } = useApiData(councilApi.getAll, []);

  const [planning, setPlanning] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null | undefined>(undefined); // undefined = closed
  const [deleting, setDeleting] = useState<CollectionRoute | null>(null);
  const [busy, setBusy] = useState(false);

  async function deleteRoute() {
    if (!deleting) {
      return;
    }
    setBusy(true);
    try {
      await truckApi.deleteRoute(deleting.id);
      toast.success('Route deleted');
      setDeleting(null);
      reloadRoutes();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (loadingTrucks) {
    return <PageLoader />;
  }

  const activeTrucks = trucks.filter((t) => t.active);

  return (
    <div className="space-y-10">
      {/* ---------- Routes ---------- */}
      <section>
        <PageHeader
          title="Trucks & routes"
          description="Which truck and driver collects in which ward each day."
          actions={
            <Button onClick={() => setPlanning(true)}>
              <CalendarPlus className="size-4" /> Plan route
            </Button>
          }
        />

        <div className="mb-4 max-w-xs">
          <TextInput id="routes-date" label="Day" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {!loadingRoutes && routes.length === 0 && (
          <EmptyState icon={Route} title="No routes on this day" message="Plan a route to send a truck to a ward." />
        )}

        {routes.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Ward</th>
                  <th className="px-5 py-3">Truck</th>
                  <th className="px-5 py-3">Driver</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{route.wardName}</p>
                      <p className="text-xs text-slate-500">{route.councilName}</p>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-700">{route.registrationNumber}</td>
                    <td className="px-5 py-3 text-slate-600">{route.driverName}</td>
                    <td className="px-5 py-3">
                      <RouteStatusBadge status={route.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {route.status === 'PLANNED' && (
                        <button
                          onClick={() => setDeleting(route)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete route"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- Trucks ---------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Trucks</h3>
          {isAdmin && (
            <Button variant="secondary" onClick={() => setEditingTruck(null)}>
              <Plus className="size-4" /> Add truck
            </Button>
          )}
        </div>

        {trucks.length === 0 ? (
          <EmptyState
            icon={TruckIcon}
            title="No trucks yet"
            message={isAdmin ? 'Add the council trucks to start planning routes.' : 'Ask an admin to add the council trucks.'}
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Truck</th>
                  <th className="px-5 py-3">Council</th>
                  <th className="px-5 py-3">Capacity</th>
                  <th className="px-5 py-3">Last GPS</th>
                  {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trucks.map((truck) => (
                  <tr key={truck.id} className={`hover:bg-slate-50/60 ${truck.active ? '' : 'opacity-60'}`}>
                    <td className="px-5 py-3">
                      <p className="font-mono font-medium text-slate-900">{truck.registrationNumber}</p>
                      <p className="text-xs text-slate-500">
                        {truck.model ?? 'Truck'}
                        {!truck.active && ' · not in use'}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{truck.councilName}</td>
                    <td className="px-5 py-3 text-slate-600">{truck.capacityKg.toLocaleString()} kg</td>
                    <td className="px-5 py-3 text-slate-600">{formatLastSeen(truck.lastSeenAt)}</td>
                    {isAdmin && (
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setEditingTruck(truck)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Edit ${truck.registrationNumber}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {planning && (
        <RouteFormModal
          date={date}
          trucks={activeTrucks}
          drivers={drivers}
          onClose={() => setPlanning(false)}
          onSaved={() => {
            setPlanning(false);
            reloadRoutes();
          }}
        />
      )}

      {editingTruck !== undefined && (
        <TruckFormModal
          truck={editingTruck}
          councils={councils}
          onClose={() => setEditingTruck(undefined)}
          onSaved={() => {
            setEditingTruck(undefined);
            reloadTrucks();
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this route?"
        message="The driver will not see it any more."
        confirmLabel="Delete route"
        loading={busy}
        onConfirm={deleteRoute}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}