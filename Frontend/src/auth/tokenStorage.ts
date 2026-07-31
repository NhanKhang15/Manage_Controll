// Lưu access/refresh token trong localStorage.
//
// RỦI RO BẢO MẬT: bất kỳ script nào chạy được trên trang (XSS) đều đọc được
// localStorage, nên token có thể bị đánh cắp nếu app dính lỗi XSS. Chấp nhận
// được cho SPA nội bộ công ty hiện tại; nếu sau này cần nâng cấp an toàn hơn,
// nên chuyển sang cookie httpOnly + SameSite do backend set (không JS nào đọc
// được), đánh đổi là cần CSRF token riêng cho các request state-changing.

const ACCESS_KEY = "vela_access_token";
const REFRESH_KEY = "vela_refresh_token";
const USER_ID_KEY = "vela_user_id";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function setAccessToken(access: string): void {
  localStorage.setItem(ACCESS_KEY, access);
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_ID_KEY);
}
