import type { AuthResponse } from "../../../types";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Request failed. Please try again.";
    try {
      const body = await response.json() as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // Keep the generic message when a server response is not JSON.
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function refreshSession(): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return parseResponse<AuthResponse>(response);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  onTokenRefreshed?: (token: string) => void,
  onAuthExpired?: () => void,
): Promise<T> {
  const send = (accessToken?: string | null) => {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  };

  let response = await send(token);
  if (response.status === 401 && token && onTokenRefreshed && !path.startsWith("/auth/")) {
    try {
      const refreshed = await refreshSession();
      onTokenRefreshed(refreshed.accessToken);
      response = await send(refreshed.accessToken);
    } catch {
      onAuthExpired?.();
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
  }
  if (response.status === 401 && token && onAuthExpired) onAuthExpired();
  return parseResponse<T>(response);
}
