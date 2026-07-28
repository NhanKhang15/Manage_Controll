import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "./tokenStorage";
import { isTokenValid } from "./jwt";

/**
 * RequireAuth
 * Route guard dạng layout route (react-router v7 <Outlet/>). Chưa có access
 * token hợp lệ (thiếu hoặc hết hạn) → điều hướng về /login.
 */
export function RequireAuth() {
  if (!isTokenValid(getAccessToken())) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
