import { useState } from 'react';
import { Clock, MapPin, Pencil, Phone, Plus, Store } from 'lucide-react';
import { recyclingApi } from '../../api/recyclingApi';
import { EmptyState } from '../../components/EmptyState';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { useApiData } from '../../hooks/useApiData';
import type { Centre } from '../../types/recycling';
import { CentreFormModal } from './CentreFormModal';

// Collection centres where households bring recyclables
export function CentresTab() {
  const { data: centres, loading, reload } = useApiData(recyclingApi.getAllCentres, []);
  const [editing, setEditing] = useState<Centre | null | undefined>(undefined); // undefined = closed

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing(null)}>
          <Plus className="size-4" /> Add centre
        </Button>
      </div>

      {centres.length === 0 ? (
        <EmptyState icon={Store} title="No centres yet" message="Add a centre so operators can start giving points." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {centres.map((centre) => (
            <div
              key={centre.id}
              className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${centre.active ? '' : 'opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900">{centre.name}</p>
                <button
                  onClick={() => setEditing(centre)}
                  className="-mt-1 -mr-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label={`Edit ${centre.name}`}
                >
                  <Pencil className="size-4" />
                </button>
              </div>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" /> {centre.address}
                </p>
                {centre.openingHours && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" /> {centre.openingHours}
                  </p>
                )}
                {centre.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3.5 shrink-0" /> {centre.phone}
                  </p>
                )}
                {!centre.active && <p className="font-medium text-slate-500">Closed</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <CentreFormModal
          centre={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      )}
    </div>
  );
}