import { useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { userApi } from '../../api/userApi';
import { useAuth } from '../../auth/useAuth';
import { Avatar } from '../../components/Avatar';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { PageHeader } from '../../components/ui/PageHeader';
import { ROLE_LABELS } from '../../config/menu';
import { useApiData } from '../../hooks/useApiData';
import type { Role, User } from '../../types/api';
import { CreateUserModal } from './CreateUserModal';

const ROLES = Object.keys(ROLE_LABELS) as Role[];
const ROLE_OPTIONS = ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));
const FILTER_OPTIONS = [{ value: 'ALL', label: 'All roles' }, ...ROLE_OPTIONS];

const dateFormat = new Intl.DateTimeFormat('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users, setData: setUsers, loading, reload } = useApiData<User[]>(userApi.getAll, []);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [creating, setCreating] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  const filteredUsers = useMemo(() => {
    const text = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (roleFilter === 'ALL' || u.role === roleFilter) &&
        (text === '' || u.fullName.toLowerCase().includes(text) || u.email.toLowerCase().includes(text)),
    );
  }, [users, search, roleFilter]);

  // Change role or enabled, then put the updated user back into the list
  async function updateUser(target: User, change: { role?: Role; enabled?: boolean }, message: string) {
    setBusyUserId(target.id);
    try {
      const updated = await userApi.update(target.id, change);
      setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyUserId(null);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone who can log in. Add staff accounts and control their roles."
        actions={
          <Button onClick={() => setCreating(true)}>
            <UserPlus className="size-4" />
            Add staff
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <TextInput
          id="user-search"
          label="Search"
          icon={Search}
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectInput
          id="role-filter"
          label="Role"
          options={FILTER_OPTIONS}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-190 text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const isMe = u.id === currentUser?.id;
              const busy = busyUserId === u.id;
              return (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.fullName} />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {u.fullName}
                          {isMe && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                        </p>
                        <p className="truncate text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.phone ?? '-'}</td>
                  <td className="px-5 py-3">
                    <SelectInput
                      id={`role-${u.id}`}
                      aria-label={`Role of ${u.fullName}`}
                      options={ROLE_OPTIONS}
                      value={u.role}
                      disabled={isMe || busy}
                      onChange={(e) => {
                        const role = e.target.value as Role;
                        void updateUser(u, { role }, `${u.fullName} is now ${ROLE_LABELS[role]}`);
                      }}
                      className="w-44 py-1.5"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.enabled ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${u.enabled ? 'bg-brand-500' : 'bg-slate-400'}`} />
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{dateFormat.format(new Date(u.createdAt))}</td>
                  <td className="px-5 py-3 text-right">
                    {!isMe && (
                      <Button
                        variant={u.enabled ? 'dangerGhost' : 'secondary'}
                        className="px-3 py-1.5"
                        loading={busy}
                        onClick={() =>
                          updateUser(
                            u,
                            { enabled: !u.enabled },
                            u.enabled ? `${u.fullName} was disabled` : `${u.fullName} was enabled`,
                          )
                        }
                      >
                        {u.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">No users match your search.</p>
        )}
      </div>

      {creating && (
        <CreateUserModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            reload();
          }}
        />
      )}
    </div>
  );
}