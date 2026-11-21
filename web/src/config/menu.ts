import type { Role } from '../types/api';

export interface MenuItem {
  label: string;
  path: string;
  roles: Role[];
}

const ALL_ROLES: Role[] = ['HOUSEHOLD', 'DRIVER', 'COUNCIL_OFFICER', 'CENTRE_OPERATOR', 'RECYCLER_MANAGER', 'ADMIN'];

// Sidebar menu. Each user only sees the items for their role.
// Pages that are not built yet show "Coming soon".
export const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', path: '/', roles: ALL_ROLES },

  // Household
  { label: 'My schedule', path: '/my-schedule', roles: ['HOUSEHOLD'] },
  { label: 'My points', path: '/my-points', roles: ['HOUSEHOLD'] },

  // Driver
  { label: 'My route', path: '/my-route', roles: ['DRIVER'] },

  // Council officer and admin
  { label: 'Schedules', path: '/schedules', roles: ['COUNCIL_OFFICER', 'ADMIN'] },
  { label: 'Pickup requests', path: '/requests', roles: ['COUNCIL_OFFICER', 'ADMIN'] },
  { label: 'Complaints', path: '/complaints', roles: ['COUNCIL_OFFICER', 'ADMIN'] },
  { label: 'Fleet map', path: '/fleet', roles: ['COUNCIL_OFFICER', 'ADMIN'] },

  // Recycling
  { label: 'Drop-offs', path: '/drop-offs', roles: ['CENTRE_OPERATOR'] },
  { label: 'Rewards', path: '/rewards', roles: ['RECYCLER_MANAGER', 'ADMIN'] },
  { label: 'Analytics', path: '/analytics', roles: ['COUNCIL_OFFICER', 'RECYCLER_MANAGER', 'ADMIN'] },

  // Admin only
  { label: 'Councils & wards', path: '/admin/councils', roles: ['ADMIN'] },
  { label: 'Users', path: '/admin/users', roles: ['ADMIN'] },
];

export const ROLE_LABELS: Record<Role, string> = {
  HOUSEHOLD: 'Household',
  DRIVER: 'Driver',
  COUNCIL_OFFICER: 'Council officer',
  CENTRE_OPERATOR: 'Centre operator',
  RECYCLER_MANAGER: 'Recycler manager',
  ADMIN: 'Admin',
};