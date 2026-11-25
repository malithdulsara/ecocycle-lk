import { API_URL, api } from './client';
import type { ApiResponse } from '../types/api';

interface FileUpload {
  fileName: string;
  url: string;
}

export const fileApi = {
  // Uploads one photo and returns its file name (send that name with the request that uses it)
  async uploadImage(file: File): Promise<string> {
    const body = new FormData();
    body.append('file', file);
    const response = await api.post<ApiResponse<FileUpload>>('/files', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.fileName;
  },
};

// Full address of an uploaded photo, to show it on the page
export function fileUrl(fileName: string): string {
  return `${API_URL}/files/${fileName}`;
}