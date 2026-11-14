import { requestJson } from "./api";
import { API_ENDPOINTS } from "./endpoints";
import { rows, text, unwrap, record } from "./backend-data";
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
export type UploadedFile = { id?: string; file_id?: string; url?: string; secure_url?: string; public_id?: string; name?: string };
export async function uploadFile(token: string, file: File, folder?: string): Promise<UploadedFile> {
  if (!file.size || file.size > 3 * 1024 * 1024) throw new Error("Choose a file up to 3 MB.");
  const form = new FormData(); form.append("file", file); if (folder) form.append("folder", folder);
  const data = unwrap(await requestJson<unknown>(API_ENDPOINTS.upload.file, { method: "POST", headers: auth(token), body: form }));
  const source = { ...data, ...record(data.file) }, url = text(source.url ?? source.file_url ?? source.fileUrl ?? source.secure_url ?? source.path);
  try { if (!["http:", "https:"].includes(new URL(url).protocol)) throw new Error(); } catch { throw new Error("The upload did not return a usable file URL."); }
  return { ...source, url, secure_url: url } as UploadedFile;
}
export const listFiles = async (token: string, folder?: string) => rows(await requestJson<unknown>(folder ? `${API_ENDPOINTS.upload.files}?folder=${encodeURIComponent(folder)}` : API_ENDPOINTS.upload.files, { headers: auth(token) })) as UploadedFile[];
export const deleteFile = (token: string, id: string) => requestJson<Record<string, unknown>>(API_ENDPOINTS.upload.fileById(encodeURIComponent(id)), { method: "DELETE", headers: auth(token) });
