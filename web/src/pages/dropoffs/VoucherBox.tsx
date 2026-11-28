import { useState, type SubmitEvent } from 'react';
import { Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { rewardApi } from '../../api/rewardApi';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/form';

// Centre operator: a household shows a voucher code, the operator hands over the reward
export function VoucherBox() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const voucher = await rewardApi.collect(code.trim());
      toast.success(`Give "${voucher.rewardName}" to ${voucher.householdName}`);
      setCode('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <TextInput
        id="voucher-code"
        label="Hand over a reward"
        placeholder="VCH-XXXXXXXX"
        icon={Ticket}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoComplete="off"
      />
      <Button type="submit" variant="secondary" className="w-full" loading={busy} disabled={!code.trim()}>
        Mark as handed over
      </Button>
    </form>
  );
}