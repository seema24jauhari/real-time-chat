import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  sub: string;
  email: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
     const decoded: { sub: string, email: string, name: string } = jwtDecode(token)
      return {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
      };
    } catch {
      return null;
    }
  });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
};
