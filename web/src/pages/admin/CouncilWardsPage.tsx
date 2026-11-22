import { useCallback, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { ArrowLeft, Hexagon, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { councilApi } from '../../api/councilApi';
import { wardApi } from '../../api/wardApi';
import { WardMap } from '../../components/map/WardMap';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useApiData } from '../../hooks/useApiData';
import type { Council, LngLat, Ward } from '../../types/admin';
import { WardEditor, type WardDraft } from './WardEditor';

// The backend sends the boundary closed (last point = first point). For editing we drop that last point.
function openRing(boundary: LngLat[] | null): LngLat[] {
  if (!boundary || boundary.length < 2) {
    return [];
  }
  const first = boundary[0];
  const last = boundary.at(-1);
  const closed = first[0] === last?.[0] && first[1] === last?.[1];
  return closed ? boundary.slice(0, -1) : boundary;
}

export function CouncilWardsPage() {
  const councilId = Number(useParams().councilId);

  const loadCouncil = useCallback(() => councilApi.getById(councilId), [councilId]);
  const loadWards = useCallback(() => wardApi.getByCouncil(councilId), [councilId]);
  const { data: council, loading: councilLoading } = useApiData<Council | null>(loadCouncil, null);
  const { data: wards, loading: wardsLoading, reload: reloadWards } = useApiData<Ward[]>(loadWards, []);

  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);
  const [draft, setDraft] = useState<WardDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Ward | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  // While editing a ward, hide its old shape so only the new drawing is shown.
  // useMemo keeps the same list between renders, so the map does not jump on every click.
  const editingWardId = draft?.wardId ?? null;
  const mapWards = useMemo(
    () => (editingWardId ? wards.filter((w) => w.id !== editingWardId) : wards),
    [wards, editingWardId],
  );

  function startAdd() {
    setSelectedWardId(null);
    setDraft({ wardId: null, name: '', wardCode: '', points: [] });
  }

  function startEdit(ward: Ward) {
    setSelectedWardId(ward.id);
    setDraft({ wardId: ward.id, name: ward.name, wardCode: ward.wardCode, points: openRing(ward.boundary) });
  }

  async function handleSave() {
    if (!draft) {
      return;
    }
    if (draft.points.length > 0 && draft.points.length < 3) {
      toast.error('A boundary needs at least 3 points. Click more points or press Clear.');
      return;
    }
    setSaving(true);
    const request = {
      name: draft.name,
      wardCode: draft.wardCode,
      boundary: draft.points.length >= 3 ? draft.points : null,
    };
    try {
      if (draft.wardId) {
        await wardApi.update(draft.wardId, request);
        toast.success('Ward updated');
      } else {
        await wardApi.create(councilId, request);
        toast.success('Ward created');
      }
      setDraft(null);
      reloadWards();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) {
      return;
    }
    setDeletingInProgress(true);
    try {
      await wardApi.remove(deleting.id);
      toast.success('Ward deleted');
      setDeleting(null);
      setSelectedWardId(null);
      reloadWards();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingInProgress(false);
    }
  }

  if (councilLoading || wardsLoading) {
    return <PageLoader />;
  }

  return (
    <div>
      <NavLink
        to="/admin/councils"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
      >
        <ArrowLeft className="size-4" /> All councils
      </NavLink>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{council?.name ?? 'Council'}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {council?.district} district · {wards.length} {wards.length === 1 ? 'ward' : 'wards'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left panel: ward list or ward editor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {draft ? (
            <WardEditor
              draft={draft}
              saving={saving}
              onChange={setDraft}
              onSave={handleSave}
              onCancel={() => setDraft(null)}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Wards</h3>
                <Button className="px-3 py-1.5" onClick={startAdd}>
                  <Plus className="size-4" /> Add ward
                </Button>
              </div>

              {wards.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  No wards yet. Click "Add ward" and draw the first one on the map.
                </p>
              )}

              <ul className="space-y-2">
                {wards.map((ward) => {
                  const selected = ward.id === selectedWardId;
                  return (
                    <li key={ward.id}>
                      <div
                        className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                          selected ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <button
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          onClick={() => setSelectedWardId(selected ? null : ward.id)}
                        >
                          <Hexagon className={`size-5 shrink-0 ${selected ? 'text-brand-600' : 'text-slate-400'}`} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{ward.name}</p>
                            <p className="text-xs text-slate-500">
                              {ward.wardCode}
                              {!ward.boundary && <span className="ml-2 text-amber-600">· no boundary</span>}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => startEdit(ward)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                          aria-label={`Edit ${ward.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(ward)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${ward.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Right: the map */}
        <div className="h-[calc(100vh-16rem)] min-h-105 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <WardMap
            wards={mapWards}
            selectedWardId={draft ? null : selectedWardId}
            onSelectWard={(ward) => setSelectedWardId(ward.id)}
            drawing={draft !== null}
            drawPoints={draft?.points ?? []}
            onMapClick={(point) => setDraft((current) => (current ? { ...current, points: [...current.points, point] } : current))}
          />
        </div>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete ward?"
        message={`"${deleting?.name}" will be deleted. Addresses in this ward will no longer have a ward.`}
        loading={deletingInProgress}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}