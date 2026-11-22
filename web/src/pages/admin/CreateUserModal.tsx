import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { userApi } from '../../api/userApi';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import { ROLE_LABELS } from '../../config/menu';
import type { Role } from '../../types/api';

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as Role[]).map((role) => ({ value: role, label: ROLE_LABELS[role] }));

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateUserModal({ onClose, onCreated }: Readonly<Props>) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('DRIVER');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await userApi.create({ fullName, email, phone: phone.trim() || null, password, role });
      toast.success(`${fullName} was added as ${ROLE_LABELS[role]}`);
      onCreated();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open title="Add staff account" description="Create a login for a driver, officer or other staff member." onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="user-name"
          label="Full name"
          placeholder="Kamal Perera"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="user-email"
            label="Email"
            type="email"
            placeholder="kamal@ecocycle.lk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            id="user-phone"
            label="Phone (optional)"
            placeholder="0771234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="user-password"
            label="Password"
            type="password"
            hint="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <SelectInput
            id="user-role"
            label="Role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Add account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
