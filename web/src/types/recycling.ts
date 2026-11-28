// ----- Centres, rates and campaigns -----

export interface Centre {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  openingHours: string | null;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface CentreRequest {
  name: string;
  address: string;
  phone: string | null;
  openingHours: string | null;
  latitude: number;
  longitude: number;
  active: boolean;
}

// One recyclable material. pointsPerKg = null means it does not earn points.
export interface MaterialRate {
  wasteTypeId: number;
  wasteTypeName: string;
  color: string;
  pointsPerKg: number | null;
}

export interface Campaign {
  id: number;
  name: string;
  description: string | null;
  multiplier: number; // 2 = double points
  wasteTypeId: number | null; // null = every material
  wasteTypeName: string | null;
  startDate: string;
  endDate: string;
  active: boolean;
  running: boolean; // active and running today
}

export interface CampaignRequest {
  name: string;
  description: string | null;
  multiplier: number;
  wasteTypeId: number | null;
  startDate: string;
  endDate: string;
  active: boolean;
}

// ----- Household points -----

export interface RecyclingCard {
  code: string; // the text inside the QR code, e.g. "ECO-7KQ2M9XA"
  fullName: string;
  createdAt: string;
}

export interface PointsSummary {
  balance: number;
  pendingPoints: number; // waiting for a review
  totalEarned: number;
}

export type TransactionType = 'EARNED' | 'REDEEMED';

export interface PointTransaction {
  id: number;
  type: TransactionType;
  points: number; // + earned, - spent
  description: string;
  dropOffId: number | null;
  voucherCode: string | null;
  createdAt: string;
}

// ----- Drop-offs (receipts) -----

export type DropOffStatus = 'CREDITED' | 'PENDING_REVIEW' | 'REJECTED';

export interface DropOffItemRequest {
  wasteTypeId: number;
  weightKg: number;
}

export interface DropOffRequest {
  cardCode: string;
  centreId: number;
  items: DropOffItemRequest[];
}

export interface DropOffItem {
  wasteTypeId: number;
  wasteTypeName: string;
  color: string;
  weightKg: number;
  pointsPerKg: number;
  multiplier: number;
  campaignName: string | null;
  points: number;
}

export interface DropOffPreview {
  householdName: string;
  items: DropOffItem[];
  totalWeightKg: number;
  totalPoints: number;
  needsReview: boolean;
  reviewReason: string | null;
}

export interface DropOff {
  id: number;
  receiptNumber: string;
  householdId: number;
  householdName: string;
  centreId: number;
  centreName: string;
  operatorName: string;
  items: DropOffItem[];
  totalWeightKg: number;
  totalPoints: number;
  status: DropOffStatus;
  reviewReason: string | null;
  reviewNote: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface HouseholdLookup {
  cardCode: string;
  householdName: string;
  dropOffsToday: number;
}

// ----- Rewards -----

export interface Reward {
  id: number;
  name: string;
  description: string | null;
  pointsCost: number;
  stock: number | null; // null = no limit
  active: boolean;
}

export interface RewardRequest {
  name: string;
  description: string | null;
  pointsCost: number;
  stock: number | null;
  active: boolean;
}

export type RedemptionStatus = 'ISSUED' | 'COLLECTED';

export interface Redemption {
  id: number;
  rewardId: number;
  rewardName: string;
  householdId: number;
  householdName: string;
  points: number;
  voucherCode: string;
  status: RedemptionStatus;
  createdAt: string;
  collectedAt: string | null;
}