const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

const resolveUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Add it to your environment variables."
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const toErrorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const candidate =
      "message" in payload
        ? payload.message
        : "error" in payload
        ? payload.error
        : "detail" in payload
        ? payload.detail
        : undefined;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return fallback;
};

export async function requestJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const isFormDataBody =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  const headers = isFormDataBody
    ? { ...(init.headers ?? {}) }
    : {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      };

  const response = await fetch(resolveUrl(path), {
    ...init,
    headers,
  });

  const rawBody = await response.text();
  let body: unknown = null;

  if (rawBody) {
    try {
      body = JSON.parse(rawBody) as unknown;
    } catch {
      body = rawBody;
    }
  }

  if (!response.ok) {
    throw new Error(toErrorMessage(body, `Request failed (${response.status})`));
  }

  return body as T;
}
