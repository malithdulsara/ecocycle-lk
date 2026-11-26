import {
  Building2,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  Coins,
  Gift,
  LayoutDashboard,
  MapPin,
  MapPinned,
  MessageSquareWarning,
  Package,
  PackageCheck,
  Route,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '../types/api';

export interface MenuItem {
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
  section: 'Overview' | 'Operations' | 'Recycling' | 'Administration';
  roles: Role[];
}

const ALL_ROLES: Role[] = ['HOUSEHOLD', 'DRIVER', 'COUNCIL_OFFICER', 'CENTRE_OPERATOR', 'RECYCLER_MANAGER', 'ADMIN'];

// Sidebar menu. Each user only sees the items for their role.
// Pages that are not built yet show "Coming soon".
export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    description: 'Your overview',
    icon: LayoutDashboard,
    section: 'Overview',
    roles: ALL_ROLES,
  },

  // Household
  {
    label: 'My schedule',
    path: '/my-schedule',
    description: 'When the truck comes to your area',
    icon: CalendarDays,
    section: 'Overview',
    roles: ['HOUSEHOLD'],
  },
    {
    label: 'Pickup requests',
    path: '/my-requests',
    description: 'Ask for a special or bulk pickup',
    icon: Truck,
    section: 'Overview',
    roles: ['HOUSEHOLD'],
  },
    {
    label: 'Complaints',
    path: '/my-complaints',
    description: 'Report missed pickups and dumping',
    icon: MessageSquareWarning,
    section: 'Overview',
    roles: ['HOUSEHOLD'],
  },
  {
    label: 'My addresses',
    path: '/my-addresses',
    description: 'Your home and other places',
    icon: MapPin,
    section: 'Overview',
    roles: ['HOUSEHOLD'],
  },
  {
    label: 'My points',
    path: '/my-points',
    description: 'Your recycling reward points',
    icon: Coins,
    section: 'Recycling',
    roles: ['HOUSEHOLD'],
  },

  // Driver
  {
    label: 'My route',
    path: '/my-route',
    description: "Today's collection stops",
    icon: Route,
    section: 'Operations',
    roles: ['DRIVER'],
  },
    {
    label: 'My pickups',
    path: '/my-pickups',
    description: 'Special pickups assigned to you',
    icon: Package,
    section: 'Operations',
    roles: ['DRIVER'],
  },

  // Council officer and admin
  {
    label: 'Schedules',
    path: '/schedules',
    description: 'Plan collection days for each ward',
    icon: CalendarClock,
    section: 'Operations',
    roles: ['COUNCIL_OFFICER', 'ADMIN'],
  },
  {
    label: 'Pickup requests',
    path: '/requests',
    description: 'Approve special and bulk pickups',
    icon: Truck,
    section: 'Operations',
    roles: ['COUNCIL_OFFICER', 'ADMIN'],
  },
  {
    label: 'Complaints',
    path: '/complaints',
    description: 'Missed pickups and illegal dumping',
    icon: MessageSquareWarning,
    section: 'Operations',
    roles: ['COUNCIL_OFFICER', 'ADMIN'],
  },
  {
    label: 'Fleet map',
    path: '/fleet',
    description: 'Live location of every truck',
    icon: MapPinned,
    section: 'Operations',
    roles: ['COUNCIL_OFFICER', 'ADMIN'],
  },

  // Recycling
  {
    label: 'Drop-offs',
    path: '/drop-offs',
    description: 'Scan QR codes and weigh materials',
    icon: PackageCheck,
    section: 'Recycling',
    roles: ['CENTRE_OPERATOR'],
  },
  {
    label: 'Rewards',
    path: '/rewards',
    description: 'Rates, campaigns and the rewards catalogue',
    icon: Gift,
    section: 'Recycling',
    roles: ['RECYCLER_MANAGER', 'ADMIN'],
  },
  {
    label: 'Analytics',
    path: '/analytics',
    description: 'Tonnage, coverage and recycling rates',
    icon: ChartColumn,
    section: 'Overview',
    roles: ['COUNCIL_OFFICER', 'RECYCLER_MANAGER', 'ADMIN'],
  },

  // Admin only
  {
    label: 'Councils & wards',
    path: '/admin/councils',
    description: 'Councils, wards and their boundaries',
    icon: Building2,
    section: 'Administration',
    roles: ['ADMIN'],
  },
  {
    label: 'Users',
    path: '/admin/users',
    description: 'Staff accounts and roles',
    icon: Users,
    section: 'Administration',
    roles: ['ADMIN'],
  },
];

export const MENU_SECTIONS: MenuItem['section'][] = ['Overview', 'Operations', 'Recycling', 'Administration'];

export const ROLE_LABELS: Record<Role, string> = {
  HOUSEHOLD: 'Household',
  DRIVER: 'Driver',
  COUNCIL_OFFICER: 'Council officer',
  CENTRE_OPERATOR: 'Centre operator',
  RECYCLER_MANAGER: 'Recycler manager',
  ADMIN: 'Admin',
};

// Items the user is allowed to see
export function menuForRole(role: Role): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.roles.includes(role));
}