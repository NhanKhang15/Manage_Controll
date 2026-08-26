import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from "react";
import { getMe, type AuthEmployee } from "../api/auth";
import { getAccessToken, clearTokens, getUserId, setUserId } from "./tokenStorage";
import { isTokenValid } from "./jwt";

interface AuthContextValue {
  employee: AuthEmployee | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<AuthEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const employeeRef = useRef<AuthEmployee | null>(null);

  const refetch = useCallback(async () => {
    if (!isTokenValid(getAccessToken())) {
      setEmployee(null);
      employeeRef.current = null;
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setEmployee(me);
      employeeRef.current = me;
      // Lưu userId để các tab khác phát hiện khi có thay đổi
      setUserId(me.id);
    } catch {
      clearTokens();
      setEmployee(null);
      employeeRef.current = null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Phát hiện xung đột session giữa các tab:
  // Khi tab khác đăng nhập bằng tài khoản khác, localStorage thay đổi →
  // event 'storage' được fire ở các tab KHÁC. Nếu userId mới khác userId
  // hiện tại → force logout tab này để tránh hiển thị sai dữ liệu.
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      // Chỉ quan tâm khi key liên quan đến auth thay đổi
      if (e.key === "vela_access_token" || e.key === "vela_user_id") {
        const currentEmp = employeeRef.current;
        const storedUserId = getUserId();

        if (!e.newValue) {
          // Token bị xoá (logout ở tab khác) → logout tab này
          clearTokens();
          setEmployee(null);
          employeeRef.current = null;
          window.location.href = "/login";
          return;
        }

        if (currentEmp && storedUserId && storedUserId !== currentEmp.id) {
          // Tài khoản khác đã đăng nhập ở tab khác → logout tab này
          console.warn("[Auth] Phát hiện tài khoản khác đăng nhập ở tab khác. Đăng xuất...");
          clearTokens();
          setEmployee(null);
          employeeRef.current = null;
          window.location.href = "/login";
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Khi tab được focus lại, kiểm tra userId còn khớp không
  useEffect(() => {
    function handleFocus() {
      const currentEmp = employeeRef.current;
      const storedUserId = getUserId();
      const token = getAccessToken();

      if (!token || !isTokenValid(token)) {
        // Token hết hạn hoặc bị xoá
        if (currentEmp) {
          clearTokens();
          setEmployee(null);
          employeeRef.current = null;
          window.location.href = "/login";
        }
        return;
      }

      if (currentEmp && storedUserId && storedUserId !== currentEmp.id) {
        // Tài khoản khác đã đăng nhập → force logout
        console.warn("[Auth] Phát hiện userId thay đổi khi focus. Đăng xuất...");
        clearTokens();
        setEmployee(null);
        employeeRef.current = null;
        window.location.href = "/login";
      }
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Memo hoá value: nếu không, mỗi lần AuthProvider render (dù employee/loading
  // không đổi) sẽ tạo object mới -> mọi consumer useAuth() re-render theo, có
  // thể khuếch đại thành vòng lặp re-render nếu 1 consumer đó dùng giá trị
  // (mảng/object literal) không ổn định trong dependency của useEffect khác.
  const value = useMemo(() => ({ employee, loading, refetch }), [employee, loading, refetch]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
