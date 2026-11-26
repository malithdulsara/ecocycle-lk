import { useState } from 'react';
import { CheckCircle2, MapPin, MessageSquareWarning, Plus, UserRound, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { complaintApi } from '../../api/complaintApi';
import { ComplaintStatusBadge, SlaBadge } from '../../components/complaint/ComplaintBadges';
import { ComplaintForm } from '../../components/complaint/ComplaintForm';
import { ComplaintProgress } from '../../components/complaint/ComplaintProgress';
import { EmptyState } from '../../components/EmptyState';
import { PhotoThumb } from '../../components/pickup/PhotoThumb';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { Complaint } from '../../types/complaint';
import { COMPLAINT_CATEGORY_LABELS, formatDateTime } from '../../utils/complaint';

// Household: report problems and follow what the council does about them
export function MyComplaintsPage() {
  const { data: complaints, loading, reload } = useApiData(complaintApi.getMine, []);
  const [creating, setCreating] = useState(false);

  if (loading) {
    return <PageLoader />;
  }

  const newButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="size-4" /> New complaint
    </Button>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Complaints"
        description="Report a missed pickup, illegal dumping or other waste problems."
        actions={complaints.length > 0 ? newButton : undefined}
      />

      {complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No complaints yet"
          message="Missed pickup or garbage dumped on the road? Tell the council and follow the progress here."
          action={newButton}
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}

      {creating && (
        <Modal
          open
          title="New complaint"
          description="The council officer for the area will be notified."
          onClose={() => setCreating(false)}
        >
          <div className="max-h-[70vh] overflow-y-auto pr-1 pb-1">
            <ComplaintForm
              onCancel={() => setCreating(false)}
              onDone={(code) => {
                toast.success(`Complaint sent. Your reference is ${code}.`);
                setCreating(false);
                reload();
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function ComplaintCard({ complaint }: Readonly<{ complaint: Complaint }>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900">{COMPLAINT_CATEGORY_LABELS[complaint.category]}</span>
            <ComplaintStatusBadge status={complaint.status} />
            <SlaBadge complaint={complaint} />
          </div>
          <p className="mt-1 text-sm text-slate-700">{complaint.description}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="font-mono font-medium text-slate-600">{complaint.trackingCode}</span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> {complaint.landmark ?? complaint.wardName}
            </span>
            <span>Sent {formatDateTime(complaint.createdAt)}</span>
          </div>
        </div>
        {complaint.photoFileName && <PhotoThumb fileName={complaint.photoFileName} />}
      </div>

      <div className="mt-4">
        <ComplaintProgress status={complaint.status} />
      </div>

      {/* What the council said */}
      <div className="mt-4 space-y-2 text-sm empty:hidden">
        {complaint.officerName && !complaint.resolvedAt && (
          <p className="flex items-center gap-2 text-slate-600">
            <UserRound className="size-4 shrink-0 text-slate-400" /> Officer: {complaint.officerName}
          </p>
        )}
        {complaint.status === 'RESOLVED' && complaint.resolutionNote && (
          <p className="flex items-start gap-2 rounded-xl bg-brand-50 px-3 py-2 text-brand-800">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            {complaint.resolutionNote}
          </p>
        )}
        {complaint.status === 'REJECTED' && complaint.resolutionNote && (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-red-700">
            <XCircle className="mt-0.5 size-4 shrink-0" /> {complaint.resolutionNote}
          </p>
        )}
      </div>
    </div>
  );
}