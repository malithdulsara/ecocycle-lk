// Same shape as ApiResponse<T> in the Spring Boot backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type Role =
  | 'HOUSEHOLD'
  | 'DRIVER'
  | 'COUNCIL_OFFICER'
  | 'CENTRE_OPERATOR'
  | 'RECYCLER_MANAGER'
  | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  enabled: boolean;
  preferredLanguage: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}