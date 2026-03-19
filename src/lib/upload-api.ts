import { requestJson } from "./api";
import { API_ENDPOINTS } from "./endpoints";

const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export type UploadedFile = {
  id?: string;
  file_id?: string;
  url?: string;
  secure_url?: string;
  public_id?: string;
  name?: string;
};

type UploadListResponse = {
  files?: UploadedFile[];
  data?: UploadedFile[];
} & Record<string, unknown>;

const parseList = (response: UploadListResponse): UploadedFile[] => {
  if (Array.isArray(response.files)) return response.files;
  if (Array.isArray(response.data)) return response.data;
  return [];
};

export const uploadFile = async (token: string, file: File, folder?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) {
    formData.append("folder", folder);
  }

  return requestJson<UploadedFile>(API_ENDPOINTS.upload.file, {
    method: "POST",
    headers: withAuthHeaders(token),
    body: formData,
  });
};

export const listFiles = async (token: string, folder?: string) => {
  const path = folder
    ? `${API_ENDPOINTS.upload.files}?folder=${encodeURIComponent(folder)}`
    : API_ENDPOINTS.upload.files;
  const response = await requestJson<UploadListResponse>(path, {
    method: "GET",
    headers: withAuthHeaders(token),
  });
  return parseList(response);
};

export const deleteFile = (token: string, id: string) =>
  requestJson<Record<string, unknown>>(API_ENDPOINTS.upload.fileById(id), {
    method: "DELETE",
    headers: withAuthHeaders(token),
  });
