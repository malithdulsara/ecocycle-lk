import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { councilApi } from '../../api/councilApi';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { Council } from '../../types/admin';

interface Props {
  // null = add a new council, otherwise edit this one
  council: Council | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CouncilFormModal({ council, onClose, onSaved }: Readonly<Props>) {
  const [name, setName] = useState(council?.name ?? '');
  const [district, setDistrict] = useState(council?.district ?? '');
  const [contactEmail, setContactEmail] = useState(council?.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(council?.contactPhone ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const request = {
      name,
      district,
      contactEmail: contactEmail.trim() || null,
      contactPhone: contactPhone.trim() || null,
    };
    try {
      if (council) {
        await councilApi.update(council.id, request);
        toast.success('Council updated');
      } else {
        await councilApi.create(request);
        toast.success('Council created');
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      title={council ? 'Edit council' : 'Add council'}
      description="Municipal council, urban council or pradeshiya sabha."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="council-name"
          label="Council name"
          placeholder="Colombo Municipal Council"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextInput
          id="council-district"
          label="District"
          placeholder="Colombo"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="council-email"
            label="Contact email"
            type="email"
            placeholder="info@council.lk"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <TextInput
            id="council-phone"
            label="Contact phone"
            placeholder="0112345678"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {council ? 'Save changes' : 'Add council'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
