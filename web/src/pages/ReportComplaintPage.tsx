import { useEffect, useState, type SubmitEvent } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { CheckCircle2, LogIn, MessageSquareWarning, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../api/client';
import { complaintApi } from '../api/complaintApi';
import { ComplaintStatusBadge, SlaBadge } from '../components/complaint/ComplaintBadges';
import { ComplaintForm } from '../components/complaint/ComplaintForm';
import { ComplaintProgress } from '../components/complaint/ComplaintProgress';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/form';
import type { ComplaintTracking } from '../types/complaint';
import { COMPLAINT_CATEGORY_LABELS, formatDateTime } from '../utils/complaint';

type Tab = 'report' | 'track';

// No login needed: anyone can report a waste problem and check its status with the reference code
export function ReportComplaintPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const codeInLink = searchParams.get('code') ?? '';
  const [tab, setTab] = useState<Tab>(codeInLink ? 'track' : 'report');
  const [sentCode, setSentCode] = useState<string | null>(null);
  // Changing this number clears the form for a new complaint
  const [formVersion, setFormVersion] = useState(0);

  function showStatus(code: string) {
    setSearchParams({ code });
    setTab('track');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Logo />
          <NavLink
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            <LogIn className="size-4" /> Sign in
          </NavLink>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <MessageSquareWarning className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Report a waste problem</h1>
            <p className="mt-1 text-sm text-slate-500">
              Missed pickup, illegal dumping or an overflowing bin? Tell the council. No account needed.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <TabButton active={tab === 'report'} onClick={() => setTab('report')}>
            Report a problem
          </TabButton>
          <TabButton active={tab === 'track'} onClick={() => setTab('track')}>
            Check status
          </TabButton>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {tab === 'report' && sentCode && (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto size-12 text-brand-600" />
              <h2 className="mt-3 text-lg font-semibold text-slate-900">Thank you! Your complaint was sent.</h2>
              <p className="mt-1 text-sm text-slate-500">Keep this reference to check what the council is doing:</p>
              <p className="mx-auto mt-4 w-fit rounded-xl bg-slate-100 px-5 py-3 font-mono text-2xl font-bold tracking-wider text-slate-900">
                {sentCode}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSentCode(null);
                    setFormVersion((v) => v + 1);
                  }}
                >
                  Report another problem
                </Button>
                <Button onClick={() => showStatus(sentCode)}>Check status</Button>
              </div>
            </div>
          )}

          {tab === 'report' && !sentCode && <ComplaintForm key={formVersion} guest onDone={setSentCode} />}

          {tab === 'track' && <TrackComplaint key={codeInLink} initialCode={codeInLink} />}
        </div>
      </main>
    </div>
  );
}

function TrackComplaint({ initialCode }: Readonly<{ initialCode: string }>) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ComplaintTracking | null>(null);
  const [checking, setChecking] = useState(false);

  // Opened with a code in the link (e.g. from "Check status"): look it up straight away
  useEffect(() => {
    if (!initialCode) {
      return;
    }
    let active = true;
    complaintApi
      .track(initialCode)
      .then((found) => {
        if (active) {
          setResult(found);
        }
      })
      .catch((error: unknown) => toast.error(getErrorMessage(error)));
    return () => {
      active = false;
    };
  }, [initialCode]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    try {
      setResult(await complaintApi.track(code.trim()));
    } catch (error) {
      setResult(null);
      toast.error(getErrorMessage(error));
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <TextInput
            id="track-code"
            label="Reference code"
            placeholder="CMP-7K3Q9P"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <Button type="submit" loading={checking}>
          <Search className="size-4" /> Check
        </Button>
      </form>

      {result && <TrackResult result={result} />}
    </div>
  );
}

function TrackResult({ result }: Readonly<{ result: ComplaintTracking }>) {
  const timeline = [
    { label: 'Sent', at: result.createdAt },
    { label: 'Assigned to an officer', at: result.assignedAt },
    { label: 'Work started', at: result.startedAt },
    { label: result.status === 'REJECTED' ? 'Closed' : 'Resolved', at: result.resolvedAt },
  ].filter((item): item is { label: string; at: string } => item.at !== null);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-900">{COMPLAINT_CATEGORY_LABELS[result.category]}</span>
        <ComplaintStatusBadge status={result.status} />
        <SlaBadge complaint={result} />
      </div>
      <p className="text-sm text-slate-500">
        {result.trackingCode} · {result.wardName}, {result.councilName}
      </p>

      <ComplaintProgress status={result.status} />

      <ul className="space-y-1.5 text-sm">
        {timeline.map((item) => (
          <li key={item.label} className="flex justify-between gap-4">
            <span className="text-slate-600">{item.label}</span>
            <span className="text-slate-900">{formatDateTime(item.at)}</span>
          </li>
        ))}
      </ul>

      {result.resolutionNote && result.status === 'RESOLVED' && (
        <p className="flex items-start gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {result.resolutionNote}
        </p>
      )}
      {result.resolutionNote && result.status === 'REJECTED' && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          <XCircle className="mt-0.5 size-4 shrink-0" /> {result.resolutionNote}
        </p>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: Readonly<{ active: boolean; onClick: () => void; children: string }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}