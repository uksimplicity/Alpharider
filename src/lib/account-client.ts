import { requestJson } from "./api";

export function currentToken() {
  const token = localStorage.getItem("alpharider_token") ?? "";
  if (!token) throw new Error("Please sign in to continue.");
  return token;
}
export function checkSession(token: string) {
  if (localStorage.getItem("alpharider_token") !== token) throw new Error("Your account changed. Refresh this page before continuing.");
}
export async function accountRequest<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = currentToken();
  const result = await requestJson<T>(path, { ...init, cache: "no-store", headers: { ...init.headers, Authorization: `Bearer ${token}` } });
  checkSession(token);
  return result;
}
