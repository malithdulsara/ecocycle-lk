export interface Address {
  id: number;
  label: string;
  addressLine: string;
  city: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  // null when the location is outside every ward we serve
  wardId: number | null;
  wardName: string | null;
  councilName: string | null;
}

export interface AddressRequest {
  label: string;
  addressLine: string;
  city: string;
  latitude: number;
  longitude: number;
}