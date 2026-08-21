import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  sub: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void  // add this
}

const UserContext = createContext<UserContextType | null>(null);


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token")
    if (!token) return null
    try {
      const decoded: { sub: string, email: string, name: string, avatarUrl: string | null } = jwtDecode(token)
      return {
        sub: decoded.sub,
        email: decoded.email,
        name: localStorage.getItem('userName') || decoded.name,
        avatarUrl: localStorage.getItem('userAvatar') || decoded.avatarUrl || null
      }
    } catch {
      return null
    }
  })

  // move inside component so it has access to setUser
  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      if (updates.name) localStorage.setItem('userName', updates.name)
      if (updates.avatarUrl) localStorage.setItem('userAvatar', updates.avatarUrl)
      return updated
    })
  }

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
};
