import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, Building2, Mail, MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { councilApi } from '../../api/councilApi';
import { EmptyState } from '../../components/EmptyState';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { Council } from '../../types/admin';
import { CouncilFormModal } from './CouncilFormModal';

export function CouncilsPage() {
  const { data: councils, loading, reload } = useApiData<Council[]>(councilApi.getAll, []);
  // undefined = form closed, null = add new, Council = edit
  const [editing, setEditing] = useState<Council | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Council | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  async function handleDelete() {
    if (!deleting) {
      return;
    }
    setDeletingInProgress(true);
    try {
      await councilApi.remove(deleting.id);
      toast.success('Council deleted');
      setDeleting(null);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingInProgress(false);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <PageHeader
        title="Councils"
        description="Local authorities that run waste collection. Open a council to manage its wards."
        actions={
          <Button onClick={() => setEditing(null)}>
            <Plus className="size-4" />
            Add council
          </Button>
        }
      />

      {councils.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No councils yet"
          message="Add the first council to start creating wards."
          action={
            <Button onClick={() => setEditing(null)}>
              <Plus className="size-4" />
              Add council
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {councils.map((council) => (
            <div
              key={council.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Building2 className="size-5" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(council)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Edit ${council.name}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(council)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete ${council.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">{council.name}</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <p className="flex items-center gap-2">
                  <MapPin className="size-4" /> {council.district} district
                </p>
                {council.contactEmail && (
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="size-4 shrink-0" /> {council.contactEmail}
                  </p>
                )}
                {council.contactPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="size-4" /> {council.contactPhone}
                  </p>
                )}
              </div>

              <NavLink
                to={`/admin/councils/${council.id}`}
                className="group mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
              >
                Manage wards
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </NavLink>
            </div>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <CouncilFormModal
          council={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete council?"
        message={`"${deleting?.name}" and all of its wards will be deleted. This cannot be undone.`}
        loading={deletingInProgress}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}