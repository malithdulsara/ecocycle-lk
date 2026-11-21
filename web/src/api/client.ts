import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../auth/tokenStorage';
import type { ApiResponse, AuthResponse } from '../types/api';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

// One Axios instance for the whole app
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 1) Add the access token to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2) When the access token has expired (401), get a new one with the refresh token and try again
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  // Plain axios (not "api") so this call does not go through these interceptors
  const response = await axios.post<ApiResponse<AuthResponse>>(`${API_URL}/auth/refresh`, { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  tokenStorage.save(accessToken, newRefreshToken);
  return accessToken;
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        // If many requests fail at the same time, refresh only once
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        tokenStorage.clear();
        globalThis.location.href = '/login';
      }
    }
    throw error;
  },
);

// Reads the "message" from our backend's error response
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiResponse<unknown>> | undefined;
    if (data?.message) {
      return data.message;
    }
    if (!error.response) {
      return 'Cannot reach the server. Is the backend running?';
    }
  }
  return 'Something went wrong. Please try again.';
}