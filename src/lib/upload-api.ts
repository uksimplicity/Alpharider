import { requestJson } from "./api";
import { API_ENDPOINTS } from "./endpoints";

const withAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const MOCK_UPLOADS_KEY = "alpharider_mock_uploads";

const isLocalMockEnabled = () => {
  if (typeof window === "undefined") return false;
  const forced = process.env.NEXT_PUBLIC_USE_LOCAL_UPLOAD_MOCK;
  if (forced === "true") return true;
  if (forced === "false") return false;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
};

const readMockUploads = (): UploadedFile[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(MOCK_UPLOADS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as UploadedFile[]) : [];
  } catch {
    return [];
  }
};

const writeMockUploads = (items: UploadedFile[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(MOCK_UPLOADS_KEY, JSON.stringify(items));
};

const createMockUploadId = () =>
  `UPL-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read file."));
    };
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

const toOptimizedDataUrl = async (file: File) => {
  const rawDataUrl = await readAsDataUrl(file);

  // Keep GIF/SVG as-is to avoid breaking animation/vector data.
  if (file.type.includes("gif") || file.type.includes("svg")) {
    return rawDataUrl;
  }

  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const maxDimension = 1200;
        const scale = Math.min(
          1,
          maxDimension / Math.max(image.width, image.height)
        );
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(rawDataUrl);
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      } catch {
        resolve(rawDataUrl);
      }
    };
    image.onerror = () => resolve(rawDataUrl);
    image.src = rawDataUrl;
  });
};

const writeMockUploadsSafely = (items: UploadedFile[]) => {
  try {
    writeMockUploads(items.slice(0, 3));
    return;
  } catch {
    try {
      // Quota fallback: keep only the newest file.
      writeMockUploads(items.slice(0, 1));
      return;
    } catch {
      throw new Error(
        "Image is too large for local mock storage. Please choose a smaller image."
      );
    }
  }
};

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
  if (isLocalMockEnabled()) {
    const id = createMockUploadId();
    const url = await toOptimizedDataUrl(file);
    const uploaded: UploadedFile = {
      id,
      file_id: id,
      public_id: id,
      name: file.name,
      url,
      secure_url: url,
    };
    const items = readMockUploads();
    writeMockUploadsSafely([uploaded, ...items]);
    return uploaded;
  }

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
  if (isLocalMockEnabled()) {
    return readMockUploads();
  }

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
  isLocalMockEnabled()
    ? (() => {
        const items = readMockUploads();
        writeMockUploads(
          items.filter(
            (item) => (item.id ?? item.file_id ?? item.public_id ?? "") !== id
          )
        );
        return Promise.resolve({ id, deleted: true } as Record<string, unknown>);
      })()
    : requestJson<Record<string, unknown>>(API_ENDPOINTS.upload.fileById(id), {
        method: "DELETE",
        headers: withAuthHeaders(token),
      });
