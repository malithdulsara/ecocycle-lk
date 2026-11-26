export type ComplaintCategory =
  | 'MISSED_PICKUP'
  | 'OVERFLOWING_BIN'
  | 'BURNING_WASTE'
  | 'ILLEGAL_DUMPING'
  | 'DAMAGED_BIN'
  | 'STAFF_BEHAVIOUR'
  | 'OTHER';

export type ComplaintPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type ComplaintStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Complaint {
  id: number;
  trackingCode: string; // "CMP-7K3Q9P"
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
  landmark: string | null;
  latitude: number;
  longitude: number;
  wardId: number;
  wardName: string;
  councilName: string;
  photoFileName: string | null;
  anonymous: boolean; // true = sent by a guest without logging in
  reporterName: string | null;
  reporterPhone: string | null;
  officerId: number | null;
  officerName: string | null;
  slaDueAt: string; // deadline to fix it
  overdue: boolean;
  resolutionNote: string | null; // what was done, or why it was rejected
  createdAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
}

// Public status check by tracking code (no names or phone numbers)
export interface ComplaintTracking {
  trackingCode: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  wardName: string;
  councilName: string;
  slaDueAt: string;
  resolutionNote: string | null;
  createdAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
}

export interface CreateComplaintRequest {
  category: ComplaintCategory;
  description: string;
  latitude: number;
  longitude: number;
  landmark: string | null;
  photoFileName: string | null;
  // Guests only (optional)
  reporterName?: string | null;
  reporterPhone?: string | null;
}