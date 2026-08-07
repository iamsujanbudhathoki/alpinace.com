"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/services/api-client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Expedition Director" | "Operations Manager" | "Guide Coordinator" | string;
  avatarUrl?: string;
  token?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

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
    async function checkAuth() {
      try {
        const savedSession = localStorage.getItem(AUTH_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed?.token) {
            try {
              // Always verify access token against backend profile endpoint on refresh
              const res = await apiClient.get<AdminUser>("/admin/auth/me");
              const currentUser = res.data;
              const sessionUser = { ...currentUser, token: parsed.token };
              setUser(sessionUser);
              localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
            } catch (err) {
              console.warn("Session verification failed on refresh:", err);
              setUser(null);
              localStorage.removeItem(AUTH_KEY);
            }
          } else {
            setUser(null);
            localStorage.removeItem(AUTH_KEY);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to read auth session:", err);
        setUser(null);
        localStorage.removeItem(AUTH_KEY);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const response = await apiClient.post<AdminUser>("/admin/auth/login", {
        email,
        password: pass,
      });

      const userData = response.data;
      if (userData && userData.token) {
        setUser(userData);
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        return true;
      }
    } catch (err: any) {
      console.error("Admin login error:", err);
      throw err;
    }

    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    apiClient.post("/admin/auth/logout").catch(() => {});
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
