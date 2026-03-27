import { createContext, useContext, useState, type ReactNode } from "react";
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
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState("");

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
