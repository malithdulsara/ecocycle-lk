import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { recyclingApi } from '../../api/recyclingApi';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { Campaign, MaterialRate } from '../../types/recycling';
import { addDaysIso, todayIso } from '../../utils/schedule';

interface Props {
  campaign: Campaign | null; // null = new campaign
  rates: MaterialRate[];
  onClose: () => void;
  onSaved: () => void;
}

export function CampaignFormModal({ campaign, rates, onClose, onSaved }: Readonly<Props>) {
  const [name, setName] = useState(campaign?.name ?? '');
  const [description, setDescription] = useState(campaign?.description ?? '');
  const [multiplier, setMultiplier] = useState(String(campaign?.multiplier ?? 2));
  const [wasteTypeId, setWasteTypeId] = useState(String(campaign?.wasteTypeId ?? ''));
  const [startDate, setStartDate] = useState(campaign?.startDate ?? todayIso());
  const [endDate, setEndDate] = useState(campaign?.endDate ?? addDaysIso(30));
  const [active, setActive] = useState(campaign?.active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const request = {
        name,
        description: description.trim() || null,
        multiplier: Number(multiplier),
        wasteTypeId: wasteTypeId ? Number(wasteTypeId) : null,
        startDate,
        endDate,
        active,
      };
      if (campaign) {
        await recyclingApi.updateCampaign(campaign.id, request);
        toast.success('Campaign updated');
      } else {
        await recyclingApi.createCampaign(request);
        toast.success('Campaign created');
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const materialOptions = [
    { value: '', label: 'Every material' },
    ...rates.map((r) => ({ value: String(r.wasteTypeId), label: r.wasteTypeName })),
  ];

  return (
    <Modal open title={campaign ? 'Edit campaign' : 'New campaign'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="campaign-name"
          label="Name"
          placeholder="Plastic December"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextInput
          id="campaign-description"
          label="Short description (optional)"
          placeholder="Double points for clean plastic bottles"
          maxLength={255}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="campaign-multiplier"
            label="Multiply points by"
            hint="1.5 = 50% more, 2 = double"
            type="number"
            min={1.1}
            max={5}
            step={0.1}
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
            required
          />
          <SelectInput
            id="campaign-material"
            label="Material"
            options={materialOptions}
            value={wasteTypeId}
            onChange={(e) => setWasteTypeId(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="campaign-start"
            label="Starts"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <TextInput
            id="campaign-end"
            label="Ends"
            type="date"
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        {campaign && (
          <SelectInput
            id="campaign-active"
            label="Status"
            options={[
              { value: 'yes', label: 'On' },
              { value: 'no', label: 'Stopped' },
            ]}
            value={active ? 'yes' : 'no'}
            onChange={(e) => setActive(e.target.value === 'yes')}
          />
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {campaign ? 'Save' : 'Create campaign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}