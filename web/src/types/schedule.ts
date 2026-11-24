export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface WasteType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  color: string; // "#16a34a"
  recyclable: boolean;
}

// One weekly slot: "Plastic, every Wednesday, 08:00 - 11:00"
export interface Schedule {
  id: number;
  wardId: number;
  wasteType: WasteType;
  dayOfWeek: DayOfWeek;
  startTime: string; // "08:00:00"
  endTime: string;
  notes: string | null;
}

export interface ScheduleRequest {
  wasteTypeId: number;
  dayOfWeek: DayOfWeek;
  startTime: string; // "08:00"
  endTime: string;
  notes: string | null;
}

export type ChangeType = 'CANCELLED' | 'RESCHEDULED';

// Holiday change for every ward of a council
export interface ScheduleChange {
  id: number;
  councilId: number;
  changeDate: string; // "2026-12-25"
  changeType: ChangeType;
  newDate: string | null;
  reason: string;
}

export interface ScheduleChangeRequest {
  changeDate: string;
  changeType: ChangeType;
  newDate: string | null;
  reason: string;
}

export type CollectionStatus = 'SCHEDULED' | 'CANCELLED' | 'RESCHEDULED';

// One collection on a real date (holiday changes already applied by the backend)
export interface UpcomingCollection {
  date: string;
  originalDate: string | null;
  wasteType: WasteType;
  startTime: string;
  endTime: string;
  status: CollectionStatus;
  note: string | null;
}

export interface WardCollections {
  wardId: number;
  wardName: string;
  councilName: string;
  collections: UpcomingCollection[];
}