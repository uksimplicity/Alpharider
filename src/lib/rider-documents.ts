import { checkSession } from "./account-client";
import { uploadFile } from "./upload-api";

export type DocumentCache = Map<File, { token: string; url: string }>;
export function documentError(file: File): string {
  if (!file.size || file.size > 3 * 1024 * 1024) return `Choose a document up to 3 MB: ${file.name}.`;
  if (!file.type.startsWith("image/") && file.type !== "application/pdf" && !(!file.type && /\.pdf$/i.test(file.name))) return `Choose a PDF or image: ${file.name}.`;
  return "";
}
export async function uploadRiderDocuments(files: File[], token: string, cache: DocumentCache): Promise<string[]> {
  for (const file of files) { const error = documentError(file); if (error) throw new Error(error); }
  const urls: string[] = [];
  for (const file of files) {
    checkSession(token);
    let cached = cache.get(file);
    if (!cached || cached.token !== token) {
      const uploaded = await uploadFile(token, file, "rider-documents");
      checkSession(token);
      if (!uploaded.url) throw new Error(`Could not confirm the upload of ${file.name}.`);
      cached = { token, url: uploaded.url }; cache.set(file, cached);
    }
    urls.push(cached.url);
  }
  return urls;
}
