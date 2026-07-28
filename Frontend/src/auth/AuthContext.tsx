import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, type AuthEmployee } from "../api/auth";
import { getAccessToken, clearTokens } from "./tokenStorage";
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

  async function refetch() {
    if (!isTokenValid(getAccessToken())) {
      setEmployee(null);
      setLoading(false);
      return;
    }
    try {
      setEmployee(await getMe());
    } catch {
      clearTokens();
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ employee, loading, refetch }}>{children}</AuthContext.Provider>;
}
