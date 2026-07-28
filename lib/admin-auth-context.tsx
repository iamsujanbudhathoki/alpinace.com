"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Expedition Director" | "Operations Manager" | "Guide Coordinator";
  avatarUrl?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const DEFAULT_USER: AdminUser = {
  id: "admin-1",
  name: "Sujan Budhathoki",
  email: "admin@alpineace.com",
  role: "Expedition Director",
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

const AUTH_KEY = "alpineace_admin_session";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
      }
    } catch (err) {
      console.error("Failed to read auth session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((res) => setTimeout(res, 600));

    // Accept valid demo credentials or fallback
    if (email && pass.length >= 4) {
      const sessionUser: AdminUser = {
        ...DEFAULT_USER,
        email: email || DEFAULT_USER.email,
      };
      setUser(sessionUser);
      localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
