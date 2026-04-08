import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { UserRole } from "@/lib/auth";

interface AuthState {
  role: UserRole | null;
  userName: string;
  login: (role: UserRole, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  role: null,
  userName: "",
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem("sg_role");
    return saved === "staff" || saved === "student" ? saved : null;
  });
  const [userName, setUserName] = useState(() => localStorage.getItem("sg_name") || "");

  useEffect(() => {
    if (role) {
      localStorage.setItem("sg_role", role);
      localStorage.setItem("sg_name", userName);
    } else {
      localStorage.removeItem("sg_role");
      localStorage.removeItem("sg_name");
    }
  }, [role, userName]);

  const login = (r: UserRole, name: string) => {
    setRole(r);
    setUserName(name);
  };

  const logout = () => {
    setRole(null);
    setUserName("");
  };

  return (
    <AuthContext.Provider value={{ role, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
