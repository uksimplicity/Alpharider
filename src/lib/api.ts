import { API_BASE_URL } from "./endpoints";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const resolveUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) {
    return path;
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
    throw new ApiError(
      toErrorMessage(body, `Request failed (${response.status})`),
      response.status,
      body
    );
  }

  return body as T;
}

export async function requestJsonWithFallback<T>(
  paths: string[],
  init: RequestInit | (() => RequestInit) = {}
): Promise<T> {
  if (paths.length === 0) {
    throw new Error("No API paths provided.");
  }

  let lastError: unknown;

  for (let i = 0; i < paths.length; i += 1) {
    try {
      const requestInit = typeof init === "function" ? init() : init;
      return await requestJson<T>(paths[i], requestInit);
    } catch (error) {
      lastError = error;

      const isFinalAttempt = i === paths.length - 1;
      const shouldTryNextPath =
        error instanceof ApiError &&
        (error.status === 401 ||
          error.status === 403 ||
          error.status === 404 ||
          error.status === 405 ||
          error.status === 501);

      if (isFinalAttempt || !shouldTryNextPath) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed.");
}
