import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "../auth/tokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Nhiều request có thể 401 gần như cùng lúc (vd. load trang gọi vài API song
// song) — dùng chung 1 promise refresh đang chạy thay vì bắn nhiều lệnh
// refresh trùng nhau.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        if (data?.access) {
          setAccessToken(data.access);
          return data.access as string;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function redirectToLogin() {
  clearTokens();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function buildErrorMessage(response: Response): Promise<string> {
  let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
  try {
    const errorData = await response.json();
    if (errorData && errorData.detail) {
      errorMessage = errorData.detail;
    } else if (errorData && typeof errorData === "object") {
      const firstKey = Object.keys(errorData)[0];
      const val = errorData[firstKey];
      errorMessage = Array.isArray(val) ? val.join(", ") : String(val);
    }
  } catch {
    // ignore json parse error
  }
  return errorMessage;
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}, _isRetry = false): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const isAuthEndpoint = path.includes("/auth/login/") || path.includes("/auth/refresh/");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const accessToken = getAccessToken();
  if (accessToken && !isAuthEndpoint) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && !isAuthEndpoint && !_isRetry) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      return apiFetch<T>(path, options, true);
    }
    redirectToLogin();
    throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  }

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
