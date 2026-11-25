import { useState } from 'react';
import { House, MapPin, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { addressApi } from '../../api/addressApi';
import { getErrorMessage } from '../../api/client';
import { EmptyState } from '../../components/EmptyState';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { Address } from '../../types/address';
import { AddAddressModal } from './AddAddressModal';

// Household: saved addresses. The default one decides "My schedule".
export function MyAddressesPage() {
  const { data: addresses, loading, reload } = useApiData(addressApi.getMine, []);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Address | null>(null);
  const [busy, setBusy] = useState(false);

  async function deleteAddress() {
    if (!deleting) {
      return;
    }
    setBusy(true);
    try {
      await addressApi.remove(deleting.id);
      toast.success('Address deleted');
      setDeleting(null);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  const addButton = (
    <Button onClick={() => setAdding(true)}>
      <Plus className="size-4" /> Add address
    </Button>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="My addresses"
        description="Your main address decides your collection schedule."
        actions={addresses.length > 0 ? addButton : undefined}
      />

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No addresses yet"
          message="Add your home address to see your collection schedule and request pickups."
          action={addButton}
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <House className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{address.label}</p>
                  {address.isDefault && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
                      Main address
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {address.addressLine}, {address.city}
                </p>
                {address.wardName ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {address.wardName} ward, {address.councilName}
                  </p>
                ) : (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                    <TriangleAlert className="size-3.5" /> Outside the wards we serve right now
                  </p>
                )}
              </div>
              <button
                onClick={() => setDeleting(address)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${address.label}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <AddAddressModal
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete address?"
        message={`"${deleting?.label ?? ''}" will be removed from your account.`}
        loading={busy}
        onConfirm={deleteAddress}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}