import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { rewardApi } from '../../api/rewardApi';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { Reward } from '../../types/recycling';

interface Props {
  reward: Reward | null; // null = new reward
  onClose: () => void;
  onSaved: () => void;
}

export function RewardFormModal({ reward, onClose, onSaved }: Readonly<Props>) {
  const [name, setName] = useState(reward?.name ?? '');
  const [description, setDescription] = useState(reward?.description ?? '');
  const [pointsCost, setPointsCost] = useState(String(reward?.pointsCost ?? 500));
  const [stock, setStock] = useState(reward?.stock == null ? '' : String(reward.stock));
  const [active, setActive] = useState(reward?.active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const request = {
        name,
        description: description.trim() || null,
        pointsCost: Number(pointsCost),
        stock: stock === '' ? null : Number(stock),
        active,
      };
      if (reward) {
        await rewardApi.update(reward.id, request);
        toast.success('Reward updated');
      } else {
        await rewardApi.create(request);
        toast.success('Reward added');
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open title={reward ? 'Edit reward' : 'Add a reward'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="reward-name"
          label="Name"
          placeholder="Rs. 500 supermarket voucher"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextInput
          id="reward-description"
          label="Short description (optional)"
          maxLength={255}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="reward-points"
            label="Points needed"
            type="number"
            min={1}
            max={1000000}
            value={pointsCost}
            onChange={(e) => setPointsCost(e.target.value)}
            required
          />
          <TextInput
            id="reward-stock"
            label="How many (optional)"
            hint="Empty = no limit"
            type="number"
            min={0}
            max={100000}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
        <SelectInput
          id="reward-active"
          label="Show to households"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No, hide it' },
          ]}
          value={active ? 'yes' : 'no'}
          onChange={(e) => setActive(e.target.value === 'yes')}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {reward ? 'Save' : 'Add reward'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}